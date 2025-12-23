import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import "../styles/ContractDetails.css";
import { contractABI } from "../utils/contractABI";

const ContractDetails = () => {
  const { contractAddress } = useParams();
  const { walletAddress, role } = useWallet();

  const isOwner = role === "owner";
  const isAuthenticator = role === "authenticator";
  const isContractor = role === "contractor";

  /* ================= STATE ================= */
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isStateApproved, setIsStateApproved] = useState(false);
  const [isContractStarted, setIsContractStarted] = useState(false);
  const [contractStartTime, setContractStartTime] = useState(null);

  const [unlockTimeLeft, setUnlockTimeLeft] = useState("");
  const [gracePeriodEndLeft, setGracePeriodEndLeft] = useState("");
  const [contractDurationLeft, setContractDurationLeft] = useState("");

  const [commitments, setCommitments] = useState([]);
  const [revealedOffers, setRevealedOffers] = useState([]);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);

  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedOfferor, setSelectedOfferor] = useState(null);

  const [txStatus, setTxStatus] = useState("");

  /* ================= FETCH CONTRACT ================= */
  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/contracts/${contractAddress}`
        );
        const data = await res.json();
        setContractData(data.contract);

        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            provider
          );

          setIsStateApproved(await contract.stateApproval());
          const started = await contract.contractStarted();
          setIsContractStarted(started);

          if (started) {
            setContractStartTime(Number(await contract.contractStartTime()));
          }
        }
      } catch {
        setError("Failed to load contract");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractAddress]);

  /* ================= FETCH DB DATA ================= */
  useEffect(() => {
    fetch(`http://localhost:5000/api/commitments/${contractAddress}`)
      .then((r) => r.json())
      .then((d) => setCommitments(d.commitments || []));
  }, [contractAddress]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/revealed-offers/${contractAddress}`)
      .then((r) => r.json())
      .then((d) => setRevealedOffers(d.revealedOffers || []));
  }, [contractAddress]);

  // ✅ FIXED ROUTE HERE
  useEffect(() => {
    fetch(`http://localhost:5000/api/files/contract/${contractAddress}`)
      .then((r) => r.json())
      .then((d) => setUploadedFiles(d.files || []))
      .finally(() => setFilesLoading(false));
  }, [contractAddress]);

  /* ================= TIMERS ================= */
  useEffect(() => {
    if (!contractData) return;

    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      setUnlockTimeLeft(formatCountdown(contractData.unlockTime - now));
      setGracePeriodEndLeft(formatCountdown(contractData.gracePeriodEnd - now));

      if (isContractStarted && contractStartTime) {
        setContractDurationLeft(
          formatCountdown(
            contractStartTime + contractData.contractDuration - now
          )
        );
      }
    };

    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [contractData, isContractStarted, contractStartTime]);

  /* ================= FILE DOWNLOAD ================= */
  const handleDownloadFile = async (fileId, filename) => {
    try {
      // ✅ FIXED ROUTE
      const res = await fetch(`http://localhost:5000/api/files/${fileId}`);
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download file");
    }
  };

  /* ================= PYTHON ANALYSIS ================= */
  const handleAnalyzeBids = async () => {
    if (!uploadedFiles.length) {
      toast.error("No documents to analyze");
      return;
    }
    console.log(contractData.description);
    setAnalysisLoading(true);

    const formData = new FormData();
    formData.append("requirements", contractData.description);

    for (const file of uploadedFiles) {
      // ✅ FIXED ROUTE
      const blob = await fetch(
        `http://localhost:5000/api/files/${file._id}`
      ).then((r) => r.blob());

      formData.append("bids", blob, file.filename);
    }

    const res = await fetch("http://localhost:4000/api/analyze-bids", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAnalysisResult(data.data);
    setAnalysisLoading(false);
  };
  const winningFile =
    analysisResult &&
    uploadedFiles.find((f) => f.filename === analysisResult.bestBid?.filename);

  const handleAcceptOffer = async (offer) => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found");
        return;
      }

      setTxStatus("Processing transaction...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.acceptOffer(offer.offeror, offer.offerAmount);

      await tx.wait();

      toast.success("Offer accepted successfully");
      setTxStatus("Offer accepted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept offer");
      setTxStatus("Transaction failed");
    }
  };

  const handleStartContract = async () => {
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not detected");
        return;
      }

      setTxStatus("Starting contract...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.startContract();
      await tx.wait();

      toast.success("Contract started successfully");
      setIsContractStarted(true);
      setTxStatus("Contract started");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start contract");
      setTxStatus("Transaction failed");
    }
  };

  /* ================= OWNER / AUTH / RENDER ================= */
  // ⬇️ EVERYTHING BELOW IS UNCHANGED ⬇️

  const formatCountdown = (s) =>
    s <= 0
      ? "Ended"
      : `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading contract...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }
  return (
    <div className="contract-details">
      {/* ================= HEADER ================= */}
      <div className="header-section">
        <h1>Contract Details</h1>
        {walletAddress && (
          <div className="wallet-display">
            Wallet:
            <span className="wallet-address monospace">{walletAddress}</span>
          </div>
        )}
      </div>

      {/* ================= DETAILS ================= */}
      <div className="detail-section">
        <h2>Contract Information</h2>

        <div className="detail-item">
          <span>Contract Address</span>
          <span className="monospace">{contractData.contractAddress}</span>
        </div>

        <div className="detail-item">
          <span>IPFS CID</span>
          <span className="monospace">{contractData.cid}</span>
        </div>

        <div className="detail-item">
          <span>Total Budget</span>
          <span>{contractData.totalBudget} ETH</span>
        </div>
      </div>

      {/* ================= TIMINGS ================= */}
      <div className="detail-section timings">
        <h2>Timings</h2>

        <div className="detail-item">
          <span>Bidding Ends</span>
          <span className={unlockTimeLeft === "Ended" ? "ended" : "active"}>
            {unlockTimeLeft}
          </span>
        </div>

        <div className="detail-item">
          <span>Grace Period Ends</span>
          <span className={gracePeriodEndLeft === "Ended" ? "ended" : "active"}>
            {gracePeriodEndLeft}
          </span>
        </div>

        {isContractStarted && (
          <div className="detail-item">
            <span>Contract Ends</span>
            <span className="active">{contractDurationLeft}</span>
          </div>
        )}
      </div>

      {/* ================= FILES ================= */}
      <div className="detail-section">
        <h2>Uploaded Documents</h2>

        {filesLoading ? (
          <p>Loading documents...</p>
        ) : uploadedFiles.length === 0 ? (
          <p>No documents uploaded.</p>
        ) : (
          <ul>
            {uploadedFiles.map((file) => (
              <li key={file._id}>
                {file.filename}
                <button
                  className="download-btn"
                  onClick={() => handleDownloadFile(file._id, file.filename)}
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ================= OWNER ACTIONS ================= */}
      {isOwner && (
        <div className="owner-actions">
          <h2>Owner Controls</h2>

          <div className="control-buttons">
            <button
              className="analyze-btn"
              onClick={handleAnalyzeBids}
              disabled={analysisLoading}
            >
              Analyze Bids
            </button>

            <button onClick={handleAcceptOffer}>Accept Offer</button>

            {isStateApproved && (
              <button onClick={handleStartContract}>Start Contract</button>
            )}
          </div>

          {analysisResult && (
            <div className="analysis-result">
              <h3>Analysis Result</h3>

              <div className="analysis-item">
                <strong>Winning File:</strong> {analysisResult.bestBid.filename}
              </div>

              <div className="analysis-item">
                <strong>Offeror:</strong> {winningFile?.username || "Unknown"}
              </div>

              <div className="analysis-item">
                <strong>Wallet:</strong>{" "}
                <span className="monospace">
                  {winningFile?.walletAddress || "—"}
                </span>
              </div>

              <div className="analysis-item">
                <strong>Qualified Bids:</strong> {analysisResult.qualifiedBids}
              </div>

              <button
                className="download-btn"
                onClick={() =>
                  handleDownloadFile(winningFile._id, winningFile.filename)
                }
              >
                Download Winning Bid
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= AUTHENTICATOR ================= */}
      {isAuthenticator && !isStateApproved && (
        <button className="approve-state-button" onClick={handleStateApproval}>
          Approve State
        </button>
      )}

      {/* ================= STATE ================= */}
      <div className="state-indicators">
        <div className="state-item">
          Locked: {contractData.contractLocked ? "✅" : "❌"}
        </div>
        <div className="state-item">
          Approved: {isStateApproved ? "✅" : "❌"}
        </div>
        <div className="state-item">
          Started: {isContractStarted ? "✅" : "❌"}
        </div>
      </div>

      {txStatus && <div className="tx-status">{txStatus}</div>}
    </div>
  );
};

export default ContractDetails;
