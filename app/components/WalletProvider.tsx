'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

export function ClientWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Mainnet;
  
  // 환경변수에서 RPC URL을 가져옵니다
  const endpoint = process.env.NEXT_PUBLIC_RPC_URL || "https://fittest-wandering-glade.solana-mainnet.quiknode.pro/dcfcd11bcbbc9f736295b7cc0fb946f4c3d94f22/";
  

  return (
    <ConnectionProvider endpoint={endpoint}>
      {/* <WalletProvider wallets={wallets} autoConnect> */}
        <WalletModalProvider>{children}</WalletModalProvider>
      {/* </WalletProvider> */}
    </ConnectionProvider>
  );
} 