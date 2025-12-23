import React, { useState } from "react";

import { useWallet } from "../context/WalletContext";
import "../styles/ownerForm.css";
import { ethers } from "ethers"; // Import ethers directly

import { contractABI } from "../utils/contractABI";
import { contractBytecode } from "../utils/contractBytecode";

const OwnerControlForm = () => {
  const { walletAddress } = useWallet(); // Get wallet address from context

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    totalBudget: "",
    unlockDurationDays: "", // Input in days
    minimumBid: "",
    gracePeriodDays: "", // Input in days
    safetyDepositAmount: "", // New field for safety deposit
    contractDurationDays: "",
    // New field for contract duration
  });

  const [message, setMessage] = useState("");

  // Helper function to convert decimal days to seconds
  const daysToSeconds = (days) => {
    const numDays = Number(days);
    return Math.floor(numDays * 24 * 60 * 60); // Convert to seconds with decimal precision
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStoreData = async (dataToStore) => {
    try {
      /// Get current timestamp at deployment
      const deploymentTimestamp = Math.floor(Date.now() / 1000);

      // Calculate actual end times
      const unlockTime = deploymentTimestamp + dataToStore.unlockDuration;
      const gracePeriodEnd = unlockTime + dataToStore.gracePeriod;

      // Store timestamps instead of converting back to days
      const dataWithTimestamps = {
        ...dataToStore,
        unlockTime,
        gracePeriodEnd,
        unlockDurationDays: formData.unlockDurationDays,
        gracePeriodDays: formData.gracePeriodDays,
        contractDurationDays: formData.contractDurationDays,
      };

      const response = await fetch(
        "http://localhost:5000/api/storeContractData",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataWithTimestamps),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage((prev) => `${prev}`);
      } else {
        setMessage(`Error: ${data.error || "Failed to store data on IPFS"}`);
      }
    } catch (error) {
      setMessage("Network Error: Unable to connect to the server or IPFS.");
    }
  };

  const handleDeployContract = async (e) => {
    e.preventDefault();
    setMessage("Deploying contract...");

    if (!walletAddress) {
      setMessage("Connect Wallet First");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      // Get the balance as a bigint
      const balance = await provider.getBalance(signerAddress);
      console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

      // Check if balance is sufficient for deployment
      if (balance < ethers.parseEther("0.1")) {
        throw new Error("Insufficient balance for deployment.");
      }

      // Convert days to seconds for contract deployment
      const unlockDurationSeconds = daysToSeconds(
        Number(formData.unlockDurationDays)
      );
      const gracePeriodSeconds = daysToSeconds(
        Number(formData.gracePeriodDays)
      );
      const contractDurationSeconds = daysToSeconds(
        Number(formData.contractDurationDays)
      );

      // Log parameters
      console.log("Parameters:");
      console.log(
        "Total Budget:",
        ethers.parseEther(formData.totalBudget.toString())
      );
      console.log("Unlock Duration (seconds):", unlockDurationSeconds);
      console.log(
        "Minimum Bid:",
        ethers.parseEther(formData.minimumBid.toString())
      );
      console.log("Grace Period (seconds):", gracePeriodSeconds);
      console.log(
        "Safety Deposit Amount:",
        ethers.parseEther(formData.safetyDepositAmount.toString())
      );
      console.log("Contract Duration (seconds):", contractDurationSeconds);

      // Create the contract factory
      const contractFactory = new ethers.ContractFactory(
        contractABI,
        contractBytecode,
        signer
      );

      // Deploy the contract with the provided parameters
      const contract = await contractFactory.deploy(
        ethers.parseEther(formData.totalBudget.toString()),
        unlockDurationSeconds, // Use seconds for deployment
        ethers.parseEther(formData.minimumBid.toString()),
        gracePeriodSeconds, // Use seconds for deployment
        contractDurationSeconds, // Use seconds for deployment
        ethers.parseEther(formData.safetyDepositAmount.toString()) // Safety deposit amount
      );

      // The contract is already deployed and mined at this point
      console.log("Contract deployed at address:", contract.target);
      setMessage(`Success: Contract deployed`);

      // Store the contract metadata and address
      console.log("Deploying contract with address:", contract.target);

      const deploymentTimestamp = Math.floor(Date.now() / 1000);

      // Calculate end timestamps
      const unlockTime = deploymentTimestamp + unlockDurationSeconds;
      const gracePeriodEnd = unlockTime + gracePeriodSeconds;
      await handleStoreData({
        name: formData.name,
        description: formData.description,
        totalBudget: formData.totalBudget,
        minimumBid: formData.minimumBid,
        safetyDepositAmount: formData.safetyDepositAmount,
        contractAddress: contract.target,
        unlockDuration: unlockDurationSeconds,
        gracePeriod: gracePeriodSeconds,
        contractDuration: contractDurationSeconds,
        unlockTime,
        gracePeriodEnd,
      });
    } catch (error) {
      console.error("Error deploying contract:", error);
      if (
        error.code === 4001 ||
        (error.error && error.error.code === 4001) ||
        (error.info && error.info.error && error.info.error.code === 4001)
      ) {
        setMessage("Error deploying contract: Error: user rejected action");
      } else {
        setMessage("Error deploying contract: " + error.message);
      }
    }
  };

  return (
    <div className="owner-control-form">
      <h2>Owner Control Panel</h2>
      {walletAddress ? (
        <form onSubmit={handleDeployContract}>
          <h3>Deploy Contract</h3>
          <div className="input-row">
            <input
              type="text"
              name="name"
              placeholder="Contract Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              step="0.0001"
              name="totalBudget"
              placeholder="Total Budget (ETH)"
              value={formData.totalBudget}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="input-row">
            <input
              type="number"
              step="0.0001"
              name="unlockDurationDays"
              placeholder="Unlock Duration (days, e.g., 0.00139 for 2 min)"
              value={formData.unlockDurationDays}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              step="0.0001"
              name="minimumBid"
              placeholder="Minimum Bid (ETH)"
              value={formData.minimumBid}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="input-row">
            <input
              type="number"
              step="0.0001"
              name="gracePeriodDays"
              placeholder="Grace Period (days, e.g., 0.00139 for 2 min)"
              value={formData.gracePeriodDays}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              step="0.0001"
              name="safetyDepositAmount"
              placeholder="Safety Deposit Amount (ETH)"
              value={formData.safetyDepositAmount}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="input-row">
            <input
              type="number"
              step="0.0001"
              name="contractDurationDays"
              placeholder="Contract Duration (days, e.g., 0.00139 for 2 min)"
              value={formData.contractDurationDays}
              onChange={handleInputChange}
              required
            />
          </div>
          <textarea
            name="description"
            placeholder="Enter a detailed description about the contract..."
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            required
          />
          <button type="submit">Deploy Contract</button>
        </form>
      ) : (
        <p>Please connect your wallet first.</p>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default OwnerControlForm;
