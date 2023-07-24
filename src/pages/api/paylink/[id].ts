import checkAuthorization from '@/utils/CheckAuthorization';
import Slugify from '@/utils/Slugify';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let userId = await checkAuthorization(req, res);

  if (!userId) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  const { id: paymentLinkId } = req.query;
  if (!paymentLinkId) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }
  try {
    switch (req.method) {
      case 'POST': {
        // await createProduct.validate(req.body);
        const {
          name,
          slug,
          redirectUrl,
          thankYouText,
          counter,
          expiration,
          amount,
          requireEmail,
          discountPercentage,
          discountAddress,
          affiliatePercentage,
          affiliateAddress,
          affiliateShow,
          productId,
          webhook,
        } = req.body;
        if (paymentLinkId === 'new') {
          const result = await prisma.paymentRequest.create({
            data: {
              name: name || undefined,
              slug: slug ? Slugify(slug) : undefined,
              redirectUrl,
              thankYouText,
              counter,
              expiration,
              amount,
              requireEmail,
              discountPercentage,
              discountAddress,
              affiliatePercentage,
              affiliateAddress,
              affiliateShow,
              productId,
              webhookId: webhook,
              isActive: true,
            },
          });
          console.log(result);
          return res.status(200).json({ slug: result.slug });
        }

        return res.status(200).json('OK');
      }
      case 'DELETE': {
        try {
          const paymentRequest = await prisma.paymentRequest.findUnique({
            where: {
              id: paymentLinkId as string,
            },
            include: {
              Product: true,
            },
          });

          if (!(paymentRequest || paymentRequest.Product.userId === userId)) {
            return res.status(404).json({ error: 'NOT_FOUND' });
          }

          const result = await prisma.paymentRequest.update({
            where: {
              /* @ts-ignore */
              id: paymentLinkId,
            },
            data: {
              isActive: false,
              slug: randomUUID(),
              webHook: {
                disconnect: true,
              },
            },
          });
        } catch (e) {
          console.log(e);
        }

        return res.status(200).json('OK');
      }
      case 'GET': {
        try {
          const result = await prisma.paymentRequest.findMany({
            where: {
              Product: {
                userId,
              },
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
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (
        e.code === 'P2002' &&
        e.meta &&
        e.meta.target &&
        /* @ts-ignore */
        e.meta.target.includes('slug')
      ) {
        res.status(400).json({ error: 'SLUG_TAKEN' });
      }
    }
    return res.status(400).json({ error: e });
  }
}
