import React, { useState } from 'react';
import HomeSelection from './components/HomeSelection';
import DonorDashboard from './components/DonorDashboard';
import OrganizerPortal from './components/OrganizerPortal';
import CampaignDetails from './components/CampaignDetails';
import AuthModal from './components/AuthModal';
import AuditorDashboard from './components/AuditorDashboard';
import GovernanceDashboard from './components/GovernanceDashboard';
import { supabase } from './supabaseClient';

export default function App() {
  const [currentRole, setCurrentRole] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Global Currency Preference State: 'ETH', 'USD', 'INR'
  const [selectedCurrency, setSelectedCurrency] = useState('ETH');

  // Conversion rates (1 ETH = $3,000 USD = ₹250,000 INR)
  const RATES = {
    ETH: 1,
    USD: 3000,
    INR: 250000
  };

  const [campaigns, setCampaigns] = useState([
    {
      id: '1',
      title: 'Clean Water Initiative',
      organization: 'Aqua Trust',
      goalEth: 10.0,
      raisedEth: 3.5,
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
      goalEth: 5.0,
      raisedEth: 2.1,
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
      goalEth: 15.0,
      raisedEth: 8.4,
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
    const numericGoalEth = parseFloat(newCamp.goal) || 5.0;
    const formatted = {
      ...newCamp,
      id: Date.now().toString(),
      goalEth: numericGoalEth,
      raisedEth: 0.0,
      raised: '0 ETH'
    };
    setCampaigns((prev) => [formatted, ...prev]);
  };

  // Enhanced handleContribute supporting multi-currency (ETH, USD, INR)
  const handleContribute = async (campaignId, amountInput, currencyChoice = 'ETH') => {
    const rawVal = parseFloat(amountInput);
    if (isNaN(rawVal) || rawVal <= 0) return;

    // Convert input value to equivalent ETH amount
    let addedEth = rawVal;
    let addedUsd = rawVal * RATES.USD;
    let addedInr = rawVal * RATES.INR;

    if (currencyChoice === 'USD') {
      addedEth = rawVal / RATES.USD;
      addedUsd = rawVal;
      addedInr = (rawVal / RATES.USD) * RATES.INR;
    } else if (currencyChoice === 'INR') {
      addedEth = rawVal / RATES.INR;
      addedUsd = (rawVal / RATES.INR) * RATES.USD;
      addedInr = rawVal;
    }

    const campaignObj = campaigns.find((c) => c.id === campaignId);
    const campaignTitle = campaignObj ? campaignObj.title : 'General Fund';

    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          const currentRaisedEth = c.raisedEth || parseFloat(c.raised.replace(/[^0-9.]/g, '')) || 0;
          const newRaisedEth = currentRaisedEth + addedEth;
          const updated = {
            ...c,
            raisedEth: newRaisedEth,
            raised: `${newRaisedEth.toFixed(3)} ETH`
          };

          if (selectedCampaign && selectedCampaign.id === campaignId) {
            setSelectedCampaign(updated);
          }
          return updated;
        }
        return c;
      })
    );

    const activeWallet = user?.address || user?.email || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    const randomHash = "0x" + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + "...tx";

    // Format display string based on currency choice
    const displayAmountStr = currencyChoice === 'ETH' 
      ? `${rawVal.toFixed(3)} ETH`
      : currencyChoice === 'USD'
      ? `$${rawVal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`
      : `₹${rawVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR`;

    await supabase
      .from('donations')
      .insert([
        {
          wallet_address: activeWallet,
          campaign_name: campaignTitle,
          amount: addedEth.toFixed(4),
          transaction_hash: randomHash
        }
      ]);

    if (user) {
      setUser((prev) => ({
        ...prev,
        history: [
          {
            id: Date.now(),
            amountStr: displayAmountStr,
            amountEth: addedEth,
            amountUsd: addedUsd,
            amountInr: addedInr,
            currencyChoice,
            campaign_name: campaignTitle,
            campaignId
          },
          ...(prev.history || [])
        ]
      }));
    }

    alert(`Successfully contributed ${displayAmountStr} (≈ ${addedEth.toFixed(4)} ETH) to "${campaignTitle}"!`);
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#182B22] font-sans">
      {/* Header bar matching exact photo styling */}
      <header className="bg-[#F5F3ED] border-b border-[#E5E0D8]/80 px-6 md:px-12 py-5 flex justify-between items-center max-w-6xl mx-auto">
        <div 
          onClick={() => { setCurrentRole(null); setSelectedCampaign(null); }}
          className="font-bold text-2xl text-[#182B22] cursor-pointer tracking-tight flex items-center gap-2"
        >
          VeriFund
        </div>

        <div className="flex items-center gap-4">
          {/* Global Currency Selection Switcher */}
          <div className="flex items-center bg-white border border-[#E5E0D8] rounded-full p-1 shadow-2xs">
            <span className="text-[10px] font-bold text-[#7C8781] px-2.5 uppercase tracking-wider hidden sm:inline">Pay in:</span>
            {['ETH', 'USD', 'INR'].map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                  selectedCurrency === curr 
                    ? 'bg-[#182B22] text-white shadow-2xs' 
                    : 'text-[#5C6660] hover:text-[#182B22]'
                }`}
              >
                {curr === 'ETH' ? 'ETH' : curr === 'USD' ? '$ USD' : '₹ INR'}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-full border border-[#E5E0D8]">
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#182B22]">{user.name}</p>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="bg-[#182B22] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#0F1E19] transition-all shadow-2xs cursor-pointer"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {!currentRole && !selectedCampaign && (
        <HomeSelection 
          onSelectRole={(role) => setCurrentRole(role)}
          onOpenAuth={() => setIsAuthOpen(true)}
          isAuthenticated={!!user}
        />
      )}

      {currentRole === 'donor' && !selectedCampaign && (
        <DonorDashboard 
          user={user}
          campaigns={campaigns}
          selectedCurrency={selectedCurrency}
          onChangeCurrency={setSelectedCurrency}
          onSelectCampaign={(c) => setSelectedCampaign(c)}
          onBackToHome={() => setCurrentRole(null)}
          onContribute={handleContribute}
        />
      )}

      {selectedCampaign && (
        <CampaignDetails 
          campaign={selectedCampaign}
          user={user}
          selectedCurrency={selectedCurrency}
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

      {currentRole === 'auditor' && !selectedCampaign && (
        <AuditorDashboard 
          onBack={() => setCurrentRole(null)}
        />
      )}

      {currentRole === 'governance' && !selectedCampaign && (
        <GovernanceDashboard 
          onBack={() => setCurrentRole(null)}
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
