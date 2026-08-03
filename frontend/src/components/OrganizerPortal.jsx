import React, { useState } from 'react';
import { ethers } from 'ethers';

// This assumes your ABI file is copied into a frontend/src/abis/ folder.
// If your setup is different, you will need to adjust this import path.
import contractABI from '../abis/DonationTracker.json'; 

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";

export default function OrganizerPortal() {
  const [expense, setExpense] = useState({ campaignId: '', amount: '', description: '', receiptUrl: '' });
  const [status, setStatus] = useState('');

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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Look inside the ABI file for the actual array. Some Hardhat setups export the whole JSON.
      const abi = contractABI.abi || contractABI; 
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

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
      // Catch our custom UnauthorizedSpender error or generic errors
      if (error.message.includes("UnauthorizedSpender")) {
        setStatus("Error: You are not the registered beneficiary for this campaign.");
      } else {
        setStatus(`Error: ${error.reason || error.message}`);
      }
    }
  };

  return (
    
      Organizer Portal: Log Expense
      
        Submit transparency receipts to the blockchain. Only the registered beneficiary of a campaign can log expenses for it.
      
      
      
        
          Campaign ID
          
        

        
          Amount Spent (ETH)
          
        

        
          Description
          
        

        
          Receipt Proof (IPFS URL)
          
        

        
          Log Expense On-Chain
        
      

      {status && (
        
          {status}
        
      )}
    
  );
}
