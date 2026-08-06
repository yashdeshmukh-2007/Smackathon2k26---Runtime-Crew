import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function DonorDashboard({ user, campaigns = [], onSelectCampaign, onBackToHome }) {
  const [userDonations, setUserDonations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaignTitle, setSelectedCampaignTitle] = useState('');
  const [donationAmount, setDonationAmount] = useState('0.1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const newsItems = [
    { title: "PrepCircle Milestone Reached", desc: "100+ local students given access to STEM workshops.", date: "Aug 2026" },
    { title: "Assam Flood Relief Fund Audit Complete", desc: "100% of contributions verified on-chain and disbursed.", date: "Jul 2026" }
  ];

  const activeWallet = user?.address || user?.email || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

  // Fetch real donation history from Supabase using the user's wallet address filter (.eq)
  const fetchDonationHistory = async () => {
    if (!activeWallet) {
      setLoadingHistory(false);
      return;
    }

    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('wallet_address', activeWallet);

    if (error) {
      console.error('Error fetching donation history:', error);
    } else {
      setUserDonations(data || []);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    fetchDonationHistory();
  }, [user]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeDonationModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Open modal with specific campaign title
  const openDonationModal = (campaignTitle) => {
    setSelectedCampaignTitle(campaignTitle || 'General Fund (Test)');
    setDonationAmount('0.1');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Close modal and reset modal state
  const closeDonationModal = () => {
    setIsModalOpen(false);
    setSelectedCampaignTitle('');
    setDonationAmount('0.1');
    setErrorMessage('');
    setIsSubmitting(false);
  };

  // Handle modal submit: pass exact user-entered amount and clicked campaign title explicitly into Supabase payload
  const handleConfirmDonation = async (e) => {
    if (e) e.preventDefault();

    const numericAmount = parseFloat(donationAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Please enter a valid ETH contribution amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const randomHash = "0x" + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + "...mockhash";

    // Explicitly inserting user-entered amount and exact campaign title clicked
    const { data, error } = await supabase
      .from('donations')
      .insert([
        {
          wallet_address: activeWallet,
          campaign_name: selectedCampaignTitle,
          amount: numericAmount,
          transaction_hash: randomHash
        }
      ]);

    setIsSubmitting(false);

    if (error) {
      console.error('Error inserting donation:', error);
      setErrorMessage('Failed to submit test donation. Please try again.');
    } else {
      // Close modal cleanly and dynamically refresh history without page reset or logging out user
      closeDonationModal();
      await fetchDonationHistory();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 relative">
      {/* Top Header Row */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Donor Portal</h2>
          <p className="text-xs text-slate-500">Explore transparent verified campaigns and track live donations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openDonationModal("General Fund (Test)")} 
            className="text-xs font-medium bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Simulate Test Donation
          </button>
          <button 
            onClick={onBackToHome} 
            className="text-xs font-medium border border-slate-200 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 transition-all text-slate-700 cursor-pointer"
          >
            Exit Dashboard
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      {user && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
            <div>
              <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{user.email || user.address}</p>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold mt-1 inline-block">
                Active Supporter
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">Contributed</span>
            <p className="text-xl font-bold text-slate-900">{userDonations.length} {userDonations.length === 1 ? 'Donation' : 'Donations'}</p>
          </div>
        </div>
      )}

      {/* User Donation History Tracker Section (Supabase Filtered) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Donation History (Supabase Tracked)</h3>
            <p className="text-xs text-slate-400">Dynamically queried from Supabase using <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] text-slate-700">.eq('wallet_address', wallet)</code></p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
            {userDonations.length} Recorded
          </span>
        </div>

        {loadingHistory ? (
          <p className="text-xs text-slate-500 py-4">Loading your on-chain history...</p>
        ) : userDonations.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">No donations recorded yet for this wallet address.</p>
            <button 
              onClick={() => openDonationModal("General Fund (Test)")}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
            >
              Simulate your first test donation now
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {userDonations.map((donation) => (
              <div key={donation.id} className="p-4 border border-slate-100 rounded-xl flex justify-between items-center bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all shadow-2xs">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{donation.campaign_name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Tx: {donation.transaction_hash}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-600">+{donation.amount} ETH</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {donation.created_at ? new Date(donation.created_at).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* News & Achievements Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">📢 Latest Transparency Updates & News</h3>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-semibold">Live Feed</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newsItems.map((item, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <span className="text-[10px] text-slate-300">{item.date}</span>
              </div>
              <p className="text-xs text-slate-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Explore Campaigns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div 
              key={campaign.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div onClick={() => onSelectCampaign(campaign)} className="cursor-pointer">
                <div className="h-44 bg-slate-100 overflow-hidden">
                  <img 
                    src={campaign.bannerImage || `https://picsum.photos/seed/${campaign.id}/800/400`} 
                    alt={campaign.title}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://picsum.photos/seed/fund/800/400"; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {campaign.organization || 'Organization'}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 mt-2">{campaign.title}</h3>
                  <div className="mt-4 flex justify-between text-xs text-slate-600">
                    <span>Raised: <strong className="text-slate-900">{campaign.raised}</strong></span>
                    <span>Goal: <strong className="text-slate-900">{campaign.goal}</strong></span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 pt-0">
                <button 
                  onClick={() => openDonationModal(campaign.title)}
                  className="w-full text-xs font-medium bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                >
                  Donate to this Campaign
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clean & Dynamic Test Donation Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDonationModal();
          }}
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            {/* Modal Top Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 relative">
              <button 
                onClick={closeDonationModal}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer"
                aria-label="Close Modal"
              >
                ✕
              </button>
              <span className="text-[10px] font-semibold tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
                Simulate Test Donation
              </span>
              <h3 className="text-xl font-bold text-white">Contribute ETH</h3>
              <p className="text-xs text-emerald-100 mt-1 line-clamp-1">
                Target: <strong className="text-white underline">{selectedCampaignTitle}</strong>
              </p>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleConfirmDonation} className="p-6 space-y-5">
              {/* Campaign Selected Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Selected Campaign</span>
                  <span className="text-xs font-bold text-slate-800">{selectedCampaignTitle}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-md">
                  Verified Campaign
                </span>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Custom ETH Amount
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    required
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.10"
                    className="w-full text-base font-semibold px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 placeholder-slate-300 pr-16"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">ETH</span>
                  </div>
                </div>
              </div>

              {/* Quick Select Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Quick Amount Presets:</span>
                <div className="flex gap-2">
                  {['0.05', '0.1', '0.25', '0.5', '1.0'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDonationAmount(preset)}
                      className={`text-xs py-1.5 px-3 rounded-lg font-medium transition-all border cursor-pointer ${
                        donationAmount === preset 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset} ETH
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Wallet Info */}
              <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                <span>Sending Wallet:</span>
                <span className="font-mono text-slate-600 font-semibold truncate max-w-[200px]">
                  {activeWallet}
                </span>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDonationModal}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Recording...</span>
                    </>
                  ) : (
                    <span>Confirm & Donate ETH</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}