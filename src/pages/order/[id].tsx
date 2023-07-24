import { API, graphqlOperation } from '@aws-amplify/api';
import { createQR } from '@solana/pay';
import { useWallet } from '@solana/wallet-adapter-react';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { GetServerSideProps } from 'next';
import React, { useEffect, useState } from 'react';
import Checkout, { OrDivider } from '../../components/checkout/CheckoutPage';
import prisma from '../../lib/prisma';

import FailedPage from '../../components/checkout/FailedPage';
import SolanaPay from '../../components/checkout/SolanaPayButton';
import SuccessPage from '../../components/checkout/SuccessPage';

import ErrorBox from '@/components/ErrorBox';
import Button from '@/components/ui/button';
import WalletContext from '@/components/WalletContext';
import Errors from '@/utils/Errors';
import axios from 'axios';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import * as subscribtions from '../../graphql/subscriptions';
import { shortenAddress } from '@/utils/ShortenAddress';

export const OrderStatus = {
  INITIALIZED: 'INITIALIZED',
  INPROGRESS: 'INPROGRESS',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  INCORRECT: 'INCORRECT',
};

enum STEPS {
  'GATHER_USER_DATA',
  'PAY',
}

interface UserInfo {
  email: string;
}

const UserInfoSchema = Yup.object().shape({
  email: Yup.string().email().required(),
});

export type LinkProps = {
  recipient: string;
  amount: string;
  reference: string;
  status: string;
  orderId: string;
  productName: string;
  productDescription: string;
  productImage: string;
  sellerName: string;
  sellerImage: string;
  basePoints: string;
  currency: string;
  redirectUrl: string;
  affiliateAddress: string;
  affiliateName: string;
  affiliatePrice: string;
  affiliateShow: boolean;
  appUrl: string;
  cluster: string;
  graphqlEndpoint: string;
  region: string;
  authenticationType: string;
  apiKey: string;
  requireEmail: boolean;
  buyerEmail: string;
  paymentLinkSlug: string;
};

export type Message = {
  discountName?: string;
  discountPrice?: string;
  finalAmount?: string;
  error?: string;
};

