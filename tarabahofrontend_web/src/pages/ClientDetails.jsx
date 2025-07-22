"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
import "../styles/Trabahador-details.css";

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    phoneNumber: "",
    birthday: "",
    location: "",
    biography: "",
    isVerified: false,
    firstname: "",
    lastname: "",
    username: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchClientData = async () => {
      setError("");
      setIsLoading(true);
      try {
        console.log(`Fetching user with ID: ${id}`);
        const response = await axios.get(`${BACKEND_URL}/api/admin/users/${id}`, {
          withCredentials: true,
        });
        console.log("Response from /api/admin/users/:id:", response.status, response.data);
        const fetchedClient = response.data;
        const clientData = {
          id: fetchedClient.id ?? 0,
          name: `${fetchedClient.firstname ?? "Unknown"} ${fetchedClient.lastname ?? "Client"}`,
          fullName: `${fetchedClient.firstname ?? "Unknown"} ${fetchedClient.lastname ?? "Client"}`,
          email: fetchedClient.email ?? "N/A",
          phoneNumber: fetchedClient.phoneNumber ?? "N/A",
          birthday: fetchedClient.birthday ?? "N/A",
          address: fetchedClient.location ?? "N/A",
          biography: fetchedClient.biography ?? "No biography available.",
          profilePicture: fetchedClient.profilePicture ?? "/placeholder.svg?height=300&width=300",
          isVerified: fetchedClient.isVerified ?? false,
          firstname: fetchedClient.firstname ?? "Unknown",
          lastname: fetchedClient.lastname ?? "Client",
          username: fetchedClient.username ?? fetchedClient.email ?? "N/A",
        };
        setClient(clientData);
        setEditForm({
          email: clientData.email,
          phoneNumber: clientData.phoneNumber,
          birthday: clientData.birthday,
          location: clientData.address,
          biography: clientData.biography,
          isVerified: clientData.isVerified,
          firstname: clientData.firstname,
          lastname: clientData.lastname,
          username: clientData.username,
        });
      } catch (err) {
        console.error("Failed to fetch client:", err);
        setError(
          err.response?.status === 401
            ? "Your session has expired. Please log in again."
            : err.response?.data?.message || "Failed to load client details. Please try again."
        );
        if (err.response?.status === 401) {
          navigate("/admin-login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [id, navigate]);

  const handleBack = () => {
    navigate(-1);
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
      // Prepare the DTO with all fields, similar to TrabahadorDetails.jsx
      const updatedUser = {
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        birthday: editForm.birthday,
        location: editForm.location,
        biography: editForm.biography,
        isVerified: editForm.isVerified,
        firstname: editForm.firstname,
        lastname: editForm.lastname,
        username: editForm.username,
      };

      console.log("Sending update request with payload:", updatedUser);

      // Attempt to get a fresh token
      try {
        const tokenResponse = await axios.get(`${BACKEND_URL}/api/admin/get-token`, {
          withCredentials: true,
        });
        console.log("Retrieved token:", tokenResponse.data.token);
      } catch (tokenErr) {
        console.error("Failed to refresh token:", tokenErr);
        if (tokenErr.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          navigate("/admin-login");
          return;
        }
      }

      const response = await axios.put(
        `${BACKEND_URL}/api/admin/users/edit/${client.id}`,
        updatedUser,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Update response:", response.status, response.data);
      const updatedData = response.data;
      setClient({
        ...client,
        email: updatedData.email ?? "N/A",
        phoneNumber: updatedData.phoneNumber ?? "N/A",
        birthday: updatedData.birthday ?? "N/A",
        address: updatedData.location ?? "N/A",
        biography: updatedData.biography ?? "No biography available.",
        isVerified: updatedData.isVerified ?? client.isVerified,
        firstname: updatedData.firstname ?? client.firstname,
        lastname: updatedData.lastname ?? client.lastname,
        username: updatedData.username ?? client.username,
        name: `${updatedData.firstname ?? client.firstname} ${updatedData.lastname ?? client.lastname}`,
        fullName: `${updatedData.firstname ?? client.firstname} ${updatedData.lastname ?? client.lastname}`,
      });
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Failed to update client:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate("/admin-login");
      } else {
        setError(err.response?.data || "Failed to update client. Please try again.");
      }
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      console.log("Deleting client ID:", client.id);
      await axios.delete(`${BACKEND_URL}/api/admin/users/delete/${client.id}`, {
        withCredentials: true,
      });
      setShowDeleteModal(false);
      navigate("/admin/manage-users");
    } catch (err) {
      console.error("Failed to delete client:", err);
      setError(err.response?.data?.message || "Failed to delete client. Please try again.");
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

  if (error) {
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

  if (!client) {
    return (
      <div className="trabahador-details-page">
        <AdminNavbar />
        <div className="trabahador-details-container">
          <div className="error-message">Client not found.</div>
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
            <img src={client.profilePicture} alt={client.name} className="profile-image" />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{client.name}</h2>
            <p className="profile-description">{client.biography}</p>
          </div>
        </div>
        <div className="details-section">
          <div className="personal-details">
            {isEditing ? (
              <div className="edit-form">
                <div className="detail-item">
                  <span className="detail-label">First Name:</span>
                  <input type="text" name="firstname" value={editForm.firstname} onChange={handleEditChange} className="edit-input" />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Name:</span>
                  <input type="text" name="lastname" value={editForm.lastname} onChange={handleEditChange} className="edit-input" />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Username:</span>
                  <input type="text" name="username" value={editForm.username} onChange={handleEditChange} className="edit-input" />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="edit-input" />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact no:</span>
                  <input type="text" name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} className="edit-input" />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Birthday:</span>
                  <input type="date" name="birthday" value={editForm.birthday} onChange={handleEditChange} className="edit-input" />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <input type="text" name="location" value={editForm.location} onChange={handleEditChange} className="edit-input" />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Biography:</span>
                  <textarea name="biography" value={editForm.biography} onChange={handleEditChange} className="edit-input" rows="3" />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Verified:</span>
                  <input type="checkbox" name="isVerified" checked={editForm.isVerified} onChange={handleEditChange} className="edit-checkbox" />
                </div>
                <div className="action-buttons">
                  <button className="save-button" onClick={handleEditSubmit}>Save</button>
                  <button className="cancel-button" onClick={handleEditToggle}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="detail-item">
                  <span className="detail-label">Full name:</span>
                  <span className="detail-value">{client.fullName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{client.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact no:</span>
                  <span className="detail-value">{client.phoneNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Birthday:</span>
                  <span className="detail-value">{client.birthday}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{client.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Verified:</span>
                  <span className="detail-value">{client.isVerified ? "Yes" : "No"}</span>
                </div>
                <div className="action-buttons">
                  <button className="edit-button" onClick={handleEditToggle}>EDIT</button>
                  <button className="delete-button" onClick={handleDeleteClick}>DELETE ACCOUNT</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2 className="delete-modal-title">Are you sure you want to delete {client.name}'s account?</h2>
            <div className="delete-modal-actions">
              <button className="delete-confirm-button" onClick={confirmDelete}>Yes, Delete</button>
              <button className="delete-cancel-button" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ClientDetails;