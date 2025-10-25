"use client";

import { useState, useEffect } from "react"; // Add useEffect
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/images/logowhite.png";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // Get type from query params
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type") || "user";

  // Debug type parameter on mount and changes
  useEffect(() => {
    console.log("ForgotPassword: Current type =", type);
    console.log("ForgotPassword: apiPath =", type === "graduate" ? "/api/graduate" : "/api/user");
  }, [type]);

  const apiPath = type === "graduate" ? "/api/graduate" : "/api/user";

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    console.log("Sending OTP request with email:", email, "type:", type);
    try {
      await axios.post(`${backendUrl}${apiPath}/forgot-password`, { email });
      setSuccess("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      const errorMessage = err.response?.data || "Failed to send OTP. Please try again.";
      console.error("OTP request failed:", err.response);
      setError(typeof errorMessage === 'string' ? errorMessage : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    console.log("Resetting password with email:", email, "type:", type);
    try {
      await axios.post(`${backendUrl}${apiPath}/reset-password`, {
        email,
        otp,
        newPassword,
      });
      setSuccess("Password reset successfully. Redirecting to sign in...");
      setTimeout(() => navigate(`/signin?type=${type}`), 2000);
    } catch (err) {
      const errorMessage = err.response?.data || "Failed to reset password. Please try again.";
      console.error("Reset password failed:", err.response);
      setError(typeof errorMessage === 'string' ? errorMessage : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    console.log("Navigating back to sign-in with type:", type);
    navigate(`/signin?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-t-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
        </div>
      )}

      <button
        onClick={handleBack}
        className="absolute top-4 left-4 text-white bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition"
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

      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 bg-blue-600 text-white p-8 flex flex-col justify-center">
          <div className="text-center">
            <img
              src={logo || "/placeholder.svg"}
              alt="Tarabaho Logo"
              className="mx-auto h-16 mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
            <p className="text-sm">
              {step === 1
                ? "Enter your email to receive a reset code."
                : "Enter the OTP and your new password."}
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Forgot Password</h2>
            <p className="text-sm text-gray-600 mb-6">
              {type === "graduate" ? "Graduate Account" : "Client Account"}
            </p>

            {error && (
              <div className="flex items-center bg-red-100 text-red-700 p-3 rounded mb-4">
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
                  className="mr-2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                {success}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
                >
                  {isLoading ? (
                    <span className="w-6 h-6 border-2 border-t-2 border-t-white border-gray-300 rounded-full animate-spin inline-block"></span>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    OTP Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter the 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
                >
                  {isLoading ? (
                    <span className="w-6 h-6 border-2 border-t-2 border-t-white border-gray-300 rounded-full animate-spin inline-block"></span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}
            <div className="mt-4 text-center">
              <Link
                to={`/signin?type=${type}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;