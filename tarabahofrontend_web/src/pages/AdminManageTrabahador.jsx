"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
import "../styles/admin-manage-trabahador.css";

const AdminManageTrabahador = () => {
  const [trabahadors, setTrabahadors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTrabahadors, setFilteredTrabahadors] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchTrabahadors = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/graduates`, {
          withCredentials: true,
        });
        // Map response to include fullName
        const workers = res.data.map(worker => ({
          ...worker,
          fullName: `${worker.firstName || ""} ${worker.lastName || ""}`.trim(),
        }));
        setTrabahadors(workers);
        setFilteredTrabahadors(workers);
        setIsLoading(false);
        console.log("Fetched workers:", workers);
      } catch (err) {
        console.error("Failed to fetch workers:", err);
        setError("Failed to load workers");
        setIsLoading(false);
        if (err.response?.status === 401) {
          navigate("/admin-portal-login-tarabaho-67");
        }
      }
    };

    fetchTrabahadors();
  }, [navigate]);

  useEffect(() => {
    const filtered = trabahadors.filter((trabahador) =>
      ["fullName", "username", "email"].some((field) =>
        String(trabahador[field]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredTrabahadors(filtered);
  }, [searchTerm, trabahadors]);

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/logout`, {}, { withCredentials: true });
      Cookies.remove("jwtToken", { path: "/", domain: "localhost" });
      navigate("/admin-portal-login-tarabaho-67");
    } catch (err) {
      console.error("Logout failed:", err.response?.status, err.response?.data);
      Cookies.remove("jwtToken", { path: "/", domain: "localhost" });
      navigate("/admin-portal-login-tarabaho-67");
    }
  };

  if (isLoading) return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminNavbar activePage="manage-trabahador" />
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading graduates...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminNavbar activePage="manage-trabahador" />
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700 font-semibold">Error Loading Graduates</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminNavbar activePage="manage-trabahador" />
      <main className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white border-b-4 border-green-700 shadow-sm mb-8">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Graduates</h1>
                  <p className="text-gray-600 text-base">View and manage graduate accounts</p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg px-6 py-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Graduates</p>
                    <p className="text-green-700 font-semibold text-lg">{filteredTrabahadors.length}</p>
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
                    placeholder="Search by name, username, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-600 focus:border-green-600 text-sm"
                    aria-label="Search Trabahadors"
                  />
                </div>
                <button
                  onClick={() => navigate("/admin/manage-graduate/register-graduate")}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Graduate
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
                    <div className="col-span-2">NAME</div>
                    <div className="col-span-2">USERNAME</div>
                    <div className="col-span-2">EMAIL</div>
                    <div className="col-span-1">PHONE</div>
                    <div className="col-span-1">BIRTHDAY</div>
                    <div className="col-span-1">VERIFIED</div>
                    <div className="col-span-2 text-right">ACTIONS</div>
                  </div>
                </div>

                {/* Table Body */}
                {filteredTrabahadors.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Graduates found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new Graduate.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredTrabahadors.map((trabahador, index) => (
                      <div
                        key={trabahador.id}
                        className={`grid grid-cols-12 gap-4 px-6 py-4 text-sm hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <div className="col-span-1 flex items-center text-gray-900 font-medium">
                          {trabahador.id}
                        </div>
                        <div className="col-span-2 flex items-center text-gray-900 min-w-0">
                          <span className="truncate" title={trabahador.fullName || "Unknown Worker"}>
                            {trabahador.fullName || "Unknown Worker"}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center text-gray-700 min-w-0">
                          <span className="truncate" title={trabahador.username}>
                            {trabahador.username}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center text-gray-700 min-w-0">
                          <span className="truncate" title={trabahador.email}>
                            {trabahador.email}
                          </span>
                        </div>
                        <div className="col-span-1 flex items-center text-gray-700 min-w-0">
                          <span className="truncate" title={trabahador.phoneNumber || "N/A"}>
                            {trabahador.phoneNumber || "N/A"}
                          </span>
                        </div>
                        <div className="col-span-1 flex items-center text-gray-700 min-w-0">
                          <span className="truncate" title={trabahador.birthday || "N/A"}>
                            {trabahador.birthday || "N/A"}
                          </span>
                        </div>
                        <div className="col-span-1 flex items-center min-w-0">
                          <span className={`verified-badge ${trabahador.isVerified ? 'verified' : 'not-verified'}`}>
                            {trabahador.isVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end min-w-0">
                          <Link
                            to={`/admin/graduate/${trabahador.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm font-semibold text-sm transition-colors"
                            aria-label={`View details of ${trabahador.fullName || "worker"}`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            View Details
                          </Link>
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

export default AdminManageTrabahador;
