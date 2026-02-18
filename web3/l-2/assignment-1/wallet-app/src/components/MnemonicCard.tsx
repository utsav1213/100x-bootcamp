"use client";

import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { Eye, EyeOff, Copy, RefreshCw, Download, Upload } from "lucide-react";

export default function MnemonicCard() {
  const { mnemonic, generateNewMnemonic, importMnemonic } = useWallet();
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const [importValue, setImportValue] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (mnemonic) {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImport = () => {
    setError("");
    if (importMnemonic(importValue)) {
      setImportMode(false);
      setImportValue("");
    } else {
      setError("Invalid mnemonic phrase. Please check and try again.");
    }
  };

  if (!mnemonic && !importMode) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">Get Started</h2>
        <p className="text-gray-400 mb-6">
          Generate a new seed phrase or import an existing one to create your
          wallets.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={generateNewMnemonic}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <RefreshCw size={20} />
            Generate New Seed Phrase
          </button>
          <button
            onClick={() => setImportMode(true)}
            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            <Upload size={20} />
            Import Existing
          </button>
        </div>
      </div>
    );
  }

  if (importMode) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">
          Import Seed Phrase
        </h2>
        <p className="text-gray-400 mb-6">
          Enter your 12-word seed phrase separated by spaces.
        </p>
        <textarea
          value={importValue}
          onChange={(e) => setImportValue(e.target.value)}
          placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
          className="w-full h-32 bg-gray-800 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono"
        />
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleImport}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <Download size={20} />
            Import
          </button>
          <button
            onClick={() => {
              setImportMode(false);
              setImportValue("");
              setError("");
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Your Seed Phrase</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMnemonic(!showMnemonic)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title={showMnemonic ? "Hide" : "Show"}
          >
            {showMnemonic ? (
              <EyeOff size={20} className="text-gray-300" />
            ) : (
              <Eye size={20} className="text-gray-300" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Copy"
          >
            <Copy
              size={20}
              className={copied ? "text-green-400" : "text-gray-300"}
            />
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        {showMnemonic ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {mnemonic?.split(" ").map((word, index) => (
              <div
                key={index}
                className="bg-gray-700/50 rounded-lg px-3 py-2 text-center"
              >
                <span className="text-gray-500 text-xs">{index + 1}.</span>
                <span className="text-white ml-1 font-mono">{word}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Click the eye icon to reveal your seed phrase
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-xl">
        <p className="text-yellow-400 text-sm">
          ⚠️ <strong>Warning:</strong> Never share your seed phrase with anyone.
          Anyone with this phrase can access all your wallets.
        </p>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={generateNewMnemonic}
          className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
        >
          <RefreshCw size={18} />
          Generate New
        </button>
      </div>
    </div>
  );
}
