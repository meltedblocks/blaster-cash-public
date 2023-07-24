import type { InferGetServerSidePropsType } from 'next';
import type { NextPageWithLayout } from '@/types';
import RootLayout from '@/layouts/_root-layout';
import RetroScreen from '@/components/screens/retro-screen';
import { GetServerSideProps } from 'next';
import { authOptions } from './api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions(context.req)
  );
  const orders = await prisma.order.findMany({
    where: {
      status: 'SUCCESS' || 'FAILED',
      PaymentRequest: {
        Product: {
          userId: session.user.id,
        },
      },
    },
    select: {
      id: true,
      status: true,
      finalAmount: true,
      createdAt: true,
      buyerAddress: true,
      PaymentRequest: {
        select: {
          slug: true,
          Product: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      },
    },
  });

  const aggregate = await prisma.paymentRequest.aggregate({
    where: {
      Product: {
        userId: session.user.id,
      },
    },
    _sum: {
      visits: true,
    },
  });

  orders.map((x) => {
    let timestamp = new Date(x.createdAt).toDateString();
    //@ts-ignore
    x.createdAt = timestamp;
    return x;
  });
  return {
    props: { orders: orders || [], impressions: aggregate._sum.visits || 0 },
  };
};

const HomePage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ orders, impressions }) => {
  return <RetroScreen orders={orders} impressions={impressions} />;
};

HomePage.getLayout = function getLayout(page) {
  return <RootLayout>{page}</RootLayout>;
};

export default HomePage;
