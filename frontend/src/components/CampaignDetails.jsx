import React, { useState } from 'react';

export default function CampaignDetails({ campaign, user, onContribute, onBack, onOpenAuth }) {
  const [donationAmount, setDonationAmount] = useState('');

  const handleDonateSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    onContribute(campaign.id, donationAmount);
    setDonationAmount('');
  };

  const tasksCompleted = campaign.tasks || [
    { title: "Phase 1: Initial Supply Procurement", status: "Completed", date: "Jan 2026" },
    { title: "Phase 2: Local Deployment & Testing", status: "In Progress", date: "Feb 2026" },
    { title: "Phase 3: Community Audit & Final Verification", status: "Pending", date: "Mar 2026" }
  ];

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        ← Back to Dashboard
      </button>

      {/* Banner */}
      <div className="w-full h-72 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
        <img 
          src={campaign.bannerImage || "https://picsum.photos/seed/campaign/1200/400"} 
          alt={campaign.title}
          onError={(e) => { e.target.onerror = null; e.target.src = "https://picsum.photos/seed/water/1200/400"; }}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {campaign.organization || 'Verified Organizer'}
            </span>
            <h1 className="text-3xl font-bold text-slate-900 mt-3">{campaign.title}</h1>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-lg text-slate-900">About this Campaign</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{campaign.description}</p>
          </div>

          {/* Transparent Tasks Completed Tracker */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Transparent Task Tracker</h3>
              <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-medium">On-Chain Verified</span>
            </div>
            
            <div className="space-y-3">
              {tasksCompleted.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${task.status === 'Completed' ? 'bg-emerald-500' : task.status === 'In Progress' ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{task.title}</p>
                      <p className="text-[10px] text-slate-400">{task.date}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Organizer Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-lg text-slate-900">Organizer Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Contact Email</p>
                <p className="text-slate-800 font-bold">{campaign.contactEmail || 'support@verifund.org'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Recipient Address</p>
                <code className="text-[10px] bg-slate-100 px-2 py-1 rounded block mt-0.5 text-slate-700 truncate">
                  {campaign.contractAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Contribute Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-6">
          <h3 className="font-bold text-lg text-slate-900">Funding Progress</h3>
          
          <div>
            <div className="flex justify-between text-xs mb-2 text-slate-600">
              <span>Raised: <strong className="text-slate-900">{campaign.raised}</strong></span>
              <span>Goal: <strong className="text-slate-900">{campaign.goal}</strong></span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-2/5"></div>
            </div>
          </div>

          <form onSubmit={handleDonateSubmit} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-500">Contribution Amount (ETH)</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="e.g. 0.5"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              {user ? 'Contribute Funds' : 'Sign In to Contribute'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}