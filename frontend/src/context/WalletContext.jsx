import { createContext, useContext, useState, useEffect } from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(() => {
    return localStorage.getItem("walletAddress") || null;
  });

  const [userName, setUserName] = useState(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    return storedWallet
      ? localStorage.getItem(`userName_${storedWallet}`) || null
      : null;
  });

  const [role, setRole] = useState(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    return storedWallet
      ? localStorage.getItem(`role_${storedWallet}`) || null
      : null;
  });

  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem("walletAddress", walletAddress);

      const storedName = localStorage.getItem(`userName_${walletAddress}`);
      if (storedName && storedName !== userName) {
        setUserName(storedName);
      }

      const storedRole = localStorage.getItem(`role_${walletAddress}`);
      if (storedRole && storedRole !== role) {
        setRole(storedRole);
      }
    } else {
      localStorage.removeItem("walletAddress");
      setUserName(null);
      setRole(null);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress && userName) {
      localStorage.setItem(`userName_${walletAddress}`, userName);
    }
  }, [userName, walletAddress]);

  useEffect(() => {
    if (walletAddress && role) {
      localStorage.setItem(`role_${walletAddress}`, role);
    }
  }, [role, walletAddress]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setWalletAddress(null);
      } else {
        setWalletAddress(accounts[0]);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddress,
        userName,
        setUserName,
        role,
        setRole,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
