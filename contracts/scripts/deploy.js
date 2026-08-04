const hre = require("hardhat");

async function main() {
  console.log("Deploying DonationTracker contract...");

  // Get the contract factory for DonationTracker
  const DonationTracker = await hre.ethers.getContractFactory("DonationTracker");

  // Deploy the contract
  const donationTracker = await DonationTracker.deploy();

  // Wait for the deployment to finish
  await donationTracker.waitForDeployment();

  const contractAddress = await donationTracker.getAddress();

  console.log("----------------------------------------------------");
  console.log(`SUCCESS: DonationTracker deployed to: ${contractAddress}`);
  console.log("----------------------------------------------------");
  console.log("Update this address in your backend/.env and frontend configuration files!");
}

main().catch((error) => {
  console.error("Error during deployment:", error);
  process.exitCode = 1;
});