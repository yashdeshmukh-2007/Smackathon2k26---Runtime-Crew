// src/contractConfig.js

// frontend/src/contractConfig.js

export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_SEPOLIA_CONTRACT_ADDRESS";

export const CONTRACT_ABI = [
  "function registerCampaign(string calldata _campaignId, address payable _beneficiary) external",
  "function recordDonation(string calldata _campaignId) external payable",
  "function getDonationsCount() external view returns (uint256 count)",
  "function totalAmountRaised() external view returns (uint256)",
  "function getRegisteredCampaignsCount() external view returns (uint256 count)",
  "function getRegisteredCampaignIdAt(uint256 _index) external view returns (string memory campaignId)",
  "function getCampaignBeneficiary(string calldata _campaignId) external view returns (address beneficiary)",
  "function getTotalRaisedForCampaign(string calldata _campaignId) external view returns (uint256 total)",
  "function getDonationsPage(uint256 _start, uint256 _count) external view returns (tuple(address donor, uint256 amount, string campaignId, uint256 timestamp)[] page)",
  "event CampaignRegistered(bytes32 indexed campaignHash, string campaignId, address indexed beneficiary, address indexed registeredBy)",
  "event DonationRecorded(address indexed donor, string indexed campaignId, uint256 amount, uint256 timestamp, uint256 donationId)"
];
