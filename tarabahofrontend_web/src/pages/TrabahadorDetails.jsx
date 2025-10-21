"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
import "../styles/Trabahador-details.css";

const TrabahadorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [graduate, setgraduate] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCertificateImage, setSelectedCertificateImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    phoneNumber: "",
    birthday: "",
    address: "",
    biography: "",
    isVerified: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoryRequestModal, setShowCategoryRequestModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchgraduateData = async () => {
      setError("");
      setIsLoading(true);
      try {
        // Fetch graduate details
        const graduateResponse = await axios.get(`${BACKEND_URL}/api/graduate/${id}`, {
          withCredentials: true,
        });
        const fetchedgraduate = graduateResponse.data;

        // Fetch certificates
        let certificates = [];
        try {
          const certificatesResponse = await axios.get(
            `${BACKEND_URL}/api/admin/certificates/graduate/${id}`,
            { withCredentials: true }
          );
          certificates = certificatesResponse.data.map(cert => ({
            id: cert.id ?? 0,
            courseName: cert.courseName ?? "Unknown Certificate",
            certificateNumber: cert.certificateNumber ?? "N/A",
            issueDate: cert.issueDate ?? "N/A",
            certificateFilePath: cert.certificateFilePath ?? "/placeholder.svg",
          }));
        } catch (certErr) {
          console.error("Failed to fetch certificates:", certErr);
          certificates = [];
        }

        // Fetch all categories
        let allCategories = [];
        try {
          const categoriesResponse = await axios.get(`${BACKEND_URL}/api/categories`, {
            withCredentials: true,
          });
          allCategories = categoriesResponse.data;
          setCategories(allCategories);
        } catch (catErr) {
          console.error("Failed to fetch categories:", catErr);
        }

        // Fetch pending category requests for this graduate
        let graduatePendingRequests = [];
        try {
          const pendingRequestsResponse = await axios.get(
            `${BACKEND_URL}/api/admin/category-requests/pending`,
            { withCredentials: true }
          );
          console.log("Pending requests response:", pendingRequestsResponse.data);
          graduatePendingRequests = pendingRequestsResponse.data.filter(
            request => request.graduate.id === parseInt(id)
          );
          setPendingRequests(graduatePendingRequests);
        } catch (reqErr) {
          console.error("Failed to fetch pending requests:", reqErr);
          if (reqErr.response) {
            console.error("Response data:", reqErr.response.data);
            console.error("Response status:", reqErr.response.status);
            console.error("Response headers:", reqErr.response.headers);
          }
        }

        const graduateData = {
          id: fetchedgraduate.id ?? 0,
          name: `${fetchedgraduate.firstName ?? "Unknown"} ${fetchedgraduate.lastName ?? "graduate"}`,
          fullName: `${fetchedgraduate.firstName ?? "Unknown"} ${fetchedgraduate.lastName ?? "graduate"}`,
          email: fetchedgraduate.email ?? "N/A",
          phoneNumber: fetchedgraduate.phoneNumber ?? "N/A",
          birthday: fetchedgraduate.birthday ?? "N/A",
          address: fetchedgraduate.address ?? "N/A",
          description: fetchedgraduate.biography ?? "No description available.",
          hourlyRate: fetchedgraduate.hourly ? `₱${fetchedgraduate.hourly.toFixed(2)}/hour` : "N/A",
          rating: fetchedgraduate.stars ?? 0,
          services: fetchedgraduate.categories?.map(category => category.name) ?? [],
          certificates: certificates,
          profilePicture: fetchedgraduate.profilePicture ?? "/placeholder.svg?height=300&width=300",
          isVerified: fetchedgraduate.isVerified ?? false,
        };
        setgraduate(graduateData);
        setEditForm({
          email: graduateData.email,
          phoneNumber: graduateData.phoneNumber,
          birthday: graduateData.birthday,
          address: graduateData.address,
          biography: graduateData.description,
          isVerified: graduateData.isVerified,
        });
      } catch (graduateErr) {
        console.error("Failed to fetch graduate:", graduateErr);
        if (graduateErr.response) {
          console.error("Response data:", graduateErr.response.data);
          console.error("Response status:", graduateErr.response.status);
          console.error("Response headers:", graduateErr.response.headers);
        }
        setError(
          graduateErr.response?.status === 401
            ? "Your session has expired. Please log in again."
            : graduateErr.response?.data?.replace("⚠️ ", "") || "Failed to load graduate details. Please try again."
        );
        if (graduateErr.response?.status === 401) {
          navigate("/admin-login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchgraduateData();
  }, [id, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCertificateClick = (certificate) => {
    if (certificate.certificateFilePath) {
      setSelectedCertificateImage(certificate.certificateFilePath);
    }
  };

  const handleCloseModal = () => {
    setSelectedCertificateImage(null);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError("");
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditSubmit = async () => {
    try {
      const updatedgraduate = {
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        birthday: editForm.birthday,
        address: editForm.address,
        biography: editForm.biography,
        isVerified: editForm.isVerified,
      };
      const response = await axios.put(
        `${BACKEND_URL}/api/admin/graduates/edit/${graduate.id}`,
        updatedgraduate,
        { withCredentials: true }
      );
      const updatedData = response.data;
      setgraduate({
        ...graduate,
        email: updatedData.email ?? "N/A",
        phoneNumber: updatedData.phoneNumber ?? "N/A",
        birthday: updatedData.birthday ?? "N/A",
        address: updatedData.address ?? "N/A",
        description: updatedData.biography ?? "No description available.",
        isVerified: updatedData.isVerified ?? false,
      });
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Failed to update graduate:", err);
      setError(err.response?.data?.replace("⚠️ ", "") || "Failed to update graduate. Please try again.");
    }
  };

  const handleRequestCategoryClick = () => {
    setShowCategoryRequestModal(true);
    setSelectedCategories([]);
    setError("");
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => parseInt(option.value));
    setSelectedCategories(selectedOptions);
  };

  const handleRequestCategorySubmit = async () => {
    try {
      if (selectedCategories.length === 0) {
        setError("Please select at least one category to request.");
        return;
      }
      // For each selected category, send a request to the graduate's endpoint
      for (const categoryId of selectedCategories) {
        const category = categories.find(cat => cat.id === categoryId);
        if (!category) continue;
        const requestData = { categoryName: category.name };
        await axios.post(
          `${BACKEND_URL}/api/graduate/${graduate.id}/request-category`,
          requestData,
          { withCredentials: true }
        );
      }
      // Refresh pending requests
      const pendingRequestsResponse = await axios.get(
        `${BACKEND_URL}/api/admin/category-requests/pending`,
        { withCredentials: true }
      );
      const graduatePendingRequests = pendingRequestsResponse.data.filter(
        request => request.graduate.id === parseInt(id)
      );
      setPendingRequests(graduatePendingRequests);
      setShowCategoryRequestModal(false);
      setError("");
    } catch (err) {
      console.error("Failed to request categories:", err);
      setError(err.response?.data?.replace("⚠️ ", "") || "Failed to request categories. Please try again.");
    }
  };

  const handleCategoryRequestModalClose = () => {
    setShowCategoryRequestModal(false);
    setError("");
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/category-requests/${requestId}/approve`,
        {},
        { withCredentials: true }
      );
      // Refresh graduate data to update categories
      const graduateResponse = await axios.get(`${BACKEND_URL}/api/graduate/${id}`, {
        withCredentials: true,
      });
      const updatedgraduate = graduateResponse.data;
      setgraduate({
        ...graduate,
        services: updatedgraduate.categories?.map(category => category.name) ?? [],
      });
      // Refresh pending requests
      const pendingRequestsResponse = await axios.get(
        `${BACKEND_URL}/api/admin/category-requests/pending`,
        { withCredentials: true }
      );
      const graduatePendingRequests = pendingRequestsResponse.data.filter(
        request => request.graduate.id === parseInt(id)
      );
      setPendingRequests(graduatePendingRequests);
      setError("");
    } catch (err) {
      console.error("Failed to approve request:", err);
      setError(err.response?.data?.replace("⚠️ ", "") || "Failed to approve request. Please try again.");
    }
  };

  const handleDenyRequest = async (requestId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/category-requests/${requestId}/deny`,
        {},
        { withCredentials: true }
      );
      // Refresh pending requests
      const pendingRequestsResponse = await axios.get(
        `${BACKEND_URL}/api/admin/category-requests/pending`,
        { withCredentials: true }
      );
      const graduatePendingRequests = pendingRequestsResponse.data.filter(
        request => request.graduate.id === parseInt(id)
      );
      setPendingRequests(graduatePendingRequests);
      setError("");
    } catch (err) {
      console.error("Failed to deny request:", err);
      setError(err.response?.data?.replace("⚠️ ", "") || "Failed to deny request. Please try again.");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/graduates/delete/${graduate.id}`, {
        withCredentials: true,
      });
      setShowDeleteModal(false);
      navigate("/admin/manage-trabahador");
    } catch (err) {
      console.error("Failed to delete graduate:", err);
      setError(err.response?.data || "Failed to delete graduate. Please try again.");
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="trabahador-details-page">
        <AdminNavbar />
        <div className="trabahador-details-container">
          <div className="loading">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !showCategoryRequestModal) {
    return (
      <div className="trabahador-details-page">
        <AdminNavbar />
        <div className="trabahador-details-container">
          <div className="error-message">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!graduate) {
    return (
      <div className="trabahador-details-page">
        <AdminNavbar />
        <div className="trabahador-details-container">
          <div className="error-message">graduate not found.</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="trabahador-details-page">
      <AdminNavbar />

      <div className="trabahador-details-container">
        <button className="back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="profile-section">
          <div className="profile-image-container">
            <img
              src={graduate.profilePicture}
              alt={graduate.name}
              className="profile-image"
            />
          </div>

          <div className="profile-info">
            <h2 className="profile-name">{graduate.name}</h2>
            <p className="profile-description">{graduate.description}</p>

            <div className="rating">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`star ${i < Math.floor(graduate.rating) ? "filled" : i < graduate.rating ? "half-filled" : ""}`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="hourly-rate">{graduate.hourlyRate}</div>

            <div className="services">
              {graduate.services.map((service, index) => (
                <span key={index} className="service-tag">
                  {service}
                </span>
              ))}
            </div>
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
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="edit-input"
                  />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact no:</span>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={handleEditChange}
                    className="edit-input"
                  />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Birthday:</span>
                  <input
                    type="date"
                    name="birthday"
                    value={editForm.birthday}
                    onChange={handleEditChange}
                    className="edit-input"
                  />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <input
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="edit-input"
                  />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Biography:</span>
                  <textarea
                    name="biography"
                    value={editForm.biography}
                    onChange={handleEditChange}
                    className="edit-input"
                    rows="3"
                  />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Verified:</span>
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={editForm.isVerified}
                    onChange={handleEditChange}
                    className="edit-checkbox"
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
                  <span className="detail-label">Full name:</span>
                  <span className="detail-value">{graduate.fullName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{graduate.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact no:</span>
                  <span className="detail-value">{graduate.phoneNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Birthday:</span>
                  <span className="detail-value">{graduate.birthday}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{graduate.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Verified:</span>
                  <span className="detail-value">{graduate.isVerified ? "Yes" : "No"}</span>
                </div>
                <div className="action-buttons">
                  <button className="edit-button" onClick={handleEditToggle}>
                    EDIT
                  </button>
                  {graduate.isVerified && (
                    <button className="add-category-button" onClick={handleRequestCategoryClick}>
                      REQUEST CATEGORY
                    </button>
                  )}
                  <button className="delete-button" onClick={handleDeleteClick}>
                    DELETE ACCOUNT
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="documents-section">
            <h3 className="documents-title">PENDING CATEGORY REQUESTS:</h3>
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <div key={request.id} className="document-item">
                  <div className="document-name">
                    {request.category.name} (Status: {request.status})
                  </div>
                  <div className="category-request-actions">
                    <button
                      className="approve-button"
                      onClick={() => handleApproveRequest(request.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="deny-button"
                      onClick={() => handleDenyRequest(request.id)}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending category requests.</p>
            )}

            <h3 className="documents-title">CERTIFICATES:</h3>
            <div className="documents-list">
              {graduate.certificates.length > 0 ? (
                graduate.certificates.map((certificate) => (
                  <div key={certificate.id} className="document-item">
                    <div
                      className="document-name"
                      onClick={() => handleCertificateClick(certificate)}
                    >
                      {certificate.courseName}
                      {certificate.certificateNumber && (
                        <span className="document-note"> (No: {certificate.certificateNumber})</span>
                      )}
                      {certificate.issueDate && (
                        <span className="document-note"> Issued: {certificate.issueDate}</span>
                      )}
                    </div>
                    <button
                      className="view-document-button"
                      onClick={() => handleCertificateClick(certificate)}
                    >
                      View
                    </button>
                  </div>
                ))
              ) : (
                <p>No certificates available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedCertificateImage && (
        <div className="certificate-modal">
          <div className="certificate-modal-content">
            <span className="certificate-modal-close" onClick={handleCloseModal}>
              ×
            </span>
            <img
              src={selectedCertificateImage}
              alt="Certificate"
              className="certificate-modal-image"
            />
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2 className="delete-modal-title">
              Are you sure you want to delete {graduate.name}'s account?
            </h2>
            <div className="delete-modal-actions">
              <button className="delete-confirm-button" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button className="delete-cancel-button" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryRequestModal && (
        <div className="modal-overlay">
          <div className="category-modal">
            <h2 className="category-modal-title">Request Categories for {graduate.name}</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="category-modal-content">
              <select
                multiple
                value={selectedCategories}
                onChange={handleCategoryChange}
                className="category-select"
              >
                {categories
                  .filter(
                    (category) =>
                      !graduate.services.includes(category.name) &&
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
              <button className="category-cancel-button" onClick={handleCategoryRequestModalClose}>
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

export default TrabahadorDetails;