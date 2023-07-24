import { NextApiRequest, NextApiResponse } from 'next';
import { object, string } from 'yup';
import prisma from '../../../../lib/prisma';

export const addEmail = object({
  email: string().email().required(),
});

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: orderId } = req.query;

  try {
    switch (req.method) {
      case 'POST': {
        await addEmail.validate(req.body);
        const { email: buyerEmail } = req.body;

        await prisma.order.update({
          where: {
            id: String(orderId),
          },
          data: {
            buyerEmail,
          },
        });

        return res.status(200).json({ result: 'OK' });
      }
      default:
        return res.status(404).json({ error: 'NOT_FOUND' });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e });
  }
}
