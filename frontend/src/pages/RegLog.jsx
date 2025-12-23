import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RegLog.css";

const RegLog = () => {
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  useEffect(() => {
    const ball = document.createElement("div");
    ball.classList.add("bouncing-ball");
    document.body.appendChild(ball);

    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;
    let dx = (Math.random() - 0.5) * 20;
    let dy = (Math.random() - 0.5) * 20;

    const updateBallPosition = () => {
      const ballSize = 30;

      x += dx;
      y += dy;

      if (x + ballSize > window.innerWidth || x < 0) dx = -dx;
      if (y + ballSize > window.innerHeight || y < 0) dy = -dy;

      ball.style.left = `${x}px`;
      ball.style.top = `${y}px`;

      requestAnimationFrame(updateBallPosition);
    };

    updateBallPosition();

    return () => {
      document.body.removeChild(ball);
    };
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-button-group">
        <button
          type="button"
          className="auth-button register"
          onClick={() => handleNavigation("/info")}
        >
          Register
        </button>
        <button
          type="button"
          className="auth-button login"
          onClick={() => handleNavigation("/login")}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default RegLog;
