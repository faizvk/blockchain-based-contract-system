import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import Button from "./ui/Button";
import Container from "./ui/Container";

const shorten = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");

export default function Navbar() {
  const { walletAddress, setWalletAddress, userName, role } = useWallet();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-surface-200">
      <Container className="flex items-center justify-between h-16">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold shadow-md shadow-brand-600/20">
            ⌬
          </span>
          <span className="font-bold text-surface-900 tracking-tight">
            Smart Chain Contracts
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          {userName && (
            <span className="text-sm text-surface-700">
              Hi, <span className="font-semibold text-surface-900">{userName}</span>
            </span>
          )}
          {role && (
            <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 capitalize">
              {role}
            </span>
          )}
          {walletAddress ? (
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <span className="monospace">{shorten(walletAddress)}</span>
              <span className="text-surface-300">|</span>
              Logout
            </Button>
          ) : (
            <Button size="sm" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="md:hidden h-10 w-10 grid place-items-center rounded-lg border border-surface-200 text-surface-700"
        >
          <span className="block w-5 h-0.5 bg-current relative before:absolute before:-top-1.5 before:block before:w-5 before:h-0.5 before:bg-current after:absolute after:top-1.5 after:block after:w-5 after:h-0.5 after:bg-current" />
        </button>
      </Container>

      {open && (
        <div className="md:hidden border-t border-surface-200 bg-white">
          <Container className="py-3 flex flex-col gap-2">
            {userName && (
              <div className="text-sm text-surface-700">
                Hi, <span className="font-semibold">{userName}</span>
              </div>
            )}
            {walletAddress ? (
              <Button variant="secondary" fullWidth onClick={handleLogout}>
                <span className="monospace">{shorten(walletAddress)}</span> | Logout
              </Button>
            ) : (
              <Button fullWidth onClick={() => navigate("/login")}>
                Login
              </Button>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}
