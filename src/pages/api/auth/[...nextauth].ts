import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import { Provider } from 'next-auth/providers';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCsrfToken } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { SigninMessage } from '../../../utils/SigninMessage';

const providers = (req): Provider[] => [
  CredentialsProvider({
    name: 'Solana',
    credentials: {
      message: {
        label: 'Message',
        type: 'text',
      },
      signature: {
        label: 'Signature',
        type: 'text',
      },
    },
    async authorize(credentials) {
      try {
        const signinMessage = new SigninMessage(
          JSON.parse(credentials?.message || '{}')
        );
        const nextAuthUrl = new URL(process.env.APP_URL);
        if (signinMessage.domain !== nextAuthUrl.host) {
          return null;
        }

        if (signinMessage.nonce !== (await getCsrfToken({ req }))) {
          return null;
        }

        const validationResult = await signinMessage.validate(
          credentials?.signature || ''
        );

        if (!validationResult)
          throw new Error('Could not validate the signed message');

        return {
          id: signinMessage.publicKey,
        };
      } catch (e) {
        return null;
      }
    },
  }),
];

declare module 'next-auth' {
  interface User {
    id: string;
  }

  interface Session {
    user: User;
  }
}

export const authOptions = (req): NextAuthOptions => {
  return {
    providers: providers(req),
    session: {
      strategy: 'jwt',
    },
    pages: {
      signIn: '/login',
      signOut: '/login2',
      error: '/auth/error', // Error code passed in query string as ?error=
      verifyRequest: '/auth/verify-request', // (used for check email message)
      newUser: '/auth/new-user', // New users will be directed here on first sign in (leave the property out if not of interest)
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token }) {
        let user = await prisma.user.findUnique({
          where: {
            pubKey: token.sub,
          },
        });

        let userId;

        if (!user) {
          let user = await prisma.user.create({
            data: {
              pubKey: token.sub,
              avatar: null,
              name: token.sub,
              apiKey: randomUUID(),
            },
          });

          userId = user.id;
        } else {
          userId = user.id;
        }

        /* @ts-ignore */
        session.publicKey = token.sub;
        if (session.user) {
          session.user.id = userId;
        }
        return session;
      },
    },
  };
};

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const isDefaultSigninPage =
    req.method === 'GET' && req.query.nextauth?.includes('signin');

  // Hides Sign-In with Solana from default sign page
  if (isDefaultSigninPage) {
    providers(req).pop();
  }

  return await NextAuth(req, res, authOptions(req));
}
