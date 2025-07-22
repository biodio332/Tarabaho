"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import AdminNavbar from "../components/AdminNavbar";
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
        const res = await axios.get(`${BACKEND_URL}/api/admin/workers`, {
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
          navigate("/admin-login");
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
      navigate("/admin-login");
    } catch (err) {
      console.error("Logout failed:", err.response?.status, err.response?.data);
      Cookies.remove("jwtToken", { path: "/", domain: "localhost" });
      navigate("/admin-login");
    }
  };

  return (
    <div className="admin-manage-trabahador-page">
      <AdminNavbar activePage="manage-trabahador" />

      <div className="manage-trabahador-container">
        <h1 className="manage-trabahador-title">MANAGE TRABAHADOR</h1>

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
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search Trabahadors"
            />
          </div>
          <button onClick={() => navigate("/admin/manage-trabahador/register-worker")} className="add-button">
            Add Trabahador
          </button>
         
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="trabahador-table-container">
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <div className="trabahador-table">
              <div className="trabahador-table-header">
                <div className="table-cell id-cell">ID</div>
                <div className="table-cell name-cell">NAME</div>
                <div className="table-cell username-cell">USERNAME</div>
                <div className="table-cell email-cell">EMAIL</div>
                <div className="table-cell phone-cell">PHONE</div>
                <div className="table-cell birthday-cell">BIRTHDAY</div>
                <div className="table-cell actions-cell"></div>
              </div>
              {filteredTrabahadors.length === 0 ? (
                <div className="no-trabahadors-message">No Trabahadors found.</div>
              ) : (
                filteredTrabahadors.map((trabahador, index) => (
                  <div
                    key={trabahador.id}
                    className={`trabahador-table-row ${index % 2 === 0 ? "even-row" : "odd-row"}`}
                  >
                    <div className="table-cell id-cell">{trabahador.id}</div>
                    <div className="table-cell name-cell">{trabahador.fullName || "Unknown Worker"}</div>
                    <div className="table-cell username-cell">{trabahador.username}</div>
                    <div className="table-cell email-cell">{trabahador.email}</div>
                    <div className="table-cell phone-cell">{trabahador.phoneNumber || "N/A"}</div>
                    <div className="table-cell birthday-cell">{trabahador.birthday || "N/A"}</div>
                    <div className="table-cell actions-cell">
                      <Link
                        to={`/admin/trabahador/${trabahador.id}`}
                        className="view-details-button"
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
                            stroke="#0078ff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                            stroke="#0078ff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        VIEW DETAILS
                      </Link>
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

export default AdminManageTrabahador;