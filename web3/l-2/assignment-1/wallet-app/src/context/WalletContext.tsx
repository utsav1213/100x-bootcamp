"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  generateMnemonic,
  validateMnemonic,
  deriveSolanaWallet,
  deriveEthereumWallet,
  SolanaWallet,
  EthereumWallet,
  SOLANA_DEVNET,
  SOLANA_MAINNET,
} from "@/lib/wallet";

interface WalletContextType {
  mnemonic: string | null;
  solanaWallets: SolanaWallet[];
  ethereumWallets: EthereumWallet[];
  network: string;
  setNetwork: (network: string) => void;
  generateNewMnemonic: () => void;
  importMnemonic: (mnemonic: string) => boolean;
  addSolanaWallet: () => void;
  addEthereumWallet: () => void;
  deleteSolanaWallet: (index: number) => void;
  deleteEthereumWallet: (index: number) => void;
  clearWallets: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEY = "wallet_app_data";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [solanaWallets, setSolanaWallets] = useState<SolanaWallet[]>([]);
  const [ethereumWallets, setEthereumWallets] = useState<EthereumWallet[]>([]);
  const [network, setNetwork] = useState<string>(SOLANA_DEVNET);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setMnemonic(data.mnemonic || null);
        setSolanaWallets(data.solanaWallets || []);
        setEthereumWallets(data.ethereumWallets || []);
        setNetwork(data.network || SOLANA_DEVNET);
      } catch (e) {
        console.error("Error loading wallet data:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          mnemonic,
          solanaWallets,
          ethereumWallets,
          network,
        }),
      );
    }
  }, [mnemonic, solanaWallets, ethereumWallets, network, isLoaded]);

  const generateNewMnemonic = () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    setSolanaWallets([]);
    setEthereumWallets([]);
  };

  const importMnemonic = (phrase: string): boolean => {
    const trimmed = phrase.trim().toLowerCase();
    if (validateMnemonic(trimmed)) {
      setMnemonic(trimmed);
      setSolanaWallets([]);
      setEthereumWallets([]);
      return true;
    }
    return false;
  };

  const addSolanaWallet = () => {
    if (!mnemonic) return;
    const index = solanaWallets.length;
    const wallet = deriveSolanaWallet(mnemonic, index);
    setSolanaWallets([...solanaWallets, wallet]);
  };

  const addEthereumWallet = () => {
    if (!mnemonic) return;
    const index = ethereumWallets.length;
    const wallet = deriveEthereumWallet(mnemonic, index);
    setEthereumWallets([...ethereumWallets, wallet]);
  };

  const deleteSolanaWallet = (index: number) => {
    setSolanaWallets(solanaWallets.filter((_, i) => i !== index));
  };

  const deleteEthereumWallet = (index: number) => {
    setEthereumWallets(ethereumWallets.filter((_, i) => i !== index));
  };

  const clearWallets = () => {
    setMnemonic(null);
    setSolanaWallets([]);
    setEthereumWallets([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <WalletContext.Provider
      value={{
        mnemonic,
        solanaWallets,
        ethereumWallets,
        network,
        setNetwork,
        generateNewMnemonic,
        importMnemonic,
        addSolanaWallet,
        addEthereumWallet,
        deleteSolanaWallet,
        deleteEthereumWallet,
        clearWallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
