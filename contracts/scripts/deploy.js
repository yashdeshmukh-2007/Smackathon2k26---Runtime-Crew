import hre from "hardhat";

async function main() {
  console.log("Deploying DonationTracker contract...");

  // Use getOrCreate() to fetch/create the active network connection in Hardhat 3
  const { ethers } = await hre.network.getOrCreate();

  const DonationTracker = await ethers.getContractFactory("DonationTracker");
  const donationTracker = await DonationTracker.deploy();
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