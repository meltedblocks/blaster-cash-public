import {
  findReference,
  FindReferenceError,
  ValidateTransferError,
} from '@solana/pay';
import prisma from '../../../../lib/prisma';

import {
  Cluster,
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import axios from 'axios';
import BigNumber from 'bignumber.js';

let FEE_VAULT = process.env.FEE_VAULT;

// POST /api/post
// Required fields in body: orderId
//  https://github.com/solana-labs/solana-pay/blob/master/core/example/payment-flow-merchant/main.ts
export default async function handle(req, res) {
  const { id: orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: 'MISSING_ORDER_ID' });
  }

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

  if (!order) {
    return res.status(404);
  }

  // Return in TX is already finalized
  switch (order.status) {
    case 'INITIALIZED':
    case 'INPROGRESS':
      break;
    case 'FAILED':
      return res.status(200).json({ orderStatus: 'FAILED' });
    case 'INCORRECT':
      return res.status(200).json({ orderStatus: 'INCORRECT' });
    case 'SUCCESS':
      return res.status(200).json({ orderStatus: 'SUCCESS' });
    default:
      return res.status(404);
  }

  let connection = await establishConnection();
  let referencePublicKey = new PublicKey(order.reference);
  let tx;
  try {
    tx = await getSignature(connection, referencePublicKey);
  } catch (error) {
    if (!(error instanceof FindReferenceError)) {
      console.error('Error with connecting to Solana cluster: ', error);
      return res.status(500);
    }
    // If reference is not found it can mean that user do not pay yet
    return res.status(200).json({ orderStatus: 'INITIALIZED' });
  }

  try {
    await validatePayment(connection, tx.signature, order);
    // Payment succeed
    try {
      await prisma.order.update({
        where: {
          id: String(orderId),
        },
        data: {
          status: 'SUCCESS',
        },
      });
    } catch (dbError) {
      console.error(
        'Error with connecting to DB while updating status: ',
        dbError
      );
      return res.status(500);
    }
    if (order.PaymentRequest.webhookId) {
      try {
        let { url: webhookUrl } = await prisma.webhook.findUnique({
          where: {
            id: order.PaymentRequest.webhookId,
          },
        });
        await axios.post(webhookUrl, {
          orderId,
          productId: order.PaymentRequest.Product.id,
          email: order.buyerEmail,
          buyerPublicKey: order.buyerAddress,
          linkId: order.PaymentRequest.id,
          amount: order.finalAmount,
          affiliateAmount: order.affiliateAmount,
          reference: order.reference,
        });
      } catch (e) {
        console.log(e);
      }
    }
    return res.status(200).json({ orderStatus: 'SUCCESS' });
  } catch (error) {
    // Payment fails
    console.error('❌ Payment failed', error);
    try {
      await prisma.order.update({
        where: {
          id: String(orderId),
        },
        data: {
          status: 'FAILED',
        },
      });
    } catch (dbError) {
      console.error(
        'Error with connecting to DB while updating status: ',
        dbError
      );
      return res.status(500);
    }
    return res.status(200).json({ orderStatus: 'FAILED' });
  }
  // }

  async function getSignature(connection, reference: PublicKey) {
    const signatureInfo = await findReference(connection, reference, {
      finality: 'confirmed',
    });
    return signatureInfo;
  }

  async function establishConnection(
    cluster: Cluster = 'devnet'
  ): Promise<Connection> {
    const endpoint = clusterApiUrl(cluster);
    const connection = new Connection(endpoint, 'confirmed');
    const version = await connection.getVersion();

    return connection;
  }
  async function validatePayment(connection, signature, order) {
    const response = await connection.getTransaction(signature);
    const meta = response.meta;
    if (!meta) throw new ValidateTransferError('missing meta');
    if (!response) throw new ValidateTransferError('not found');
    const { message, signatures } = response.transaction;
    const transaction = Transaction.populate(message, signatures);
    const instructions = transaction.instructions.slice();

    // validate service fee
    validateSOLTransfer(
      new PublicKey(FEE_VAULT),
      order.serviceFeeAmount,
      message,
      meta
    );

    // check affiliate transfer
    if (order.affiliateAmount) {
      validateSOLTransfer(
        new PublicKey(order.PaymentRequest.affiliateAddress),
        order.affiliateAmount,
        message,
        meta
      );
    }

    // validate to seller transfer
    validateSOLTransfer(
      new PublicKey(order.PaymentRequest.Product.User.pubKey),
      order.finalAmount,
      message,
      meta
    );
  }

  function validateSOLTransfer(recipient, amount, message, meta) {
    const accountIndex = message.accountKeys.findIndex((pubkey) =>
      pubkey.equals(recipient)
    );
    if (accountIndex === -1)
      throw new ValidateTransferError('recipient not found');
    let postAmount = new BigNumber(meta.postBalances[accountIndex]);
    let preAmount = new BigNumber(meta.preBalances[accountIndex]);
    let diff = postAmount.minus(preAmount);
    if (postAmount.minus(preAmount).lt(amount))
      throw new ValidateTransferError('amount not transferred');
  }
}
