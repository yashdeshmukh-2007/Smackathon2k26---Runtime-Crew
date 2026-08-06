import React from 'react';

// Added 'isAuthenticated' to the props
export default function HomeSelection({ onSelectRole, onOpenAuth, isAuthenticated }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 md:p-12 font-sans text-slate-800">
      {/* Top Header / Branding */}
      <header className="flex justify-between items-center max-w-6xl w-full mx-auto">
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-teal-700 text-3xl">token</span>
          <span className="font-display font-bold text-2xl tracking-tight text-slate-900">VeriFund </span>
        </div>
        
        {/* Conditional Rendering: Only show button if user is NOT authenticated */}
        {!isAuthenticated && (
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors shadow-sm"
          >
            Sign In / Connect Wallet
          </button>
        )}
      </header>

      {/* Hero Content & Portal Selection */}
      <main className="max-w-4xl w-full mx-auto my-12 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-6 border border-teal-100">
          Decentralized Platform
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-normal text-slate-900 leading-tight mb-6">
          Transparent, impactful engagement for modern communities.
        </h1>
        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Select your entry portal to access campaigns, explore initiatives, or manage organizer operations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Donor / User Portal Card */}
          <div 
            onClick={() => onSelectRole('donor')}
            className="glass-card p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-6 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">explore</span>
            </div>
            <h3 className="font-display text-2xl font-semibold text-slate-900 mb-2">Explorer & Donor Portal</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Discover verified campaigns, make trackable contributions, and monitor real-time metrics and personal history.
            </p>
            <span className="inline-flex items-center text-teal-700 font-medium text-sm group-hover:underline">
              Enter Explorer Dashboard <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </span>
          </div>

          {/* Organizer / NGO Portal Card */}
          <div 
            onClick={() => onSelectRole('organizer')}
            className="glass-card p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">campaign</span>
            </div>
            <h3 className="font-display text-2xl font-semibold text-slate-900 mb-2">Organizer Portal</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Create new campaigns, manage registration parameters, track target goals, and update contributors.
            </p>
            <span className="inline-flex items-center text-slate-900 font-medium text-sm group-hover:underline">
              Launch Campaign Manager <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 max-w-6xl w-full mx-auto">
        &copy; {new Date().getFullYear()} PrepCircle. All rights reserved.
      </footer>
    </div>
  );
}
