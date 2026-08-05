import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import AuthModal from './AuthModal';
import HomeSelection from './HomeSelection';

export default function DonorDashboard() {
  // Navigation / View State ('home', 'donate', 'enlist')
  const [currentView, setCurrentView] = useState('home');

  // Auth States
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  // Sample Hypothetical Organizations for instant engagement
  const sampleOrgs = [
    {
      id: 'clean-water-2026',
      name: 'PureDrop Water Initiative',
      desc: 'Providing clean and safe drinking water to rural communities.',
      raised: '1.45',
      image: 'https://images.unsplash.com/photo-1541257710737-06d277f2fd24?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'ed-tech-future',
      name: 'PrepCircle Learning',
      desc: 'Gamified exam prep resources and laptops for underprivileged students.',
      raised: '2.80',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'green-earth-drive',
      name: 'GreenShield Forests',
      desc: 'Massive community tree plantation drive to combat climate change.',
      raised: '0.95',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80'
    }
  ];

  // Fallback Read Provider
  const getReadProvider = () => {
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  };

  // Connect Web3 Wallet
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

  // Fetch On-Chain Data
  const fetchData = useCallback(async () => {
    try {
      const provider = getReadProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const rawTotal = await contract.totalAmountRaised();
      setTotalEth(ethers.formatEther(rawTotal));

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
        })).reverse();

        setDonationsList(formatted);
      }
    } catch (err) {
      console.error("Error loading contract data:", err);
    }
  }, [selectedCampaign]);

  // Register New Campaign
  const handleRegisterCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaignId || !newBeneficiary) return;

    if (!window.ethereum) {
      alert("MetaMask is required to send transactions.");
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("Enlisting your cause on-chain...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.registerCampaign(newCampaignId, newBeneficiary);
      await tx.wait();

      setStatusMessage(`Success! Campaign "${newCampaignId}" is now live.`);
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

  // Record Donation
  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || !selectedCampaign) return;

    if (!window.ethereum) {
      alert("MetaMask is required to send transactions.");
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("Preparing your donation...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const amountInWei = ethers.parseEther(amount);
      setStatusMessage("Please confirm the transaction in MetaMask...");
      
      const tx = await contract.recordDonation(selectedCampaign, { value: amountInWei });
      setStatusMessage("Sending funds directly to the cause...");
      await tx.wait();

      setStatusMessage("Thank you! Donation sent successfully.");
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
    <div className="min-h-screen bg-[#F7F5F0] text-[#1D1D1F] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Navigation Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 apple-card rounded-3xl shadow-sm">
          <div 
            onClick={() => setCurrentView('home')} 
            className="cursor-pointer flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#1D1D1F] text-[#F7F5F0] flex items-center justify-center font-bold text-lg">
              S
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#1D1D1F]">
                Smackathon 2k26
              </h1>
              <p className="text-xs text-[#6E6E73]">Transparent Donation Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {currentView !== 'home' && (
              <button 
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 text-xs font-semibold apple-pill-inactive apple-click rounded-full"
              >
                ← Home
              </button>
            )}

            {/* Web3 Wallet status/button */}
            {account ? (
              <div className="flex items-center gap-2 bg-[#F5F3ED] border border-[#E5E2D9] px-3.5 py-1.5 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-xs text-[#1D1D1F]">
                  {account.substring(0, 6)}...{account.substring(38)}
                </span>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="px-4 py-2 text-xs font-semibold bg-[#E5E2D9] text-[#1D1D1F] rounded-full apple-click hover:bg-[#D9D5CC]"
              >
                Connect Wallet
              </button>
            )}

            {/* User Auth Profile / Login */}
            {user ? (
              <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E5E2D9] px-3 py-1.5 rounded-full shadow-xs">
                <span className="text-xs font-semibold text-[#1D1D1F]">{user.name}</span>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="apple-button apple-click px-5 py-2 text-xs shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Main Content Router */}
        {currentView === 'home' && (
          <HomeSelection 
            sampleOrgs={sampleOrgs} 
            onSelectMode={(mode) => setCurrentView(mode)} 
          />
        )}

        {currentView === 'donate' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Hero Metrics */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 apple-card rounded-3xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">Total Funds Raised</p>
                  <h2 className="text-3xl font-extrabold text-[#1D1D1F] mt-1">{totalEth} <span className="text-lg font-medium text-[#0066CC]">ETH</span></h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#0066CC]/10 text-[#0066CC] flex items-center justify-center text-xl font-bold">
                  Ξ
                </div>
              </div>

              <div className="p-6 apple-card rounded-3xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">Active Causes</p>
                  <h2 className="text-3xl font-extrabold text-[#1D1D1F] mt-1">{campaigns.length + sampleOrgs.length}</h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#F5F3ED] text-[#1D1D1F] flex items-center justify-center text-xl">
                  ❤️
                </div>
              </div>
            </section>

            {/* Featured Sample Orgs & Live Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Send Donation Form */}
              <section className="apple-card rounded-3xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-[#1D1D1F] mb-1">Make a Donation</h2>
                <p className="text-xs text-[#6E6E73] mb-6">Your support goes directly to the chosen cause instantly.</p>

                <form onSubmit={handleDonate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">Select Cause</label>
                    <select 
                      value={selectedCampaign} 
                      onChange={(e) => setSelectedCampaign(e.target.value)}
                      className="apple-input w-full px-4 py-3 rounded-2xl text-sm"
                    >
                      {campaigns.length === 0 ? (
                        <option value="">Choose from sample or custom campaigns</option>
                      ) : (
                        campaigns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.id} ({c.raisedEth} ETH Raised)
                          </option>
                        ))
                      )}
                      {sampleOrgs.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.raised} ETH Raised)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">Amount (in ETH)</label>
                    <input 
                      type="number" 
                      step="0.0001" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      placeholder="0.01"
                      required 
                      className="apple-input w-full px-4 py-3 rounded-2xl text-sm"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || !account} 
                    className="w-full py-3 apple-button apple-click disabled:bg-[#E5E2D9] disabled:text-[#8E8E93] disabled:transform-none font-semibold text-sm shadow-xs"
                  >
                    {loading ? "Processing..." : account ? "Confirm Donation" : "Connect Wallet to Donate"}
                  </button>
                </form>
              </section>

              {/* Sample Organizations Quick View */}
              <section className="apple-card rounded-3xl p-6 md:p-8 space-y-4">
                <h2 className="text-xl font-bold text-[#1D1D1F]">Featured Causes</h2>
                <p className="text-xs text-[#6E6E73]">Pre-enlisted organizations ready for support.</p>
                
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {sampleOrgs.map((org, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-[#F5F3ED] border border-[#E5E2D9]">
                      <img src={org.image} alt={org.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-[#1D1D1F] truncate">{org.name}</h4>
                        <p className="text-[11px] text-[#6E6E73] truncate">{org.desc}</p>
                      </div>
                      <button 
                        onClick={() => { setSelectedCampaign(org.id); }}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#1D1D1F] text-white rounded-full apple-click"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {statusMessage && (
              <div className="text-center p-4 text-xs font-medium text-[#0066CC] bg-[#0066CC]/5 border border-[#0066CC]/20 rounded-2xl">
                {statusMessage}
              </div>
            )}

            {/* Donations Feed Table */}
            <section className="apple-card rounded-3xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1D1D1F]">Recent Donations</h2>
                  <p className="text-xs text-[#6E6E73]">Live transparent records from the blockchain network.</p>
                </div>
                <button 
                  onClick={fetchData} 
                  className="px-4 py-2 text-xs font-medium apple-pill-inactive apple-click rounded-full"
                >
                  Refresh Feed
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E2D9] text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
                      <th className="py-3 px-4">Donor</th>
                      <th className="py-3 px-4">Cause ID</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E2D9]/60 text-sm">
                    {donationsList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-[#8E8E93] italic text-xs">
                          No donations recorded yet. Be the first!
                        </td>
                      </tr>
                    ) : (
                      donationsList.map((item, index) => (
                        <tr key={index} className="hover:bg-[#F5F3ED]/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs text-[#0066CC]">
                            {item.donor.substring(0, 6)}...{item.donor.substring(38)}
                          </td>
                          <td className="py-3.5 px-4 text-[#1D1D1F] font-medium text-xs">
                            {item.campaignId}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600 text-xs">
                            {item.amount} ETH
                          </td>
                          <td className="py-3.5 px-4 text-right text-xs text-[#6E6E73]">
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
        )}

        {currentView === 'enlist' && (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
            <section className="apple-card rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-[#1D1D1F] mb-1">Enlist Your Cause</h2>
              <p className="text-xs text-[#6E6E73] mb-6">Register a unique identifier and your wallet address to receive direct contributions.</p>

              <form onSubmit={handleRegisterCampaign} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">Cause Identifier</label>
                  <input 
                    type="text" 
                    value={newCampaignId} 
                    onChange={(e) => setNewCampaignId(e.target.value)} 
                    placeholder="e.g. community-relief-2026"
                    required 
                    className="apple-input w-full px-4 py-3 rounded-2xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">Your Wallet Address</label>
                  <input 
                    type="text" 
                    value={newBeneficiary} 
                    onChange={(e) => setNewBeneficiary(e.target.value)} 
                    placeholder="0x..."
                    required 
                    className="apple-input w-full px-4 py-3 rounded-2xl text-sm font-mono"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !account} 
                  className="w-full py-3 apple-button apple-click disabled:bg-[#E5E2D9] disabled:text-[#8E8E93] disabled:transform-none font-semibold text-sm shadow-xs"
                >
                  {loading ? "Registering..." : account ? "Enlist Cause On-Chain" : "Connect Wallet First"}
                </button>
              </form>

              {statusMessage && (
                <div className="mt-4 text-center p-3 text-xs font-medium text-[#0066CC] bg-[#0066CC]/5 border border-[#0066CC]/20 rounded-2xl">
                  {statusMessage}
                </div>
              )}
            </section>
          </div>
        )}

      </div>

      {/* Auth Modal Popup */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={(userData) => setUser(userData)} 
      />
    </div>
  );
}