import React, { useState } from 'react';
import HomeSelection from './components/HomeSelection';
import DonorDashboard from './components/DonorDashboard';
import OrganizerPortal from './components/OrganizerPortal';
import CampaignDetails from './components/CampaignDetails';
import AuthModal from './components/AuthModal';

export default function App() {
  const [currentRole, setCurrentRole] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Sample initial campaigns list
  const [campaigns, setCampaigns] = useState([
    {
      id: '1',
      title: 'Clean Water Initiative',
      organization: 'Aqua Trust',
      goal: '10 ETH',
      raised: '3.5 ETH',
      bannerImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
      description: 'Deploying clean water filtration systems across rural communities.',
      contactEmail: 'support@aquatrust.org',
      contractAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
    },
    {
      id: '2',
      title: 'PrepCircle STEM Workshop',
      organization: 'PrepCircle EdTech',
      goal: '5 ETH',
      raised: '2.1 ETH',
      bannerImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
      description: 'Empowering students with hands-on coding and computer engineering kits.',
      contactEmail: 'contact@prepcircle.org',
      contractAddress: '0x88F923...1C82'
    },
    {
      id: '3',
      title: 'Assam Flood Relief Support',
      organization: 'Red Cross Assist',
      goal: '15 ETH',
      raised: '8.4 ETH',
      bannerImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      description: 'Emergency medical kits, food distribution, and shelter for affected families.',
      contactEmail: 'relief@redcross.org',
      contractAddress: '0x3A219B...90F1'
    }
  ]);

  const handleLogin = (provider) => {
    setUser({
      name: provider === 'google' ? 'Yash Deshmukh' : 'Web3 Donor',
      email: provider === 'google' ? 'yash@example.com' : '0x71C7...976F',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      history: []
    });
    setIsAuthOpen(false);
  };

  const handleAddCampaign = (newCamp) => {
    const formatted = {
      ...newCamp,
      id: Date.now().toString(),
      raised: '0 ETH'
    };
    setCampaigns((prev) => [formatted, ...prev]);
  };

  const handleContribute = (campaignId, amount) => {
    const numericAmount = parseFloat(amount);
    
    // Update raised balance on campaign
    setCampaigns((prev) => prev.map((c) => {
      if (c.id === campaignId) {
        const currentRaised = parseFloat(c.raised.replace(' ETH', '')) || 0;
        return { ...c, raised: `${(currentRaised + numericAmount).toFixed(2)} ETH` };
      }
      return c;
    }));

    // Record user history
    if (user) {
      setUser((prev) => ({
        ...prev,
        history: [{ id: Date.now(), amount: `${numericAmount} ETH`, campaignId }, ...prev.history]
      }));
    }

    alert(`Successfully contributed ${numericAmount} ETH!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div 
          onClick={() => { setCurrentRole(null); setSelectedCampaign(null); }}
          className="font-bold text-xl text-emerald-600 cursor-pointer flex items-center gap-2"
        >
          VeriFund
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-slate-800"
            >
              Sign In / Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Pages */}
      {!currentRole && !selectedCampaign && (
        <HomeSelection 
          onSelectRole={(role) => setCurrentRole(role)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {currentRole === 'donor' && !selectedCampaign && (
        <DonorDashboard 
          user={user}
          campaigns={campaigns}
          onSelectCampaign={(c) => setSelectedCampaign(c)}
          onBackToHome={() => setCurrentRole(null)}
        />
      )}

      {selectedCampaign && (
        <CampaignDetails 
          campaign={selectedCampaign}
          user={user}
          onContribute={handleContribute}
          onOpenAuth={() => setIsAuthOpen(true)}
          onBack={() => setSelectedCampaign(null)}
        />
      )}

      {currentRole === 'organizer' && !selectedCampaign && (
        <OrganizerPortal 
          onAddCampaign={handleAddCampaign}
          onBackToHome={() => setCurrentRole(null)}
        />
      )}

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={handleLogin}
      />
    </div>
  );
}