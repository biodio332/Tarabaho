"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/images/logowhite.png";
import "../styles/Admin-login.css";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/login`,
        { username, password },
        { withCredentials: true }
      );
      console.log("Admin login successful!", res.data);

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "admin");
      localStorage.setItem("username", username);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      navigate("/admin/homepage");
    } catch (err) {
      console.log("Admin login failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/signin");
  };

  return (
    <div className="admin-login-page">
      {isLoading && (
        <div className={`loading-overlay ${isLoading ? "active" : ""}`}>
          <span className="loading-spinner"></span>
          <span className="loading-text">Logging in...</span>
        </div>
      )}
      <div className="admin-login-container">
        <button
          className="back-button"
          onClick={handleBack}
          disabled={isLoading}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 19L8 12L15 5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="admin-login-content">
          <div className="logo-container">
            <img src={logo || "/placeholder.svg"} alt="Tarabaho Logo" className="logo" />
          </div>

          <div className="admin-login-heading">ADMIN LOGIN</div>

          <div className="form-overlay">
            <form onSubmit={handleLogin} className="login-form">
              {error && (
                <div className="error-message" aria-live="polite">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {error}
                </div>
              )}

              <div className="input-group">
                <label htmlFor="username" className="input-label">
                  Username
                </label>
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">
                  Password
                </label>
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="16" r="1" fill="white" />
                </svg>
                <input
                  id="password"
                  type={showAdminPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowAdminPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showAdminPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="links-container">
                <Link to="/register" className="auth-link">
                  No account yet?
                </Link>
                <Link to="/forgot-password" className="auth-link">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? <span className="loading-spinner"></span> : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;