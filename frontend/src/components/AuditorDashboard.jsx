import React, { useState } from 'react';

export default function AuditorDashboard({ onBack }) {
  // Sample pending campaigns awaiting audit
  const [pendingAudits, setPendingAudits] = useState([
    {
      id: 1,
      title: 'Clean Water Initiative - Phase 2',
      organizer: 'EcoAction Global',
      requestedFunds: '12.5 ETH (≈ $37,500 USD / ₹3,125,000 INR)',
      riskScore: 'Low',
      status: 'Pending Review',
      documents: 'Verified NGO License & 501(c)(3)'
    },
    {
      id: 2,
      title: 'Emergency Medical Relief - Zone B',
      organizer: 'HealthFirst DAO',
      requestedFunds: '25.0 ETH (≈ $75,000 USD / ₹6,250,000 INR)',
      riskScore: 'Medium',
      status: 'Pending Review',
      documents: 'Independent Expense Receipt Attached'
    }
  ]);

  const handleAuditAction = (id, action) => {
    setPendingAudits(prev => prev.filter(item => item.id !== id));
    alert(`Campaign proposal successfully ${action === 'approve' ? 'Approved & Certified' : 'Flagged for Compliance Review'}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] p-6 md:p-12 font-sans text-[#182B22]">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-[#E5E0D8] pb-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#E3E8E3] text-[#4A5E53] text-[10px] font-bold uppercase tracking-wider mb-2 border border-[#D5DDD5]">
            Validator Node & Compliance Access
          </span>
          <h1 className="text-3xl font-bold text-[#182B22]">Auditor & Compliance Portal</h1>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 rounded-full bg-white border border-[#E5E0D8] text-[#182B22] hover:bg-[#E3E8E3] font-bold text-xs transition-all shadow-2xs cursor-pointer"
        >
          ← Back to Portal
        </button>
      </div>

      {/* Stats Area */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.02)]">
            <p className="text-xs text-[#5C6660] font-bold uppercase tracking-wider">Pending Audits</p>
            <p className="text-3xl font-bold text-[#182B22] mt-2">{pendingAudits.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.02)]">
            <p className="text-xs text-[#5C6660] font-bold uppercase tracking-wider">Verified This Month</p>
            <p className="text-3xl font-bold text-[#182B22] mt-2">18</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.02)]">
            <p className="text-xs text-[#5C6660] font-bold uppercase tracking-wider">Compliance Rate</p>
            <p className="text-3xl font-bold text-[#182B22] mt-2">98.4%</p>
          </div>
        </div>

        {/* Audit Queue */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.02)] p-6">
          <h3 className="text-xl font-bold text-[#182B22] mb-4">Pending Campaign Proposals</h3>
          
          {pendingAudits.length === 0 ? (
            <p className="text-[#5C6660] text-xs py-8 text-center">No pending audits remaining. All proposals verified!</p>
          ) : (
            <div className="space-y-4">
              {pendingAudits.map((audit) => (
                <div key={audit.id} className="p-5 rounded-xl border border-[#E5E0D8] bg-[#F5F3ED]/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-[#182B22] text-base">{audit.title}</h4>
                    <p className="text-xs text-[#5C6660] mt-1">
                      Organizer: <span className="font-semibold text-[#182B22]">{audit.organizer}</span> | Target: <span className="font-semibold text-[#182B22]">{audit.requestedFunds}</span>
                    </p>
                    <p className="text-[10px] text-[#4A5E53] bg-[#E3E8E3] inline-block px-2.5 py-0.5 rounded-full mt-2 font-bold border border-[#D5DDD5]">
                      Docs: {audit.documents}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleAuditAction(audit.id, 'flag')}
                      className="flex-1 md:flex-none px-4 py-2 rounded-full border border-rose-300 text-rose-800 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
                    >
                      Flag Issue
                    </button>
                    <button 
                      onClick={() => handleAuditAction(audit.id, 'approve')}
                      className="flex-1 md:flex-none px-5 py-2 rounded-full bg-[#182B22] hover:bg-[#0F1E19] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Approve & Sign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
