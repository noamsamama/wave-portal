import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";

// Address printed by `npm run deploy:local` (or your testnet deployment)
const CONTRACT_ADDRESS = import.meta.env.VITE_WAVEPORTAL_ADDRESS ?? "";

const CONTRACT_ABI = [
  "function wave(string message) external",
  "function getAllWaves() external view returns (tuple(address waver, string message, uint256 timestamp)[])",
  "function totalWaves() external view returns (uint256)",
  "event NewWave(address indexed from, uint256 timestamp, string message)",
];

function shortAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function App() {
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [waves, setWaves] = useState([]);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const hasWallet = typeof window !== "undefined" && window.ethereum;

  const getContract = useCallback(async (withSigner = false) => {
    const provider = new BrowserProvider(window.ethereum);
    if (withSigner) {
      const signer = await provider.getSigner();
      return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, []);

  const refreshWaves = useCallback(async () => {
    if (!hasWallet || !CONTRACT_ADDRESS) return;
    try {
      const contract = await getContract();
      const allWaves = await contract.getAllWaves();
      setWaves(
        [...allWaves]
          .map((w) => ({
            waver: w.waver,
            message: w.message,
            timestamp: Number(w.timestamp) * 1000,
          }))
          .reverse()
      );
    } catch (error) {
      console.error(error);
      setStatus("Could not load waves. Is the contract address correct?");
    }
  }, [getContract, hasWallet]);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      setStatus("");
    } catch {
      setStatus("Wallet connection rejected.");
    }
  };

  const sendWave = async () => {
    if (!message.trim()) {
      setStatus("Write a message first.");
      return;
    }
    setSending(true);
    setStatus("Waiting for signature…");
    try {
      const contract = await getContract(true);
      const tx = await contract.wave(message.trim());
      setStatus(`Mining ${tx.hash.slice(0, 10)}…`);
      await tx.wait();
      setStatus("Wave stored on-chain ✔");
      setMessage("");
      await refreshWaves();
    } catch (error) {
      console.error(error);
      setStatus(
        error?.reason ?? "Transaction failed (cooldown active, perhaps?)"
      );
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    refreshWaves();
  }, [account, refreshWaves]);

  if (!hasWallet) {
    return (
      <main className="container">
        <h1>👋 Wave Portal</h1>
        <p>Install MetaMask to use this app.</p>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>👋 Wave Portal</h1>
      <p className="subtitle">
        Connect your wallet and store a wave on Ethereum. {waves.length} wave
        {waves.length === 1 ? "" : "s"} so far.
      </p>

      {!account ? (
        <button onClick={connectWallet}>Connect wallet</button>
      ) : (
        <>
          <p className="account">Connected as {shortAddress(account)}</p>
          <div className="composer">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="GM from Paris…"
              maxLength={140}
              disabled={sending}
            />
            <button onClick={sendWave} disabled={sending}>
              {sending ? "Sending…" : "Wave 👋"}
            </button>
          </div>
        </>
      )}

      {status && <p className="status">{status}</p>}

      <section className="waves">
        {waves.map((wave, index) => (
          <article key={`${wave.timestamp}-${index}`} className="wave">
            <header>
              <span className="waver">{shortAddress(wave.waver)}</span>
              <time>{new Date(wave.timestamp).toLocaleString()}</time>
            </header>
            <p>{wave.message}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
