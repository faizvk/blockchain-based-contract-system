import React from "react";
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

import ProtectedRoute from "./components/ProtectedRoute.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<RegLog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/info" element={<Main />} />
        <Route path="/info/ownauth" element={<OwnAuth />} />

        {/* Unified Signup */}
        <Route path="/signup/:role" element={<Signup />} />

        {/* Dashboard */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["owner", "contractor", "authenticator"]}
            />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Owner-only */}
        <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
          <Route path="/owner-form" element={<OwnerControlForm />} />
        </Route>

        {/* Contract details */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["owner", "contractor", "authenticator"]}
            />
          }
        >
          <Route
            path="/contract-details/:contractAddress"
            element={<ContractDetails />}
          />
          <Route
            path="/offeror-form/:contractAddress"
            element={<OfferorForm />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
