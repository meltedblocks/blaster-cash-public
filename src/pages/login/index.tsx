import WalletContext from '@/components/WalletContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import bs58 from 'bs58';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SignIn from '../../components/sign-in/SignIn';
import { SigninMessage } from '../../utils/SigninMessage';

export default function Login() {
  return (
    <>
      <WalletContext>
        <LoginComponent />
      </WalletContext>
    </>
  );
}

const LoginComponent = () => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const router = useRouter();

  const loading = status === 'loading';

  const wallet = useWallet();
  const walletModal = useWalletModal();

  const handleSignIn = async () => {
    try {
      setIsButtonClicked(true);
      if (!wallet.connected) {
        walletModal.setVisible(true);
        return;
      }

      setIsLoading(true);

      const csrf = await getCsrfToken();
      if (!wallet.publicKey || !csrf || !wallet.signMessage) return;

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: wallet.publicKey?.toBase58(),
        statement: `Sign this message to sign in to the app.`,
        nonce: csrf,
      });

      const data = new TextEncoder().encode(message.prepare());
      const signature = await wallet.signMessage(data);
      const serializedSignature = bs58.encode(signature);

      signIn('credentials', {
        message: JSON.stringify(message),
        redirect: false,
        signature: serializedSignature,
      });
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    walletModal.setVisible(false);
  }, []);

  useEffect(() => {
    if (wallet.connected && status === 'unauthenticated' && isButtonClicked) {
      setIsLoading(true);
      handleSignIn();
    }
  }, [wallet.connected]);

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session]);
  return <SignIn handleSignIn={handleSignIn} isLoading={isLoading} />;
};
