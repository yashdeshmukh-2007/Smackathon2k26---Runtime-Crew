import React, { useState } from 'react';

export default function GovernanceDashboard({ onBack }) {
  const [proposals, setProposals] = useState([
    {
      id: 1,
      title: 'TIP-04: Allocate 50,000 VERI to Disaster Relief Matching Pool',
      description: 'Proposal to direct treasury funds toward matching community contributions for upcoming emergency campaigns.',
      votesFor: 1420,
      votesAgainst: 45,
      status: 'Active'
    },
    {
      id: 2,
      title: 'TIP-05: Lower Auditor Verification Threshold for Verified NGOs',
      description: 'Streamline onboarding for established non-profits by reducing multi-sig requirement from 3 to 2 approvals.',
      votesFor: 890,
      votesAgainst: 310,
      status: 'Active'
    }
  ]);

  const handleVote = (id, type) => {
    setProposals(prev => prev.map(prop => {
      if (prop.id === id) {
        return {
          ...prop,
          votesFor: type === 'for' ? prop.votesFor + 100 : prop.votesFor,
          votesAgainst: type === 'against' ? prop.votesAgainst + 100 : prop.votesAgainst
        };
      }
      return prop;
    }));
    alert(`Successfully cast your voting weight (${type.toUpperCase()}) on-chain!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-violet-100">
            Community DAO
          </span>
          <h1 className="text-3xl font-bold text-slate-900">Governance & Proposals</h1>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors shadow-sm"
        >
          &larr; Back to Home
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Shape the Future of VeriFund</h2>
            <p className="text-violet-100 text-sm max-w-xl">
              Your voting power is calculated based on your historical contributions and active participation tokens. Cast your vote on-chain securely.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-right">
            <span className="text-xs text-violet-200 uppercase tracking-wider block">Your Voting Power</span>
            <span className="text-2xl font-bold">1,250 VP</span>
          </div>
        </div>

        {/* Proposals List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Active Improvement Proposals</h3>
          
          <div className="space-y-6">
            {proposals.map((prop) => (
              <div key={prop.id} className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h4 className="font-semibold text-slate-900 text-lg">{prop.title}</h4>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                    {prop.status}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{prop.description}</p>
                
                {/* Voting Metrics bar */}
                <div className="flex justify-between text-xs text-slate-500 font-medium mb-2">
                  <span>For: {prop.votesFor} VP</span>
                  <span>Against: {prop.votesAgainst} VP</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6 flex">
                  <div 
                    className="bg-emerald-500 h-full transition-all" 
                    style={{ width: `${(prop.votesFor / (prop.votesFor + prop.votesAgainst)) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-rose-500 h-full transition-all" 
                    style={{ width: `${(prop.votesAgainst / (prop.votesFor + prop.votesAgainst)) * 100}%` }}
                  ></div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => handleVote(prop.id, 'against')}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                  >
                    Vote Against
                  </button>
                  <button 
                    onClick={() => handleVote(prop.id, 'for')}
                    className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors shadow-sm"
                  >
                    Vote For
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
