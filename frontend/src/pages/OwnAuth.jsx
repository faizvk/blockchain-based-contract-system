import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RegLog.css";

const OwnAuth = () => {
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Register</h1>

      <form action="">
        <div className="auth-button-group">
          <button
            className="auth-button register"
            onClick={() => handleNavigation("./signown")}
          >
            Owner
          </button>
          <button
            className="auth-button login"
            onClick={() => handleNavigation("./signauth")}
          >
            Authenticator
          </button>
        </div>
      </form>
    </div>
  );
};

export default OwnAuth;
