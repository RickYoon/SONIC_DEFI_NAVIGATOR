// 'use client';

// import { useWallet } from '@solana/wallet-adapter-react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { LAMPORTS_PER_SOL } from '@solana/web3.js';
// import { useEffect, useState } from 'react';
// import { useConnection } from '@solana/wallet-adapter-react';

// export function WalletButton() {
//   const { publicKey } = useWallet();
//   const [balance, setBalance] = useState<number | null>(null);
//   const [mounted, setMounted] = useState(false);
//   const connection = useConnection();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (publicKey) {
//       // Fetch balance when wallet is connected
//       connection.getBalance(publicKey).then(setBalance);
//     }
//   }, [publicKey, connection]);

//   return (
//     <div className="flex items-center gap-4">
//       {mounted && (
//         <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
//       )}
//       {balance !== null && (
//         <div className="text-sm text-gray-300">
//           Balance: {balance.toLocaleString()} SOL
//         </div>
//       )}
//     </div>
//   );
// } 