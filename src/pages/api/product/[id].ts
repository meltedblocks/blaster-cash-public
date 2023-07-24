import { createProduct } from '@/types/schemas';
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
  const { id: productId } = req.query;
  if (!productId) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }
  try {
    switch (req.method) {
      case 'POST': {
        await createProduct.validate(req.body);
        const { name, description, image } = req.body;
        if (productId === 'new') {
          await prisma.product.create({
            data: {
              name,
              description,
              image,
              /* @ts-ignore */
              userId,
            },
          });
          return res.status(200).json('OK');
        }
        const products = await prisma.product.findMany({
          where: {
            id: productId as string,
            User: {
              id: userId,
            },
          },
        });

        if (!products || products.length === 0) {
          return res.status(404).json({ error: 'NOT_FOUND' });
        }

        const product = products[0];

        await prisma.product.updateMany({
          where: {
            User: {
              /* @ts-ignore */
              id: userId,
            },
            /* @ts-ignore */
            id: productId,
          },
          data: {
            name,
            description,
            image,
          },
        });

        if (product.image !== image) {
          const key = product.image.split('/').at(-1);
          var params = {
            Bucket: process.env.BUCKET_NAME,
            Key: key,
          };
          await s3.deleteObject(params).send();
        }

        return res.status(200).json('OK');
      }
      case 'DELETE': {
        const { image } = await prisma.product.findUnique({
          where: {
            id: productId as string,
          },
          select: {
            image: true,
          },
        });
        await prisma.product.deleteMany({
          where: {
            User: {
              /* @ts-ignore */
              id: userId,
            },
            /* @ts-ignore */
            id: productId,
          },
        });

        const key = image.split('/').at(-1);
        var params = {
          Bucket: process.env.BUCKET_NAME,
          Key: key,
        };
        await s3.deleteObject(params).send();

        return res.status(200).json('OK');
      }
      case 'GET': {
        try {
          const result = await prisma.product.findMany({
            where: {
              userId,
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
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e });
  }
}
