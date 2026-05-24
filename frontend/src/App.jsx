import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import OfferorForm from "./pages/offerorForm.jsx";
import OwnerControlForm from "./pages/ownerForm.jsx";
import ContractDetails from "./pages/ContractDetails.jsx";
import RegLog from "./pages/RegLog.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Main from "./pages/Exam.jsx";
import OwnAuth from "./pages/OwnAuth.jsx";
import NotFound from "./pages/NotFound.jsx";
import Authenticator from "./pages/Authenticator.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

const ALL_ROLES = ["owner", "contractor", "authenticator"];

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public (no app chrome) */}
        <Route path="/" element={<RegLog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/info" element={<Main />} />
        <Route path="/info/ownauth" element={<OwnAuth />} />
        <Route path="/signup/:role" element={<Signup />} />

        {/* Authenticated app routes share Layout */}
        <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/contract-details/:contractAddress"
              element={<ContractDetails />}
            />
            <Route
              path="/offeror-form/:contractAddress"
              element={<OfferorForm />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
          <Route element={<Layout />}>
            <Route path="/owner-form" element={<OwnerControlForm />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["authenticator"]} />}>
          <Route element={<Layout />}>
            <Route path="/authenticator" element={<Authenticator />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}
