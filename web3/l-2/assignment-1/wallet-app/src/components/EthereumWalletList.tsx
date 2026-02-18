"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { EthereumWallet, getEthereumBalance } from "@/lib/wallet";
import { Plus, Trash2, Copy, Eye, EyeOff, RefreshCw } from "lucide-react";

interface WalletCardProps {
  wallet: EthereumWallet;
  onDelete: () => void;
}

function EthereumWalletCard({ wallet, onDelete }: WalletCardProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const eth = await getEthereumBalance(wallet.address);
      setBalance(eth);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBalance();
  }, [wallet.address]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold">Ξ</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">
              ETH Wallet #{wallet.index + 1}
            </h3>
            <p className="text-gray-400 text-sm font-mono">{shortAddress}</p>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
              PRACTICE
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchBalance}
            disabled={loading}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw
              size={18}
              className={`text-gray-300 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-900/50 hover:bg-red-800/50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Balance Display */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <p className="text-gray-400 text-sm mb-1">Balance</p>
        <p className="text-3xl font-bold text-white">
          {loading ? (
            <span className="text-gray-500">Loading...</span>
          ) : (
            <>
              {parseFloat(balance || "0").toFixed(6)}{" "}
              <span className="text-blue-400 text-lg">ETH</span>
            </>
          )}
        </p>
      </div>

      {/* Address Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs mb-1">Address</p>
            <p className="text-white text-sm font-mono truncate">
              {wallet.address}
            </p>
          </div>
          <button
            onClick={() => handleCopy(wallet.address)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-2"
          >
            <Copy
              size={16}
              className={copied ? "text-green-400" : "text-gray-400"}
            />
          </button>
        </div>

        <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs mb-1">Private Key</p>
            <p className="text-white text-sm font-mono truncate">
              {showPrivateKey ? wallet.privateKey : "••••••••••••••••••••••••"}
            </p>
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {showPrivateKey ? (
                <EyeOff size={16} className="text-gray-400" />
              ) : (
                <Eye size={16} className="text-gray-400" />
              )}
            </button>
            <button
              onClick={() => handleCopy(wallet.privateKey)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Copy size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EthereumWalletList() {
  const { mnemonic, ethereumWallets, addEthereumWallet, deleteEthereumWallet } =
    useWallet();

  if (!mnemonic) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">🧪 Ethereum Wallets</h2>
          <p className="text-gray-400 text-sm mt-1">
            Practice wallets for learning
          </p>
        </div>
        <button
          onClick={addEthereumWallet}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
        >
          <Plus size={20} />
          Add Wallet
        </button>
      </div>

      {ethereumWallets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No Ethereum wallets yet</p>
          <button
            onClick={addEthereumWallet}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Create your first wallet
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {ethereumWallets.map((wallet, index) => (
            <EthereumWalletCard
              key={`${wallet.address}-${index}`}
              wallet={wallet}
              onDelete={() => deleteEthereumWallet(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
