"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TrabahadorNavbar from "../components/TrabahadorNavbar";
import TrabahadorLogoutConfirmation from "../components/TrabahadorLogoutConfirmation";
import Footer from "../components/Footer";
import "../styles/TrabahadorProfile.css";
import { FaStar, FaCertificate, FaPlus, FaTrash, FaPen, FaCheck, FaTimes } from "react-icons/fa";

const TrabahadorProfile = () => {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [error, setError] = useState("");
  const [isAddingCertificate, setIsAddingCertificate] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    courseName: "",
    certificateNumber: "",
    issueDate: "",
    certificateFile: null,
  });
  const [editingCertificateId, setEditingCertificateId] = useState(null);
  const [selectedCertificateImage, setSelectedCertificateImage] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showCategoryRequestModal, setShowCategoryRequestModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const fileInputRef = useRef(null);
  const certificateFileInputRef = useRef(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // Inline editing states
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({
    email: "",
    address: "",
    birthday: "",
    biography: "",
    password: "",
  });

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) {
          navigate("/signin");
          return;
        }
        const response = await axios.get(`${BACKEND_URL}/api/worker/all`, {
          withCredentials: true,
        });
        const workerData = response.data.find((w) => w.username === username);
        if (workerData) {
          setWorker(workerData);
          setEditValues({
            email: workerData.email || "",
            address: workerData.address || "",
            birthday: workerData.birthday || "",
            biography: workerData.biography || "",
            password: "",
          });
          setProfileImage(workerData.profilePicture || "/placeholder.svg");

          // Fetch pending category requests for this worker
          try {
            const pendingRequestsResponse = await axios.get(
              `${BACKEND_URL}/api/worker/${workerData.id}/category-requests`,
              { withCredentials: true }
            );
            setPendingRequests(pendingRequestsResponse.data);
          } catch (reqErr) {
            console.error("Failed to fetch pending requests:", reqErr);
          }

          // Fetch all categories
          try {
            const categoriesResponse = await axios.get(`${BACKEND_URL}/api/categories`, {
              withCredentials: true,
            });
            setCategories(categoriesResponse.data);
          } catch (catErr) {
            console.error("Failed to fetch categories:", catErr);
          }
        } else {
          setError("Worker not found.");
        }
      } catch (err) {
        console.error("Failed to fetch worker:", err);
        setError("Failed to load profile. Please try again.");
      }
    };
    fetchWorker();
  }, [navigate]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("No file selected.");
      return;
    }
    setSelectedFile(file);

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/worker/${worker.id}/upload-picture`,
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
      setError(err.response?.data || "Failed to upload picture. Please try again.");
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleCertificateFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCertificate((prev) => ({ ...prev, certificateFile: file }));
    }
  };

  const handleCertificateImageClick = () => {
    certificateFileInputRef.current.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditField = (field) => {
    setEditingField(field);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    if (worker) {
      setEditValues({
        email: worker.email || "",
        address: worker.address || "",
        birthday: worker.birthday || "",
        biography: worker.biography || "",
        password: "",
      });
    }
  };

  const handleSaveField = async (field) => {
    try {
      const updatedWorker = {
        ...worker,
        [field]: editValues[field],
      };

      if (field === "password" && !editValues.password) {
        delete updatedWorker.password;
      }

      const response = await axios.put(
        `${BACKEND_URL}/api/worker/${worker.id}`,
        updatedWorker,
        {
          withCredentials: true,
        }
      );

      setWorker(response.data);
      setEditingField(null);
      setError("");
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      setError(err.response?.data || `Failed to update ${field}. Please try again.`);
    }
  };

  const handleAddCertificate = async () => {
    try {
      console.log("Adding certificate for worker ID:", worker.id);
      const certificateData = new FormData();
      certificateData.append("courseName", newCertificate.courseName);
      certificateData.append("certificateNumber", newCertificate.certificateNumber);
      certificateData.append("issueDate", newCertificate.issueDate);
      if (newCertificate.certificateFile) {
        certificateData.append("certificateFile", newCertificate.certificateFile);
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/certificate/worker/${worker.id}`,
        certificateData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Certificate added:", response.data);
      setWorker((prev) => ({
        ...prev,
        certificates: [...(prev.certificates || []), response.data],
      }));
      setNewCertificate({
        courseName: "",
        certificateNumber: "",
        issueDate: "",
        certificateFile: null,
      });
      setIsAddingCertificate(false);
    } catch (err) {
      console.error("Failed to add certificate:", err);
      setError(err.response?.data || "Failed to add certificate. Please try again.");
    }
  };

  const handleEditCertificate = (certificate) => {
    setEditingCertificateId(certificate.id);
    setNewCertificate({
      courseName: certificate.courseName,
      certificateNumber: certificate.certificateNumber,
      issueDate: certificate.issueDate,
      certificateFile: null,
    });
  };

  const handleUpdateCertificate = async (certificateId) => {
    try {
      console.log("Updating certificate ID:", certificateId);
      const certificateData = new FormData();
      certificateData.append("courseName", newCertificate.courseName);
      certificateData.append("certificateNumber", newCertificate.certificateNumber);
      certificateData.append("issueDate", newCertificate.issueDate);
      certificateData.append("workerId", worker.id);
      if (newCertificate.certificateFile) {
        certificateData.append("certificateFile", newCertificate.certificateFile);
      }

      const response = await axios.put(
        `${BACKEND_URL}/api/certificate/${certificateId}`,
        certificateData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Certificate updated:", response.data);
      setWorker((prev) => ({
        ...prev,
        certificates: prev.certificates.map((cert) =>
          cert.id === certificateId ? response.data : cert
        ),
      }));
      setNewCertificate({
        courseName: "",
        certificateNumber: "",
        issueDate: "",
        certificateFile: null,
      });
      setEditingCertificateId(null);
      setError("");
    } catch (err) {
      console.error("Failed to update certificate:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please sign in again.");
        navigate("/signin");
      } else {
        setError(err.response?.data || "Failed to update certificate. Please try again.");
      }
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    try {
      console.log("Deleting certificate ID:", certificateId);
      await axios.delete(`${BACKEND_URL}/api/certificate/${certificateId}`, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setWorker((prev) => ({
        ...prev,
        certificates: prev.certificates.filter((cert) => cert.id !== certificateId),
      }));
      setError("");
    } catch (err) {
      console.error("Failed to delete certificate:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please sign in again.");
        navigate("/signin");
      } else {
        setError(err.response?.data || "Failed to delete certificate. Please try again.");
      }
    }
  };

  const handleCertificateClick = (certificate) => {
    if (certificate.certificateFilePath) {
      setSelectedCertificateImage(certificate.certificateFilePath);
    }
  };

  const handleCloseModal = () => {
    setSelectedCertificateImage(null);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/user/logout`, {}, { withCredentials: true });
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userType");
      localStorage.removeItem("username");
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

  const handleRequestCategoryClick = () => {
    setShowCategoryRequestModal(true);
    setSelectedCategory("");
    setError("");
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleRequestCategorySubmit = async () => {
    try {
      if (!selectedCategory) {
        setError("Please select a category to request.");
        return;
      }
      const category = categories.find((cat) => cat.id === parseInt(selectedCategory));
      if (!category) {
        setError("Invalid category selected.");
        return;
      }
      const requestData = { categoryName: category.name };
      const response = await axios.post(
        `${BACKEND_URL}/api/worker/${worker.id}/request-category`,
        requestData,
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      // Refresh pending requests
      const pendingRequestsResponse = await axios.get(
        `${BACKEND_URL}/api/worker/${worker.id}/category-requests`,
        { withCredentials: true }
      );
      setPendingRequests(pendingRequestsResponse.data);
      setShowCategoryRequestModal(false);
      setError("");
    } catch (err) {
      console.error("Failed to request category:", err);
      setError(
        err.response?.data?.replace("⚠️ ", "") || "Failed to request category. Please try again."
      );
    }
  };

  const handleCategoryRequestModalClose = () => {
    setShowCategoryRequestModal(false);
    setError("");
  };

  // Determine verification status
  const getVerificationStatus = () => {
    if (worker?.isVerified) {
      return { text: "Verified", className: "verified-status" };
    } else if (pendingRequests.length > 0) {
      return { text: "Semi Verified", className: "semi-verified-status" };
    }
    return { text: "Not Verified", className: "not-verified-status" };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="trabahador-profile-page">
      <TrabahadorNavbar activePage="profile" />

      <div className="trabahador-profile-content">
        <div className="trabahador-profile-header">
          <h1 className="trabahador-profile-heading">TRABAHADOR PROFILE</h1>
          <button className="logout-button" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-top-section">
              <div className="profile-image-section">
                <img
                  src={profileImage || "/placeholder.svg"}
                  alt="Worker Profile"
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

              <div className="profile-credentials-section">
                <h3>
                  {worker ? `${worker.firstName} ${worker.lastName}` : "Loading..."}
                  <span
                    className={verificationStatus.className}
                    title={`Worker is ${verificationStatus.text.toLowerCase()}`}
                  >
                    ({verificationStatus.text})
                  </span>
                </h3>
                <p className="worker-bio">{worker?.biography || "No biography available"}</p>
                <div className="worker-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`star-icon ${i < Math.floor(worker?.stars || 0) ? "filled" : ""}`}
                    />
                  ))}
                </div>
                <div className="worker-rate">₱{worker?.hourly || "63.00"}/hour</div>
                <div className="worker-skills">
                  {worker?.categories?.length > 0 ? (
                    worker.categories.map((category, index) => (
                      <span key={index} className="skill-tag">
                        {category.name}
                      </span>
                    ))
                  ) : (
                    <span className="skill-tag">No categories assigned</span>
                  )}
                  {worker?.isVerified && (
                    <button className="add-skill-btn" onClick={handleRequestCategoryClick}>
                      <FaPlus /> Request Category
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-details-section">
              <div className="detail-row">
                <div className="detail-label">Full Name:</div>
                <div className="detail-value">
                  <div className="detail-text">
                    {worker ? `${worker.firstName} ${worker.lastName}` : "Loading..."}
                    
                  </div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Email:</div>
                <div className="detail-value">
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
                      <div className="save-cancel-buttons">
                        <button className="save-button" onClick={() => handleSaveField("email")}>
                          <FaCheck />
                        </button>
                        <button className="cancel-button" onClick={handleCancelEdit}>
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="detail-text">{worker?.email || "N/A"}</div>
                      <button className="edit-button" onClick={() => handleEditField("email")}>
                        <FaPen />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Contact no.:</div>
                <div className="detail-value">
                  <div className="detail-text">{worker?.phoneNumber || "N/A"}</div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Address:</div>
                <div className="detail-value">
                  {editingField === "address" ? (
                    <>
                      <input
                        type="text"
                        name="address"
                        value={editValues.address}
                        onChange={handleInputChange}
                        className="detail-input"
                        autoFocus
                      />
                      <div className="save-cancel-buttons">
                        <button className="save-button" onClick={() => handleSaveField("address")}>
                          <FaCheck />
                        </button>
                        <button className="cancel-button" onClick={handleCancelEdit}>
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="detail-text">{worker?.address || "N/A"}</div>
                      <button className="edit-button" onClick={() => handleEditField("address")}>
                        <FaPen />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Birthday:</div>
                <div className="detail-value">
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
                      <div className="save-cancel-buttons">
                        <button className="save-button" onClick={() => handleSaveField("birthday")}>
                          <FaCheck />
                        </button>
                        <button className="cancel-button" onClick={handleCancelEdit}>
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="detail-text">{worker?.birthday || "N/A"}</div>
                      <button className="edit-button" onClick={() => handleEditField("birthday")}>
                        <FaPen />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Biography:</div>
                <div className="detail-value">
                  {editingField === "biography" ? (
                    <>
                      <textarea
                        name="biography"
                        value={editValues.biography}
                        onChange={handleInputChange}
                        className="detail-textarea"
                        autoFocus
                      />
                      <div className="save-cancel-buttons">
                        <button className="save-button" onClick={() => handleSaveField("biography")}>
                          <FaCheck />
                        </button>
                        <button className="cancel-button" onClick={handleCancelEdit}>
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="detail-text">{worker?.biography || "N/A"}</div>
                      <button className="edit-button" onClick={() => handleEditField("biography")}>
                        <FaPen />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Password:</div>
                <div className="detail-value">
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
                      <div className="save-cancel-buttons">
                        <button className="save-button" onClick={() => handleSaveField("password")}>
                          <FaCheck />
                        </button>
                        <button className="cancel-button" onClick={handleCancelEdit}>
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="detail-text">••••••••</div>
                      <button className="edit-button" onClick={() => handleEditField("password")}>
                        <FaPen />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="certificates-section">
              <h3 className="certificates-title">
                CERTIFICATES
                <button className="add-certificate-btn" onClick={() => setIsAddingCertificate(true)}>
                  <FaPlus /> Add Certificate
                </button>
              </h3>

              {isAddingCertificate && (
                <div className="certificate-form">
                  <div className="form-group">
                    <label className="credential-label">Course Name:</label>
                    <input
                      type="text"
                      name="courseName"
                      value={newCertificate.courseName}
                      onChange={handleCertificateInputChange}
                      className="form-input"
                      placeholder="Enter course name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="credential-label">Certificate Number:</label>
                    <input
                      type="text"
                      name="certificateNumber"
                      value={newCertificate.certificateNumber}
                      onChange={handleCertificateInputChange}
                      className="form-input"
                      placeholder="Enter certificate number"
                    />
                  </div>
                  <div className="form-group">
                    <label className="credential-label">Issue Date:</label>
                    <input
                      type="date"
                      name="issueDate"
                      value={newCertificate.issueDate}
                      onChange={handleCertificateInputChange}
                      className="form-input"
                      placeholder="Select issue date"
                    />
                  </div>
                  <div className="form-group">
                    <label className="credential-label">Certificate File:</label>
                    <div className="certificate-image-upload">
                      <img
                        src={
                          newCertificate.certificateFile
                            ? URL.createObjectURL(newCertificate.certificateFile)
                            : "/placeholder.svg"
                        }
                        alt="Certificate Preview"
                        className="certificate-preview-image"
                        onClick={handleCertificateImageClick}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCertificateFileChange}
                        className="file-input"
                        ref={certificateFileInputRef}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="save-btn" onClick={handleAddCertificate}>
                      Add Certificate
                    </button>
                    <button className="cancel-btn" onClick={() => setIsAddingCertificate(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {worker?.certificates?.length > 0 ? (
                worker.certificates.map((certificate) => (
                  <div key={certificate.id} className="certificate-item">
                    {editingCertificateId === certificate.id ? (
                      <div className="certificate-form">
                        <div className="form-group">
                          <label className="credential-label">Course Name:</label>
                          <input
                            type="text"
                            name="courseName"
                            value={newCertificate.courseName}
                            onChange={handleCertificateInputChange}
                            className="form-input"
                            placeholder="Enter course name"
                          />
                        </div>
                        <div className="form-group">
                          <label className="credential-label">Certificate Number:</label>
                          <input
                            type="text"
                            name="certificateNumber"
                            value={newCertificate.certificateNumber}
                            onChange={handleCertificateInputChange}
                            className="form-input"
                            placeholder="Enter certificate number"
                          />
                        </div>
                        <div className="form-group">
                          <label className="credential-label">Issue Date:</label>
                          <input
                            type="date"
                            name="issueDate"
                            value={newCertificate.issueDate}
                            onChange={handleCertificateInputChange}
                            className="form-input"
                            placeholder="Select issue date"
                          />
                        </div>
                        <div className="form-group">
                          <label className="credential-label">Certificate File:</label>
                          <div className="certificate-image-upload">
                            <img
                              src={
                                newCertificate.certificateFile
                                  ? URL.createObjectURL(newCertificate.certificateFile)
                                  : certificate.certificateFilePath || "/placeholder.svg"
                              }
                              alt="Certificate Preview"
                              className="certificate-preview-image"
                              onClick={handleCertificateImageClick}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCertificateFileChange}
                              className="file-input"
                              ref={certificateFileInputRef}
                              style={{ display: "none" }}
                            />
                          </div>
                        </div>
                        <div className="form-actions">
                          <button
                            className="save-btn"
                            onClick={() => handleUpdateCertificate(certificate.id)}
                          >
                            Save
                          </button>
                          <button className="cancel-btn" onClick={() => setEditingCertificateId(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="certificate-details"
                          onClick={() => handleCertificateClick(certificate)}
                        >
                          <FaCertificate className="certificate-icon" />
                          <div>
                            <h4>{certificate.courseName}</h4>
                            <p>Certificate Number: {certificate.certificateNumber}</p>
                            <p className="certificate-date">Issued: {certificate.issueDate}</p>
                          </div>
                        </div>
                        <div className="certificate-actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditCertificate(certificate)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteCertificate(certificate.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-certificates">
                  <p>No certificates added yet. Add your first certificate to showcase your skills.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <TrabahadorLogoutConfirmation onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}

      {selectedCertificateImage && (
        <div className="certificate-modal">
          <div className="certificate-modal-content">
            <span className="certificate-modal-close" onClick={handleCloseModal}>
              ×
            </span>
            <img
              src={selectedCertificateImage || "/placeholder.svg"}
              alt="Certificate"
              className="certificate-modal-image"
            />
          </div>
        </div>
      )}

      {showCategoryRequestModal && (
        <div className="modal-overlay">
          <div className="category-modal">
            <h2 className="category-modal-title">Request a New Category</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="category-modal-content">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="category-select"
              >
                <option value="">Select a category</option>
                {categories
                  .filter(
                    (category) =>
                      !worker.categories?.some((cat) => cat.name === category.name) &&
                      !pendingRequests.some((req) => req.category.name === category.name)
                  )
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="category-modal-actions">
              <button className="category-save-button" onClick={handleRequestCategorySubmit}>
                Request
              </button>
              <button
                className="category-cancel-button"
                onClick={handleCategoryRequestModalClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TrabahadorProfile;