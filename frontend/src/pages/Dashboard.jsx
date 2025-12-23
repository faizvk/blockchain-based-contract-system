import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { useWallet } from "../context/WalletContext";

const Dashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});
  const { walletAddress, setWalletAddress, userName, role } = useWallet();
  const navigate = useNavigate();

  /* ================= FETCH CONTRACTS ================= */
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/contracts");
        const data = await res.json();
        if (res.ok) setContracts(data.contracts);
      } catch (err) {
        console.error("Failed to fetch contracts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    const updateCountdowns = () => {
      const now = Math.floor(Date.now() / 1000);
      const updated = {};

      contracts.forEach((c) => {
        let status = "";
        let display = "";

        if (!c.startTime || c.startTime === 0) {
          status = "Contract status";
          display = "Not started";
        } else if (c.startTime > now) {
          status = "Contract starts in";
          display = formatDuration(c.startTime - now);
        } else if (now < c.startTime + c.contractDuration) {
          status = "Contract ends in";
          display = formatDuration(c.startTime + c.contractDuration - now);
        } else {
          status = "Contract status";
          display = "Contract has ended";
        }

        updated[c.contractAddress] = {
          unlock: formatDuration(c.unlockTime - now),
          grace: formatDuration(c.gracePeriodEnd - now),
          status,
          display,
        };
      });

      setTimeLeft(updated);
    };

    updateCountdowns();
    const timer = setInterval(updateCountdowns, 1000);
    return () => clearInterval(timer);
  }, [contracts]);

  /* ================= HELPERS ================= */
  const formatDuration = (seconds) => {
    if (seconds <= 0 || typeof seconds !== "number") return "Ended";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d ? d + "d " : ""}${h ? h + "h " : ""}${m ? m + "m " : ""}${s}s`;
  };

  const handleLogout = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      }
    } catch {}
    setWalletAddress(null);
    navigate("/login");
  };

  const handleDetails = (address) => {
    navigate(`/contract-details/${address}`);
  };

  if (loading) return <div>Loading contracts...</div>;

  /* ================= RENDER ================= */
  return (
    <div className="dashboard">
      <div className="animated-background"></div>

      <header className="dashboard-header">
        {role === "owner" && (
          <button
            className="create-contract-btn"
            onClick={() => navigate("/owner-form")}
          >
            Create Contract
          </button>
        )}

        <h1>Smart Chain Contracts</h1>

        <div className="wallet-section">
          {userName && <span>Welcome, {userName}</span>}
          {walletAddress && (
            <button className="logout-btn" onClick={handleLogout}>
              {walletAddress.slice(0, 6)}...
              {walletAddress.slice(-4)} | Logout
            </button>
          )}
        </div>
      </header>

      <div className="cards-container">
        {contracts.map((c) => (
          <div className="contract-card" key={c.contractAddress}>
            <h2>{c.name || "Contract"}</h2>

            <p>
              <strong>Total Budget:</strong> {c.totalBudget} ETH
            </p>
            <p>
              <strong>Minimum Bid:</strong> {c.minimumBid} ETH
            </p>
            <p>
              <strong>Safety Deposit:</strong> {c.safetyDepositAmount} ETH
            </p>

            <p>Bidding Ends In: {timeLeft[c.contractAddress]?.unlock}</p>
            <p>Grace Period Ends In: {timeLeft[c.contractAddress]?.grace}</p>
            <p>
              {timeLeft[c.contractAddress]?.status}:{" "}
              {timeLeft[c.contractAddress]?.display}
            </p>

            <div className="button-div">
              <button
                className="view-details-btn"
                onClick={() => handleDetails(c.contractAddress)}
              >
                View Details
              </button>

              {role === "contractor" && (
                <button
                  className="bid-btn"
                  onClick={() => navigate(`/offeror-form/${c.contractAddress}`)}
                >
                  Bid
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
