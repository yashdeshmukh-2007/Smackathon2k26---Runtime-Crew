import React from 'react';

export default function HomeSelection({ onSelectRole }) {
  return (
    <div className="bg-[#F5F3ED] min-h-[calc(100vh-80px)] flex flex-col justify-between p-6 md:p-12 font-sans text-[#182B22]">
      
      {/* Hero Content & Portal Selection */}
      <main className="max-w-5xl w-full mx-auto my-6 text-center">
        {/* Category Pill Badge */}
        <div className="mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#E3E8E3] text-[#4A5E53] text-[11px] font-bold tracking-widest uppercase border border-[#D5DDD5]">
            Decentralized Platform
          </span>
        </div>
        
        {/* Hero Title & Subtitle */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#182B22] tracking-tight leading-[1.15] mb-6 max-w-3xl mx-auto">
          Impactful community engagement.
        </h1>
        
        <p className="text-[#5C6660] text-base md:text-lg max-w-xl mx-auto mb-14 leading-relaxed font-normal">
          Select your entry portal to access campaigns, explore initiatives, or manage organizer operations.
        </p>

        {/* 2x2 Portal Selection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          {/* 1. Explorer & Donor Portal Card */}
          <div 
            onClick={() => onSelectRole('donor')}
            className="bg-white p-8 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.03)] hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-full bg-[#E5EAE5] text-[#182B22] flex items-center justify-center mb-6 group-hover:bg-[#182B22] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">explore</span>
            </div>
            <h3 className="text-2xl font-bold text-[#182B22] mb-3">Explorer & Donor Portal</h3>
            <p className="text-[#5C6660] text-sm leading-relaxed mb-8">
              Discover verified campaigns, make trackable contributions, and monitor real time metrics and personal history.
            </p>
            <span className="inline-flex items-center text-[#182B22] font-semibold text-xs group-hover:underline">
              Enter Explorer Dashboard <span className="ml-1 text-xs">→</span>
            </span>
          </div>

          {/* 2. Organizer Portal Card */}
          <div 
            onClick={() => onSelectRole('organizer')}
            className="bg-white p-8 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.03)] hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-full bg-[#E5EAE5] text-[#182B22] flex items-center justify-center mb-6 group-hover:bg-[#182B22] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">campaign</span>
            </div>
            <h3 className="text-2xl font-bold text-[#182B22] mb-3">Organizer Portal</h3>
            <p className="text-[#5C6660] text-sm leading-relaxed mb-8">
              Create new campaigns, manage registration parameters, track target goals, and update contributors.
            </p>
            <span className="inline-flex items-center text-[#182B22] font-semibold text-xs group-hover:underline">
              Launch Campaign Manager <span className="ml-1 text-xs">→</span>
            </span>
          </div>

          {/* 3. Auditor Portal Card */}
          <div 
            onClick={() => onSelectRole('auditor')}
            className="bg-white p-8 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.03)] hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-full bg-[#E5EAE5] text-[#182B22] flex items-center justify-center mb-6 group-hover:bg-[#182B22] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">fact_check</span>
            </div>
            <h3 className="text-2xl font-bold text-[#182B22] mb-3">Auditor Portal</h3>
            <p className="text-[#5C6660] text-sm leading-relaxed mb-8">
              Review campaign proposals, verify organizational credentials, and audit fund disbursements to ensure transparency.
            </p>
            <span className="inline-flex items-center text-[#182B22] font-semibold text-xs group-hover:underline">
              Access Auditor Tools <span className="ml-1 text-xs">→</span>
            </span>
          </div>

          {/* 4. Governance Portal Card */}
          <div 
            onClick={() => onSelectRole('governance')}
            className="bg-white p-8 rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_rgba(24,43,34,0.03)] hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-full bg-[#E5EAE5] text-[#182B22] flex items-center justify-center mb-6 group-hover:bg-[#182B22] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">how_to_vote</span>
            </div>
            <h3 className="text-2xl font-bold text-[#182B22] mb-3">Governance Portal</h3>
            <p className="text-[#5C6660] text-sm leading-relaxed mb-8">
              Participate in community voting, propose platform upgrades, and shape the future of the funding ecosystem.
            </p>
            <span className="inline-flex items-center text-[#182B22] font-semibold text-xs group-hover:underline">
              View DAO Proposals <span className="ml-1 text-xs">→</span>
            </span>
          </div>

        </div>
      </main>

      {/* Footer Matching Photo Specs */}
      <footer className="max-w-5xl w-full mx-auto pt-16 pb-6 flex flex-col md:flex-row justify-between items-center text-xs text-[#7C8781] border-t border-[#E5E0D8]/60 mt-12 gap-4">
        <div className="flex items-center gap-2">
          <strong className="text-[#182B22] font-bold">VeriFund</strong>
          <span>© 2026 VeriFund. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#terms" className="hover:text-[#182B22] transition-colors">Terms of Service</a>
          <a href="#privacy" className="hover:text-[#182B22] transition-colors">Privacy Policy</a>
          <a href="#contact" className="hover:text-[#182B22] transition-colors">Contact</a>
          <a href="#docs" className="hover:text-[#182B22] transition-colors">Documentation</a>
        </div>
      </footer>
    </div>
  );
}
