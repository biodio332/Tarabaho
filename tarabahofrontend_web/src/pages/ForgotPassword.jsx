"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import axios from "axios"
import logo from "../assets/images/logowhite.png"

const ForgotPassword = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"

  const queryParams = new URLSearchParams(location.search)
  const type = queryParams.get("type") || "user"

  useEffect(() => {
    console.log("ForgotPassword: Current type =", type)
    console.log("ForgotPassword: apiPath =", type === "graduate" ? "/api/graduate" : "/api/user")
  }, [type])

  const apiPath = type === "graduate" ? "/api/graduate" : "/api/user"

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    console.log("Sending OTP request with email:", email, "type:", type)
    try {
      await axios.post(`${backendUrl}${apiPath}/forgot-password`, { email })
      setSuccess("OTP sent to your email.")
      setStep(2)
    } catch (err) {
      const errorMessage = err.response?.data || "Failed to send OTP. Please try again."
      console.error("OTP request failed:", err.response)
      setError(typeof errorMessage === "string" ? errorMessage : "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 8 characters long.")
      setIsLoading(false)
      return
    }

    console.log("Resetting password with email:", email, "type:", type)
    try {
      await axios.post(`${backendUrl}${apiPath}/reset-password`, {
        email,
        otp,
        newPassword,
      })
      setSuccess("Password reset successfully. Redirecting to sign in...")
      setTimeout(() => navigate(`/signin?type=${type}`), 2000)
    } catch (err) {
      const errorMessage = err.response?.data || "Failed to reset password. Please try again."
      console.error("Reset password failed:", err.response)
      setError(typeof errorMessage === "string" ? errorMessage : "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    console.log("Navigating back to sign-in with type:", type)
    navigate(`/signin?type=${type}`)
  }

  return (
    <div className="min-h-screen bg-[#140075] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-200/30 border-t-blue-300 rounded-full animate-spin"></div>
            <p className="text-white text-sm font-medium">Processing...</p>
          </div>
        </div>
      )}

      <button
        onClick={handleBack}
        className="absolute top-6 left-6 text-white hover:text-blue-100 transition-all duration-300 hover:scale-110 z-40 p-2 hover:bg-white/10 rounded-lg backdrop-blur-sm"
        aria-label="Go back"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15 19L8 12L15 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative z-10 animate-fadeIn border border-blue-100/50">
        <div className="w-full md:w-2/5 bg-gradient-to-br from-blue-50 via-blue-75 to-blue-100 p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden min-h-[500px]">
          <svg
            className="absolute inset-0 w-full h-full opacity-5"
            viewBox="0 0 400 600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="#3B82F6" />
              </pattern>
            </defs>
            <rect width="400" height="600" fill="url(#dots)" />
          </svg>

          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-300 rounded-full opacity-20 animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-32 h-32 bg-blue-400 rounded-full opacity-10 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>

          <div className="relative z-10 text-center space-y-6">
            <svg className="w-40 h-40 mx-auto animate-float" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <g>
                <rect
                  x="60"
                  y="90"
                  width="80"
                  height="70"
                  rx="8"
                  fill="#3B82F6"
                  opacity="0.1"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                <path
                  d="M70 90V70C70 55 80 45 100 45C120 45 130 55 130 70V90"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="120" r="6" fill="#3B82F6" />
                <line x1="100" y1="126" x2="100" y2="140" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
              </g>
              <g opacity="0.6">
                <path
                  d="M140 60L160 75V110C160 130 150 145 140 155"
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <g opacity="0.8">
                <circle cx="150" cy="50" r="12" fill="#10B981" />
                <path
                  d="M146 50L149 53L154 48"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>

            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">Reset Your Password</h3>
              <p className="text-blue-700 text-sm leading-relaxed max-w-xs mx-auto font-medium">
                {step === 1
                  ? "Secure your account by resetting your password"
                  : "Create a strong new password to protect your account"}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-b from-white to-blue-50/30">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 leading-tight">
                {step === 1 ? "Forgot Password?" : "Create New Password"}
              </h2>
              <div className="h-1.5 w-20 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mb-4"></div>
              <p className="text-blue-600 text-sm font-semibold">
                {type === "graduate" ? "Graduate Account" : "Client Account"}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 animate-slideDown shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 animate-slideDown shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 mt-0.5"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-6 animate-fadeIn">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-blue-900 mb-2.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-400 placeholder:text-blue-300 hover:border-blue-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6 animate-fadeIn">
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-blue-900 mb-2.5">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-400 placeholder:text-blue-300 tracking-widest text-center hover:border-blue-300 font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-blue-900 mb-2.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-400 placeholder:text-blue-300 hover:border-blue-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium hover:bg-blue-50 px-2 py-1 rounded"
                      tabIndex={-1}
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-blue-900 mb-2.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-400 placeholder:text-blue-300 hover:border-blue-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium hover:bg-blue-50 px-2 py-1 rounded"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <Link
                href={`/signin?type=${type}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default ForgotPassword
