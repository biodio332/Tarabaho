"use client";

import { useState, useEffect, Component } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../assets/images/logowhite.png";
import styles from "../styles/signin.module.css";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.signinPage}>
          <div className={styles.signinContainer}>
            <div className={styles.errorContainer}>
              <h2>Something went wrong</h2>
              <p>Please try refreshing the page or contact support.</p>
              <button
                onClick={() => window.location.reload()}
                className={styles.primaryButton}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SignIn = () => {
  const [loginType, setLoginType] = useState("user");
  const [userCredentials, setUserCredentials] = useState({
    username: "",
    password: "",
  });
  const [graduateCredentials, setGraduateCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showGraduatePassword, setShowGraduatePassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // Redirect if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userType = localStorage.getItem("userType");

    if (isLoggedIn === "true") {
      if (userType === "graduate") {
        console.log("User is logged in as graduate, redirecting to /graduate-homepage");
        navigate("/graduate-homepage");
      } else if (userType === "user") {
        console.log("User is logged in as user, redirecting to /user-browse");
        navigate("/user-browse");
      }
    }
  }, [navigate]);

  useEffect(() => {
    console.log("SignIn component mounted, current loginType:", loginType);
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get("type");
    const username = urlParams.get("username");
    const error = urlParams.get("error");

    if (error) {
      const decodedError = decodeURIComponent(error);
      console.error(`OAuth2 login failed: ${decodedError}`);
      setError(`Google Sign-In failed: ${decodedError}`);
      setIsLoading(false);
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (type && username) {
      console.log(`OAuth redirect detected, type: ${type}, username: ${username}`);
      setIsLoading(true);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", type);
      localStorage.setItem("username", username);
      console.log("Stored in localStorage:", {
        isLoggedIn: "true",
        userType: type,
        username: username,
      });
      const redirectPath = type === "graduate" ? "/graduate-homepage" : "/user-browse";
      navigate(redirectPath, { replace: true });
      setIsLoading(false);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [navigate, loginType]); // Added loginType to dependencies for debugging

  const handleLoginTypeChange = (type) => {
    console.log(`Switching loginType to: ${type}`);
    setLoginType(type);
    setError("");
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const payload = userCredentials;
    console.log("User Login Payload:", payload);

    try {
      const res = await axios.post(`${backendUrl}/api/user/token`, payload, {
        withCredentials: true,
      });
      console.log("User login successful, token set in cookie:", res.data);

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "user");
      localStorage.setItem("username", userCredentials.username);
      console.log("Stored in localStorage:", {
        isLoggedIn: "true",
        userType: "user",
        username: userCredentials.username,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate("/user-browse");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid username or password";
      console.error("User login failed:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGraduateLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const payload = graduateCredentials;
    console.log("Graduate Login Payload:", payload);

    try {
      const res = await axios.post(`${backendUrl}/api/graduate/token`, payload, {
        withCredentials: true,
      });
      console.log("Graduate login successful, token set in cookie:", res.data);

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "graduate");
      localStorage.setItem("username", graduateCredentials.username);
      console.log("Stored in localStorage:", {
        isLoggedIn: "true",
        userType: "graduate",
        username: graduateCredentials.username,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate("/graduate-homepage");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid username or password";
      console.error("Graduate login failed:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log(`Initiating Google OAuth login with loginType: ${loginType}`);
    setIsLoading(true);
    const oauthUrl = `${backendUrl}/oauth2/authorization/google?type=${loginType}`;
    console.log(`Redirecting to OAuth URL: ${oauthUrl}`);
    window.location.href = oauthUrl;
  };

  const handleBack = () => {
    console.log("Navigating back to home");
    navigate("/");
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserCredentials((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleGraduateInputChange = (e) => {
    const { name, value } = e.target;
    setGraduateCredentials((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  return (
    <ErrorBoundary>
      <div className={styles.signinPage}>
        {isLoading && (
          <div
            className={`${styles.loadingOverlay} ${
              isLoading ? styles.active : ""
            }`}
          >
            <span className={styles.loadingSpinner}></span>
          </div>
        )}
        <div className={styles.signinOverlay}></div>

        <button
          className={styles.backButton}
          onClick={handleBack}
          aria-label="Go back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 19L8 12L15 5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className={styles.signinContainer}>
          <div className={styles.signinContent}>
            <div className={styles.signinLeft}>
              <div className={styles.brandContainer}>
                <img
                  src={logo || "/placeholder.svg"}
                  alt="Tarabaho Logo"
                  className={styles.brandLogo}
                />
              </div>
              <div className={styles.brandMessage}>
                <h2>Build Your Portfolio. Showcase Your Skills.</h2>
                <p>
                  Create a verified digital portfolio and connect with clients looking for TESDA-certified talent.
                </p>
                <div className={styles.featureList}>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L3 6V11C3 16.52 6.84 21.74 12 23C17.16 21.74 21 16.52 21 11V6L12 2Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 12L11 14L15 10"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span>Verified Credentials</span>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 3H14L20 9V21H4V3Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 3V9H20"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span>Professional digital portfolio</span>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 13C10.5304 13 11.0391 13.2107 11.4142 13.5858C11.7893 13.9609 12 14.4696 12 15C12 15.5304 11.7893 16.0391 11.4142 16.4142C11.0391 16.7893 10.5304 17 10 17H7C6.46957 17 5.96086 16.7893 5.58579 16.4142C5.21071 16.0391 5 15.5304 5 15V9C5 8.46957 5.21071 7.96086 5.58579 7.58579C5.96086 7.21071 6.46957 7 7 7H10C10.5304 7 11.0391 7.21071 11.4142 7.58579C11.7893 7.96086 12 8.46957 12 9"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M17 12H13"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15 10L17 12L15 14"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span>Shareable client-ready profile</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.signinRight}>
              <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                  <h2>Sign In</h2>
                  <div className={styles.loginTypeTabs}>
                    <button
                      className={`${styles.tabButton} ${
                        loginType === "user" ? styles.active : ""
                      }`}
                      onClick={() => handleLoginTypeChange("user")}
                    >
                      Client
                    </button>
                    <button
                      className={`${styles.tabButton} ${
                        loginType === "graduate" ? styles.active : ""
                      }`}
                      onClick={() => handleLoginTypeChange("graduate")}
                    >
                      Graduate
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={styles.errorMessage}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
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

                {loginType === "user" ? (
                  <form onSubmit={handleUserLogin} className={styles.loginForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="username">Username</label>
                      <div className={styles.inputWrapper}>
                        <div className={styles.inputIconWrapper}></div>
                        <input
                          id="username"
                          type="text"
                          name="username"
                          placeholder="Enter your username"
                          value={userCredentials.username}
                          onChange={handleUserInputChange}
                          required
                          disabled={isLoading}
                          className={styles.formInput}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="password">Password</label>
                      <div className={styles.inputWrapper}>
                        <div className={styles.inputIconWrapper}></div>
                        <input
                          id="password"
                          type={showUserPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={userCredentials.password}
                          onChange={handleUserInputChange}
                          required
                          disabled={isLoading}
                          className={styles.formInput}
                        />
                        <button
                          type="button"
                          className={styles.togglePassword}
                          onClick={() => setShowUserPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showUserPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div className={styles.formLinks}>
                      <Link to="/forgot-password?type=user" className={styles.formLink}>
                        Forgot Password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className={styles.loadingSpinner}></span>
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    <div className={styles.divider}>
                      <span>OR</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className={styles.googleButton}
                      disabled={isLoading}
                    >
                      <svg
                        className={styles.googleIcon}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </button>

                    <div className={styles.registerPrompt}>
                      <span>Don't have an account?</span>
                      <Link to="/register-user" className={styles.registerLink}>
                        Register as Client
                      </Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleGraduateLogin} className={styles.loginForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="graduate-username">Username</label>
                      <div className={styles.inputWrapper}>
                        <div className={styles.inputIconWrapper}></div>
                        <input
                          id="graduate-username"
                          type="text"
                          name="username"
                          placeholder="Enter your username"
                          value={graduateCredentials.username}
                          onChange={handleGraduateInputChange}
                          required
                          disabled={isLoading}
                          className={styles.formInput}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="graduate-password">Password</label>
                      <div className={styles.inputWrapper}>
                        <div className={styles.inputIconWrapper}></div>
                        <input
                          id="graduate-password"
                          type={showGraduatePassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={graduateCredentials.password}
                          onChange={handleGraduateInputChange}
                          required
                          disabled={isLoading}
                          className={styles.formInput}
                        />
                        <button
                          type="button"
                          className={styles.togglePassword}
                          onClick={() => setShowGraduatePassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showGraduatePassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div className={styles.formLinks}>
                      <Link to="/forgot-password?type=graduate" className={styles.formLink}>
                        Forgot Password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      className={`${styles.submitButton} ${styles.graduateButton}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className={styles.loadingSpinner}></span>
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    <div className={styles.divider}>
                      <span>OR</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className={styles.googleButton}
                      disabled={isLoading}
                    >
                      <svg
                        className={styles.googleIcon}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </button>

                    <div className={styles.registerPrompt}>
                      <span>Don't have an account?</span>
                      <Link to="/register-graduate" className={styles.registerLink}>
                        Register as Graduate
                      </Link>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SignIn;