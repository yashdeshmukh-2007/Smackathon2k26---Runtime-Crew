import React, { useState } from 'react';

export default function OrganizerPortal({ onAddCampaign, onBackToHome }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Education & Tech',
    goal: '',
    address: '',
    endDate: '',
    description: '',
    bannerImage: '',
    contactEmail: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddCampaign) {
      onAddCampaign({
        ...formData,
        organization: formData.category,
        contractAddress: formData.address || '0x' + Math.random().toString(16).substr(2, 40)
      });
    }
    alert('Campaign registration submitted successfully!');
    onBackToHome();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <button 
        onClick={onBackToHome}
        className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
      >
        ← Back to Home
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Create New Campaign</h2>
        <p className="text-xs text-slate-500 mb-6">Fill in the parameters below to deploy your transparent campaign onto the registry.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Campaign Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. PrepCircle Community STEM Workshop"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option>Education & Tech</option>
                <option>Medical Support</option>
                <option>Disaster Relief</option>
                <option>Environment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Target Amount (ETH)</label>
              <input 
                type="text" 
                required
                placeholder="e.g. 5.0"
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value + ' ETH'})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Recipient Wallet Address</label>
              <input 
                type="text" 
                placeholder="0x..."
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Banner Image URL (Optional)</label>
              <input 
                type="url" 
                placeholder="https://images.unsplash.com/..."
                value={formData.bannerImage}
                onChange={(e) => setFormData({...formData, bannerImage: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Description & Impact Goals</label>
            <textarea 
              rows="4"
              required
              placeholder="Describe your initiative, milestones, and how funds will be deployed..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onBackToHome}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
            >
              Register Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}