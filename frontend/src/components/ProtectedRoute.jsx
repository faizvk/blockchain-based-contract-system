// src/components/ProtectedRoute.js
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { walletAddress, role } = useWallet();

  useEffect(() => {
    console.log("ProtectedRoute walletAddress:", walletAddress);
    console.log("ProtectedRoute role:", role);
  }, [walletAddress, role]);

  // If walletAddress is null (or falsy), redirect to /login
  if (!walletAddress) {
    console.log("User not authenticated; redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // If the role does not match allowedRoles, redirect to /login
  if (allowedRoles && !allowedRoles.includes(role)) {
    console.log("User does not have the required role; redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
