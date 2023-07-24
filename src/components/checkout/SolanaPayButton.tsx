import React, { useCallback } from 'react';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import { createTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { SolanaPayButton } from './CheckoutPage';

import { useMemo } from 'react';
import { shortenAddress } from '../../utils/ShortenAddress';
import axios from 'axios';

export const OrderStatus = {
  INITIALIZED: 'INITIALIZED',
  INPROGRESS: 'INPROGRESS',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  INCORRECT: 'INCORRECT',
};

export type SolanaPayProps = {
  recipient: string;
  amount: string;
  reference: string;
  isLoading: boolean;
  appUrl: string;
  orderId: string;
  cluster: string;
  setIsLoading: any;
};

const SolanaPay: React.FC<SolanaPayProps> = (props) => {
  const { wallet, publicKey, connected, sendTransaction } = useWallet();

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [signedMessage, setSignedMessage] = useState('');
  const [verified, setVerified] = useState(false);
  const { setVisible } = useWalletModal();
  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    if (!connected) {
      setError('');
      setMessage('');
      setSignature('');
      setSignedMessage('');
      setVerified(false);
      setVisible(false);
    }
    if (buttonClicked) {
      props.setIsLoading(true);
      pay();
      setButtonClicked(false);
    }
  }, [connected]);

  useEffect(() => {
    setVisible(false);
  }, []);

  const payClick = async (e) => {
    e.preventDefault();
    setButtonClicked(true);
    if (props.isLoading) return;
    if (!connected) {
      setVisible(true);
      setButtonClicked(true);
      return;
    }
    pay();
  };

  const openModal = useCallback(
    (e) => {
      e.preventDefault();
      setVisible(true);
    },
    [setVisible]
  );

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const content = useMemo(() => {
    if (!wallet || !base58) return null;
    return shortenAddress(base58);
  }, [wallet, base58]);

  const pay = async () => {
    try {
      props.setIsLoading(true);
      if (connected) {
        const result = await axios.post(
          `${props.appUrl}/api/order/${props.orderId}`,
          {
            account: publicKey.toString(),
          }
        );
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const tx = Transaction.from(
          Buffer.from(result.data.transaction, 'base64')
        );
        await sendTransaction(tx, connection);
      }
    } catch (e) {
      props.setIsLoading(false);
      console.log(e);
    }
  };

  return (
    <>
      <SolanaPayButton onClick={payClick} isLoading={props.isLoading} />
      {connected && (
        <div className="right mt-2 flex justify-end">
          <button onClick={openModal}>
            <p className="text-sm font-semibold underline">
              {content} connected{' '}
            </p>
          </button>
        </div>
      )}
    </>
  );
};

export default SolanaPay;
