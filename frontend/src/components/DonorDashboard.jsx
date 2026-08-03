// src/components/DonorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';

export default function DonorDashboard() {
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [donationsList, setDonationsList] = useState([]);
  const [totalEth, setTotalEth] = useState('0');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // 1. Connect MetaMask Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to interact with this platform.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  // 2. Fetch All Donations from Contract
  const fetchDonations = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const count = await contract.getDonationCount();
      const rawTotal = await contract.totalDonations();
      setTotalEth(ethers.formatEther(rawTotal));

      const items = [];
      for (let i = 0; i < Number(count); i++) {
        const item = await contract.donations(i);
        items.push({
          donor: item.donor,
          amount: ethers.formatEther(item.amount),
          purpose: item.purpose,
          timestamp: new Date(Number(item.timestamp) * 1000).toLocaleString()
        });
      }
      setDonationsList(items.reverse());
    } catch (err) {
      console.error("Error fetching donations:", err);
    }
  };

  // 3. Send Donation Transaction
  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || !purpose) return;
    try {
      setLoading(true);
      setStatusMessage("Preparing transaction...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const amountInWei = ethers.parseEther(amount);

      setStatusMessage("Please confirm transaction in MetaMask...");
      const tx = await contract.recordDonation(purpose, { value: amountInWei });

      setStatusMessage("Transaction submitted! Waiting for confirmation...");
      await tx.wait();

      setStatusMessage("Donation recorded successfully on Sepolia testnet!");
      setAmount('');
      setPurpose('');
      
      await fetchDonations();
    } catch (err) {
      console.error("Donation failed:", err);
      setStatusMessage("Transaction failed or was rejected.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Smackathon 2k26
            </h1>
            <p className="text-xs md:text-sm text-slate-400">Transparent Blockchain Donation Tracker</p>
          </div>

          <div className="flex items-center gap-3">
            {account ? (
              <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-mono text-sm text-slate-300">
                  {account.substring(0, 6)}...{account.substring(38)}
                </span>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        {/* Hero Metrics Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-gradient-to-br from-indigo-900/40 to-slate-800/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl shadow-lg flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Total Funds Raised</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1">{totalEth} <span className="text-lg font-medium text-indigo-400">ETH</span></h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl font-bold">
              Ξ
            </div>
          </div>

          <div className="p-6 bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-lg flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Transactions</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1">{donationsList.length}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-700/40 border border-slate-600 flex items-center justify-center text-slate-300">
              ⚡
            </div>
          </div>
        </section>

        {/* Donation Action Form */}
        <section className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-slate-100 mb-1">Make an On-Chain Donation</h2>
          <p className="text-sm text-slate-400 mb-6">Transactions are immutably written directly to the Ethereum Sepolia testnet.</p>

          <form onSubmit={handleDonate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Cause / Purpose</label>
                <input 
                  type="text" 
                  value={purpose} 
                  onChange={(e) => setPurpose(e.target.value)} 
                  placeholder="e.g., Medical Relief, Tech Education"
                  required 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Amount (ETH)</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  placeholder="0.01"
                  required 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button 
                type="submit" 
                disabled={loading || !account} 
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                {loading ? "Processing Block..." : "Confirm & Send ETH"}
              </button>

              {statusMessage && (
                <span className="text-xs font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-3 py-2 rounded-lg text-center w-full sm:w-auto">
                  {statusMessage}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Live Transparency Leaderboard Table */}
        <section className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Public Transparency Feed</h2>
              <p className="text-sm text-slate-400">Live ledger records directly from smart contract memory.</p>
            </div>
            <button 
              onClick={fetchDonations} 
              className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              Refresh Feed
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/40">
                  <th className="py-3 px-4">Donor Address</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-sm">
                {donationsList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500 italic">
                      No on-chain donations found. Be the first to donate!
                    </td>
                  </tr>
                ) : (
                  donationsList.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-300">
                        {item.donor.substring(0, 6)}...{item.donor.substring(38)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium">
                        {item.purpose}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {item.amount} ETH
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                        {item.timestamp}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
