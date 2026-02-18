# Web3 Wallet - Assignment 1

A web-based cryptocurrency wallet that supports Solana and Ethereum networks.

## Features

### Core Features ✅
- **Generate Seed Phrases**: Create cryptographically secure 12-word BIP39 seed phrases
- **Import Existing Seed Phrases**: Import your existing wallet seed phrase
- **Multiple Solana Wallets**: Create unlimited Solana wallets from a single seed
- **Multiple Ethereum Wallets**: Create unlimited Ethereum wallets from a single seed
- **View SOL Balance**: Real-time Solana balance tracking
- **View Token Balances**: Support for USDC, USDT, RAY, BONK and other SPL tokens
- **View ETH Balance**: Real-time Ethereum balance tracking
- **Network Switching**: Switch between Solana Devnet and Mainnet

### Bonus Features ✅
- **Send SOL**: Transfer SOL to any Solana address
- **Devnet Airdrop**: Request free SOL on devnet for testing
- **Local Storage**: Wallets persist across browser sessions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Solana**: @solana/web3.js, @solana/spl-token
- **Ethereum**: ethers.js
- **Cryptography**: bip39, ed25519-hd-key, tweetnacl

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

\`\`\`bash
cd wallet-app
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Generate or Import Seed Phrase** - Click "Generate New Seed Phrase" or "Import Existing"
2. **Create Wallets** - Click "Add Wallet" under Solana or Ethereum sections
3. **View Balances** - Balances auto-refresh, click refresh icon to update
4. **Send SOL** - Click "Send" on any Solana wallet
5. **Get Test SOL** - Switch to Devnet and click "Airdrop 1 SOL"

## Security Notes

⚠️ **Important**: This is a development/educational wallet. Never use for storing real funds.

## License

MIT
