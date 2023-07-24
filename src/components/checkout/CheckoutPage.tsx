import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import BigNumber from 'bignumber.js';
import React, { MouseEventHandler, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import darkLogo from '@/assets/images/logo-white.svg';
import Image from '@/components/ui/image';
import { shortenAddress } from '../../utils/ShortenAddress';

const cluster = 'devnet';

const SolanaPayLogo = (
  <svg
    width="86"
    height="32"
    viewBox="0 0 86 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M77.1128 22.0067L72.1479 11.1584H68.027L75.1197 25.7957L74.9921 26.2365C74.8144 26.8224 74.4395 27.3284 73.9311 27.668C73.4228 28.0077 72.8125 28.16 72.2046 28.099C71.493 28.0924 70.7948 27.904 70.1761 27.5516L69.5165 30.6867C70.4684 31.0799 71.4871 31.285 72.5167 31.2909C75.3538 31.2909 77.0702 30.2459 78.4888 27.1677L86 11.1584H82.021L77.1128 22.0067Z"
      fill="white"
    />
    <path
      d="M42.0235 5.99023H30.1219V25.9308H34.0229V18.6015H42.0235C46.3713 18.6015 49.2297 16.4048 49.2297 12.2959C49.2297 8.18689 46.3713 5.99023 42.0235 5.99023ZM41.8107 15.111H34.0087V9.42385H41.8107C44.0662 9.42385 45.357 10.4546 45.357 12.2674C45.357 14.0802 44.0662 15.111 41.8107 15.111Z"
      fill="white"
    />
    <path
      d="M65.539 22.1488V16.1418C65.539 12.5873 62.9928 10.7461 58.6236 10.7461C55.0773 10.7461 51.9706 12.4025 51.0982 14.9475L54.3042 16.0849C54.7794 14.8124 56.432 13.874 58.4889 13.874C60.9288 13.874 61.9572 14.8693 61.9572 16.0849V16.4759L56.1554 17.1157C52.8147 17.4711 50.6159 18.9711 50.6159 21.6512C50.6159 24.5872 53.1339 26.1653 56.4745 26.1653C58.6278 26.2326 60.7248 25.4692 62.3331 24.0327C62.9147 25.4545 63.5105 26.4071 67.4754 25.9023V22.9308C65.8866 23.3147 65.539 22.9308 65.539 22.1488ZM61.9927 20.2436C61.9927 22.1772 59.2903 23.2009 57.0278 23.2009C55.3042 23.2009 54.2687 22.6464 54.2687 21.5445C54.2687 20.4427 55.1198 20.0446 56.7653 19.8526L62.0069 19.2413L61.9927 20.2436Z"
      fill="white"
    />
    <path
      d="M22.7439 21.253C22.7714 21.3361 22.7714 21.4259 22.7439 21.5089C22.7279 21.5918 22.6885 21.6683 22.6304 21.7293L18.8783 25.6748C18.7956 25.7599 18.6968 25.8276 18.5875 25.8738C18.478 25.9219 18.3595 25.9462 18.24 25.9449H0.444308C0.361894 25.9456 0.280888 25.9235 0.210248 25.8809C0.139655 25.8328 0.0833028 25.7665 0.0471156 25.689C0.0221236 25.6104 0.0221236 25.5259 0.0471156 25.4473C0.0618237 25.3655 0.0986193 25.2892 0.153506 25.2269L3.91265 21.2815C3.99533 21.1963 4.09422 21.1286 4.20346 21.0824C4.31277 21.0337 4.43137 21.0094 4.551 21.0113H22.3183C22.404 21.0097 22.4882 21.0345 22.5594 21.0824C22.6393 21.1154 22.7047 21.1759 22.7439 21.253ZM18.8854 13.7602C18.8009 13.6773 18.7025 13.6099 18.5946 13.5612C18.484 13.5164 18.3663 13.4924 18.2471 13.4901H0.444308C0.360864 13.4913 0.27943 13.5159 0.209231 13.5612C0.139032 13.6064 0.0828724 13.6704 0.0471156 13.746C0.0225831 13.8247 0.0225831 13.909 0.0471156 13.9877C0.0590607 14.0704 0.0962206 14.1474 0.153506 14.2081L3.91265 18.1606C3.99717 18.2436 4.09561 18.311 4.20346 18.3597C4.31383 18.405 4.43173 18.4291 4.551 18.4308H22.3183C22.404 18.4324 22.4882 18.4076 22.5594 18.3597C22.6311 18.3178 22.6861 18.2526 22.7155 18.1749C22.7518 18.0992 22.7639 18.0141 22.7499 17.9314C22.7359 17.8486 22.6966 17.7722 22.6375 17.7128L18.8854 13.7602ZM0.210248 10.8455C0.280888 10.8881 0.361894 10.9102 0.444308 10.9095H18.2471C18.3666 10.9108 18.4851 10.8865 18.5946 10.8384C18.7038 10.7922 18.8027 10.7246 18.8854 10.6394L22.6375 6.69394C22.6956 6.63288 22.7349 6.55639 22.7509 6.47356C22.7755 6.39487 22.7755 6.31055 22.7509 6.23186C22.7216 6.15414 22.6665 6.08889 22.5949 6.04702C22.5237 5.99912 22.4395 5.9743 22.3538 5.97593H4.52263C4.403 5.97402 4.2844 5.99828 4.17509 6.04702C4.06585 6.09322 3.96696 6.1609 3.88428 6.24607L0.132229 10.2057C0.0727337 10.2658 0.0331119 10.3427 0.0187441 10.4261C-0.00624802 10.5047 -0.00624802 10.5892 0.0187441 10.6678C0.0647789 10.7438 0.131116 10.8054 0.210248 10.8455V10.8455Z"
      fill="url(#paint0_linear_127_5312)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_127_5312"
        x1="1.922"
        y1="26.4209"
        x2="20.1989"
        y2="5.40994"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.08" stopColor="#9945FF" />
        <stop offset="0.3" stopColor="#8752F3" />
        <stop offset="0.5" stopColor="#5497D5" />
        <stop offset="0.6" stopColor="#43B4CA" />
        <stop offset="0.72" stopColor="#28E0B9" />
        <stop offset="0.97" stopColor="#19FB9B" />
      </linearGradient>
    </defs>
  </svg>
);

export const SolanaPayButton: React.FC<{
  onClick: MouseEventHandler<HTMLButtonElement>;
  isLoading: boolean;
}> = ({ onClick, isLoading }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center rounded-md border border-transparent bg-black py-2 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
    >
      {!isLoading ? (
        SolanaPayLogo
      ) : (
        <ThreeDots
          height="32"
          width="46"
          radius="9"
          color="#ffffff"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          visible={true}
        />
      )}
    </button>
  );
};

