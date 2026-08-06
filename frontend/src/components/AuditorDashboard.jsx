import React, { useState } from 'react';

export default function AuditorDashboard({ onBack }) {
  // Sample pending campaigns awaiting audit
  const [pendingAudits, setPendingAudits] = useState([
    {
      id: 1,
      title: 'Clean Water Initiative - Phase 2',
      organizer: 'EcoAction Global',
      requestedFunds: '12.5 ETH',
      riskScore: 'Low',
      status: 'Pending Review',
      documents: 'Verified NGO License & 501(c)(3)'
    },
    {
      id: 2,
      title: 'Emergency Medical Relief - Zone B',
      organizer: 'HealthFirst DAO',
      requestedFunds: '25.0 ETH',
      riskScore: 'Medium',
      status: 'Pending Review',
      documents: 'Missing Independent Expense Receipt'
    }
  ]);

  const handleAuditAction = (id, action) => {
    setPendingAudits(prev => prev.filter(item => item.id !== id));
    alert(`Campaign successfully ${action === 'approve' ? 'Approved & Certified' : 'Flagged for Review'}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-100">
            Validator Node Access
          </span>
          <h1 className="text-3xl font-bold text-slate-900">Auditor & Compliance Portal</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Pending Audits</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{pendingAudits.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Verified This Month</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">18</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Compliance Rate</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">98.4%</p>
          </div>
        </div>

        {/* Audit Queue Table / Cards */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Pending Campaign Proposals</h3>
          
          {pendingAudits.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No pending audits remaining. Great job!</p>
          ) : (
            <div className="space-y-4">
              {pendingAudits.map((audit) => (
                <div key={audit.id} className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg">{audit.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Organizer: <span className="font-medium text-slate-700">{audit.organizer}</span> | Requested: <span className="font-medium text-slate-700">{audit.requestedFunds}</span></p>
                    <p className="text-xs text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded mt-2 border border-indigo-100">Docs: {audit.documents}</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleAuditAction(audit.id, 'flag')}
                      className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-medium transition-colors"
                    >
                      Flag Issue
                    </button>
                    <button 
                      onClick={() => handleAuditAction(audit.id, 'approve')}
                      className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
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
