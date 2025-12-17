"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import LogoutConfirmation from "../components/User-LogoutConfirmation";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaBirthdayCake,
  FaPen,
  FaCheck,
  FaTimes,
  FaShieldAlt,
} from "react-icons/fa";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({
    email: "",
    location: "",
    birthday: "",
    password: "",
    phoneNumber: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [error, setError] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState(1); // 1=confirm, 2=sent, 3=otp
  const [otp, setOtp] = useState(""); // <-- NEW
  const fileInputRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // -----------------------------------------------------------------
  // 1. Auto-reload on ?verified=true
  // -----------------------------------------------------------------
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("verified") === "true") {
      window.history.replaceState({}, "", "/user-profile");
      window.location.reload();
    } else if (urlParams.get("error")) {
      const msg = decodeURIComponent(urlParams.get("error") || "");
      setError(msg);
      window.history.replaceState({}, "", "/user-profile");
    }
  }, []);

  // -----------------------------------------------------------------
  // 2. FETCH USER
  // -----------------------------------------------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const username = localStorage.getItem("username");
        if (!username) {
          setError("No user session found. Please log in.");
          navigate("/signin");
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/api/user/me`, {
          withCredentials: true,
        });

        const userData = response.data;
        setUser(userData);
        setEditValues({
          email: userData.email || "",
          location: userData.location || "",
          birthday: userData.birthday || "",
          password: "",
          phoneNumber: userData.phoneNumber || "",
        });
        setProfileImage(userData.profilePicture || "/placeholder.svg");
      } catch (err) {
        console.error("Failed to fetch user:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Session expired. Please log in again.");
          localStorage.clear();
          navigate("/signin");
        } else {
          setError("Failed to load profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // -----------------------------------------------------------------
  // 3. SOCIAL CONNECT
  // -----------------------------------------------------------------
  const handleConnectToggle = (platform) => {
    setConnectedAccounts((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  // -----------------------------------------------------------------
  // 4. PROFILE PICTURE
  // -----------------------------------------------------------------
  const handleFileChange = async (e) => {
    if (!user) {
      setError("Profile not loaded yet. Please wait.");
      return;
    }
    const file = e.target.files[0];
    if (!file) {
      setError("No file selected.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setSelectedFile(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/user/upload-picture`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(response.data);
      setProfileImage(response.data.profilePicture || profileImage);
      setSelectedFile(null);
      setError("");
    } catch (err) {
      console.error("Failed to upload picture:", err);
      setError(err.response?.data?.message || "Failed to upload picture. Please try again.");
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // -----------------------------------------------------------------
  // 5. INLINE EDIT
  // -----------------------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditField = (field) => {
    if (field === "email" && user?.emailVerified) {
      setError("Cannot edit verified email.");
      return;
    }
    setEditingField(field);
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    if (user) {
      setEditValues({
        email: user.email || "",
        location: user.location || "",
        birthday: user.birthday || "",
        password: "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  };

  const handleSaveField = async (field) => {
    try {
      if (!editValues[field] && field !== "password") {
        setError(`Please enter a valid ${field}.`);
        return;
      }
      if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editValues.email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (field === "phoneNumber" && !/^\+?\d{10,15}$/.test(editValues.phoneNumber)) {
        setError("Please enter a valid phone number.");
        return;
      }
      if (field === "password" && editValues.password && editValues.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }

      const updateData = { [field]: editValues[field] };
      let response;

      if (field === "phoneNumber") {
        response = await axios.put(`${BACKEND_URL}/api/user/update-phone`, updateData, {
          withCredentials: true,
        });
      } else {
        if (field === "password" && !editValues.password) {
          setEditingField(null);
          setError("");
          return;
        }
        response = await axios.put(`${BACKEND_URL}/api/user/update-profile`, updateData, {
          withCredentials: true,
        });
      }

      setUser((prevUser) => ({ ...prevUser, [field]: editValues[field] }));

      if (field === "email") {
        localStorage.setItem("username", editValues.email);
        setError("Your email has been updated.");
      }
      if (field === "password") {
        setError("Your password has been updated. Please log in again.");
        await confirmLogout();
      } else {
        setEditingField(null);
        setError("");
      }
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired. Please log in again.");
        localStorage.clear();
        navigate("/signin");
      } else {
        setError(err.response?.data?.message || `Failed to update ${field}. Please try again.`);
      }
    }
  };

  // -----------------------------------------------------------------
  // 6. LOGOUT
  // -----------------------------------------------------------------
  const confirmLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/user/logout`, {}, { withCredentials: true });
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userType");
      localStorage.removeItem("username");
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      setShowLogoutModal(false);
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed. Please try again.");
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // -----------------------------------------------------------------
  // 7. EMAIL VERIFICATION FLOW (with OTP)
  // -----------------------------------------------------------------
  const startVerification = () => {
    setShowVerifyModal(true);
    setVerifyStep(1);
    setOtp("");
  };

  const confirmEmail = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/user/send-verification`, {}, { withCredentials: true });
      setVerifyStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification email.");
      setShowVerifyModal(false);
    }
  };

  const submitOtp = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    try {
      await axios.post(
        `${BACKEND_URL}/api/user/verify-otp`,
        { otp, email: user.email },
        { withCredentials: true }
      );
      // Success → redirect with flag
      window.location.href = "/user-profile?verified=true";
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired OTP.");
    }
  };

  // -----------------------------------------------------------------
  // 8. RENDER
  // -----------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex flex-col font-sans">
        <UserNavbar activePage="user-profile" />
        <div className="flex-1 p-6 max-w-6xl mx-auto w-full text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col font-sans">
      <UserNavbar activePage="user-profile" />

      {/* VERIFICATION BANNER */}
      {!user?.emailVerified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-6 rounded-r-lg shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-yellow-800 font-medium">
              Please verify your email to unlock all features.
            </p>
            <button
              onClick={startVerification}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-semibold transition"
            >
              Verify Now
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
          <h1 className="text-4xl font-bold text-blue-600 drop-shadow-sm">MY PROFILE</h1>
          <button
            className="flex items-center gap-2 text-red-500 border border-red-200/50 px-4 py-2 rounded-lg hover:bg-red-50 hover:shadow-sm transition-transform hover:-translate-y-0.5 text-sm font-semibold"
            onClick={() => setShowLogoutModal(true)}
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

        <div className="w-full">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden relative">
            <div className="bg-gradient-to-r from-blue-600 to-blue-900 p-10 text-white relative">
              <div className="absolute -bottom-20 left-10 w-40 h-40 group">
                <img
                  src={profileImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover cursor-pointer border-4 border-white shadow-xl hover:border-blue-200 hover:scale-105 transition-all duration-300"
                  onClick={handleImageClick}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-full">
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
                <h3 className="text-3xl font-bold text-white drop-shadow-md">
                  {user ? `${user.firstname || "N/A"} ${user.lastname || "N/A"}` : "Loading..."}
                  {user?.emailVerified && (
                    <span className="text-green-300 text-base ml-2 drop-shadow-sm">
                      (Verified)
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="p-6 mt-20">
              {/* Full Name */}
              <div className="flex items-center p-4 border-b border-gray-100">
                <div className="w-44 font-semibold text-gray-600">Full Name:</div>
                <div className="flex-1 text-gray-900">
                  {user ? `${user.firstname || "N/A"} ${user.lastname}` : "Loading..."}
                </div>
              </div>

              {/* EMAIL FIELD */}
              <div className="flex items-center p-4 border-b border-gray-100 group">
                <div className="w-44 font-semibold text-gray-600">Email:</div>
                <div className="flex-1 flex items-center min-h-[40px] gap-2">
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
                        <button
                          className="bg-green-500 text-white p-2 rounded-lg"
                          onClick={() => handleSaveField("email")}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="bg-gray-500 text-white p-2 rounded-lg"
                          onClick={handleCancelEdit}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">{user?.email || "N/A"}</div>
                      {user?.emailVerified ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium text-sm">
                          <FaShieldAlt /> Verified
                        </span>
                      ) : (
                        <span className="text-red-500 text-sm">Not verified</span>
                      )}
                      {!user?.emailVerified && (
                        <button
                          className="text-blue-600 p-2 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => handleEditField("email")}
                        >
                          <FaPen />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

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
                        placeholder="Enter phone number"
                        autoFocus
                      />
                      <div className="flex gap-2 ml-4">
                        <button
                          className="bg-green-500 text-white p-2 rounded-lg"
                          onClick={() => handleSaveField("phoneNumber")}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="bg-gray-500 text-white p-2 rounded-lg"
                          onClick={handleCancelEdit}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">{user?.phoneNumber || "N/A"}</div>
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

              <div className="flex items-center p-4 border-b border-gray-100 group">
                <div className="w-44 font-semibold text-gray-600">Address:</div>
                <div className="flex-1 flex items-center min-h-[40px]">
                  {editingField === "location" ? (
                    <>
                      <input
                        type="text"
                        name="location"
                        value={editValues.location}
                        onChange={handleInputChange}
                        className="flex-1 p-3 border border-gray-300 rounded-lg"
                        autoFocus
                      />
                      <div className="flex gap-2 ml-4">
                        <button
                          className="bg-green-500 text-white p-2 rounded-lg"
                          onClick={() => handleSaveField("location")}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="bg-gray-500 text-white p-2 rounded-lg"
                          onClick={handleCancelEdit}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">{user?.location || "N/A"}</div>
                      <button
                        className="text-blue-600 p-2 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                        onClick={() => handleEditField("location")}
                      >
                        <FaPen />
                      </button>
                    </>
                  )}
                </div>
              </div>

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
                        <button
                          className="bg-green-500 text-white p-2 rounded-lg"
                          onClick={() => handleSaveField("birthday")}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="bg-gray-500 text-white p-2 rounded-lg"
                          onClick={handleCancelEdit}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">{user?.birthday || "N/A"}</div>
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
                        placeholder="Enter new password"
                        autoFocus
                      />
                      <div className="flex gap-2 ml-4">
                        <button
                          className="bg-green-500 text-white p-2 rounded-lg"
                          onClick={() => handleSaveField("password")}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="bg-gray-500 text-white p-2 rounded-lg"
                          onClick={handleCancelEdit}
                        >
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
      </div>

    
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            {/* STEP 1: Confirm Email */}
            {verifyStep === 1 && (
              <>
                <h3 className="text-xl font-bold mb-4">Verify Your Email</h3>
                <p className="text-gray-600 mb-6">
                  Is <strong>{user?.email}</strong> correct?
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

            {/* STEP 2: Email Sent + Enter Code */}
            {verifyStep === 2 && (
              <>
                <h3 className="text-xl font-bold mb-4 text-green-600">Email Sent!</h3>
                <p className="text-gray-600 mb-4">
                  A 6-digit code were sent to <strong>{user?.email}</strong>.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Enter the code below.
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

            {/* STEP 3: OTP Input */}
            {verifyStep === 3 && (
              <>
                <h3 className="text-xl font-bold mb-4">Enter Verification Code</h3>
                <p className="text-gray-600 mb-4">
                  Check your email for the 6-digit code.
                </p>
                <input
                  type="text"
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
        <LogoutConfirmation onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}
      <Footer />
    </div>
  );
};

export default UserProfile;