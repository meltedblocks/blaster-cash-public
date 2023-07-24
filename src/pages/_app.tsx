import type { AppProps } from 'next/app';
import type { NextPageWithLayout } from '@/types';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import ModalsContainer from '@/components/modal-views/container';
import DrawersContainer from '@/components/drawer-views/container';
import DevnetMark from '@/components/settings/DevnetMark';

import { SessionProvider } from 'next-auth/react';
import 'overlayscrollbars/css/OverlayScrollbars.css';
// base css file
import 'swiper/css';
import '@/assets/css/scrollbar.css';
import '@/assets/css/globals.css';
import '@/assets/css/range-slider.css';
require('@solana/wallet-adapter-react-ui/styles.css');
import NextNProgress from 'nextjs-progressbar';
import { Analytics } from '@vercel/analytics/react';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function CustomApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1 maximum-scale=1"
        />
        <title>Blaster - easy on-chain payments</title>
      </Head>
      <ThemeProvider attribute="class" enableSystem={false} defaultTheme="dark">
        <SessionProvider session={pageProps.session} refetchInterval={0}>
          <NextNProgress color="#eb7134" />
          {getLayout(<Component {...pageProps} />)}
          <DevnetMark />
          <ModalsContainer />
          <DrawersContainer />
          <Analytics />
        </SessionProvider>
      </ThemeProvider>
    </>
  );
}

export default CustomApp;
