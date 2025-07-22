"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/Admin-manage-users.css";

const AdminManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/admin/me`, {
          withCredentials: true,
        });
        setIsAdmin(true);
        console.log("Valid admin token found");
      } catch (error) {
        setIsAdmin(false);
        console.log("No valid admin token");
        if (error.response?.status === 401 || error.response?.status === 404) {
          navigate("/admin-login");
        }
      }
    };

    checkAdminStatus();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/users`, {
          withCredentials: true,
        });
        setUsers(res.data);
        setFilteredUsers(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users");
        setIsLoading(false);
        if (err.response?.status === 401) {
          navigate("/admin-login");
        }
      }
    };

    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      ["firstname", "lastname", "email"].some((field) =>
        String(user[field]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleBack = () => {
    navigate(isAdmin ? "/admin/homepage" : "/admin-login");
  };

  const handleAddUser = () => {
    navigate("/admin/manage-users/register-user");
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/logout`, {}, { withCredentials: true });
      Cookies.remove("jwtToken", { path: "/", domain: "localhost" });
      navigate("/admin-login");
    } catch (err) {
      console.error("Logout failed:", err.response?.status, err.response?.data);
      Cookies.remove("jwtToken", { path: "/", domain: "localhost" });
      navigate("/admin-login");
    }
  };

  const handleViewDetails = (userId) => {
    navigate(`/admin/client/${userId}`);
  };

  return (
    <div className="admin-manage-users-page">
     
      <AdminNavbar activePage="manage-users" />

      <div className="manage-users-container">
        <h1 className="manage-users-title">MANAGE CLIENTS</h1>

        <div className="search-bar-container">
          <div className="search-bar">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="11" cy="11" r="7" stroke="#666" strokeWidth="2" />
              <path d="M16 16L20 20" stroke="#666" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search users"
            />
          </div>
          <button onClick={handleAddUser} className="add-button">
            Add User
          </button>
    
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="users-table-container">
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <div className="users-table">
              <div className="users-table-header">
                <div className="table-cell id-cell">ID</div>
                <div className="table-cell name-cell">Full Name</div>
                <div className="table-cell email-cell">Email</div>
                <div className="table-cell phone-cell">Phone Number</div>
                <div className="table-cell address-cell">Address</div>
                <div className="table-cell verified-cell">Verified</div>
                <div className="table-cell actions-cell"></div>
              </div>
              {filteredUsers.length === 0 ? (
                <div className="no-users-message">No users found.</div>
              ) : (
                filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={`users-table-row ${index % 2 === 0 ? "even-row" : "odd-row"}`}
                  >
                    <div className="table-cell id-cell">{user.id}</div>
                    <div className="table-cell name-cell">{`${user.firstname} ${user.lastname}`}</div>
                    <div className="table-cell email-cell">{user.email}</div>
                    <div className="table-cell phone-cell">{user.phoneNumber || "N/A"}</div>
                    <div className="table-cell address-cell">{user.address || "N/A"}</div>
                    <div className="table-cell verified-cell">{user.isVerified ? "Yes" : "No"}</div>
                    <div className="table-cell actions-cell">
                      <button
                        className="view-details-button"
                        onClick={() => handleViewDetails(user.id)}
                        aria-label={`View details for ${user.firstname} ${user.lastname}`}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageUsers;