import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import prisma from '../lib/prisma';

const checkAuthorization = async (req, res) => {
  let session = await getServerSession(req, res, authOptions(req));
  if (session && session.user && session.user.id) {
    return session.user.id;
  }
  if (req.headers['x-api-key']) {
    let user = await prisma.user.findMany({
      where: {
        apiKey: req.headers['x-api-key'] as string,
      },
    });

    if (user && user.length === 1) {
      return user[0].id;
    }
  }

  return;
};

export default checkAuthorization;
