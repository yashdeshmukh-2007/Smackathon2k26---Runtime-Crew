// frontend/src/components/DonorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';

export default function DonorDashboard() {
  const [account, setAccount] = useState(null);

  // Donation Form States
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [amount, setAmount] = useState('');

  // Campaign Registration States
  const [newCampaignId, setNewCampaignId] = useState('');
  const [newBeneficiary, setNewBeneficiary] = useState('');

  // On-Chain Data States
  const [campaigns, setCampaigns] = useState([]);
  const [donationsList, setDonationsList] = useState([]);
  const [totalEth, setTotalEth] = useState('0');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Fallback Read Provider (Allows read-only access even without MetaMask)
  const getReadProvider = () => {
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    // Fallback to local RPC node if wallet extension is absent
    return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  };

  // 1. Connect Wallet
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

  // 2. Fetch On-Chain Data
  const fetchData = useCallback(async () => {
    try {
      const provider = getReadProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Fetch total funds raised
      const rawTotal = await contract.totalAmountRaised();
      setTotalEth(ethers.formatEther(rawTotal));

      // Fetch registered campaigns
      const campaignCount = await contract.getRegisteredCampaignsCount();
      const loadedCampaigns = [];

      for (let i = 0; i < Number(campaignCount); i++) {
        const id = await contract.getRegisteredCampaignIdAt(i);
        const beneficiary = await contract.getCampaignBeneficiary(id);
        const raisedWei = await contract.getTotalRaisedForCampaign(id);
        loadedCampaigns.push({
          id,
          beneficiary,
          raisedEth: ethers.formatEther(raisedWei)
        });
      }

      setCampaigns(loadedCampaigns);
      if (loadedCampaigns.length > 0 && !selectedCampaign) {
        setSelectedCampaign(loadedCampaigns[0].id);
      }

      // Fetch paginated donation history
      const totalDonations = await contract.getDonationsCount();
      const totalCount = Number(totalDonations);

      if (totalCount > 0) {
        const pageSize = Math.min(totalCount, 50);
        const startIndex = totalCount > pageSize ? totalCount - pageSize : 0;
        const rawPage = await contract.getDonationsPage(startIndex, pageSize);

        const formatted = rawPage.map((item) => ({
          donor: item.donor,
          amount: ethers.formatEther(item.amount),
          campaignId: item.campaignId,
          timestamp: new Date(Number(item.timestamp) * 1000).toLocaleString()
        })).reverse(); // Newest first

        setDonationsList(formatted);
      }
    } catch (err) {
      console.error("Error loading contract data:", err);
    }
  }, [selectedCampaign]);

  // 3. Register a New Campaign
  const handleRegisterCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaignId || !newBeneficiary) return;

    if (!window.ethereum) {
      alert("MetaMask is required to send transactions.");
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("Registering campaign on-chain...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.registerCampaign(newCampaignId, newBeneficiary);
      await tx.wait();

      setStatusMessage(`Campaign "${newCampaignId}" registered successfully!`);
      setNewCampaignId('');
      setNewBeneficiary('');
      await fetchData();
    } catch (err) {
      console.error("Campaign registration failed:", err);
      setStatusMessage(`Failed: ${err.reason || err.message || "Transaction reverted"}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. Record a Donation
  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || !selectedCampaign) return;

    if (!window.ethereum) {
      alert("MetaMask is required to send transactions.");
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("Preparing donation transaction...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const amountInWei = ethers.parseEther(amount);
      if (amountInWei < 1000n) {
        alert("Minimum donation amount is 1000 wei.");
        setLoading(false);
        return;
      }

      setStatusMessage("Confirm transaction in MetaMask...");
      const tx = await contract.recordDonation(selectedCampaign, { value: amountInWei });

      setStatusMessage("Forwarding funds on-chain...");
      await tx.wait();

      setStatusMessage("Donation recorded and funds directly forwarded!");
      setAmount('');
      await fetchData();
    } catch (err) {
      console.error("Donation failed:", err);
      setStatusMessage(`Failed: ${err.reason || err.message || "Transaction reverted"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Smackathon 2k26
            </h1>
            <p className="text-xs md:text-sm text-slate-400">Non-Custodial Transparent Donation Tracker</p>
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

        {/* Hero Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-gradient-to-br from-indigo-900/40 to-slate-800/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl shadow-lg flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Total Funds Raised Across Campaigns</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1">{totalEth} <span className="text-lg font-medium text-indigo-400">ETH</span></h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl font-bold">
              Ξ
            </div>
          </div>

          <div className="p-6 bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-lg flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Registered Campaigns</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1">{campaigns.length}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-700/40 border border-slate-600 flex items-center justify-center text-slate-300">
              🎯
            </div>
          </div>
        </section>

        {/* Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Register Campaign Form */}
          <section className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-100 mb-1">Register New Campaign</h2>
            <p className="text-xs text-slate-400 mb-4">Set an immutable campaign identifier and target beneficiary address.</p>

            <form onSubmit={handleRegisterCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Campaign ID</label>
                <input 
                  type="text" 
                  value={newCampaignId} 
                  onChange={(e) => setNewCampaignId(e.target.value)} 
                  placeholder="e.g. flood-relief-2026"
                  required 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Beneficiary Address</label>
                <input 
                  type="text" 
                  value={newBeneficiary} 
                  onChange={(e) => setNewBeneficiary(e.target.value)} 
                  placeholder="0x..."
                  required 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !account} 
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm rounded-xl transition-all"
              >
                {loading ? "Processing..." : account ? "Register Campaign" : "Connect Wallet First"}
              </button>
            </form>
          </section>

          {/* Send Donation Form */}
          <section className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-100 mb-1">Direct On-Chain Donation</h2>
            <p className="text-xs text-slate-400 mb-4">Funds route immediately to the registered beneficiary in the same block.</p>

            <form onSubmit={handleDonate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Select Campaign</label>
                <select 
                  value={selectedCampaign} 
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {campaigns.length === 0 ? (
                    <option value="">No Campaigns Registered</option>
                  ) : (
                    campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} ({c.raisedEth} ETH Raised)
                      </option>
                    ))
                  )}
                </select>
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !account || campaigns.length === 0} 
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                {loading ? "Processing..." : account ? "Donate Now" : "Connect Wallet First"}
              </button>
            </form>
          </section>

        </div>

        {statusMessage && (
          <div className="text-center p-3 text-xs font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 rounded-xl">
            {statusMessage}
          </div>
        )}

        {/* Live Ledger Table */}
        <section className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Immutable Ledger Feed</h2>
              <p className="text-sm text-slate-400">Live records from contract memory using paginated reads.</p>
            </div>
            <button 
              onClick={fetchData} 
              className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/40">
                  <th className="py-3 px-4">Donor Address</th>
                  <th className="py-3 px-4">Campaign ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-sm">
                {donationsList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500 italic">
                      No on-chain donations found.
                    </td>
                  </tr>
                ) : (
                  donationsList.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-300">
                        {item.donor.substring(0, 6)}...{item.donor.substring(38)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium">
                        {item.campaignId}
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