import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

import "../styles/offerorForm.css";

import { contractABI } from "../utils/contractABI";

const OfferorForm = () => {
  const { contractAddress } = useParams();
  const { walletAddress, userName } = useWallet();
  const [offerAmount, setOfferAmount] = useState("");
  const [nonce, setNonce] = useState("");
  const [message, setMessage] = useState("");
  const [contractDetails, setContractDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [unlockTimeLeft, setUnlockTimeLeft] = useState("");
  const [gracePeriodLeft, setGracePeriodLeft] = useState("");
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [isUploaded, setIsUploaded] = useState(false);

  // Unique key for localStorage based on contractAddress and walletAddress
  const storageKey = `uploadStatus_${contractAddress}_${walletAddress}`;

  // Fetch contract details from the backend
  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/contracts/${contractAddress}`
        );
        if (!response.ok) throw new Error("Failed to fetch contract details");
        const data = await response.json();
        setContractDetails(data.contract);
      } catch (error) {
        console.error("Error fetching contract details:", error);
        setMessage("Error fetching contract details");
      } finally {
        setLoading(false);
      }
    };

    if (contractAddress) fetchContractDetails();
  }, [contractAddress]);

  // Check localStorage for previous upload status on mount
  useEffect(() => {
    const storedStatus = JSON.parse(localStorage.getItem(storageKey));
    if (storedStatus && storedStatus.isUploaded) {
      setIsUploaded(true);
      setIpfsHash(storedStatus.ipfsHash || ""); // Retrieve stored IPFS hash
    }
  }, [storageKey]);

  // Update countdown timers for bidding and grace period
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!contractDetails.unlockTime || !contractDetails.gracePeriodEnd)
        return;
      const now = Math.floor(Date.now() / 1000);
      const unlockRemaining = contractDetails.unlockTime - now;
      const graceRemaining = contractDetails.gracePeriodEnd - now;
      setUnlockTimeLeft(formatDuration(unlockRemaining));
      setGracePeriodLeft(formatDuration(graceRemaining));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [contractDetails.unlockTime, contractDetails.gracePeriodEnd]);

  // Helper function: Format duration in seconds to a human-readable string
  const formatDuration = (seconds) => {
    if (typeof seconds !== "number" || seconds <= 0) return "Ended";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);
    return parts.join(" ");
  };

  const isValidOfferAmount = (amount) => {
    const numAmount = Number(amount);
    const minBid = Number(contractDetails.minimumBid || 0);
    const maxBudget = Number(contractDetails.totalBudget || Infinity);
    return numAmount >= minBid && numAmount <= maxBudget;
  };

  // Helper function: Format ETH value
  const formatETH = (value) => {
    const numberValue = Number(value);
    return isNaN(numberValue) ? "0 ETH" : `${numberValue.toLocaleString()} ETH`;
  };

  // Check if the connected wallet has enough balance for the required safety deposit
  const checkBalance = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(walletAddress);
      const required = ethers.parseEther(
        contractDetails.safetyDepositAmount.toString()
      );
      console.log("Required Deposit:", required);
      return balance >= required;
    } catch (error) {
      console.error("Balance check error:", error);
      return false;
    }
  };

  // Handle commit offer with validation
  const handleCommitOffer = async (e) => {
    e.preventDefault();
    if (!contractDetails.safetyDepositAmount) {
      setCommitMessage("Error: Safety deposit amount not found in contract.");
      return;
    }

    if (!isValidOfferAmount(offerAmount)) {
      setCommitMessage(
        `Offer must be between ${formatETH(
          contractDetails.minimumBid
        )} and ${formatETH(contractDetails.totalBudget)}`
      );
      return;
    }

    if (!(await checkBalance())) {
      setCommitMessage("Error: Insufficient balance for safety deposit.");
      return;
    }

    if (!ipfsHash) {
      setCommitMessage("Please upload a document before committing the offer.");
      return;
    }

    setCommitMessage("Committing offer...");
    try {
      const safetyDeposit = ethers.parseEther(
        contractDetails.safetyDepositAmount.toString()
      );

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const commitment = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "uint256"],
          [ethers.parseEther(offerAmount), nonce]
        )
      );

      const tx = await contract.commitOffer(commitment, {
        value: safetyDeposit,
      });
      await tx.wait();

      const response = await fetch(
        "http://localhost:5000/api/store-commitment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractAddress,
            offeror: walletAddress,
            commitmentHash: commitment,
            username: userName,
            ipfsHash,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to store commitment in database.");
      }

      setCommitMessage("Offer committed successfully!");
    } catch (error) {
      console.error("Commit error:", error);
      setCommitMessage(`Error: ${error.reason || error.message}`);
    }
  };

  // Handle reveal offer on-chain and store the revealed offer along with username
  const handleRevealOffer = async (e) => {
    e.preventDefault();
    setMessage("Revealing offer...");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const tx = await contract.revealOffer(
        ethers.parseEther(offerAmount),
        nonce
      );
      await tx.wait();
      setMessage("Offer revealed successfully!");

      const storeResponse = await fetch(
        "http://localhost:5000/api/store-revealed-offer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractAddress,
            offeror: walletAddress,
            offerAmount: offerAmount,
            username: userName,
          }),
        }
      );

      if (!storeResponse.ok) {
        throw new Error("Failed to store revealed offer in database");
      }
    } catch (error) {
      console.error("Reveal error:", error);
      setMessage(`Error: ${error.reason || error.message}`);
    }
  };

  const handleFileChange = (e) => {
    if (!isUploaded) {
      setFile(e.target.files[0]);
      setUploadMessage(""); // Clear previous upload message
    }
  };

  const uploadToIPFSAndMongoDB = async () => {
    if (isUploaded) {
      setUploadMessage("File has already been uploaded.");
      return;
    }

    if (!file) {
      setUploadMessage("Please select a file to upload.");
      return;
    }

    setUploadMessage("Uploading file ...");
    try {
      // Prepare IPFS upload
      const ipfsFormData = new FormData();
      ipfsFormData.append("file", file);
      ipfsFormData.append(
        "pinataMetadata",
        JSON.stringify({
          name: file.name,
          description: "Uploaded via OfferorForm",
        })
      );
      ipfsFormData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

      // Read file as binary data and convert to Base64
      const fileReader = new FileReader();
      const filePromise = new Promise((resolve, reject) => {
        fileReader.onload = () => {
          const arrayBuffer = fileReader.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          const base64String = btoa(String.fromCharCode(...uint8Array));
          resolve(base64String);
        };
        fileReader.onerror = () => reject(new Error("Failed to read file"));
        fileReader.readAsArrayBuffer(file);
      });
      const fileBase64 = await filePromise;

      // Prepare MongoDB data including the file content
      const fileData = {
        filename: file.name,
        contractAddress: contractAddress,
        fileContent: fileBase64,
        username: userName,
        walletAddress: walletAddress,
      };
      console.log("Sending to MongoDB:", fileData);

      // Concurrent uploads to IPFS and MongoDB
      const [ipfsResponse, mongoResponse] = await Promise.all([
        axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          ipfsFormData,
          {
            maxBodyLength: "Infinity",
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
            },
          }
        ),
        fetch("http://localhost:5000/api/save-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: fileData }),
        }),
      ]);

      // Check IPFS response
      if (ipfsResponse.status !== 200) {
        throw new Error("Failed to upload to IPFS");
      }
      const hash = ipfsResponse.data.IpfsHash;
      setIpfsHash(hash);

      // Check MongoDB response
      if (!mongoResponse.ok) {
        const errorText = await mongoResponse.text();
        throw new Error(`Failed to save file to MongoDB: ${errorText}`);
      }

      setIsUploaded(true);
      setUploadMessage("File uploaded successfully!");
      toast.success("File uploaded successfully!");

      // Store upload status and IPFS hash in localStorage
      localStorage.setItem(
        storageKey,
        JSON.stringify({ isUploaded: true, ipfsHash: hash })
      );
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage(`Error: ${error.message}`);
      toast.error(`Error: ${error.message}`);
    }
  };

  if (loading)
    return <div className="loading">Loading contract details...</div>;

  return (
    <div className="offeror-form">
      <h2>Bidding on Contract</h2>
      <div className="header-section">
        {walletAddress ? (
          <p className="wallet-display">
            Connected Wallet:{" "}
            <span className="wallet-address">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </p>
        ) : (
          <p className="wallet-warning">
            Please connect your wallet in the dashboard
          </p>
        )}
      </div>
      <div className="contract-header">
        <p className="contract-address">CA : {contractAddress}</p>
      </div>

      <div className="contract-info">
        <div className="info-item">
          <span>Total Budget:</span>
          <span>{formatETH(contractDetails.totalBudget)}</span>
        </div>
        <div className="info-item">
          <span>Minimum Bid:</span>
          <span>{formatETH(contractDetails.minimumBid)}</span>
        </div>
        <div className="info-item time-remaining">
          <span>Bidding Ends In:</span>
          <span className={unlockTimeLeft === "Ended" ? "ended" : "active"}>
            {unlockTimeLeft}
          </span>
        </div>
        <div className="info-item time-remaining">
          <span>Grace Period Ends In:</span>
          <span className={gracePeriodLeft === "Ended" ? "ended" : "active"}>
            {gracePeriodLeft}
          </span>
        </div>
        <div className="info-item highlight">
          <span>Safety Deposit Required:</span>
          <span>{formatETH(contractDetails.safetyDepositAmount)}</span>
        </div>
      </div>

      <div className="action-section">
        {unlockTimeLeft !== "Ended" ? (
          <form onSubmit={handleCommitOffer}>
            <h3>Commit Offer</h3>
            <div className="offeror-form">
              <h3>Upload Document to IPFS</h3>
              <div className="file-upload">
                <label htmlFor="fileInput">
                  {isUploaded
                    ? "File Already Uploaded"
                    : "Click to Upload a File"}
                </label>
                <input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isUploaded}
                />
                {file && !isUploaded && (
                  <p className="selected-file">Selected File: {file.name}</p>
                )}
              </div>

              <button
                onClick={uploadToIPFSAndMongoDB}
                className="upload-btn"
                disabled={isUploaded}
              >
                {isUploaded ? "Uploaded" : "Upload"}
              </button>
              {uploadMessage && <p>{uploadMessage}</p>}
              {ipfsHash && (
                <p>
                  File IPFS Hash:{" "}
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ipfsHash}
                  </a>
                </p>
              )}
            </div>
            <input
              type="number"
              step="0.0001"
              placeholder="Offer Amount (ETH)"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Nonce"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
              required
            />

            <button type="submit" className="commit-btn">
              Commit Offer
            </button>

            {commitMessage && (
              <div
                className={`message ${
                  commitMessage.includes("Error") ? "error" : ""
                }`}
              >
                {commitMessage}
              </div>
            )}
          </form>
        ) : gracePeriodLeft !== "Ended" ? (
          <form onSubmit={handleRevealOffer}>
            <h3>Reveal Offer</h3>
            <input
              type="number"
              step="0.0001"
              placeholder="Offer Amount (ETH)"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Nonce"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
              required
            />
            <button type="submit" className="reveal-btn">
              Reveal Offer
            </button>
          </form>
        ) : (
          <p className="bidding-closed">
            Bidding and revealing period have ended.
          </p>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes("Error") ? "error" : ""}`}>
          {message}
        </div>
      )}
      <Toaster position="top-right" />
    </div>
  );
};

export default OfferorForm;
