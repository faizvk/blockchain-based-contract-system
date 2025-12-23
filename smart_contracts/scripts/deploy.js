const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Set the initial contract parameters
  const totalBudget = hre.ethers.utils.parseEther("10000"); // Total budget of 10,000 Ether
  const unlockDuration = 3600; // Unlock duration of 1 hour (3600 seconds)
  const minimumBid = hre.ethers.utils.parseEther("10"); // Minimum bid of 10 Ether
  const gracePeriod = 600; // Grace period of 10 minutes (600 seconds)
  const contractDuration = 2592000; // Contract duration of 30 days (2592000 seconds)
  const safetyDepositAmount = hre.ethers.utils.parseEther("1"); // Safety deposit of 1 Ether

  // Get contract factory
  const BudgetContract = await hre.ethers.getContractFactory("BudgetContract");

  // Deploy the contract with all required arguments
  const budgetContract = await BudgetContract.deploy(
    totalBudget,
    unlockDuration,
    minimumBid,
    gracePeriod,
    contractDuration,
    safetyDepositAmount
  );

  await budgetContract.deployed();

  // Log the deployed contract's address
  console.log("Contract deployed to:", budgetContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
