import { Router } from 'next/router';
import { useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useRouter } from 'next/router';

export type SuccessPageProps = {
  redirectUrl: string;
};

const redirect = (router, redirectUrl) => {
  if (!redirectUrl) {
    return;
  }
  setTimeout(() => {
    router.push(redirectUrl);
  }, 3000);
};

const SuccessPage: React.FC<SuccessPageProps> = (props) => {
  const router = useRouter();
  useEffect(() => {
    redirect(router, props.redirectUrl);
  }, []);
  return (
    <>
      <main className="grid min-h-full place-items-center bg-white py-24 px-6 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-green-800">Success</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Payment successful
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">All good!</p>
          {props.redirectUrl && (
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a href="#" className="text-sm font-semibold text-gray-900">
                Redirecting to merchant page
              </a>
            </div>
          )}
        </div>
      </main>
      <div className="h-screen bg-white"></div>
    </>
  );
};

export default SuccessPage;
