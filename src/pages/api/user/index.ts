import { userUpdate } from '@/types/schemas';
import checkAuthorization from '@/utils/CheckAuthorization';
import S3 from 'aws-sdk/clients/s3';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

const s3 = new S3({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  signatureVersion: 'v4',
});

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let userId = await checkAuthorization(req, res);

  if (!userId) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }

  switch (req.method) {
    case 'POST':
    case 'PUT': {
      try {
        await userUpdate.validate(req.body);
        const { name, image } = req.body;

        const result = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        if (image && result.avatar) {
          const key = result.avatar.split('/').at(-1);
          var params = {
            Bucket: process.env.BUCKET_NAME,
            Key: key,
          };
          await s3.deleteObject(params).send();
        }

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            name: name || result.name,
            avatar: image || result.avatar,
          },
        });

        return res.json(result.id);
      } catch (e) {
        console.log(e);
        return res.status(400).json({ error: e });
      }
    }
    case 'GET': {
      try {
        const result = await prisma.user.findMany({
          where: {
            id: userId,
          },
        });
        return res.json(result);
      } catch (e) {
        console.log(e);
        return res.status(400).json({ error: e });
      }
    }
    default:
      return res.status(404).json({ error: 'NOT_FOUND' });
  }
}
