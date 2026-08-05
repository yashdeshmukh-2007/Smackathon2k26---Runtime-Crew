import React from 'react';

export default function DonorDashboard({ user, campaigns = [], onSelectCampaign, onBackToHome }) {
  const newsItems = [
    { title: "PrepCircle Milestone Reached", desc: "100+ local students given access to STEM workshops.", date: "Aug 2026" },
    { title: "Assam Flood Relief Fund Audit Complete", desc: "100% of contributions verified on-chain and disbursed.", date: "Jul 2026" }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Top Header Row */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Donor Portal</h2>
          <p className="text-xs text-slate-500">Explore transparent verified campaigns and track live donations.</p>
        </div>
        <button onClick={onBackToHome} className="text-xs font-medium border border-slate-200 px-4 py-2 rounded-xl bg-white hover:bg-slate-50">
          Exit Dashboard
        </button>
      </div>

      {/* User Profile Card */}
      {user && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{user.email || user.address}</p>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold mt-1 inline-block">Active Supporter</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">Contributed</span>
            <p className="text-xl font-bold text-slate-900">{user.history ? user.history.length : 0} Donations</p>
          </div>
        </div>
      )}

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
              onClick={() => onSelectCampaign(campaign)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer group"
            >
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
          ))}
        </div>
      </div>
    </div>
  );
}