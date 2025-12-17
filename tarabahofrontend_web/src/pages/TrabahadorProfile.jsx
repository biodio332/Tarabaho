"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TrabahadorLogoutConfirmation from "../components/TrabahadorLogoutConfirmation";
import { FaPen, FaCheck, FaTimes, FaShieldAlt } from "react-icons/fa";

const TrabahadorProfile = () => {
  const navigate = useNavigate();
  const [graduate, setGraduate] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // Inline editing
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({
    email: "",
    address: "",
    birthday: "",
    password: "",
    phoneNumber: "",
  });

  // Email verification modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState(1); // 1=confirm, 2=sent, 3=otp
  const [otp, setOtp] = useState("");

  // -----------------------------------------------------------------
  // 1. FETCH GRADUATE
  // -----------------------------------------------------------------
  useEffect(() => {
    const fetchGraduate = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) {
          navigate("/signin");
          return;
        }
        const resp = await axios.get(`${BACKEND_URL}/api/graduate/all`, {
          withCredentials: true,
        });
        const grad = resp.data.find((g) => g.username === username);
        if (!grad) throw new Error("Graduate not found");

        setGraduate(grad);
        setEditValues({
          email: grad.email || "",
          address: grad.address || "",
          birthday: grad.birthday || "",
          password: "",
          phoneNumber: grad.phoneNumber || "",
        });
        setProfileImage(grad.profilePicture || "/placeholder.svg");
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      }
    };
    fetchGraduate();
  }, [navigate]);

  // -----------------------------------------------------------------
  // 2. REDIRECT AFTER VERIFICATION
  // -----------------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      window.history.replaceState({}, "", "/graduate-profile");
      window.location.reload();
    } else if (params.get("error")) {
      const msg = decodeURIComponent(params.get("error")||"");
      setError(msg);
      window.history.replaceState({}, "", "/graduate-profile");
    }
  }, []);

  // -----------------------------------------------------------------
  // 3. PROFILE PICTURE
  // -----------------------------------------------------------------
  const handleFileChange = async (e) => {
    if (!graduate) return setError("Profile not loaded.");
    const file = e.target.files[0];
    if (!file) return setError("No file selected.");
    if (!file.type.startsWith("image/")) return setError("Select an image.");

    const form = new FormData();
    form.append("file", file);

    try {
      const resp = await axios.post(
        `${BACKEND_URL}/api/graduate/${graduate.id}/upload-picture`,
        form,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      setGraduate(resp.data);
      setProfileImage(resp.data.profilePicture || profileImage);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    }
  };
  const handleImageClick = () => fileInputRef.current?.click();

  // -----------------------------------------------------------------
  // 4. INLINE EDITING
  // -----------------------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((p) => ({ ...p, [name]: value }));
  };

  const handleEditField = (field) => {
    if (field === "email" && graduate?.emailVerified) {
      setError("Verified email cannot be changed.");
      return;
    }
    setEditingField(field);
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    if (graduate) {
      setEditValues({
        email: graduate.email || "",
        address: graduate.address || "",
        birthday: graduate.birthday || "",
        password: "",
        phoneNumber: graduate.phoneNumber || "",
      });
    }
  };

  const handleSaveField = async (field) => {
    if (!editValues[field] && field !== "password") {
      setError(`Please enter a ${field}.`);
      return;
    }
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editValues.email)) {
      setError("Invalid email.");
      return;
    }
    if (field === "phoneNumber" && !/^\+?\d{10,15}$/.test(editValues.phoneNumber)) {
      setError("Invalid phone number.");
      return;
    }

    try {
      const payload = { [field]: editValues[field] };
      if (field === "password" && !editValues.password) {
        setEditingField(null);
        return;
      }

      const resp = await axios.put(
        `${BACKEND_URL}/api/graduate/${graduate.id}`,
        payload,
        { withCredentials: true }
      );

      setGraduate(resp.data);
      if (field === "email") {
        localStorage.setItem("username", resp.data.email);
        setError("Email updated.");
      }
      if (field === "password") {
        setError("Password changed – logging out…");
        await confirmLogout();
      } else {
        setEditingField(null);
        setError("");
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired.");
        localStorage.clear();
        navigate("/signin");
      } else {
        setError(err.response?.data?.message || `Failed to update ${field}.`);
      }
    }
  };

  // -----------------------------------------------------------------
  // 5. LOGOUT
  // -----------------------------------------------------------------
  const confirmLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/graduate/logout`, {}, { withCredentials: true });
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
      });
      setShowLogoutModal(false);
      navigate("/signin");
    } catch (e) {
      setError("Logout failed.");
    }
  };
  const cancelLogout = () => setShowLogoutModal(false);

  // -----------------------------------------------------------------
  // 6. EMAIL VERIFICATION FLOW
  // -----------------------------------------------------------------
  const startVerification = () => {
    setShowVerifyModal(true);
    setVerifyStep(1);
    setOtp("");
  };

  const confirmEmail = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/graduate/send-verification`, {}, { withCredentials: true });
      setVerifyStep(2); // show "email sent"
    } catch (e) {
      setError(e.response?.data?.error || "Failed to send email.");
      setShowVerifyModal(false);
    }
  };

  const submitOtp = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/graduate/verify-otp`,
        { otp, email: graduate.email },
        { withCredentials: true }
      );

      // Success → manual navigation
      window.location.href = "/graduate-profile?verified=true";
    } catch (e) {
      setError(e.response?.data?.error || "Invalid or expired OTP.");
    }
  };

  // -----------------------------------------------------------------
  // 7. TESDA VERIFICATION (unchanged)
  // -----------------------------------------------------------------
  const getTesdaVerificationStatus = () => {
    if (graduate?.isVerified) {
      return { text: "Verified", className: "text-green-500 font-semibold" };
    }
    return { text: "Not Verified", className: "text-red-500 font-semibold" };
  };
  const tesdaStatus = getTesdaVerificationStatus();

  // -----------------------------------------------------------------
  // 8. RENDER
  // -----------------------------------------------------------------
  if (!graduate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* ---- EMAIL VERIFICATION BANNER ---- */}
      {!graduate.emailVerified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-6 rounded-r-lg shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-yellow-800 font-medium">
              Verify your email to unlock all features.
            </p>
            <button
              onClick={startVerification}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-semibold"
            >
              Verify Email
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
          <h1 className="text-4xl font-bold text-blue-600 drop-shadow-sm">
            GRADUATE PROFILE
          </h1>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 text-red-500 border border-red-200/50 px-4 py-2 rounded-lg hover:bg-red-50 hover:shadow-sm transition-transform hover:-translate-y-0.5 text-sm font-semibold"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            LOG OUT
          </button>
        </div>

        {error && (
          <div className="text-red-500 bg-red-50 text-center py-3 px-4 rounded-lg mb-6 border-l-4 border-red-500 shadow-md text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-900 p-10 text-white relative">
            <div className="absolute -bottom-20 left-10 w-40 h-40 group">
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full rounded-full object-cover cursor-pointer border-4 border-white shadow-xl hover:border-blue-200 hover:scale-105 transition-all duration-300"
                onClick={handleImageClick}
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 rounded-b-full">
                Change Photo
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
            </div>

            <div className="ml-56">
              <h3 className="text-3xl font-bold drop-shadow-md">
                {graduate.firstName} {graduate.lastName}
                <span className={`${tesdaStatus.className} text-base ml-2`}>
                  ({tesdaStatus.text})
                </span>
              </h3>
            </div>
          </div>

          {/* Fields */}
          <div className="p-6 mt-20 space-y-0">
            {/* Full Name */}
            <div className="flex items-center p-4 border-b border-gray-100">
              <div className="w-44 font-semibold text-gray-600">Full Name:</div>
              <div className="flex-1 text-gray-900">
                {graduate.firstName} {graduate.lastName}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center p-4 border-b border-gray-100 group">
              <div className="w-44 font-semibold text-gray-600">Email:</div>
              <div className="flex-1 flex items-center gap-2 min-h-[40px]">
                {editingField === "email" ? (
                  <>
                    <input
                      type="email"
                      name="email"
                      value={editValues.email}
                      onChange={handleInputChange}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button className="bg-green-500 text-white p-2 rounded-lg" onClick={() => handleSaveField("email")}>
                        <FaCheck />
                      </button>
                      <button className="bg-gray-500 text-white p-2 rounded-lg" onClick={handleCancelEdit}>
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">{graduate.email || "N/A"}</div>
                    {graduate.emailVerified ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium text-sm">
                        <FaShieldAlt /> Verified
                      </span>
                    ) : (
                      <span className="text-red-500 text-sm">Not verified</span>
                    )}
                    {!graduate.emailVerified && (
                      <button
                        className="text-blue-600 p-2 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                        onClick={() => handleEditField("email")}
                      >
                        <FaPen />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center p-4 border-b border-gray-100 group">
              <div className="w-44 font-semibold text-gray-600">Contact no.:</div>
              <div className="flex-1 flex items-center min-h-[40px]">
                {editingField === "phoneNumber" ? (
                  <>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={editValues.phoneNumber}
                      onChange={handleInputChange}
                      className="flex-1 p-3 border border-gray-300 rounded-lg"
                      placeholder="Enter phone"
                      autoFocus
                    />
                    <div className="flex gap-2 ml-4">
                      <button className="bg-green-500 text-white p-2 rounded-lg" onClick={() => handleSaveField("phoneNumber")}>
                        <FaCheck />
                      </button>
                      <button className="bg-gray-500 text-white p-2 rounded-lg" onClick={handleCancelEdit}>
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">{graduate.phoneNumber || "N/A"}</div>
                    <button
                      className="text-blue-600 p-2 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                      onClick={() => handleEditField("phoneNumber")}
                    >
                      <FaPen />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center p-4 border-b border-gray-100 group">
              <div className="w-44 font-semibold text-gray-600">Address:</div>
              <div className="flex-1 flex items-center min-h-[40px]">
                {editingField === "address" ? (
                  <>
                    <input
                      type="text"
                      name="address"
                      value={editValues.address}
                      onChange={handleInputChange}
                      className="flex-1 p-3 border border-gray-300 rounded-lg"
                      autoFocus
                    />
                    <div className="flex gap-2 ml-4">
                      <button className="bg-green-500 text-white p-2 rounded-lg" onClick={() => handleSaveField("address")}>
                        <FaCheck />
                      </button>
                      <button className="bg-gray-500 text-white p-2 rounded-lg" onClick={handleCancelEdit}>
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">{graduate.address || "N/A"}</div>
                    <button
                      className="text-blue-600 p-2 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                      onClick={() => handleEditField("address")}
                    >
                      <FaPen />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Birthday */}
            <div className="flex items-center p-4 border-b border-gray-100 group">
              <div className="w-44 font-semibold text-gray-600">Birthday:</div>
              <div className="flex-1 flex items-center min-h-[40px]">
                {editingField === "birthday" ? (
                  <>
                    <input
                      type="date"
                      name="birthday"
                      value={editValues.birthday}
                      onChange={handleInputChange}
                      className="flex-1 p-3 border border-gray-300 rounded-lg"
                      autoFocus
                    />
                    <div className="flex gap-2 ml-4">
                      <button className="bg-green-500 text-white p-2 rounded-lg" onClick={() => handleSaveField("birthday")}>
                        <FaCheck />
                      </button>
                      <button className="bg-gray-500 text-white p-2 rounded-lg" onClick={handleCancelEdit}>
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">{graduate.birthday || "N/A"}</div>
                    <button
                      className="text-blue-600 p-2 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                      onClick={() => handleEditField("birthday")}
                    >
                      <FaPen />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="flex items-center p-4 group">
              <div className="w-44 font-semibold text-gray-600">Password:</div>
              <div className="flex-1 flex items-center min-h-[40px]">
                {editingField === "password" ? (
                  <>
                    <input
                      type="password"
                      name="password"
                      value={editValues.password}
                      onChange={handleInputChange}
                      className="flex-1 p-3 border border-gray-300 rounded-lg"
                      placeholder="New password"
                      autoFocus
                    />
                    <div className="flex gap-2 ml-4">
                      <button className="bg-green-500 text-white p-2 rounded-lg" onClick={() => handleSaveField("password")}>
                        <FaCheck />
                      </button>
                      <button className="bg-gray-500 text-white p-2 rounded-lg" onClick={handleCancelEdit}>
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">••••••••</div>
                    <button
                      className="text-blue-600 p-2 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                      onClick={() => handleEditField("password")}
                    >
                      <FaPen />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- EMAIL VERIFICATION MODAL ---------- */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            {/* STEP 1: Confirm Email */}
            {verifyStep === 1 && (
              <>
                <h3 className="text-xl font-bold mb-4">Verify Your Email</h3>
                <p className="text-gray-600 mb-6">
                  Is <strong>{graduate.email}</strong> correct?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    No
                  </button>
                  <button
                    onClick={confirmEmail}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Yes, Send Email
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Email Sent */}
            {verifyStep === 2 && (
              <>
                <h3 className="text-xl font-bold mb-4 text-green-600">Email Sent!</h3>
                <p className="text-gray-600 mb-4">
                  A 6-digit code were sent to <strong>{graduate.email}</strong>.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setVerifyStep(3)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Enter Code
                  </button>
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: Enter OTP */}
            {verifyStep === 3 && (
              <>
                <h3 className="text-xl font-bold mb-4">Enter Verification Code</h3>
                <p className="text-gray-600 mb-4">
                  Check your email for the 6-digit code.
                </p>
                <input
                  type="text"
                  maxLength={6}

                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full p-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg mb-6"
                  placeholder="000000"
                  autoFocus
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setVerifyStep(2)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={submitOtp}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Verify
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showLogoutModal && (
        <TrabahadorLogoutConfirmation onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}
    </div>
  );
};

export default TrabahadorProfile;