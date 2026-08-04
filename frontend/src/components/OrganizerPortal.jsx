// frontend/src/components/OrganizerPortal.jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';

export default function OrganizerPortal() {
  const [expense, setExpense] = useState({
    campaignId: '',
    amount: '',
    description: '',
    receiptUrl: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  const submitExpense = async (e) => {
    e.preventDefault();
    setStatus('Connecting to wallet...');

    if (!window.ethereum) {
      setStatus('Please install MetaMask to log expenses.');
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setStatus('Waiting for wallet approval...');

      const amountInWei = ethers.parseEther(expense.amount);

      // Call the non-custodial logExpense function
      const tx = await contract.logExpense(
        expense.campaignId,
        amountInWei,
        expense.description,
        expense.receiptUrl
      );

      setStatus('Transaction submitted. Waiting for blockchain confirmation...');
      await tx.wait();

      setStatus('Success! Expense permanently logged on the blockchain.');
      setExpense({ campaignId: '', amount: '', description: '', receiptUrl: '' });
    } catch (error) {
      console.error(error);
      if (error.message && error.message.includes("UnauthorizedSpender")) {
        setStatus("Error: You are not the registered beneficiary for this campaign.");
      } else {
        setStatus(`Error: ${error.reason || error.message || "Transaction failed"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans flex items-center justify-center">
      <div className="max-w-xl w-full bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 md:p-8 shadow-xl">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Organizer Portal: Log Expense
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit transparency receipts directly to the blockchain. Only the registered beneficiary of a campaign can log expenses.
          </p>
        </div>

        <form onSubmit={submitExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Campaign ID
            </label>
            <input
              type="text"
              name="campaignId"
              value={expense.campaignId}
              onChange={handleInputChange}
              placeholder="e.g. flood-relief-2026"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Amount Spent (ETH)
            </label>
            <input
              type="number"
              step="0.0001"
              name="amount"
              value={expense.amount}
              onChange={handleInputChange}
              placeholder="0.05"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={expense.description}
              onChange={handleInputChange}
              placeholder="e.g. Purchased emergency medical supplies"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Receipt Proof (IPFS or Hash URL)
            </label>
            <input
              type="text"
              name="receiptUrl"
              value={expense.receiptUrl}
              onChange={handleInputChange}
              placeholder="ipfs://Qm... or https://..."
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            {loading ? "Processing..." : "Log Expense On-Chain"}
          </button>
        </form>

        {status && (
          <div className="mt-6 p-3 text-center text-xs font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 rounded-xl break-words">
            {status}
          </div>
        )}

      </div>
    </div>
  );
}