"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import {
  SolanaWallet,
  getSolanaBalance,
  getAllTokenBalances,
  requestAirdrop,
  sendSol,
  TokenBalance,
  SOLANA_DEVNET,
} from "@/lib/wallet";
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Droplets,
} from "lucide-react";

interface WalletCardProps {
  wallet: SolanaWallet;
  onDelete: () => void;
  network: string;
}

function SolanaWalletCard({ wallet, onDelete, network }: WalletCardProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [airdropping, setAirdropping] = useState(false);
  const [txResult, setTxResult] = useState<{
    success: boolean;
    message: string;
    isRateLimited?: boolean;
  } | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const sol = await getSolanaBalance(wallet.publicKey, network);
      setBalance(sol);
      const tokenBalances = await getAllTokenBalances(
        wallet.publicKey,
        network,
      );
      setTokens(tokenBalances);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBalance();
  }, [wallet.publicKey, network]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAirdrop = async () => {
    if (network !== SOLANA_DEVNET) {
      setTxResult({
        success: false,
        message: "Airdrop only available on Devnet",
      });
      return;
    }
    setAirdropping(true);
    try {
      await requestAirdrop(wallet.publicKey, 1, network);
      setTxResult({
        success: true,
        message: "Airdrop successful! 1 SOL received.",
      });
      fetchBalance();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      // Check for rate limit error (429)
      if (
        errorMessage.includes("429") ||
        errorMessage.includes("Too Many Requests") ||
        errorMessage.includes("limit")
      ) {
        setTxResult({
          success: false,
          message:
            "Rate limited! Visit faucet.solana.com to get test SOL manually.",
          isRateLimited: true,
        });
      } else {
        setTxResult({
          success: false,
          message: `Airdrop failed: ${errorMessage}`,
        });
      }
    }
    setAirdropping(false);
    setTimeout(() => setTxResult(null), 10000);
  };

  const handleSend = async () => {
    if (!sendTo || !sendAmount) return;

    // Check if user has enough balance
    const amount = parseFloat(sendAmount);
    if (balance !== null && amount > balance) {
      setTxResult({
        success: false,
        message: `Insufficient balance! You have ${balance.toFixed(4)} SOL but trying to send ${amount} SOL.`,
      });
      return;
    }

    if (balance === 0 || balance === null) {
      setTxResult({
        success: false,
        message:
          "You need SOL to send transactions. Get some from faucet.solana.com first!",
      });
      return;
    }

    setSending(true);
    try {
      const signature = await sendSol(
        wallet.privateKey,
        sendTo,
        amount,
        network,
      );
      setTxResult({
        success: true,
        message: `Transaction successful! Signature: ${signature.slice(0, 20)}...`,
      });
      setShowSend(false);
      setSendTo("");
      setSendAmount("");
      fetchBalance();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      // Provide more helpful error messages
      if (
        errorMessage.includes("insufficient") ||
        errorMessage.includes("0x1")
      ) {
        setTxResult({
          success: false,
          message:
            "Insufficient funds for transaction + fees. You need a small amount extra for gas fees.",
        });
      } else if (
        errorMessage.includes("Invalid") ||
        errorMessage.includes("invalid")
      ) {
        setTxResult({
          success: false,
          message: "Invalid recipient address. Please check and try again.",
        });
      } else {
        setTxResult({
          success: false,
          message: `Transaction failed: ${errorMessage}`,
        });
      }
    }
    setSending(false);
    setTimeout(() => setTxResult(null), 8000);
  };

  const shortAddress = `${wallet.publicKey.slice(0, 6)}...${wallet.publicKey.slice(-4)}`;

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">
              Dev Wallet #{wallet.index + 1}
            </h3>
            <p className="text-gray-400 text-sm font-mono">{shortAddress}</p>
            <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
              DEVNET ONLY
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
              {balance?.toFixed(4)}{" "}
              <span className="text-purple-400 text-lg">SOL</span>
            </>
          )}
        </p>

        {/* Token Balances */}
        {tokens.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Tokens</p>
            {tokens.map((token) => (
              <div key={token.mint} className="flex justify-between text-sm">
                <span className="text-gray-300">{token.symbol}</span>
                <span className="text-white font-mono">
                  {token.balance.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        {network === SOLANA_DEVNET && (
          <button
            onClick={handleAirdrop}
            disabled={airdropping}
            className="flex items-center gap-1 bg-cyan-600/50 hover:bg-cyan-600 text-white text-sm py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
          >
            <Droplets size={16} />
            {airdropping ? "Airdropping..." : "Airdrop 1 SOL"}
          </button>
        )}
        <button
          onClick={() => setShowSend(!showSend)}
          className="flex items-center gap-1 bg-purple-600/50 hover:bg-purple-600 text-white text-sm py-2 px-3 rounded-lg transition-colors"
        >
          <Send size={16} />
          Send
        </button>
      </div>

      {/* Send Form */}
      {showSend && (
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4 space-y-3">
          <input
            type="text"
            placeholder="Recipient Address"
            value={sendTo}
            onChange={(e) => setSendTo(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="number"
            placeholder="Amount (SOL)"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={sending || !sendTo || !sendAmount}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {sending ? "Sending..." : "Confirm Send"}
          </button>
        </div>
      )}

      {/* Transaction Result */}
      {txResult && (
        <div
          className={`p-3 rounded-lg mb-4 ${txResult.success ? "bg-green-900/30 border border-green-500/30" : "bg-red-900/30 border border-red-500/30"}`}
        >
          <p
            className={`text-sm ${txResult.success ? "text-green-400" : "text-red-400"}`}
          >
            {txResult.message}
          </p>
          {txResult.isRateLimited && (
            <a
              href={`https://faucet.solana.com/?address=${wallet.publicKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-cyan-400 hover:text-cyan-300 underline"
            >
              → Click here to get SOL from Solana Faucet
            </a>
          )}
        </div>
      )}

      {/* Address Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs mb-1">Public Address</p>
            <p className="text-white text-sm font-mono truncate">
              {wallet.publicKey}
            </p>
          </div>
          <button
            onClick={() => handleCopy(wallet.publicKey)}
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

export default function SolanaWalletList() {
  const {
    mnemonic,
    solanaWallets,
    addSolanaWallet,
    deleteSolanaWallet,
    network,
  } = useWallet();

  if (!mnemonic) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">🧪 Solana Wallets</h2>
          <p className="text-gray-400 text-sm mt-1">
            Practice wallets for learning (Devnet)
          </p>
        </div>
        <button
          onClick={addSolanaWallet}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
        >
          <Plus size={20} />
          Add Wallet
        </button>
      </div>

      {solanaWallets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No Solana wallets yet</p>
          <button
            onClick={addSolanaWallet}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Create your first wallet
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {solanaWallets.map((wallet, index) => (
            <SolanaWalletCard
              key={`${wallet.publicKey}-${index}`}
              wallet={wallet}
              onDelete={() => deleteSolanaWallet(index)}
              network={network}
            />
          ))}
        </div>
      )}
    </div>
  );
}
