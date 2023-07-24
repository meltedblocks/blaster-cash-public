export type FailedPageProps = {
  paymentLinkSlug: string;
  appUrl: string;
};

const FailedPage: React.FC<FailedPageProps> = ({ paymentLinkSlug, appUrl }) => {
  return (
    <>
      <main className="grid min-h-full place-items-center bg-white py-24 px-6 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-red-900">Failed</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Payment failed
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            Your payment fails. Please{' '}
            <a href={`${appUrl}/pay/${paymentLinkSlug}`}>
              try again or contact support.
            </a>
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="#" className="text-sm font-semibold text-gray-900">
              Contact support <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </main>
    </>
  );
};

export default FailedPage;
