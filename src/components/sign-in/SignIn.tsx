import Button from '@/components/ui/button';
import Image from '@/components/ui/image';
import darkLogo from '@/assets/images/logo-white.svg';
export type SingInProps = {
  handleSignIn: () => Promise<void>;
  isLoading: boolean;
};

const SignIn: React.FC<SingInProps> = (props) => {
  const onClick = async (e: any) => {
    e.preventDefault();
    await props.handleSignIn();
  };
  return (
    <>
      <div className="py-4 text-center lg:px-4">
        <div
          className="flex items-center bg-orange-700 p-2 leading-none text-indigo-100 lg:inline-flex lg:rounded-full"
          role="alert"
        >
          <span className="mr-3 flex rounded-full bg-orange-800 px-2 py-1 text-xs font-bold uppercase">
            Devnet
          </span>
          <span className="mr-2 flex-auto text-left font-semibold">
            To use this application change network in your wallet to Devnet.
            Solflare and Phantom are supported for now. You can get free SOL{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://solfaucet.com/"
            >
              here
            </a>
          </span>
        </div>
      </div>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <Image
                className="mx-auto mb-12"
                src={darkLogo}
                alt="Blaster"
                height={24}
                priority
              />
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                Sign in to your account
              </h2>
              <p className="mt-2 text-center text-sm">
                or <a className="font-medium">create free account</a>
              </p>
            </div>

            <form
              className="mt-10 items-center space-y-6"
              action="#"
              method="POST"
            >
              <Button
                size="large"
                shape="rounded"
                fullWidth={true}
                className=""
                onClick={onClick}
                isLoading={props.isLoading}
              >
                Connect your wallet to sign in
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
