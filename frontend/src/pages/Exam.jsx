import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RegLog.css";

const Main = () => {
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Register</h1>

      {/* No form needed */}
      <div className="auth-button-group">
        <button type="button" onClick={() => navigate("/signup/owner")}>
          Organization
        </button>

        <button type="button" onClick={() => navigate("/signup/contractor")}>
          Contractor
        </button>
      </div>
    </div>
  );
};

export default Main;
