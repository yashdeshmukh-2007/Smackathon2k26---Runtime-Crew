import React from 'react';

export default function HomeSelection({ onSelectMode, sampleOrgs }) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in duration-300">
      
      {/* Hero Intro */}
      <div className="text-center space-y-3">
        <span className="px-3.5 py-1.5 rounded-full bg-[#EBEAE5] text-[#1D1D1F] text-xs font-semibold tracking-wide uppercase">
          Smackathon 2k26
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1D1D1F]">
          Transparent & Direct Giving
        </h1>
        <p className="text-sm md:text-base text-[#6E6E73] max-w-xl mx-auto">
          Send funds securely on-chain or register your cause to start receiving transparent support instantly.
        </p>
      </div>

      {/* Two Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Choice 1: Donate */}
        <div 
          onClick={() => onSelectMode('donate')}
          className="apple-card rounded-3xl p-8 cursor-pointer hover:border-[#0066CC]/40 transition-all group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066CC]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#0066CC]/10 text-[#0066CC] flex items-center justify-center text-2xl mb-6">
              🤝
            </div>
            <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">Want to Donate?</h2>
            <p className="text-sm text-[#6E6E73] leading-relaxed mb-6">
              Browse pre-enlisted trusted organizations or support your favorite causes with secure, direct ETH transactions.
            </p>
          </div>

          <button className="w-full py-3 apple-button apple-click font-semibold text-sm flex items-center justify-center gap-2">
            Start Donating <span className="text-lg">→</span>
          </button>
        </div>

        {/* Choice 2: Enlist / Register */}
        <div 
          onClick={() => onSelectMode('enlist')}
          className="apple-card rounded-3xl p-8 cursor-pointer hover:border-[#1D1D1F]/40 transition-all group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBEAE5] rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#EBEAE5] text-[#1D1D1F] flex items-center justify-center text-2xl mb-6">
              🎯
            </div>
            <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">Enlist Your Cause</h2>
            <p className="text-sm text-[#6E6E73] leading-relaxed mb-6">
              Register your organization on-chain with a custom campaign identifier and receive transparent funding directly.
            </p>
          </div>

          <button className="w-full py-3 bg-[#EBEAE5] text-[#1D1D1F] hover:bg-[#E2E1DC] rounded-full font-semibold text-sm apple-click flex items-center justify-center gap-2">
            Register Campaign <span className="text-lg">→</span>
          </button>
        </div>

      </div>

      {/* Pre-Enlisted Sample Organizations Section */}
      <div className="apple-card rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-[#1D1D1F]">Featured Active Organizations</h3>
            <p className="text-xs text-[#6E6E73]">Already enlisted and receiving live support on the network.</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ● Live On-Chain
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sampleOrgs.map((org, index) => (
            <div key={index} className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E5E2D9] space-y-3 hover:shadow-sm transition-all">
              <img 
                src={org.image} 
                alt={org.name} 
                className="w-full h-32 object-cover rounded-xl"
              />
              <div>
                <h4 className="font-bold text-sm text-[#1D1D1F]">{org.name}</h4>
                <p className="text-xs text-[#6E6E73] mt-1 line-clamp-2">{org.desc}</p>
              </div>
              <div className="pt-2 border-t border-[#E5E2D9]/60 flex items-center justify-between text-xs font-semibold">
                <span className="text-[#0066CC]">{org.raised} ETH Raised</span>
                <span className="text-[#8E8E93] font-mono">{org.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}