export const OrDivider = (
  <div className="relative mt-4">
    <div className="absolute inset-0 flex items-center" aria-hidden="true">
      <div className="w-full border-t border-gray-200" />
    </div>
    <div className="relative flex justify-center">
      <span className="bg-white px-4 text-sm font-medium text-gray-500">
        or
      </span>
    </div>
  </div>
);

// TEMP
const products = [
  {
    id: 1,
    name: 'High Wall Tote',
    href: '#',
    price: '$210.00',
    color: 'White and black',
    size: '15L',
    imageSrc: '',
    imageAlt:
      'Front of zip tote bag with white canvas, white handles, and black drawstring top.',
  },
  // More products...
];

let solDecimals = 1000000;
const bgColor = '#9945FF';

const Checkout: React.FC<{ props: any; children: ReactNode }> = ({
  props,
  children,
}) => {
  const [amountConverted, setAmountConverted] = useState('');

  useEffect(() => {
    const amountConverted = new BigNumber(props.amount).div(solDecimals);
    setAmountConverted(amountConverted.toString());
  }, []);

  return (
    <div className="bg-white">
      {/* Background color split screen for large screens */}
      <div
        className="fixed top-0 right-0 hidden h-full w-1/2 bg-white lg:block"
        aria-hidden="true"
      />
      <div
        className="fixed top-0 left-0 hidden h-full w-1/2 bg-neutral-900 lg:block"
        aria-hidden="true"
      />

      <header className="relative mx-auto max-w-7xl bg-neutral-900 py-6 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:bg-transparent lg:px-8 lg:pt-16 lg:pb-10">
        <div className="mx-auto flex max-w-2xl px-4 lg:w-full lg:max-w-lg lg:px-0">
          <Image
            src={props.sellerImage ? props.sellerImage : darkLogo}
            alt={props.sellerName ? props.sellerName : 'Blaster'}
            width={32}
            height={32}
            priority
          />
          <dt className="self-center pl-4 text-sm font-medium">
            {props.sellerName}
          </dt>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8">
        <section
          aria-labelledby="summary-heading"
          className="bg-neutral-900 pt-6 pb-12 text-neutral-300 md:px-10 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-24"
        >
          <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
            <h2 id="summary-heading" className="sr-only">
              Order summary
            </h2>

            <dl>
              <dt className="text-sm font-medium">Amount due</dt>
              <dd className="mt-1 text-3xl font-bold tracking-tight text-white">
                {props.finalAmount} {props.currency}
              </dd>
            </dl>

            <ul
              role="list"
              className="divide-y divide-white divide-opacity-10 text-sm font-medium"
            >
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex items-start space-x-4 py-6"
                >
                  <img
                    src={props.productImgSrc}
                    className="h-20 w-20 flex-none rounded-md object-cover object-center"
                  />
                  <div className="flex-auto space-y-1">
                    <h3 className="text-white">{props.productName}</h3>
                    <p>{props.productDescription}</p>
                  </div>
                  <p className="flex-none text-base font-medium text-white">
                    {props.finalAmount} {props.currency}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <dl className="mx-auto max-w-2xl space-y-6 px-4 text-sm font-medium text-white lg:max-w-none lg:px-0">
            <div className="flex justify-between">
              <dt>Item price</dt>
              <dd className="text-white">
                {props.initialAmount} {props.currency}
              </dd>
            </div>
            {props.affiliateShow && props.affiliateAddress && (
              <>
                <div className="flex justify-between">
                  <dt className="flex">
                    <p>
                      {' '}
                      Cash back to{' '}
                      <a
                        className="underline"
                        href={`https://explorer.solana.com/address/${props.affiliateAddress}?cluster=${cluster}}`}
                      >
                        {shortenAddress(props.affiliateAddress)}
                      </a>
                    </p>
                  </dt>
                  <dd className="text-white">{props.affiliatePrice} %</dd>
                </div>
              </>
            )}
            {props.discountPrice && (
              <>
                <div className="flex justify-between">
                  <dt className="flex">
                    <span className="rounded-full bg-gray-200 py-0.5 px-2 text-xs tracking-wide text-black">
                      {' '}
                      {props.discountName}{' '}
                    </span>
                  </dt>
                  <dd className="text-green-400">
                    - {props.discountPrice} {props.currency}
                  </dd>
                </div>
              </>
            )}
            <div className="flex items-center justify-between border-t border-gray-500 pt-6 text-white">
              <dt>Total</dt>
              <dd className="text-base">
                {props.finalAmount} {props.currency}
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="payment-and-shipping-heading"
          className="py-16 lg:col-start-2 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:pt-0 lg:pb-24"
        >
          <div className="mx-auto w-full max-w-lg">{children}</div>
        </section>
        <footer>
          <span className="font-small text-sm text-gray-500">
            Powered by{' '}
            <a href="https://blaster.cash" className="hover:underline">
              Blaster.cash
            </a>
          </span>
        </footer>
      </main>
    </div>
  );
};

export default Checkout;
