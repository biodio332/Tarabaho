"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TrabahadorNavbar from "../components/TrabahadorNavbar";
import TrabahadorLogoutConfirmation from "../components/TrabahadorLogoutConfirmation";
import Footer from "../components/Footer";
import { FaPen, FaCheck, FaTimes } from "react-icons/fa";

const TrabahadorProfile = () => {
  const navigate = useNavigate();
  const [graduate, setWorker] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // Inline editing states
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({
    email: "",
    address: "",
    birthday: "",
    password: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) {
          navigate("/signin");
          return;
        }
        const response = await axios.get(`${BACKEND_URL}/api/graduate/all`, {
          withCredentials: true,
        });
        const graduateData = response.data.find((w) => w.username === username);
        if (graduateData) {
          setWorker(graduateData);
          setEditValues({
            email: graduateData.email || "",
            address: graduateData.address || "",
            birthday: graduateData.birthday || "",
            password: "",
            phoneNumber: graduateData.phoneNumber || "",
          });
          setProfileImage(graduateData.profilePicture || "/placeholder.svg");
        } else {
          setError("Worker not found.");
        }
      } catch (err) {
        console.error("Failed to fetch graduate:", err);
        setError("Failed to load profile. Please try again.");
      }
    };
    fetchWorker();
  }, [navigate]);

  const handleFileChange = async (e) => {
    if (!graduate) {
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

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/graduate/${graduate.id}/upload-picture`,
        uploadData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setWorker(response.data);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditField = (field) => {
    setEditingField(field);
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
  // Validate inputs
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

  try {
    // Create an object with only the field being updated
    const updatedField = {
      [field]: editValues[field],
    };

    // If password is empty, skip it (optional field)
    if (field === "password" && !editValues.password) {
      setEditingField(null);
      setError("");
      return;
    }

    const response = await axios.put(
      `${BACKEND_URL}/api/graduate/${graduate.id}`,
      updatedField, // Send only the changed field
      {
        withCredentials: true,
      }
    );

    // Update local state with the response
    setWorker(response.data);
    if (field === "email") {
      localStorage.setItem("username", response.data.email); // Sync localStorage if email is used for login
      setError(`Your ${field} has been updated.`); // Sync localStorage if email is used for login
    }
    if (field === "password") {
      setError(`Your ${field} has been updated. Please log in again.`);
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


  const confirmLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/user/logout`, {}, { withCredentials: true });
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userType");
      localStorage.removeItem("username");
      // Clear all cookies
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

  // Determine verification status
  const getVerificationStatus = () => {
    if (graduate?.isVerified) {
      return { text: "Verified", className: "text-green-500 font-semibold" };
    }
    return { text: "Not Verified", className: "text-red-500 font-semibold" };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col font-sans">
      <TrabahadorNavbar activePage="profile" />

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
          <h1 className="text-4xl font-bold text-blue-600 drop-shadow-sm">GRADUATE PROFILE</h1>
          <button
            className="flex items-center gap-2 text-red-500 border border-red-200/50 px-4 py-2 rounded-lg hover:bg-red-50 hover:shadow-sm transition-transform hover:-translate-y-0.5 text-sm font-semibold"
            onClick={() => setShowLogoutModal(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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

        {error && (
          <div className="text-red-500 bg-red-50 text-center py-3 px-4 rounded-lg mb-6 border-l-4 border-red-500 shadow-md text-sm">
            {error}
          </div>
        )}

        <div className="w-full">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden relative">
            {/* Header section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-900 p-10 text-white relative">
              {/* Floating profile image */}
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

              {/* Name and status */}
              <div className="ml-56">
                <h3 className="text-3xl font-bold text-white drop-shadow-md">
                  {graduate ? `${graduate.firstName} ${graduate.lastName}` : "Loading..."}
                  <span className={`${verificationStatus.className} text-base ml-2 drop-shadow-sm`}>
                    ({verificationStatus.text})
                  </span>
                </h3>
              </div>
            </div>

            {/* Editable fields */}
            <div className="p-6 mt-20">
              {/* Full name */}
              <div className="flex items-center p-4 border-b border-gray-100">
                <div className="w-44 font-semibold text-gray-600">Full Name:</div>
                <div className="flex-1 text-gray-900">
                  {graduate ? `${graduate.firstName} ${graduate.lastName}` : "Loading..."}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center p-4 border-b border-gray-100 group">
                <div className="w-44 font-semibold text-gray-600">Email:</div>
                <div className="flex-1 flex items-center min-h-[40px]">
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
                      <div className="flex gap-2 ml-4">
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
                      <div className="flex-1">{graduate?.email || "N/A"}</div>
                      <button
                        className="text-blue-600 p-2 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                        onClick={() => handleEditField("email")}
                      >
                        <FaPen />
                      </button>
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
                      <div className="flex-1">{graduate?.phoneNumber || "N/A"}</div>
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
                        <button
                          className="bg-green-500 text-white p-2 rounded-lg"
                          onClick={() => handleSaveField("address")}
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
                      <div className="flex-1">{graduate?.address || "N/A"}</div>
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
                      <div className="flex-1">{graduate?.birthday || "N/A"}</div>
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

      {showLogoutModal && (
        <TrabahadorLogoutConfirmation onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}

      <Footer />
    </div>
  );
};

export default TrabahadorProfile;