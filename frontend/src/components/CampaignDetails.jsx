import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function CampaignDetails({ 
  campaign, 
  user, 
  selectedCurrency = 'ETH',
  onContribute, 
  onBack, 
  onOpenAuth 
}) {
  const [payCurrency, setPayCurrency] = useState(selectedCurrency);
  const [donationAmount, setDonationAmount] = useState('0.1');
  const [campaignDonations, setCampaignDonations] = useState([]);

  // Exchange rates: 1 ETH = $3,000 USD = ₹250,000 INR
  const RATES = {
    ETH: 1,
    USD: 3000,
    INR: 250000
  };

  if (!campaign) return null;

  const numericGoalEth = campaign.goalEth || parseFloat(campaign.goal) || 10;
  const numericRaisedEth = campaign.raisedEth || parseFloat(campaign.raised) || 3.5;
  const percentage = Math.min(Math.round((numericRaisedEth / numericGoalEth) * 100), 100);

  const fetchCampaignDonations = async () => {
    if (!campaign?.title) return;
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('campaign_name', campaign.title);

    if (!error && data) {
      setCampaignDonations(data);
    }
  };

  useEffect(() => {
    fetchCampaignDonations();
  }, [campaign?.title]);

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    const val = parseFloat(donationAmount);
    if (!donationAmount || isNaN(val) || val <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    await onContribute(campaign.id, donationAmount, payCurrency);
    setDonationAmount(payCurrency === 'ETH' ? '0.1' : payCurrency === 'USD' ? '100' : '5000');
    fetchCampaignDonations();
  };

  const tasksCompleted = campaign.tasks || [
    { title: "Phase 1: Initial Procurement & Setup", status: "Completed", date: "Jan 2026" },
    { title: "Phase 2: Local Deployment & Field Testing", status: "In Progress", date: "Feb 2026" },
    { title: "Phase 3: Independent Compliance Audit", status: "Pending", date: "Mar 2026" }
  ];

  // Helper to calculate live currency conversions
  const getConvertedValues = (val, curr) => {
    const num = parseFloat(val) || 0;
    if (curr === 'ETH') return { eth: num, usd: num * RATES.USD, inr: num * RATES.INR };
    if (curr === 'USD') {
      const eth = num / RATES.USD;
      return { eth, usd: num, inr: eth * RATES.INR };
    }
    const eth = num / RATES.INR;
    return { eth, usd: eth * RATES.USD, inr: num };
  };

  const { eth: calcEth, usd: calcUsd, inr: calcInr } = getConvertedValues(donationAmount, payCurrency);

  const formatDisplayCurrency = (ethVal) => {
    if (selectedCurrency === 'ETH') return `${ethVal.toFixed(2)} ETH`;
    if (selectedCurrency === 'USD') return `$${(ethVal * RATES.USD).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD`;
    return `₹${(ethVal * RATES.INR).toLocaleString('en-IN', { maximumFractionDigits: 0 })} INR`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8 font-sans text-[#182B22]">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-[#182B22] bg-white border border-[#E5E0D8] px-4 py-2 rounded-full hover:bg-[#E3E8E3] transition-all cursor-pointer shadow-2xs"
      >
        ← Back to Portal
      </button>

      <div className="w-full h-72 rounded-2xl overflow-hidden bg-[#F5F3ED] border border-[#E5E0D8] relative">
        <img 
          src={campaign.bannerImage || "https://picsum.photos/seed/campaign/1200/400"} 
          alt={campaign.title || "Campaign Banner"}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5E53] bg-[#E3E8E3] border border-[#D5DDD5] px-3 py-1 rounded-full">
              {campaign.organization || 'Verified Organizer'}
            </span>
            <h1 className="text-3xl font-bold text-[#182B22] mt-3">{campaign.title}</h1>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.02)] space-y-3">
            <h3 className="font-bold text-lg text-[#182B22]">About this Campaign</h3>
            <p className="text-[#5C6660] text-sm leading-relaxed">{campaign.description}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.02)] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#182B22]">Transparent Milestone Tracker</h3>
              <span className="text-[10px] bg-[#E3E8E3] px-3 py-1 rounded-full text-[#182B22] font-bold">On-Chain Audit</span>
            </div>
            
            <div className="space-y-3">
              {tasksCompleted.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E0D8] bg-[#F5F3ED]/40">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${task.status === 'Completed' ? 'bg-[#182B22]' : task.status === 'In Progress' ? 'bg-amber-600' : 'bg-slate-300'}`}></span>
                    <div>
                      <p className="text-xs font-bold text-[#182B22]">{task.title}</p>
                      <p className="text-[10px] text-[#7C8781]">{task.date}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${task.status === 'Completed' ? 'bg-[#E3E8E3] text-[#182B22]' : 'bg-amber-50 text-amber-800'}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Campaign Transactions */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.02)] space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E0D8]/60 pb-3">
              <h3 className="font-bold text-lg text-[#182B22]">Recent Campaign Ledger</h3>
              <span className="text-xs bg-[#E3E8E3] text-[#182B22] border border-[#D5DDD5] px-2.5 py-0.5 rounded-full font-bold">
                {campaignDonations.length} Transactions
              </span>
            </div>

            {campaignDonations.length === 0 ? (
              <p className="text-xs text-[#7C8781] italic">No transactions recorded yet for this campaign.</p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {campaignDonations.map((tx) => (
                  <div key={tx.id} className="p-3 border border-[#E5E0D8] rounded-xl bg-[#F5F3ED]/30 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#182B22]">{tx.campaign_name}</p>
                      <p className="text-[10px] text-[#7C8781] font-mono">Tx: {tx.transaction_hash}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#182B22]">{formatDisplayCurrency(parseFloat(tx.amount))}</span>
                      <p className="text-[10px] text-[#7C8781]">{tx.created_at ? new Date(tx.created_at).toLocaleTimeString() : 'Recent'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Multi-Currency Contribution Form */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.02)] h-fit space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-[#182B22]">Funding Progress</h3>
            <span className="text-xs font-bold text-[#182B22] bg-[#E3E8E3] px-2.5 py-1 rounded-md">{percentage}%</span>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-2 text-[#5C6660]">
              <span>Raised: <strong className="text-[#182B22]">{formatDisplayCurrency(numericRaisedEth)}</strong></span>
              <span>Goal: <strong className="text-[#182B22]">{formatDisplayCurrency(numericGoalEth)}</strong></span>
            </div>
            <div className="w-full bg-[#E5E0D8] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#182B22] h-full transition-all duration-500 ease-out rounded-full" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleDonateSubmit} className="space-y-4 pt-2 border-t border-[#E5E0D8]/60">
            <div>
              <label className="block text-xs font-bold text-[#182B22] mb-1.5">
                Payment Currency Choice:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['ETH', 'USD', 'INR'].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => {
                      setPayCurrency(curr);
                      if (curr === 'ETH') setDonationAmount('0.1');
                      else if (curr === 'USD') setDonationAmount('100');
                      else if (curr === 'INR') setDonationAmount('5000');
                    }}
                    className={`text-xs py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      payCurrency === curr 
                        ? 'bg-[#182B22] text-white border-[#182B22]' 
                        : 'bg-[#F5F3ED] text-[#182B22] border-[#E5E0D8] hover:bg-[#E3E8E3]'
                    }`}
                  >
                    {curr === 'USD' ? '$ USD' : curr === 'INR' ? '₹ INR' : 'ETH'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182B22] mb-1.5">
                Amount in {payCurrency}
              </label>
              <input 
                type="number" 
                step={payCurrency === 'ETH' ? '0.01' : '1'}
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E5E0D8] rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#182B22] text-[#182B22]"
              />
            </div>

            <div className="bg-[#F5F3ED] p-3 rounded-xl border border-[#E5E0D8] text-[11px] space-y-1">
              <div className="flex justify-between text-[#5C6660]">
                <span>ETH Equivalent:</span>
                <strong className="font-mono text-[#182B22]">{calcEth.toFixed(4)} ETH</strong>
              </div>
              <div className="flex justify-between text-[#5C6660]">
                <span>USD Equivalent:</span>
                <strong className="font-mono text-[#182B22]">${calcUsd.toFixed(2)} USD</strong>
              </div>
              <div className="flex justify-between text-[#5C6660]">
                <span>INR Equivalent:</span>
                <strong className="font-mono text-[#182B22]">₹{calcInr.toLocaleString('en-IN')} INR</strong>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#182B22] text-white font-bold text-xs py-3.5 rounded-full hover:bg-[#0F1E19] transition-colors cursor-pointer shadow-2xs"
            >
              {user ? `Contribute in ${payCurrency}` : 'Sign In to Contribute'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}