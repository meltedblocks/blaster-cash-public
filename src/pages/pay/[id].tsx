import { Keypair } from '@solana/web3.js';
import { GetServerSideProps } from 'next';
import React from 'react';
import prisma from '../../lib/prisma';

export type LinkProps = {
  recipient: string;
  amount: string;
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const link = await prisma.paymentRequest.findUnique({
    where: {
      slug: String(params?.id),
    },
  });

  // TODO not only null but also when link is not active
  if (!link || !link.isActive) {
    return {
      notFound: true, //redirects to 404 page
    };
  }

  let orderReference = new Keypair().publicKey;

  // Create session
  const result = await prisma.order.create({
    data: {
      paymentRequestId: link.id,
      reference: orderReference.toString(),
    },
  });

  await prisma.paymentRequest.update({
    where: {
      id: link.id,
    },
    data: {
      visits: link.visits + 1,
    },
  });

  let redirectUrl = `/order/${result.id}`;

  // Redirect to order page
  return {
    redirect: {
      permanent: false,
      destination: redirectUrl,
    },
    props: {},
  };
};

const Post: React.FC<LinkProps> = (props) => {
  return <p>LOL</p>;
};

export default Post;
