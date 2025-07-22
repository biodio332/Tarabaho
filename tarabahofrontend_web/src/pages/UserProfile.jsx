"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import LogoutConfirmation from "../components/User-LogoutConfirmation";
import "../styles/User-profile.css";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaUser,
  FaBookmark,
  FaHistory,
  FaSignOutAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaBirthdayCake,
  FaPen,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({
    email: "",
    location: "",
    birthday: "",
    password: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState({
    facebook: false,
    instagram: false,
    tiktok: false,
  });
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/user/me`, {
          withCredentials: true,
        });
        if (response.data) {
          setUser(response.data);
          setEditValues({
            email: response.data.email || "",
            location: response.data.location || "",
            birthday: response.data.birthday || "",
            password: "",
          });
          setProfileImage(response.data.profilePicture || "/placeholder.svg");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to load profile. Please try again.");
      }
    };
    fetchUser();
  }, []);

  const handleConnectToggle = (platform) => {
    setConnectedAccounts((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("No file selected.");
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
      setError(err.response?.data || "Failed to upload picture. Please try again.");
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditField = (field) => {
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
      });
    }
  };

  const handleSaveField = async (field) => {
    try {
      // Validate password if editing password
      if (field === "password") {
        if (!editValues.password) {
          setError("Password cannot be empty.");
          return;
        }
        if (editValues.password.length < 8) {
          setError("Password must be at least 8 characters long.");
          return;
        }
      }

      // Create updateData with only the edited field
      const updateData = {
        [field]: editValues[field],
      };

      // Explicitly exclude password if it's empty
      if (field === "password" && !editValues.password) {
        delete updateData.password;
      }

      const response = await axios.put(`${BACKEND_URL}/api/user/update-profile`, updateData, {
        withCredentials: true,
      });
      setUser(response.data);
      setEditingField(null);
      setEditValues((prev) => ({ ...prev, password: "" })); // Reset password field
      setError("");
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      setError(err.response?.data || `Failed to update ${field}. Please try again.`);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/user/logout`, {}, { withCredentials: true });
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

  const handleBookmarksClick = () => {
    navigate("/user-bookmarks");
  };

  const handleHistoryClick = () => {
    navigate("/booking-history");
  };

  const getVerificationStatus = () => {
    if (user?.isVerified) {
      return { text: "Verified", className: "verified-status" };
    }
    return { text: "Not Verified", className: "not-verified-status" };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="profile-page">
      <UserNavbar activePage="user-profile" />

      <div className="profile-content">
        <h1 className="profile-title">MY PROFILE</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-container">
          <div className="profile-sidebar">
            <div className={`sidebar-item ${location.pathname === "/user-profile" ? "active" : ""}`}>
              <FaUser className="sidebar-icon" />
              <span>PROFILE</span>
            </div>
            <div
              className={`sidebar-item ${location.pathname === "/user-bookmarks" ? "active" : ""}`}
              onClick={handleBookmarksClick}
            >
              <FaBookmark className="sidebar-icon" />
              <span>BOOKMARKS</span>
            </div>
            <div
              className={`sidebar-item ${location.pathname === "/booking-history" ? "active" : ""}`}
              onClick={handleHistoryClick}
            >
              <FaHistory className="sidebar-icon" />
              <span>HISTORY</span>
            </div>
            <div className="sidebar-item logout" onClick={handleLogout}>
              <FaSignOutAlt className="sidebar-icon" />
              <span>LOG OUT</span>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-info-section">
              <div className="profile-image-container">
                <img
                  src={profileImage || "/placeholder.svg"}
                  alt="User Profile"
                  className="profile-image"
                  onClick={handleImageClick}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />
              </div>

              <div className="profile-details">
                <div className="profile-detail-item">
                  <span className="detail-label">
                    <FaUser className="detail-icon" /> Name:
                  </span>
                  <span className="detail-value">
                    {user ? `${user.firstname} ${user.lastname}` : "Loading..."}
                    <span
                      className={verificationStatus.className}
                      title={`User is ${verificationStatus.text.toLowerCase()}`}
                    >
                      {verificationStatus.text}
                    </span>
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">
                    <FaEnvelope className="detail-icon" /> Email:
                  </span>
                  <span className="detail-value">
                    {editingField === "email" ? (
                      <>
                        <input
                          type="email"
                          name="email"
                          value={editValues.email}
                          onChange={handleInputChange}
                          className="detail-input"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button className="save-btn" onClick={() => handleSaveField("email")}>
                            <FaCheck />
                          </button>
                          <button className="cancel-btn" onClick={handleCancelEdit}>
                            <FaTimes />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {user?.email || "N/A"}
                        <button className="edit-btn" onClick={() => handleEditField("email")}>
                          <FaPen />
                        </button>
                      </>
                    )}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">
                    <FaMapMarkerAlt className="detail-icon" /> Address:
                  </span>
                  <span className="detail-value">
                    {editingField === "location" ? (
                      <>
                        <input
                          type="text"
                          name="location"
                          value={editValues.location}
                          onChange={handleInputChange}
                          className="detail-input"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button className="save-btn" onClick={() => handleSaveField("location")}>
                            <FaCheck />
                          </button>
                          <button className="cancel-btn" onClick={handleCancelEdit}>
                            <FaTimes />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {user?.location || "N/A"}
                        <button className="edit-btn" onClick={() => handleEditField("location")}>
                          <FaPen />
                        </button>
                      </>
                    )}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">
                    <FaPhone className="detail-icon" /> Contact no.:
                  </span>
                  <span className="detail-value">{user?.phoneNumber || "N/A"}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">
                    <FaBirthdayCake className="detail-icon" /> Birthdate:
                  </span>
                  <span className="detail-value">
                    {editingField === "birthday" ? (
                      <>
                        <input
                          type="date"
                          name="birthday"
                          value={editValues.birthday}
                          onChange={handleInputChange}
                          className="detail-input"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button className="save-btn" onClick={() => handleSaveField("birthday")}>
                            <FaCheck />
                          </button>
                          <button className="cancel-btn" onClick={handleCancelEdit}>
                            <FaTimes />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {user?.birthday || "N/A"}
                        <button className="edit-btn" onClick={() => handleEditField("birthday")}>
                          <FaPen />
                        </button>
                      </>
                    )}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">
                    <FaUser className="detail-icon" /> Password:
                  </span>
                  <span className="detail-value">
                    {editingField === "password" ? (
                      <>
                        <input
                          type="password"
                          name="password"
                          value={editValues.password}
                          onChange={handleInputChange}
                          className="detail-input"
                          placeholder="Enter new password"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button className="save-btn" onClick={() => handleSaveField("password")}>
                            <FaCheck />
                          </button>
                          <button className="cancel-btn" onClick={handleCancelEdit}>
                            <FaTimes />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        ••••••••
                        <button className="edit-btn" onClick={() => handleEditField("password")}>
                          <FaPen />
                        </button>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="account-info-section">
              <div className="account-credentials">
                <div className="credential-item">
                  <span className="credential-label">Username:</span>
                  <span className="credential-value">{user?.username || "N/A"}</span>
                </div>
              </div>

              <div className="connected-accounts">
                <h3 className="connected-accounts-title">CONNECTED ACCOUNTS</h3>
                <div className="account-divider"></div>

                <div className="social-account-item">
                  <FaFacebook className="social-icon facebook" />
                  <button
                    className={`connect-btn ${connectedAccounts.facebook ? "connected" : ""}`}
                    onClick={() => handleConnectToggle("facebook")}
                    aria-label={connectedAccounts.facebook ? "Disconnect Facebook" : "Connect Facebook"}
                  >
                    {connectedAccounts.facebook ? "Disconnect" : "Connect"}
                  </button>
                </div>
                <div className="social-account-item">
                  <FaInstagram className="social-icon instagram" />
                  <button
                    className={`connect-btn ${connectedAccounts.instagram ? "connected" : ""}`}
                    onClick={() => handleConnectToggle("instagram")}
                    aria-label={connectedAccounts.instagram ? "Disconnect Instagram" : "Connect Instagram"}
                  >
                    {connectedAccounts.instagram ? "Disconnect" : "Connect"}
                  </button>
                </div>
                <div className="social-account-item">
                  <FaTiktok className="social-icon tiktok" />
                  <button
                    className={`connect-btn ${connectedAccounts.tiktok ? "connected" : ""}`}
                    onClick={() => handleConnectToggle("tiktok")}
                    aria-label={connectedAccounts.tiktok ? "Disconnect TikTok" : "Connect TikTok"}
                  >
                    {connectedAccounts.tiktok ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLogoutModal && <LogoutConfirmation onConfirm={confirmLogout} onCancel={cancelLogout} />}
      <Footer />
    </div>
  );
};

export default UserProfile;