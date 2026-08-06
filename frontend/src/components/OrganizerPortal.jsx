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
    <div className="max-w-4xl mx-auto p-6 md:p-8 font-sans text-[#182B22]">
      <button 
        onClick={onBackToHome}
        className="mb-6 text-xs font-bold text-[#182B22] bg-white border border-[#E5E0D8] px-4 py-2 rounded-full hover:bg-[#E3E8E3] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
      >
        ← Back to Portal
      </button>

      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-8 shadow-[0_4px_20px_rgba(24,43,34,0.02)]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5E53] bg-[#E3E8E3] border border-[#D5DDD5] px-3 py-1 rounded-full inline-block mb-3">
          Organizer Deployment Portal
        </span>
        <h2 className="text-2xl font-bold text-[#182B22] mb-1">Create New Campaign</h2>
        <p className="text-xs text-[#5C6660] mb-6">Fill in the parameters below to deploy your transparent campaign onto the on-chain registry.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#182B22] mb-1.5">Campaign Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Clean Water & Sanitation Initiative"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#182B22] text-[#182B22]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182B22] mb-1.5">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#182B22] text-[#182B22] bg-white"
              >
                <option>Education & Tech</option>
                <option>Medical Support</option>
                <option>Disaster Relief</option>
                <option>Environment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182B22] mb-1.5">Target Goal (ETH)</label>
              <input 
                type="number"
                step="0.1" 
                required
                placeholder="e.g. 5.0"
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#182B22] text-[#182B22]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182B22] mb-1.5">Recipient Wallet Address</label>
              <input 
                type="text" 
                placeholder="0x..."
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#182B22] text-[#182B22]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182B22] mb-1.5">Banner Image URL (Optional)</label>
              <input 
                type="url" 
                placeholder="https://images.unsplash.com/..."
                value={formData.bannerImage}
                onChange={(e) => setFormData({...formData, bannerImage: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#182B22] text-[#182B22]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182B22] mb-1.5">Description & Impact Goals</label>
            <textarea 
              rows="4"
              required
              placeholder="Describe your initiative, milestones, and how funds will be deployed..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#182B22] text-[#182B22]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8]/60">
            <button 
              type="button" 
              onClick={onBackToHome}
              className="px-6 py-2.5 rounded-full border border-[#E5E0D8] text-xs font-bold text-[#5C6660] hover:bg-[#F5F3ED] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#182B22] text-white text-xs font-bold hover:bg-[#0F1E19] transition-all shadow-2xs cursor-pointer"
            >
              Deploy Campaign Registry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}