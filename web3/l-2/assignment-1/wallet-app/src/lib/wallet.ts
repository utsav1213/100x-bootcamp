import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ethers } from "ethers";
import bs58 from "bs58";
import nacl from "tweetnacl";

// Solana devnet/mainnet connection
export const SOLANA_MAINNET = "https://api.mainnet-beta.solana.com";
export const SOLANA_DEVNET = "https://api.devnet.solana.com";

// Common SPL Token addresses (Mainnet)
export const TOKEN_LIST = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
};

export interface WalletInfo {
  publicKey: string;
  privateKey: string;
  path: string;
  index: number;
}

export interface SolanaWallet extends WalletInfo {
  type: "solana";
}

export interface EthereumWallet extends WalletInfo {
  type: "ethereum";
  address: string;
}

export interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
}

// Generate a new random mnemonic (seed phrase)
export function generateMnemonic(): string {
  return bip39.generateMnemonic(128); // 12 words
}

// Validate a mnemonic
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

// Get seed from mnemonic
export function mnemonicToSeed(mnemonic: string): Buffer {
  return bip39.mnemonicToSeedSync(mnemonic);
}

// Derive Solana wallet from seed
export function deriveSolanaWallet(
  mnemonic: string,
  index: number,
): SolanaWallet {
  const seed = mnemonicToSeed(mnemonic);
  const path = `m/44'/501'/${index}'/0'`;
  const derivedSeed = derivePath(path, seed.toString("hex")).key;
  const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
  const solanaKeypair = Keypair.fromSecretKey(keypair.secretKey);

  return {
    type: "solana",
    publicKey: solanaKeypair.publicKey.toBase58(),
    privateKey: bs58.encode(solanaKeypair.secretKey),
    path,
    index,
  };
}

// Derive Ethereum wallet from seed
export function deriveEthereumWallet(
  mnemonic: string,
  index: number,
): EthereumWallet {
  const path = `m/44'/60'/${index}'/0/0`;
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, path);

  return {
    type: "ethereum",
    publicKey: hdNode.publicKey,
    privateKey: hdNode.privateKey,
    address: hdNode.address,
    path,
    index,
  };
}

// Get Solana balance
export async function getSolanaBalance(
  publicKey: string,
  network: string = SOLANA_DEVNET,
): Promise<number> {
  try {
    const connection = new Connection(network, "confirmed");
    const pubKey = new PublicKey(publicKey);
    const balance = await connection.getBalance(pubKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    return 0;
  }
}

// Get SPL Token balance
export async function getTokenBalance(
  walletPublicKey: string,
  tokenMintAddress: string,
  network: string = SOLANA_DEVNET,
): Promise<TokenBalance | null> {
  try {
    const connection = new Connection(network, "confirmed");
    const walletPubKey = new PublicKey(walletPublicKey);
    const mintPubKey = new PublicKey(tokenMintAddress);

    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintPubKey,
      walletPubKey,
    );

    const tokenAccount = await getAccount(connection, associatedTokenAddress);

    // Get token symbol from our list
    const symbol =
      Object.entries(TOKEN_LIST).find(
        ([, address]) => address === tokenMintAddress,
      )?.[0] || "Unknown";

    return {
      mint: tokenMintAddress,
      symbol,
      balance: Number(tokenAccount.amount) / Math.pow(10, 6), // Assuming 6 decimals for most tokens
      decimals: 6,
    };
  } catch (error) {
    // Token account doesn't exist or other error
    return null;
  }
}

// Get all token balances for a wallet
export async function getAllTokenBalances(
  walletPublicKey: string,
  network: string = SOLANA_DEVNET,
): Promise<TokenBalance[]> {
  const balances: TokenBalance[] = [];

  for (const [symbol, mintAddress] of Object.entries(TOKEN_LIST)) {
    const balance = await getTokenBalance(
      walletPublicKey,
      mintAddress,
      network,
    );
    if (balance && balance.balance > 0) {
      balances.push({ ...balance, symbol });
    }
  }

  return balances;
}

// Send SOL to another address
export async function sendSol(
  fromPrivateKey: string,
  toAddress: string,
  amount: number,
  network: string = SOLANA_DEVNET,
): Promise<string> {
  const connection = new Connection(network, "confirmed");
  const fromKeypair = Keypair.fromSecretKey(bs58.decode(fromPrivateKey));
  const toPublicKey = new PublicKey(toAddress);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    }),
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    fromKeypair,
  ]);
  return signature;
}

// Request airdrop (devnet only)
export async function requestAirdrop(
  publicKey: string,
  amount: number = 1,
  network: string = SOLANA_DEVNET,
): Promise<string> {
  const connection = new Connection(network, "confirmed");
  const pubKey = new PublicKey(publicKey);
  const signature = await connection.requestAirdrop(
    pubKey,
    amount * LAMPORTS_PER_SOL,
  );
  await connection.confirmTransaction(signature);
  return signature;
}

// Get Ethereum balance
export async function getEthereumBalance(address: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error fetching Ethereum balance:", error);
    return "0";
  }
}
