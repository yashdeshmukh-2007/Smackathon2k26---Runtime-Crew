import React, { useState } from 'react';

export default function GovernanceDashboard({ onBack }) {
  const [proposals, setProposals] = useState([
    {
      id: 1,
      title: 'TIP-04: Multi-Currency Matching Pool for Emergency Relief',
      description: 'Proposal to direct treasury reserves to match community contributions in ETH, USD, and INR.',
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
    <div className="min-h-screen bg-[#F5F3ED] p-6 md:p-12 font-sans text-[#182B22]">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-[#E5E0D8] pb-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#E3E8E3] text-[#4A5E53] text-[10px] font-bold uppercase tracking-wider mb-2 border border-[#D5DDD5]">
            Community Governance & DAO
          </span>
          <h1 className="text-3xl font-bold text-[#182B22]">Governance Proposals</h1>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 rounded-full bg-white border border-[#E5E0D8] text-[#182B22] hover:bg-[#E3E8E3] font-bold text-xs transition-all shadow-2xs cursor-pointer"
        >
          ← Back to Portal
        </button>
      </div>

      {/* Hero Governance Banner */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#182B22] rounded-2xl p-8 text-white shadow-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Shape the VeriFund Ecosystem</h2>
            <p className="text-white/80 text-xs max-w-xl leading-relaxed">
              Your voting power is calculated based on historical contributions in ETH, USD, and INR. Cast your vote on-chain securely.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-right">
            <span className="text-[10px] text-white/60 uppercase tracking-wider block font-semibold">Voting Power</span>
            <span className="text-2xl font-bold">1,250 VP</span>
          </div>
        </div>

        {/* Proposals List */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.02)] p-6">
          <h3 className="text-xl font-bold text-[#182B22] mb-6">Active Improvement Proposals</h3>
          
          <div className="space-y-6">
            {proposals.map((prop) => (
              <div key={prop.id} className="p-6 rounded-xl border border-[#E5E0D8] bg-[#F5F3ED]/30 shadow-2xs">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h4 className="font-bold text-[#182B22] text-lg">{prop.title}</h4>
                  <span className="px-3 py-1 rounded-full bg-[#E3E8E3] text-[#182B22] text-[10px] font-bold border border-[#D5DDD5]">
                    {prop.status}
                  </span>
                </div>
                <p className="text-[#5C6660] text-xs mb-4 leading-relaxed">{prop.description}</p>
                
                {/* Voting Metrics bar */}
                <div className="flex justify-between text-xs text-[#5C6660] font-semibold mb-2">
                  <span>For: {prop.votesFor} VP</span>
                  <span>Against: {prop.votesAgainst} VP</span>
                </div>
                <div className="w-full bg-[#E5E0D8] h-2.5 rounded-full overflow-hidden mb-6 flex">
                  <div 
                    className="bg-[#182B22] h-full transition-all" 
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
                    className="px-4 py-2 rounded-full border border-rose-300 text-rose-800 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    Vote Against
                  </button>
                  <button 
                    onClick={() => handleVote(prop.id, 'for')}
                    className="px-5 py-2 rounded-full bg-[#182B22] hover:bg-[#0F1E19] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
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
