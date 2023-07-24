import SendMessage from '@/utils/SendMessage';
import { Metaplex } from '@metaplex-foundation/js';
import { createTransfer } from '@solana/pay';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

let SERVICE_FEE_PERCENTAGE = process.env.SERVICE_FEE_PERCENTAGE;
let FEE_VAULT = process.env.FEE_VAULT;

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: orderId } = req.query;

  try {
    switch (req.method) {
      case 'POST': {
        const { account } = req.body;
        const sender = new PublicKey(account);
        const order = await prisma.order.findUnique({
          where: {
            id: String(orderId),
          },
          include: {
            PaymentRequest: {
              include: {
                Product: {
                  include: {
                    User: true,
                  },
                },
              },
            },
          },
        });

        const receiver = new PublicKey(
          order.PaymentRequest.Product.User.pubKey
        );

        // Seller cannot be buyer

        if (receiver.toString() === account) {
          const error = 'SAME_BUYER_SELLER';
          await SendMessage({ error }, orderId);
          return res.status(400).json({ error });
        }

        let orderReference = new PublicKey(order.reference);

        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

        const memo = '';
        // calculations

        let amount = new BigNumber(order.PaymentRequest.amount);
        let affiliateIx;
        let discountName;
        let discountPrice;
        let amountToAffiliate;

        // check discount
        if (order.PaymentRequest.discountAddress) {
          //@todo
          const metaplex = new Metaplex(connection);
          const usersNfts = await metaplex.nfts().findAllByOwner({
            owner: sender,
          });

          let shouldDiscount = usersNfts.some((nft) => {
            if (nft.collection && nft.collection.address) {
              if (
                nft.collection.verified &&
                nft.collection.address.toString() ===
                  order.PaymentRequest.discountAddress
              ) {
                discountName = nft.name;
                return true;
              }
            }
          });
          if (shouldDiscount) {
            discountPrice = amount
              .multipliedBy(order.PaymentRequest.discountPercentage)
              .div(100);

            amount = amount.minus(discountPrice);
          }
        }

        let amountAfterDiscount = amount;

        // check if user has enough lamports
        const senderInfo = await connection.getAccountInfo(sender);
        if (
          new BigNumber(senderInfo.lamports).isLessThan(amountAfterDiscount)
        ) {
          const error = 'NO_FUNDS';
          await SendMessage({ error }, orderId);
          return res.status(400).json({ error });
        }

        // check affiliate
        if (order.PaymentRequest.affiliateAddress) {
          amountToAffiliate = amount
            .multipliedBy(order.PaymentRequest.affiliatePercentage)
            .div(100);
          amount = amount.minus(amountToAffiliate);

          affiliateIx = SystemProgram.transfer({
            fromPubkey: sender,
            toPubkey: new PublicKey(order.PaymentRequest.affiliateAddress),
            lamports: amountToAffiliate,
          });
        }

        // send fee
        let serviceFeeAmount = amount
          .multipliedBy(SERVICE_FEE_PERCENTAGE)
          .div(100);
        amount = amount.minus(serviceFeeAmount);

        const servieFeeIx = SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: new PublicKey(FEE_VAULT),
          // @ts-ignore
          lamports: serviceFeeAmount,
        });

        // transfer to seller
        const transferTransaction = await createTransfer(connection, sender, {
          recipient: receiver,
          amount: amount.div(1000000000),
          reference: orderReference,
          memo,
        });

        if (affiliateIx) {
          transferTransaction.add(affiliateIx);
        }

        transferTransaction.add(servieFeeIx);

        // Serialize and return the unsigned transaction.
        const serializedTransaction = transferTransaction.serialize({
          verifySignatures: false,
          requireAllSignatures: false,
        });

        const base64Transaction = serializedTransaction.toString('base64');
        const message =
          order.PaymentRequest.thankYouText || 'Thank you for the purchase';

        await prisma.order.update({
          where: {
            id: String(orderId),
          },
          data: {
            finalAmount: amount.toString(),
            discountAmount: discountPrice && discountPrice.toString(),
            affiliateAmount: amountToAffiliate && amountToAffiliate.toString(),
            serviceFeeAmount: serviceFeeAmount.toString(),
            buyerAddress: sender.toString(),
          },
        });
        await SendMessage(
          {
            discountName,
            discountPrice: discountPrice && discountPrice.toString(),
            finalAmount: amountAfterDiscount.toString(),
          },
          orderId
        );
        return res
          .status(200)
          .json({ transaction: base64Transaction, message });
      }
      case 'GET': {
        const order = await prisma.order.findUnique({
          where: {
            id: String(orderId),
          },
          include: {
            PaymentRequest: {
              include: {
                Product: true,
              },
            },
          },
        });
        const label = order.PaymentRequest.Product.name;
        const icon = order.PaymentRequest.Product.image;
        return res.status(200).json({
          label,
          icon,
        });
      }
      default:
        return res.status(404).json({ error: 'NOT_FOUND' });
    }
  } catch (e) {
    console.log(e);
    await SendMessage({ error: 'DEFAULT' }, orderId);
    return res.status(400).json({ error: e });
  }
}
