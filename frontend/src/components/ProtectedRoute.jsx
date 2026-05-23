import { Navigate, Outlet } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { walletAddress, role } = useWallet();

  if (!walletAddress) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
