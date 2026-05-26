import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { useWallet } from "../context/WalletContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Container from "../components/ui/Container";
import { Card, CardBody } from "../components/ui/Card";

const roleLabels = {
  contractor: "Contractor",
  owner: "Owner",
  authenticator: "Authenticator",
};

export default function Signup() {
  const { role } = useParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState({ msg: "", tone: "" });
  const [submitting, setSubmitting] = useState(false);

  const { setUserName, setAuthToken, setRole } = useWallet();

  if (!["contractor", "owner", "authenticator"].includes(role)) {
    return <Navigate to="/info" replace />;
  }

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
    } catch {
      /* user dismissed */
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ msg: "", tone: "" });

    if (!walletAddress) {
      setStatus({ msg: "Connect your wallet first.", tone: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
        role,
      });

      const msg = res.data?.message ?? "";
      if (msg === "Registration successful") {
        if (res.data.token) setAuthToken(res.data.token);
        setUserName(name);
        if (res.data.role) setRole(res.data.role);
        setStatus({ msg: "Registration successful. Redirecting…", tone: "success" });
      } else {
        setStatus({ msg: msg || "Registration failed.", tone: "error" });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong. Try again.";
      setStatus({ msg, tone: "error" });
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
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-surface-700">
              Registering as <span className="font-semibold">{roleLabels[role]}</span>.
            </p>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              className="mt-6"
              onClick={connectWallet}
            >
              {walletAddress
                ? `Connected: ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
                : "Connect Wallet"}
            </Button>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Input
                label="Full name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Wallet address"
                type="text"
                placeholder="Connect wallet to autofill"
                value={email}
                readOnly
                required
                className="monospace"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? "Creating account…" : "Create account"}
              </Button>

              {status.msg && (
                <div
                  className={[
                    "rounded-xl border text-sm px-3 py-2",
                    status.tone === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-rose-50 border-rose-200 text-rose-700",
                  ].join(" ")}
                >
                  {status.msg}
                </div>
              )}
            </form>

            <p className="mt-6 text-sm text-center text-surface-700">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-900">
                Login
              </Link>
            </p>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
