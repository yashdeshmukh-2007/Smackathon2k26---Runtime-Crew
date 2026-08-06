import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function DonorDashboard({ 
  user, 
  campaigns = [], 
  selectedCurrency = 'ETH',
  onChangeCurrency,
  onSelectCampaign, 
  onBackToHome,
  onContribute
}) {
  const [userDonations, setUserDonations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Modal State for Multi-Currency Contributions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaignTitle, setSelectedCampaignTitle] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState(selectedCurrency);
  const [donationAmount, setDonationAmount] = useState('0.1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Exchange rates: 1 ETH = $3,000 USD = ₹250,000 INR
  const RATES = {
    ETH: 1,
    USD: 3000,
    INR: 250000
  };

  const newsItems = [
    { title: "PrepCircle STEM Workshop Milestone", desc: "100+ students given access to coding kits verified on-chain.", date: "Aug 2026" },
    { title: "Assam Flood Relief Multi-Currency Portal Live", desc: "Direct ETH, USD, and INR direct routing active for emergency relief.", date: "Jul 2026" }
  ];

  const activeWallet = user?.address || user?.email || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

  // Fetch real donation history from Supabase
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

  // Keep modal payment currency synchronized with top navbar preference
  useEffect(() => {
    setPaymentCurrency(selectedCurrency);
    if (selectedCurrency === 'ETH') setDonationAmount('0.1');
    else if (selectedCurrency === 'USD') setDonationAmount('100');
    else if (selectedCurrency === 'INR') setDonationAmount('5000');
  }, [selectedCurrency]);

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeDonationModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const openDonationModal = (campaignTitle, campaignId = '1') => {
    setSelectedCampaignTitle(campaignTitle || 'General Fund');
    setSelectedCampaignId(campaignId);
    setPaymentCurrency(selectedCurrency);
    if (selectedCurrency === 'ETH') setDonationAmount('0.1');
    else if (selectedCurrency === 'USD') setDonationAmount('100');
    else if (selectedCurrency === 'INR') setDonationAmount('5000');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const closeDonationModal = () => {
    setIsModalOpen(false);
    setSelectedCampaignTitle('');
    setSelectedCampaignId('');
    setErrorMessage('');
    setIsSubmitting(false);
  };

  // Compute live multi-currency conversions
  const getConvertedValues = (val, curr) => {
    const num = parseFloat(val) || 0;
    if (curr === 'ETH') {
      const eth = num;
      const usd = num * RATES.USD;
      const inr = num * RATES.INR;
      return { eth, usd, inr };
    } else if (curr === 'USD') {
      const eth = num / RATES.USD;
      const usd = num;
      const inr = eth * RATES.INR;
      return { eth, usd, inr };
    } else {
      const eth = num / RATES.INR;
      const usd = eth * RATES.USD;
      const inr = num;
      return { eth, usd, inr };
    }
  };

  const { eth: calcEth, usd: calcUsd, inr: calcInr } = getConvertedValues(donationAmount, paymentCurrency);

  const handleConfirmDonation = async (e) => {
    if (e) e.preventDefault();

    const numericAmount = parseFloat(donationAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage(`Please enter a valid ${paymentCurrency} amount greater than 0.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (onContribute) {
        await onContribute(selectedCampaignId || '1', donationAmount, paymentCurrency);
      } else {
        const randomHash = "0x" + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + "...tx";
        await supabase
          .from('donations')
          .insert([
            {
              wallet_address: activeWallet,
              campaign_name: selectedCampaignTitle,
              amount: calcEth.toFixed(4),
              transaction_hash: randomHash
            }
          ]);
      }

      closeDonationModal();
      await fetchDonationHistory();
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to submit contribution. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Helper to format values according to global selected currency
  const formatCurrencyDisplay = (ethVal) => {
    const numEth = parseFloat(ethVal) || 0;
    if (selectedCurrency === 'ETH') {
      return `${numEth.toFixed(2)} ETH`;
    } else if (selectedCurrency === 'USD') {
      return `$${(numEth * RATES.USD).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD`;
    } else {
      return `₹${(numEth * RATES.INR).toLocaleString('en-IN', { maximumFractionDigits: 0 })} INR`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 font-sans text-[#182B22]">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E0D8] pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#4A5E53] bg-[#E3E8E3] px-3 py-1 rounded-full border border-[#D5DDD5] inline-block mb-2">
            Multi-Currency Platform (ETH • USD • INR)
          </span>
          <h2 className="text-3xl font-bold text-[#182B22]">Explorer & Donor Portal</h2>
          <p className="text-xs text-[#5C6660] mt-1">Direct transparent routing for ETH, USD ($), and INR (₹) contributions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openDonationModal("General Community Fund", "1")} 
            className="text-xs font-semibold bg-[#182B22] text-white px-5 py-2.5 rounded-full hover:bg-[#0F1E19] shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Simulate Multi-Currency Donation
          </button>
          <button 
            onClick={onBackToHome} 
            className="text-xs font-semibold border border-[#E5E0D8] px-4 py-2.5 rounded-full bg-white hover:bg-[#F5F3ED] transition-all text-[#182B22] cursor-pointer"
          >
            ← Exit Portal
          </button>
        </div>
      </div>

      {/* Active User Card */}
      {user && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.02)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#182B22]" />
            <div>
              <h3 className="text-base font-bold text-[#182B22]">{user.name}</h3>
              <p className="text-xs text-[#7C8781] font-mono">{user.email || user.address}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#7C8781] font-medium uppercase tracking-wider block">Total Contributions</span>
            <p className="text-xl font-bold text-[#182B22]">
              {userDonations.length + (user?.history?.length || 0)} Recorded
            </p>
          </div>
        </div>
      )}

      {/* Donation History Tracker Section */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.02)] space-y-4">
        <div className="flex justify-between items-center border-b border-[#E5E0D8]/60 pb-3">
          <div>
            <h3 className="text-lg font-bold text-[#182B22]">Your Multi-Currency Donation History</h3>
            <p className="text-xs text-[#5C6660]">Tracked on-chain & verified with converted ETH / USD / INR values</p>
          </div>
          <span className="text-xs bg-[#E3E8E3] text-[#182B22] px-3 py-1 rounded-full font-bold border border-[#D5DDD5]">
            {userDonations.length + (user?.history?.length || 0)} Total
          </span>
        </div>

        {loadingHistory ? (
          <p className="text-xs text-[#7C8781] py-4">Loading your transaction history...</p>
        ) : (userDonations.length === 0 && (!user?.history || user.history.length === 0)) ? (
          <div className="p-8 text-center border border-dashed border-[#E5E0D8] rounded-xl bg-[#F5F3ED]/50">
            <p className="text-xs text-[#5C6660] font-medium">No recorded contributions for this address yet.</p>
            <button 
              onClick={() => openDonationModal("General Fund", "1")}
              className="mt-3 text-xs font-bold text-[#182B22] underline cursor-pointer hover:text-[#0F1E19]"
            >
              Make your first contribution in ETH, USD, or INR
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {/* User local state history */}
            {user?.history?.map((donation) => (
              <div key={donation.id} className="p-4 border border-[#E5E0D8] rounded-xl flex justify-between items-center bg-[#F5F3ED]/40 hover:bg-white transition-all">
                <div>
                  <h4 className="text-sm font-bold text-[#182B22]">{donation.campaign_name}</h4>
                  <p className="text-[10px] text-[#7C8781] font-mono mt-0.5">
                    Paid in: <strong className="text-[#182B22]">{donation.currencyChoice || 'ETH'}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#182B22] block">
                    {donation.amountStr}
                  </span>
                  <span className="text-[11px] text-[#5C6660] block">
                    ≈ {donation.amountEth ? donation.amountEth.toFixed(4) : '0.00'} ETH | ${(donation.amountUsd || 0).toFixed(2)} | ₹{(donation.amountInr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}

            {/* Supabase recorded history */}
            {userDonations.map((donation) => (
              <div key={donation.id} className="p-4 border border-[#E5E0D8] rounded-xl flex justify-between items-center bg-[#F5F3ED]/30 hover:bg-white transition-all">
                <div>
                  <h4 className="text-sm font-bold text-[#182B22]">{donation.campaign_name}</h4>
                  <p className="text-[10px] text-[#7C8781] font-mono mt-0.5">Tx: {donation.transaction_hash}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#182B22] block">
                    {formatCurrencyDisplay(donation.amount)}
                  </span>
                  <p className="text-[10px] text-[#7C8781] mt-0.5">
                    {donation.created_at ? new Date(donation.created_at).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* News & Updates Banner */}
      <div className="bg-[#182B22] text-white p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">📢 Platform Updates & Auditing Logs</h3>
          <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white px-3 py-1 rounded-full font-semibold">Live</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newsItems.map((item, idx) => (
            <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <span className="text-[10px] text-white/60">{item.date}</span>
              </div>
              <p className="text-xs text-white/80">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-[#182B22]">Active Verified Campaigns</h3>
          <div className="text-xs text-[#5C6660]">
            Viewing metrics in <strong className="text-[#182B22]">{selectedCurrency}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const numericGoalEth = campaign.goalEth || parseFloat(campaign.goal) || 10.0;
            const numericRaisedEth = campaign.raisedEth || parseFloat(campaign.raised) || 3.5;

            return (
              <div 
                key={campaign.id}
                className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-[0_4px_20px_rgba(24,43,34,0.02)] hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div onClick={() => onSelectCampaign(campaign)} className="cursor-pointer">
                  <div className="h-44 bg-[#F5F3ED] overflow-hidden relative">
                    <img 
                      src={campaign.bannerImage || `https://picsum.photos/seed/${campaign.id}/800/400`} 
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-[#182B22] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#E5E0D8]">
                      ETH • USD • INR
                    </span>
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-bold text-[#4A5E53] bg-[#E3E8E3] px-2.5 py-1 rounded-full border border-[#D5DDD5]">
                      {campaign.organization || 'Verified Org'}
                    </span>
                    <h3 className="font-bold text-lg text-[#182B22] mt-3">{campaign.title}</h3>
                    
                    {/* Goal & Raised displayed in selected currency */}
                    <div className="mt-4 p-3 bg-[#F5F3ED]/60 rounded-xl border border-[#E5E0D8]/60 space-y-1">
                      <div className="flex justify-between text-xs text-[#5C6660]">
                        <span>Raised:</span>
                        <strong className="text-[#182B22]">{formatCurrencyDisplay(numericRaisedEth)}</strong>
                      </div>
                      <div className="flex justify-between text-xs text-[#5C6660]">
                        <span>Target Goal:</span>
                        <strong className="text-[#182B22]">{formatCurrencyDisplay(numericGoalEth)}</strong>
                      </div>
                      <div className="w-full bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden mt-2">
                        <div 
                          className="bg-[#182B22] h-full rounded-full" 
                          style={{ width: `${Math.min(100, (numericRaisedEth / numericGoalEth) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <button 
                    onClick={() => openDonationModal(campaign.title, campaign.id)}
                    className="w-full text-xs font-semibold bg-[#182B22] text-white py-3 rounded-full hover:bg-[#0F1E19] shadow-2xs transition-all cursor-pointer"
                  >
                    Donate to Campaign ({selectedCurrency})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Currency Donation Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182B22]/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDonationModal();
          }}
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E5E0D8] overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-[#182B22] text-white p-6 relative">
              <button 
                onClick={closeDonationModal}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-white/15 px-2.5 py-1 rounded-full inline-block mb-2">
                Multi-Currency Payment
              </span>
              <h3 className="text-xl font-bold text-white">Contribute Funds</h3>
              <p className="text-xs text-white/80 mt-1 line-clamp-1">
                Campaign: <strong className="text-white underline">{selectedCampaignTitle}</strong>
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmDonation} className="p-6 space-y-5">
              {/* Payment Currency Selector (ETH, USD, INR) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#182B22]">
                  Select Payment Currency:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'ETH', label: 'ETH (Crypto)', symbol: 'Ξ' },
                    { code: 'USD', label: 'USD ($)', symbol: '$' },
                    { code: 'INR', label: 'INR (₹)', symbol: '₹' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setPaymentCurrency(item.code);
                        if (item.code === 'ETH') setDonationAmount('0.1');
                        else if (item.code === 'USD') setDonationAmount('100');
                        else if (item.code === 'INR') setDonationAmount('5000');
                      }}
                      className={`text-xs py-2.5 px-3 rounded-xl font-bold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        paymentCurrency === item.code 
                          ? 'bg-[#182B22] text-white border-[#182B22] shadow-2xs' 
                          : 'bg-[#F5F3ED] text-[#182B22] border-[#E5E0D8] hover:bg-[#E3E8E3]'
                      }`}
                    >
                      <span className="text-sm font-extrabold">{item.symbol}</span>
                      <span>{item.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#182B22]">
                  Enter Contribution Amount ({paymentCurrency})
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <input
                    type="number"
                    step={paymentCurrency === 'ETH' ? '0.001' : '1'}
                    min="0.0001"
                    required
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full text-lg font-bold px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl focus:ring-2 focus:ring-[#182B22] outline-none text-[#182B22] pr-16"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-xs font-bold text-[#5C6660] bg-[#F5F3ED] px-2.5 py-1 rounded-md border border-[#E5E0D8]">
                      {paymentCurrency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Amount Presets based on selected currency */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#7C8781] font-medium">Quick Presets:</span>
                <div className="flex flex-wrap gap-2">
                  {(paymentCurrency === 'ETH' 
                    ? ['0.05', '0.1', '0.25', '0.5', '1.0'] 
                    : paymentCurrency === 'USD'
                    ? ['25', '50', '100', '250', '500']
                    : ['500', '1000', '2500', '5000', '10000']
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDonationAmount(preset)}
                      className={`text-xs py-1.5 px-3 rounded-lg font-semibold transition-all border cursor-pointer ${
                        donationAmount === preset 
                          ? 'bg-[#182B22] text-white border-[#182B22]' 
                          : 'bg-[#F5F3ED] text-[#182B22] border-[#E5E0D8] hover:bg-[#E3E8E3]'
                      }`}
                    >
                      {paymentCurrency === 'USD' ? `$${preset}` : paymentCurrency === 'INR' ? `₹${preset}` : `${preset} ETH`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Multi-Currency Conversion Card */}
              <div className="bg-[#F5F3ED] p-3.5 rounded-xl border border-[#E5E0D8] text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C8781] block mb-1">Equivalent Conversions:</span>
                <div className="flex justify-between text-[#182B22]">
                  <span>Crypto (Ethereum):</span>
                  <strong className="font-mono">{calcEth.toFixed(4)} ETH</strong>
                </div>
                <div className="flex justify-between text-[#182B22]">
                  <span>United States Dollar:</span>
                  <strong className="font-mono">${calcUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</strong>
                </div>
                <div className="flex justify-between text-[#182B22]">
                  <span>Indian Rupee:</span>
                  <strong className="font-mono">₹{calcInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR</strong>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDonationModal}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-xs font-semibold text-[#5C6660] bg-[#F5F3ED] hover:bg-[#E3E8E3] rounded-full transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#182B22] hover:bg-[#0F1E19] rounded-full shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm & Pay {paymentCurrency}</span>
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