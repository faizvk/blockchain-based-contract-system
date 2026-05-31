import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Spinner from "./components/ui/Spinner.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const OfferorForm = lazy(() => import("./pages/offerorForm.jsx"));
const OwnerControlForm = lazy(() => import("./pages/ownerForm.jsx"));
const ContractDetails = lazy(() => import("./pages/ContractDetails.jsx"));
const RegLog = lazy(() => import("./pages/RegLog.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Main = lazy(() => import("./pages/Exam.jsx"));
const OwnAuth = lazy(() => import("./pages/OwnAuth.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Authenticator = lazy(() => import("./pages/Authenticator.jsx"));

const ALL_ROLES = ["owner", "contractor", "authenticator"];

function RouteFallback() {
  return (
    <div className="min-h-screen grid place-items-center">
      <Spinner />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </Router>
  );
}
