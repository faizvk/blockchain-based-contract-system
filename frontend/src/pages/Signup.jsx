import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Signup.css";
import { useWallet } from "../context/WalletContext";

const roleLabels = {
  contractor: "Contractor",
  owner: "Owner",
  authenticator: "Authenticator",
};

function Signup() {
  const { role } = useParams(); // contractor | owner | authenticator

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const { setUserName } = useWallet();

  if (!["contractor", "owner", "authenticator"].includes(role)) {
    return <p>Invalid signup role</p>;
  }

  /* ================= WALLET ================= */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is required");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      setEmail(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");

    if (!walletAddress) {
      setStatusMessage("Connect Wallet");
      setMessageColor("red");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        role,
      });

      if (res.data === "Email already registered") {
        setStatusMessage("Account already registered");
        setMessageColor("red");
      } else if (res.data === "Registration successful") {
        setUserName(name);
        setStatusMessage("Registration successful");
        setMessageColor("green");
      } else {
        throw new Error();
      }
    } catch {
      setStatusMessage("An error occurred during registration");
      setMessageColor("red");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="signup-container">
      <h2>Register as {roleLabels[role]}</h2>

      <div className="wallet-button-container">
        <button className="wallet-button" onClick={connectWallet}>
          {walletAddress
            ? `Wallet Connected: ${walletAddress.slice(
                0,
                6
              )}...${walletAddress.slice(-4)}`
            : "Connect Wallet"}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          required
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Wallet Address"
          value={email}
          readOnly
          required
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Register</button>

        {statusMessage && (
          <p style={{ color: messageColor }}>{statusMessage}</p>
        )}

        <div className="login-text">
          <p>Already have an account?</p>
          <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}

export default Signup;
