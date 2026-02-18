"use client";

import Header from "@/components/Header";
import MnemonicCard from "@/components/MnemonicCard";
import SolanaWalletList from "@/components/SolanaWalletList";
import EthereumWalletList from "@/components/EthereumWalletList";
import { useWallet } from "@/context/WalletContext";

export default function Home() {
  const { mnemonic } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Only show when no mnemonic */}
        {!mnemonic && (
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-400 text-sm font-medium">
                🧪 Practice Mode - For Learning Only
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Learn{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Web3 Wallets
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Practice creating seed phrases, managing wallets, and
              understanding blockchain transactions. Perfect for Web3
              development learning!
            </p>
          </div>
        )}

        <div className="space-y-8">
          {/* Mnemonic Card */}
          <MnemonicCard />

          {/* Wallet Lists - Show in a grid on larger screens */}
          {mnemonic && (
            <div className="grid lg:grid-cols-2 gap-8">
              <SolanaWalletList />
              <EthereumWalletList />
            </div>
          )}
        </div>

        {/* Features Section - Only show when no mnemonic */}
        {!mnemonic && (
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Secure Seed Phrases
              </h3>
              <p className="text-gray-400 text-sm">
                Generate cryptographically secure 12-word seed phrases using
                BIP39 standard.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Multi-Wallet Support
              </h3>
              <p className="text-gray-400 text-sm">
                Create unlimited Solana and Ethereum wallets from a single seed
                phrase.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Balance Tracking
              </h3>
              <p className="text-gray-400 text-sm">
                View SOL, ETH, and token balances in real-time across all your
                wallets.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Send Transactions
              </h3>
              <p className="text-gray-400 text-sm">
                Send SOL to other addresses directly from your wallet. Fast and
                simple.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p className="text-lg font-semibold text-gray-400">
              🎓 100xDevs Web3 Assignment
            </p>
            <p className="mt-2 text-yellow-500/80">
              ⚠️ PRACTICE ONLY - This is for learning purposes. Never use for
              real funds!
            </p>
            <p className="mt-1 text-gray-600">
              Using Solana Devnet for testing • No real crypto involved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
