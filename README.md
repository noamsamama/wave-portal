# 👋 Wave Portal

[![CI](https://github.com/noamsamama/wave-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/noamsamama/wave-portal/actions/workflows/ci.yml)
![Solidity](https://img.shields.io/badge/Solidity-0.8.26-363636?logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22-fff100)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![ethers.js](https://img.shields.io/badge/ethers.js-6-2535A0)

A full-cycle Ethereum dApp: connect MetaMask, send a "wave" with a message, and store it on-chain. Covers the complete interaction lifecycle:

```
wallet ──► signature ──► transaction ──► smart contract ──► event ──► frontend
```

## Smart contract

`WavePortal.sol`:

- Stores waves as `(waver, message, timestamp)` structs
- Emits a `NewWave` event on every wave
- Custom errors (`EmptyMessage`, `CooldownActive`) instead of revert strings
- 30-second per-address cooldown using a `mapping(address => uint256)`

**5 Hardhat tests** cover storage, events, input validation, and cooldown logic (including time manipulation with `network-helpers`).

## Frontend (`web/`)

React 18 + Vite + ethers v6:

- Wallet connection via `BrowserProvider`
- `wave()` write call with transaction lifecycle feedback (signature → mining → confirmed)
- On-chain wave feed via `getAllWaves()`

## Run it locally

```bash
# 1. Contracts: test then run a local node
npm ci
npm test
npm run node                # terminal 1: local JSON-RPC at http://127.0.0.1:8545

# 2. Deploy to the local node
npm run deploy:local        # terminal 2: prints the contract address

# 3. Frontend
cd web
npm ci
VITE_WAVEPORTAL_ADDRESS=0x... npm run dev
```

Point MetaMask at the local network (`http://127.0.0.1:8545`, chain id `31337`), import one of the Hardhat test accounts, and wave.

## Why this project

Built as a hands-on introduction to Ethereum fundamentals (gas, signatures, events, testnets) before moving on to [tokenized bond DvP settlement](https://github.com/noamsamama/tokenized-bond-settlement-lab).

## License

MIT
