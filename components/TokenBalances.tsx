// 'use client';

// import { useWallet, useConnection } from '@solana/wallet-adapter-react';
// import { useEffect, useState } from 'react';
// import { AccountInfo, ParsedAccountData } from '@solana/web3.js';

// interface TokenBalance {
//   mint: string;
//   amount: number;
//   decimals: number;
//   symbol?: string;
//   logo?: string;
// }

// export function TokenBalances() {
//   const { publicKey } = useWallet();
//   const { connection } = useConnection();
//   const [tokens, setTokens] = useState<TokenBalance[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (publicKey) {
//       // Get token balances from wallet
//       connection.getParsedTokenAccountsByOwner(publicKey, {
//         programId: TOKEN_PROGRAM_ID
//       }).then(async (accounts) => {
//         const balances = accounts.value.map(account => ({
//           mint: account.account.data.parsed.info.mint,
//           amount: account.account.data.parsed.info.tokenAmount.uiAmount
//         }));

//         const tokenInfoPromises = balances.map(async balance => {
//           const tokenInfo = await fetch(`https://token.jup.ag/all`).then(res => res.json());
//           return {
//             mint: balance.mint,
//             amount: balance.amount,
//             symbol: tokenInfo?.symbol || 'Unknown',
//             logo: tokenInfo?.logoURI
//           };
//         });

//         const tokenBalances = await Promise.all(tokenInfoPromises);
//         setTokens(tokenBalances.filter(token => token.amount > 0));
//       }).catch(error => {
//         console.error('Failed to fetch token information:', error);
//       });
//     }
//   }, [publicKey, connection]);

//   if (!publicKey) return null;

//   return (
//     <div className="w-full max-w-md p-4 bg-gray-800 rounded-lg shadow">
//       <h2 className="text-xl font-bold mb-4">Token Balances</h2>
//       {loading ? (
//         <div className="text-center">Loading...</div>
//       ) : tokens.length > 0 ? (
//         <div className="space-y-2">
//           {tokens.map((token, index) => (
//             <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
//               <div className="flex items-center">
//                 {token.logo && (
//                   <img src={token.logo} alt={token.symbol} className="w-6 h-6 mr-2 rounded-full" />
//                 )}
//                 <span>{token.symbol}</span>
//               </div>
//               <span>{token.amount}</span>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center text-gray-400">No tokens found</div>
//       )}
//     </div>
//   );
// } 