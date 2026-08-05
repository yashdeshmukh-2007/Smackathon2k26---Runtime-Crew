import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate successful login/signup for the hackathon
    onLoginSuccess({ email: email || 'user@example.com', name: 'Yash Deshmukh' });
    onClose();
  };

  const handleGoogleLogin = () => {
    // Simulate Google Sign-In success
    onLoginSuccess({ email: 'yash.google@gmail.com', name: 'Yash Deshmukh' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="apple-card w-full max-w-md rounded-3xl p-6 md:p-8 relative shadow-2xl bg-[#FFFFFF] animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5F3ED] text-[#6E6E73] hover:text-[#1D1D1F] flex items-center justify-center font-bold apple-click"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-extrabold text-[#1D1D1F]">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h3>
          <p className="text-xs text-[#6E6E73] mt-1">
            {isSignUp ? "Join our transparent community today" : "Sign in to manage your donations and campaigns"}
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 rounded-full border border-[#D2D2D7] bg-[#FFFFFF] hover:bg-[#F9F9F8] text-[#1D1D1F] font-semibold text-sm flex items-center justify-center gap-3 shadow-sm apple-click mb-5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.22 24 12 24z"/>
            <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.13 0 9.87 0 11.7c0 1.83.43 3.57 1.18 5.1l4.09-2.56z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-[#E5E2D9]"></div>
          <span className="px-3 text-xs text-[#8E8E93] uppercase">or with email</span>
          <div className="flex-grow border-t border-[#E5E2D9]"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="apple-input w-full px-4 py-2.5 rounded-2xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="apple-input w-full px-4 py-2.5 rounded-2xl text-sm"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 apple-button apple-click font-semibold text-sm shadow-sm mt-2"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Toggle between Sign In / Sign Up */}
        <div className="text-center mt-6">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-[#0066CC] hover:underline font-medium"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}