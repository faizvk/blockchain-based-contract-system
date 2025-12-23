import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useWallet } from "../context/WalletContext";
import "../styles/Login.css";

function Login() {
  const {
    walletAddress,
    setWalletAddress,
    setRole,
    setUserName, // ✅ REQUIRED
  } = useWallet();

  const [email, setEmail] = useState(walletAddress || "");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      const sepoliaChainId = "0xaa36a7";

      if (currentChainId !== sepoliaChainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: sepoliaChainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: sepoliaChainId,
                  chainName: "Sepolia Testnet",
                  rpcUrls: [
                    "https://sepolia.infura.io/v3/9dee712955fa4f74984a0c31c90d5df7",
                  ],
                  nativeCurrency: {
                    name: "Sepolia Ether",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } else {
            console.error("Network switch failed:", switchError);
            return;
          }
        }
      }

      setWalletAddress(accounts[0]);
      setEmail(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!walletAddress) {
      setErrorMessage("Connect Wallet");
      return;
    }

    axios
      .post("http://localhost:5000/api/auth/login", {
        email,
        password,
      })
      .then((result) => {
        if (result.data.message === "Success") {
          const { role, name } = result.data;

          setRole(role);
          setUserName(name); // ✅ FIXED

          navigate("/dashboard");
        } else {
          setErrorMessage(result.data);
        }
      })
      .catch(() => {
        setErrorMessage("An error occurred.");
      });
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <input
            type="email"
            placeholder="Wallet Address"
            value={email}
            readOnly
            className="form-input"
          />
        </div>

        <div className="wallet-button-container">
          <button
            type="button"
            onClick={connectWallet}
            className="wallet-button"
          >
            {walletAddress
              ? `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(
                  -4
                )}`
              : "Connect Wallet"}
          </button>
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
        </div>

        <button type="submit" className="form-button">
          Login
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="login-text">
          <p>Don't have an account?</p>
          <Link to="/info" className="link">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
