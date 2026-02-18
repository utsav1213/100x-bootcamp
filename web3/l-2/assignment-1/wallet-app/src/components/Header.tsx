"use client";

import { useWallet } from "@/context/WalletContext";
import { SOLANA_DEVNET, SOLANA_MAINNET } from "@/lib/wallet";
import { Wallet, Trash2 } from "lucide-react";

export default function Header() {
  const { mnemonic, network, setNetwork, clearWallets } = useWallet();

  return (
    <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Wallet className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Web3 Wallet
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                  PRACTICE
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                100xDevs Assignment - Learning Only
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {mnemonic && (
              <>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={SOLANA_DEVNET}>Solana Devnet</option>
                  <option value={SOLANA_MAINNET}>Solana Mainnet</option>
                </select>

                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to clear all wallets? This action cannot be undone.",
                      )
                    ) {
                      clearWallets();
                    }
                  }}
                  className="flex items-center gap-2 bg-red-900/50 hover:bg-red-800/50 text-red-400 text-sm py-2 px-3 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
