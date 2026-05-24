import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useWallet } from "../context/WalletContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Container from "../components/ui/Container";
import { Card, CardBody } from "../components/ui/Card";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

export default function Login() {
  const { walletAddress, setWalletAddress, setRole, setUserName, setAuthToken } =
    useWallet();
  const [email, setEmail] = useState(walletAddress || "");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

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

      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: "Sepolia Testnet",
                  rpcUrls: [
                    import.meta.env.VITE_RPC_URL || "https://rpc.sepolia.org",
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
            return;
          }
        }
      }

      setWalletAddress(accounts[0]);
      setEmail(accounts[0]);
    } catch {
      setErrorMessage("Wallet connection failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!walletAddress) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await api.post("/api/auth/login", { email, password });

      if (result.data.message === "Success") {
        const { role, name, token } = result.data;
        if (token) setAuthToken(token);
        setRole(role);
        setUserName(name);
        navigate("/dashboard");
      } else {
        setErrorMessage(result.data.message || "Login failed.");
      }
    } catch {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-brand-50 py-10">
      <Container className="max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold shadow-md">
              ⌬
            </span>
            <span className="font-bold tracking-tight">Smart Chain Contracts</span>
          </Link>
        </div>

        <Card>
          <CardBody className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-surface-900">Welcome back</h1>
            <p className="mt-1 text-sm text-surface-700">
              Sign in with your wallet and password.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Wallet address"
                type="text"
                placeholder="Connect MetaMask to autofill"
                value={email}
                readOnly
                className="monospace"
              />

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={connectWallet}
              >
                {walletAddress
                  ? `Connected: ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
                  : "Connect Wallet"}
              </Button>

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>

              {errorMessage && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2">
                  {errorMessage}
                </div>
              )}
            </form>

            <p className="mt-6 text-sm text-center text-surface-700">
              No account?{" "}
              <Link to="/info" className="font-semibold text-brand-700 hover:text-brand-900">
                Sign up
              </Link>
            </p>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
