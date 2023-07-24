import prisma from '../../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { randomUUID } from 'crypto';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions(req));
  if (!session) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  try {
    switch (req.method) {
      case 'POST': {
        let newApiKey = randomUUID();
        await prisma.user.update({
          where: {
            /* @ts-ignore */
            id: session.user.id,
          },
          data: {
            apiKey: newApiKey,
          },
        });

        return res.status(200).json({ apiKey: newApiKey });
      }
      default:
        return res.status(404).json({ error: 'NOT_FOUND' });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e });
  }
}
