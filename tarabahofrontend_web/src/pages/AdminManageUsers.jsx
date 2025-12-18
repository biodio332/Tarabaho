"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
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

  if (isLoading) return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminNavbar activePage="manage-users" />
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading users...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminNavbar activePage="manage-users" />
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700 font-semibold">Error Loading Users</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminNavbar activePage="manage-users" />
      <main className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white border-b-4 border-blue-700 shadow-sm mb-8">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Clients</h1>
                  <p className="text-gray-600 text-base">View and manage registered client accounts</p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-6 py-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Clients</p>
                    <p className="text-blue-700 font-semibold text-lg">{filteredUsers.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Actions Bar */}
          <div className="bg-white shadow-md rounded-sm border border-gray-200 mb-8">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full md:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                    aria-label="Search users"
                  />
                </div>
                <button
                  onClick={handleAddUser}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add User
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white shadow-md rounded-sm border border-gray-200">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-2">Full Name</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-1">Phone</div>
                    <div className="col-span-3">Address</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new user.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredUsers.map((user, index) => (
                      <div
                        key={user.id}
                        className={`grid grid-cols-12 gap-4 px-6 py-4 text-sm hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <div className="col-span-1 flex items-center text-gray-900 font-medium">
                          {user.id}
                        </div>
                        <div className="col-span-2 flex items-center text-gray-900">
                          {`${user.firstname || ""} ${user.lastname || ""}`.trim() || "N/A"}
                        </div>
                        <div className="col-span-3 flex items-center text-gray-700">
                          {user.email}
                        </div>
                        <div className="col-span-1 flex items-center text-gray-700">
                          {user.phoneNumber || "N/A"}
                        </div>
                        <div className="col-span-3 flex items-center text-gray-700">
                          {user.address || "N/A"}
                        </div>
                        <div className="col-span-2 flex items-center justify-end">
                          <button
                            onClick={() => handleViewDetails(user.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm font-semibold text-sm transition-colors"
                            aria-label={`View details for ${user.firstname} ${user.lastname}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminManageUsers;