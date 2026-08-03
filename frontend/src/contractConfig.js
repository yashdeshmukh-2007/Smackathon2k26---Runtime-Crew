// src/contractConfig.js

export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_SEPOLIA_CONTRACT_ADDRESS";

export const CONTRACT_ABI = [
  "function recordDonation(string memory _purpose) external payable",
  "function getDonationCount() external view returns (uint256)",
  "function totalDonations() external view returns (uint256)",
  "function donations(uint256) external view returns (address donor, uint256 amount, string purpose, uint256 timestamp)",
  "event DonationRecorded(address indexed donor, uint256 amount, string purpose, uint256 timestamp)"
];
