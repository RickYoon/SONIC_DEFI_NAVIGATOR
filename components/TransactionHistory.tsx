'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { ParsedTransactionWithMeta } from '@solana/web3.js';

interface Transaction {
  signature: string;
  slot: number;
  timestamp: number;
  type: string;
  amount?: number;
  status: 'success' | 'error';
  rawLogs?: string[];
  rawInstructions?: any;
}

export function TransactionHistory() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    connection.getSignaturesForAddress(publicKey, { limit: 10 })
      .then(async (signatures) => {
        const txPromises = signatures.map(async (item) => {
          const tx = await connection.getParsedTransaction(item.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (!tx) return null;

          let type = 'Unknown';
          let amount;

          if (tx.meta?.logMessages) {
            const messages = tx.meta.logMessages;
            
            if (messages.some(msg => msg.includes('Transfer'))) {
              type = 'SOL Transfer';
              amount = tx.meta.postBalances[0] - tx.meta.preBalances[0];
            } else if (messages.some(msg => msg.includes('Instruction: Sign'))) {
              type = 'Sign Request';
            } else if (messages.some(msg => msg.includes('Instruction: Initialize'))) {
              type = 'Initialize';
            } else if (messages.some(msg => msg.includes('Instruction: Stake'))) {
              type = 'Staking';
            } else if (messages.some(msg => msg.includes('Instruction: Swap'))) {
              type = 'Token Swap';
            }
            
            const programIds = messages
              .filter(msg => msg.includes('Program '))
              .map(msg => msg.split(' ')[1]);
            
            if (programIds.includes('11111111111111111111111111111111')) {
              if (type === 'Unknown') {
                // System Program instruction analysis
                const instructions = tx.transaction.message.instructions;
                if (instructions && instructions.length > 0) {
                  const systemInstruction = instructions[0];
                  if ('parsed' in systemInstruction && systemInstruction.parsed) {
                    const { type: instructionType } = systemInstruction.parsed;
                    switch (instructionType) {
                      case 'createAccount':
                        type = 'Create Account';
                        break;
                      case 'assign':
                        type = 'Assign Account';
                        break;
                      case 'transfer':
                        type = 'SOL Transfer';
                        break;
                      case 'createAccountWithSeed':
                        type = 'Create Seed Account';
                        break;
                      case 'allocate':
                        type = 'Allocate Memory';
                        break;
                      default:
                        type = `System Operation: ${instructionType}`;
                    }
                  }
                }
              }
            } else if (programIds.includes('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')) {
              if (type === 'Unknown') type = 'Token Program';
            }
          }

          const transaction: Transaction = {
            signature: item.signature,
            slot: item.slot,
            timestamp: item.blockTime || 0,
            type,
            status: tx.meta?.err ? 'error' : 'success',
            rawLogs: tx.meta?.logMessages || [],
            rawInstructions: tx.transaction.message.instructions
          };

          if (amount !== undefined) {
            transaction.amount = Math.abs(amount) / 1e9;
          }

          return transaction;
        });

        const txs = (await Promise.all(txPromises)).filter((tx): tx is Transaction => tx !== null);
        setTransactions(txs);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch transaction information:', error);
        setLoading(false);
      });
  }, [publicKey, connection]);

  if (!publicKey) return null;

  return (
    <div className="w-full max-w-md p-4 bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : transactions.length > 0 ? (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.signature} className="p-2 bg-gray-700 rounded">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedTx(expandedTx === tx.signature ? null : tx.signature)}
              >
                <span className="text-sm">{tx.type}</span>
                <span className={tx.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                  {tx.status === 'success' ? 'Success' : 'Failed'}
                </span>
              </div>
              {tx.amount && (
                <div className="text-sm text-gray-400">
                  {tx.amount.toLocaleString()} SOL
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {new Date(tx.timestamp * 1000).toLocaleString()}
              </div>
              
              {/* Transaction Details */}
              {expandedTx === tx.signature && (
                <div className="mt-2 p-2 bg-gray-800 rounded text-xs font-mono">
                  <div className="mb-2">
                    <div className="text-blue-400 mb-1">Log Messages:</div>
                    {tx.rawLogs?.map((log, i) => (
                      <div key={i} className="text-gray-300 break-all">{log}</div>
                    ))}
                  </div>
                  <div>
                    <div className="text-blue-400 mb-1">Instructions:</div>
                    <pre className="text-gray-300 overflow-x-auto">
                      {JSON.stringify(tx.rawInstructions, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400">No transaction history</div>
      )}
    </div>
  );
} 