import { createWebhook } from '@/types/schemas';
import checkAuthorization from '@/utils/CheckAuthorization';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let userId = await checkAuthorization(req, res);

  if (!userId) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }

  const { id: webhookId } = req.query;
  if (!webhookId) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }
  try {
    switch (req.method) {
      case 'POST': {
        await createWebhook.validate(req.body);
        const { name, url } = req.body;
        if (webhookId === 'new') {
          const result = await prisma.webhook.create({
            data: {
              name,
              url,
              /* @ts-ignore */
              userId,
            },
          });
          return res.status(200).json({ id: result.id });
        }
        const webhooks = await prisma.webhook.findMany({
          where: {
            id: webhookId as string,
            User: {
              id: userId,
            },
          },
        });

        if (!webhooks || webhooks.length === 0) {
          return res.status(404).json({ error: 'NOT_FOUND' });
        }

        const webhook = webhooks[0];

        const result = await prisma.webhook.updateMany({
          where: {
            User: {
              id: userId,
            },
            /* @ts-ignore */
            id: webhook,
          },
          data: {
            name,
            url,
          },
        });

        return res.status(200).json({ id: webhookId });
      }
      case 'DELETE': {
        if (webhookId === 'url') {
          const { url } = req.body;
          await prisma.webhook.deleteMany({
            where: {
              userId: userId,
              /* @ts-ignore */
              url,
            },
          });
        } else {
          await prisma.webhook.deleteMany({
            where: {
              userId: userId,
              /* @ts-ignore */
              id: webhookId,
            },
          });
        }

        return res.status(200).json('OK');
      }
      case 'GET': {
        try {
          const result = await prisma.webhook.findMany({
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
