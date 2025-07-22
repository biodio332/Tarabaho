"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Cookies from "js-cookie"
import AdminNavbar from "../components/AdminNavbar"
import LogoutConfirmation from "../components/Admin-LogoutConfirmation"
import profilePlaceholder from "../assets/images/profile-placeholder.png"
import "../styles/Admin-profile.css"
import Footer from "../components/Footer"

const AdminProfile = () => {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    address: "",
    password: "",
  })
  const [profileImage, setProfileImage] = useState(profilePlaceholder)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/admin/me`, {
          withCredentials: true,
        })
        if (response.data) {
          setAdmin(response.data)
          setFormData({
            email: response.data.email || "",
            address: response.data.address || "",
            password: "",
          })
          setProfileImage(response.data.profilePicture || profilePlaceholder)
        }
      } catch (err) {
        console.error("Failed to fetch admin:", err)
        setError("Failed to load profile. Please try again.")
        navigate("/admin-login")
      }
    }
    fetchAdmin()
  }, [navigate])

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) {
      setError("No file selected.")
      return
    }
    setSelectedFile(file)
    console.log("Selected file:", file.name)

    const uploadFormData = new FormData()
    uploadFormData.append("file", file)

    try {
      console.log("Uploading file:", file.name)
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/upload-picture`,
        uploadFormData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      setAdmin(response.data)
      setProfileImage(response.data.profilePicture || profilePlaceholder)
      setSelectedFile(null)
      setError("")
      console.log("Upload successful:", response.data)
    } catch (err) {
      console.error("Failed to upload picture:", err)
      setError(err.response?.data || "Failed to upload picture. Please try again.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    setError("")
  }

  const handleEditSubmit = async () => {
    try {
      const updatedAdmin = {
        ...admin,
        email: formData.email,
        address: formData.address,
        password: formData.password || admin.password,
      }
      const response = await axios.put(
        `${BACKEND_URL}/api/admin/edit/${admin.id}`,
        updatedAdmin,
        {
          withCredentials: true,
        }
      )
      setAdmin(response.data)
      setIsEditing(false)
      setError("")
    } catch (err) {
      console.error("Failed to update profile:", err)
      setError(err.response?.data || "Failed to update profile. Please try again.")
    }
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/logout`,
        {},
        { withCredentials: true }
      )
      Cookies.remove("jwtToken", { path: "/", domain: "localhost" })
      console.log("Admin logged out")
      setShowLogoutModal(false)
      navigate("/admin-login")
    } catch (err) {
      console.error("Logout failed:", err)
      Cookies.remove("jwtToken", { path: "/", domain: "localhost" })
      setShowLogoutModal(false)
      navigate("/admin-login")
    }
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  if (!admin) {
    return (
      <div className="admin-profile-page">
        <AdminNavbar />
        <div className="admin-profile-content">
          <div>Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="admin-profile-page">
      <AdminNavbar />

      <div className="admin-profile-content">
        <div className="admin-profile-header">
          <h1 className="admin-profile-heading">ADMIN PROFILE</h1>
          <button className="logout-button" onClick={handleLogout}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 17L21 12L16 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            LOG OUT
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-section">
          <div className="profile-image-container">
            <img
              src={profileImage}
              alt="Profile"
              className="profile-image"
              onClick={handleImageClick}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
          </div>

          <div className="profile-info">
            <h2 className="profile-name">{admin.firstname} {admin.lastname}</h2>
            <p className="profile-description">Username: {admin.username}</p>
          </div>
        </div>

        <div className="details-section">
          <div className="personal-details">
            {isEditing ? (
              <div className="edit-form">
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Password:</span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className="edit-input"
                  />
                </div>
                <div className="action-buttons">
                  <button className="save-button" onClick={handleEditSubmit}>
                    Save
                  </button>
                  <button className="cancel-button" onClick={handleEditToggle}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="detail-item">
                  <span className="detail-label">Full Name:</span>
                  <span className="detail-value">{admin.firstname} {admin.lastname}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Username:</span>
                  <span className="detail-value">{admin.username}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{admin.email || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{admin.address || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Password:</span>
                  <span className="detail-value">********</span>
                  <a href="#" className="change-password-link" onClick={handleEditToggle}>
                    Change password
                  </a>
                </div>
                <div className="action-buttons">
                  <button className="edit-button" onClick={handleEditToggle}>
                    EDIT
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <h2 className="logout-modal-title">Are you sure you want to log out?</h2>
            <div className="logout-modal-actions">
              <button className="save-button" onClick={confirmLogout}>
                Yes, Log Out
              </button>
              <button className="cancel-button" onClick={cancelLogout}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default AdminProfile