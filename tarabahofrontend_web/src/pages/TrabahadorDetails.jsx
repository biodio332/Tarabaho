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
  const [worker, setWorker] = useState(null);
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
    const fetchWorkerData = async () => {
      setError("");
      setIsLoading(true);
      try {
        // Fetch worker details
        const workerResponse = await axios.get(`${BACKEND_URL}/api/worker/${id}`, {
          withCredentials: true,
        });
        const fetchedWorker = workerResponse.data;

        // Fetch certificates
        let certificates = [];
        try {
          const certificatesResponse = await axios.get(
            `${BACKEND_URL}/api/admin/certificates/worker/${id}`,
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

        // Fetch pending category requests for this worker
        let workerPendingRequests = [];
        try {
          const pendingRequestsResponse = await axios.get(
            `${BACKEND_URL}/api/admin/category-requests/pending`,
            { withCredentials: true }
          );
          console.log("Pending requests response:", pendingRequestsResponse.data);
          workerPendingRequests = pendingRequestsResponse.data.filter(
            request => request.worker.id === parseInt(id)
          );
          setPendingRequests(workerPendingRequests);
        } catch (reqErr) {
          console.error("Failed to fetch pending requests:", reqErr);
          if (reqErr.response) {
            console.error("Response data:", reqErr.response.data);
            console.error("Response status:", reqErr.response.status);
            console.error("Response headers:", reqErr.response.headers);
          }
        }

        const workerData = {
          id: fetchedWorker.id ?? 0,
          name: `${fetchedWorker.firstName ?? "Unknown"} ${fetchedWorker.lastName ?? "Worker"}`,
          fullName: `${fetchedWorker.firstName ?? "Unknown"} ${fetchedWorker.lastName ?? "Worker"}`,
          email: fetchedWorker.email ?? "N/A",
          phoneNumber: fetchedWorker.phoneNumber ?? "N/A",
          birthday: fetchedWorker.birthday ?? "N/A",
          address: fetchedWorker.address ?? "N/A",
          description: fetchedWorker.biography ?? "No description available.",
          hourlyRate: fetchedWorker.hourly ? `₱${fetchedWorker.hourly.toFixed(2)}/hour` : "N/A",
          rating: fetchedWorker.stars ?? 0,
          services: fetchedWorker.categories?.map(category => category.name) ?? [],
          certificates: certificates,
          profilePicture: fetchedWorker.profilePicture ?? "/placeholder.svg?height=300&width=300",
          isVerified: fetchedWorker.isVerified ?? false,
        };
        setWorker(workerData);
        setEditForm({
          email: workerData.email,
          phoneNumber: workerData.phoneNumber,
          birthday: workerData.birthday,
          address: workerData.address,
          biography: workerData.description,
          isVerified: workerData.isVerified,
        });
      } catch (workerErr) {
        console.error("Failed to fetch worker:", workerErr);
        if (workerErr.response) {
          console.error("Response data:", workerErr.response.data);
          console.error("Response status:", workerErr.response.status);
          console.error("Response headers:", workerErr.response.headers);
        }
        setError(
          workerErr.response?.status === 401
            ? "Your session has expired. Please log in again."
            : workerErr.response?.data?.replace("⚠️ ", "") || "Failed to load worker details. Please try again."
        );
        if (workerErr.response?.status === 401) {
          navigate("/admin-login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkerData();
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
      const updatedWorker = {
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        birthday: editForm.birthday,
        address: editForm.address,
        biography: editForm.biography,
        isVerified: editForm.isVerified,
      };
      const response = await axios.put(
        `${BACKEND_URL}/api/admin/workers/edit/${worker.id}`,
        updatedWorker,
        { withCredentials: true }
      );
      const updatedData = response.data;
      setWorker({
        ...worker,
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
      console.error("Failed to update worker:", err);
      setError(err.response?.data?.replace("⚠️ ", "") || "Failed to update worker. Please try again.");
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
      // For each selected category, send a request to the worker's endpoint
      for (const categoryId of selectedCategories) {
        const category = categories.find(cat => cat.id === categoryId);
        if (!category) continue;
        const requestData = { categoryName: category.name };
        await axios.post(
          `${BACKEND_URL}/api/worker/${worker.id}/request-category`,
          requestData,
          { withCredentials: true }
        );
      }
      // Refresh pending requests
      const pendingRequestsResponse = await axios.get(
        `${BACKEND_URL}/api/admin/category-requests/pending`,
        { withCredentials: true }
      );
      const workerPendingRequests = pendingRequestsResponse.data.filter(
        request => request.worker.id === parseInt(id)
      );
      setPendingRequests(workerPendingRequests);
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
      // Refresh worker data to update categories
      const workerResponse = await axios.get(`${BACKEND_URL}/api/worker/${id}`, {
        withCredentials: true,
      });
      const updatedWorker = workerResponse.data;
      setWorker({
        ...worker,
        services: updatedWorker.categories?.map(category => category.name) ?? [],
      });
      // Refresh pending requests
      const pendingRequestsResponse = await axios.get(
        `${BACKEND_URL}/api/admin/category-requests/pending`,
        { withCredentials: true }
      );
      const workerPendingRequests = pendingRequestsResponse.data.filter(
        request => request.worker.id === parseInt(id)
      );
      setPendingRequests(workerPendingRequests);
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
      const workerPendingRequests = pendingRequestsResponse.data.filter(
        request => request.worker.id === parseInt(id)
      );
      setPendingRequests(workerPendingRequests);
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
      await axios.delete(`${BACKEND_URL}/api/admin/workers/delete/${worker.id}`, {
        withCredentials: true,
      });
      setShowDeleteModal(false);
      navigate("/admin/manage-trabahador");
    } catch (err) {
      console.error("Failed to delete worker:", err);
      setError(err.response?.data || "Failed to delete worker. Please try again.");
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

  if (!worker) {
    return (
      <div className="trabahador-details-page">
        <AdminNavbar />
        <div className="trabahador-details-container">
          <div className="error-message">Worker not found.</div>
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
              src={worker.profilePicture}
              alt={worker.name}
              className="profile-image"
            />
          </div>

          <div className="profile-info">
            <h2 className="profile-name">{worker.name}</h2>
            <p className="profile-description">{worker.description}</p>

            <div className="rating">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`star ${i < Math.floor(worker.rating) ? "filled" : i < worker.rating ? "half-filled" : ""}`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="hourly-rate">{worker.hourlyRate}</div>

            <div className="services">
              {worker.services.map((service, index) => (
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
                  <span className="detail-value">{worker.fullName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{worker.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact no:</span>
                  <span className="detail-value">{worker.phoneNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Birthday:</span>
                  <span className="detail-value">{worker.birthday}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{worker.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Verified:</span>
                  <span className="detail-value">{worker.isVerified ? "Yes" : "No"}</span>
                </div>
                <div className="action-buttons">
                  <button className="edit-button" onClick={handleEditToggle}>
                    EDIT
                  </button>
                  {worker.isVerified && (
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
              {worker.certificates.length > 0 ? (
                worker.certificates.map((certificate) => (
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
              Are you sure you want to delete {worker.name}'s account?
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
            <h2 className="category-modal-title">Request Categories for {worker.name}</h2>
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
                      !worker.services.includes(category.name) &&
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