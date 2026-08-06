// frontend/src/contractConfig.js

// Points to your local Hardhat node deployment
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  // Write functions
  "function registerCampaign(string calldata _campaignId, address payable _beneficiary) external",
  "function recordDonation(string calldata _campaignId) external payable",
  "function logExpense(string calldata _campaignId, uint256 _amount, string calldata _description, string calldata _receiptUrl) external",

  // Read functions
  "function getDonationsCount() external view returns (uint256 count)",
  "function totalAmountRaised() external view returns (uint256)",
  "function getRegisteredCampaignsCount() external view returns (uint256 count)",
  "function getRegisteredCampaignIdAt(uint256 _index) external view returns (string memory campaignId)",
  "function getCampaignBeneficiary(string calldata _campaignId) external view returns (address beneficiary)",
  "function getTotalRaisedForCampaign(string calldata _campaignId) external view returns (uint256 total)",
  "function getIsCampaignRegistered(string calldata _campaignId) external view returns (bool)",

  // Paginated feed
  "function getDonationsPage(uint256 _start, uint256 _count) external view returns (tuple(address donor, uint256 amount, string campaignId, uint256 timestamp)[] page)",

  // Events
  "event CampaignRegistered(bytes32 indexed campaignHash, string campaignId, address indexed beneficiary, address indexed registeredBy)",
  "event DonationRecorded(address indexed donor, string indexed campaignId, uint256 amount, uint256 timestamp, uint256 donationId)",
  "event ExpenseLogged(string indexed campaignId, uint256 amount, string description, string receiptUrl, uint256 timestamp)"
];
