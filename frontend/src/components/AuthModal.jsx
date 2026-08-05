import React from 'react';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-slate-900 mb-1">Sign In / Connect Account</h3>
        <p className="text-xs text-slate-500 mb-6">Choose Google authentication or your preferred Web3 wallet.</p>

        <div className="space-y-3">
          {/* Google Sign In Option */}
          <button 
            onClick={() => onLogin('google')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs">
                🌐
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Continue with Google</p>
                <p className="text-[10px] text-slate-400">Fast sign in with email</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-emerald-600 font-medium">Select →</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400">Or Web3 Wallet</span></div>
          </div>

          {/* MetaMask */}
          <button 
            onClick={() => onLogin('metamask')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">🦊</div>
              <div>
                <p className="text-sm font-bold text-slate-800">MetaMask</p>
                <p className="text-[10px] text-slate-400">Connect browser extension</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-emerald-600 font-medium">Connect →</span>
          </button>

          {/* WalletConnect */}
          <button 
            onClick={() => onLogin('walletconnect')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">🔗</div>
              <div>
                <p className="text-sm font-bold text-slate-800">WalletConnect</p>
                <p className="text-[10px] text-slate-400">Scan via mobile app</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-emerald-600 font-medium">Connect →</span>
          </button>
        </div>
      </div>
    </div>
  );
}