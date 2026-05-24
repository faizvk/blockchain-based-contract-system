import { createContext, useContext, useEffect, useState } from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(
    () => localStorage.getItem("walletAddress") || null
  );
  const [userName, setUserName] = useState(() => {
    const w = localStorage.getItem("walletAddress");
    return w ? localStorage.getItem(`userName_${w}`) || null : null;
  });
  const [role, setRole] = useState(() => {
    const w = localStorage.getItem("walletAddress");
    return w ? localStorage.getItem(`role_${w}`) || null : null;
  });
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem("authToken") || null
  );

  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem("walletAddress", walletAddress);
      const storedName = localStorage.getItem(`userName_${walletAddress}`);
      if (storedName && storedName !== userName) setUserName(storedName);
      const storedRole = localStorage.getItem(`role_${walletAddress}`);
      if (storedRole && storedRole !== role) setRole(storedRole);
    } else {
      localStorage.removeItem("walletAddress");
      setUserName(null);
      setRole(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (authToken) {
      localStorage.setItem("authToken", authToken);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [authToken]);

  useEffect(() => {
    if (!window.ethereum) return;
    const handle = (accounts) => {
      setWalletAddress(accounts.length === 0 ? null : accounts[0]);
    };
    window.ethereum.on("accountsChanged", handle);
    return () => window.ethereum.removeListener("accountsChanged", handle);
  }, []);

  const logout = () => {
    setWalletAddress(null);
    setUserName(null);
    setRole(null);
    setAuthToken(null);
    localStorage.removeItem("authToken");
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddress,
        userName,
        setUserName,
        role,
        setRole,
        authToken,
        setAuthToken,
        logout,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