const convertAmount = (amount, basePoints) => {
  return new BigNumber(amount.toString()).div(basePoints);
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const order = await prisma.order.findUnique({
    where: {
      id: String(params?.id),
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

  if (order.status === 'TIMEOUT') {
    return {
      redirect: {
        permanent: false,
        destination: process.env.APP_URL + '/pay/' + order.PaymentRequest.slug,
      },
      props: {},
    };
  }

  return {
    props: {
      recipient: order.PaymentRequest.Product.User.pubKey,
      reference: order.reference,
      amount: order.PaymentRequest.amount,
      basePoints: 1000000000,
      currency: 'SOL',
      status: order.status,
      orderId: params.id,
      productName: order.PaymentRequest.Product.name,
      productDescription: order.PaymentRequest.Product.description,
      productImage: order.PaymentRequest.Product.image,
      sellerName: order.PaymentRequest.Product.User.name,
      sellerImage: order.PaymentRequest.Product.User.avatar,
      redirectUrl: order.PaymentRequest.redirectUrl,
      affiliateAddress: order.PaymentRequest.affiliateAddress,
      affiliatePrice: order.PaymentRequest.affiliatePercentage,
      affiliateShow: order.PaymentRequest.affiliateShow,
      appUrl: process.env.APP_URL,
      cluster: process.env.CLUSTER,
      graphqlEndpoint: process.env.GRAPHQL_ENDPOINT,
      region: process.env.REGION,
      authenticationType: 'API_KEY',
      apiKey: process.env.GRAPHQL_API_KEY,
      requireEmail: order.PaymentRequest.requireEmail,
      buyerEmail: order.buyerEmail,
      paymentLinkSlug: order.PaymentRequest.slug,
    },
  };
};

const Post: React.FC<LinkProps> = (props) => {
  API.configure({
    aws_appsync_graphqlEndpoint: props.graphqlEndpoint,
    aws_appsync_region: props.region,
    aws_appsync_authenticationType: props.authenticationType,
    aws_appsync_apiKey: props.apiKey,
  });
  const { connected } = useWallet();

  const [status, setStatus] = useState(props.status);
  const [orderId, setOrderId] = useState(props.orderId);
  const [errorText, setErrorText] = useState('');

  const [finalAmount, setFinalAmount] = useState(
    convertAmount(props.amount, props.basePoints).toString()
  );
  const [currency, setCurrency] = useState(props.currency);
  const [initialAmount, setInitialAmount] = useState(
    convertAmount(props.amount, props.basePoints).toString()
  );
  const [discountPrice, setDiscountPrice] = useState('');
  const [discountName, setDiscountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<STEPS>(null);

  const waitForTx = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    connection.onSignature;
    connection.onAccountChange(new PublicKey(props.recipient), async (val) => {
      const { orderStatus } = await (
        await fetch(`/api/order/status/${orderId}`)
      ).json();

      switch (orderStatus) {
        case 'FAILED':
        case 'INCORRECT':
        case 'SUCCESS':
          setStatus(orderStatus);
      }
    });
  };

  const subscribeCallback = (value) => {
    let message: Message;
    try {
      message = JSON.parse(value.data.subscribe.data).msg;
    } catch (e) {
      console.log(e);
      return;
    }

    if (message?.error) {
      if (Errors[message?.error]) {
        setErrorText(Errors[message?.error]);
      } else {
        setErrorText(Errors.DEFAULT);
      }
      setIsLoading(false);
      return;
    }
    if (message?.discountName) {
      setDiscountName(message?.discountName);
    }

    if (message?.discountPrice) {
      let discountPrice = convertAmount(
        message?.discountPrice,
        props.basePoints
      );
      setDiscountPrice(discountPrice.toString());
    }

    if (message?.finalAmount) {
      let finalAmount = convertAmount(message?.finalAmount, props.basePoints);
      setFinalAmount(finalAmount.toString());
    }

    setIsLoading(true);
  };

  useEffect(() => {
    waitForTx();
  }, [connected]);

  useEffect(() => {
    if (currentStep === STEPS.PAY) {
      const qrCode = createQR(
        `solana:${props.appUrl}/api/order/${props.orderId}`
      );
      const doc = document.getElementById('PayQRCode');
      qrCode.append(doc);
    }
  }, [currentStep]);

  useEffect(() => {
    setStatus(status);
    const currentStep =
      props.requireEmail && !props.buyerEmail
        ? STEPS.GATHER_USER_DATA
        : STEPS.PAY;
    setCurrentStep(currentStep);
  }, []);

  useEffect(() => {
    //Subscribe via WebSockets
    const sub = API.graphql(
      graphqlOperation(subscribtions.subscribe, { name: orderId })
      // @ts-ignore
    ).subscribe({
      next: ({ provider, value }) => subscribeCallback(value),
      error: (error) => console.warn(error),
    });
  }, [orderId]);

  return (
    <div>
      {(status === OrderStatus.FAILED || status === OrderStatus.INCORRECT) && (
        <FailedPage
          paymentLinkSlug={props.paymentLinkSlug}
          appUrl={props.appUrl}
        />
      )}
      {status === OrderStatus.SUCCESS && (
        <SuccessPage redirectUrl={props.redirectUrl} />
      )}
      {status === OrderStatus.INITIALIZED && (
        <>
          <Checkout
            props={{
              amount: props.amount,
              recipient: props.recipient,
              productName: props.productName,
              productDescription: props.productDescription,
              productImgSrc: props.productImage,
              sellerName: props.sellerName,
              sellerImage: props.sellerImage,
              finalAmount,
              currency,
              initialAmount,
              discountPrice,
              discountName,
              affiliateAddress: props.affiliateAddress,
              affiliateName: shortenAddress(props.affiliateAddress),
              affiliatePrice: props.affiliatePrice,
              affiliateShow: props.affiliateShow,
            }}
          >
            {errorText && (
              <ErrorBox errorText={errorText} setErrorText={setErrorText} />
            )}
            {currentStep === STEPS.PAY && (
              <>
                <WalletContext>
                  <SolanaPay
                    recipient={props.recipient}
                    amount={props.amount}
                    reference={props.reference}
                    appUrl={props.appUrl}
                    orderId={props.orderId}
                    cluster={props.cluster}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                  {OrDivider}
                  <h2 className="mt-6 text-sm font-semibold text-gray-900">
                    Scan QR Code using your mobile wallet
                  </h2>
                  <div id="PayQRCode"></div>
                </WalletContext>
              </>
            )}
            {currentStep === STEPS.GATHER_USER_DATA && (
              <>
                <Formik
                  initialValues={{
                    email: '',
                  }}
                  validationSchema={UserInfoSchema}
                  onSubmit={async (
                    values: UserInfo,
                    {
                      setSubmitting,
                      setStatus,
                      setErrors,
                    }: FormikHelpers<UserInfo>
                  ) => {
                    try {
                      setSubmitting(true);
                      await axios.post(
                        '/api/order/update-email/' + props.orderId,
                        {
                          email: values.email,
                        }
                      );
                      setCurrentStep(STEPS.PAY);
                      setSubmitting(false);
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                >
                  {({ errors, touched, isSubmitting, setFieldValue }) => (
                    <Form>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Email address
                        </label>
                        <div className="mt-2 mb-4">
                          <Field
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      <div>
                        <Button
                          type="submit"
                          isLoading={isSubmitting}
                          className="flex w-full justify-center rounded-md bg-stone-800 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:stroke-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          Go to next step
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </>
            )}
          </Checkout>
        </>
      )}
    </div>
  );
};

export default Post;
