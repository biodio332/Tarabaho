"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import TrabahadorNavbar from "../components/TrabahadorNavbar";
import Footer from "../components/Footer";
import "../styles/TrabahadorHomepage.css";
import { FaPlus, FaTimes } from "react-icons/fa";

const TrabahadorHomepage = () => {
  const [trabahadorName, setTrabahadorName] = useState("");
  const [graduateData, setGraduateData] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    courseName: "",
    certificateNumber: "",
    issueDate: "",
    certificateFile: null,
  });
  const [token, setToken] = useState(null);
  const certificateFileInputRef = useRef(null);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchTrabahadorProfile = async () => {
      setIsLoading(true);
      console.log("Cookies:", document.cookie);

      const username = localStorage.getItem("username");
      if (!username) {
        console.log("No username found, redirecting to signin");
        setError("User not logged in. Please sign in.");
        navigate("/signin");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch token from backend
        console.log("Fetching token from /api/graduate/get-token");
        const tokenResponse = await axios.get(`${BACKEND_URL}/api/graduate/get-token`, {
          withCredentials: true,
        });
        const fetchedToken = tokenResponse.data.token;
        if (!fetchedToken) {
          console.log("No token received, redirecting to signin");
          setError("Authentication token missing. Please sign in again.");
          navigate("/signin");
          setIsLoading(false);
          return;
        }
        setToken(fetchedToken);
        console.log("Token received:", fetchedToken);

        console.log("Fetching graduate with username:", username);
        const graduateResponse = await axios.get(
          `${BACKEND_URL}/api/graduate/username/${username}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${fetchedToken}` },
          }
        );
        const graduateData = graduateResponse.data;
        console.log("Graduate data received:", graduateData);

        if (graduateData) {
          setTrabahadorName(graduateData.firstName || "");
          setGraduateData(graduateData);
          localStorage.setItem("username", graduateData.username);

          // Fetch certificates
          try {
            const certificateResponse = await axios.get(
              `${BACKEND_URL}/api/certificate/graduate/${graduateData.id}`,
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${fetchedToken}` },
              }
            );
            console.log("Certificates received:", certificateResponse.data);
            setCertificates(certificateResponse.data || []);
          } catch (certificateErr) {
            console.error("Failed to fetch certificates:", certificateErr.response?.data || certificateErr.message);
            if (certificateErr.response?.status === 401) {
              console.log("Unauthorized certificate request, logging out");
              setError("Session expired. Please sign in again.");
              localStorage.removeItem("isLoggedIn");
              localStorage.removeItem("userType");
              localStorage.removeItem("username");
              document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              navigate("/signin");
            } else {
              console.log("No certificates found, setting empty array");
              setCertificates([]);
            }
          }

          // Fetch portfolio data
          try {
            const portfolioResponse = await axios.get(
              `${BACKEND_URL}/api/portfolio/graduate/${graduateData.id}/portfolio`,
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${fetchedToken}` },
              }
            );
            console.log("Portfolio data received:", portfolioResponse.data);
            setPortfolio(portfolioResponse.data);
          } catch (portfolioErr) {
            if (portfolioErr.response?.status === 404) {
              console.log("No portfolio found for graduate ID:", graduateData.id);
              setPortfolio(null);
            } else if (portfolioErr.response?.status === 401) {
              console.log("Unauthorized portfolio request, logging out");
              setError("Session expired. Please sign in again.");
              localStorage.removeItem("isLoggedIn");
              localStorage.removeItem("userType");
              localStorage.removeItem("username");
              document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              navigate("/signin");
            } else {
              console.error("Portfolio fetch error:", portfolioErr.response?.data || portfolioErr.message);
              setPortfolio(null);
            }
          }
        } else {
          setError("Graduate profile not found");
        }
      } catch (err) {
        console.error("Failed to fetch profile or token:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          console.log("Unauthorized request, logging out");
          setError("Session expired. Please sign in again.");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userType");
          localStorage.removeItem("username");
          document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          navigate("/signin");
        } else {
          setError(`Error ${err.response?.status || "Unknown"}: ${err.response?.data?.message || err.response?.statusText || "Failed to load profile data"}`);
        }
      } finally {
        setIsLoading(false);
      }

      console.log("Rendering: isLoading=", isLoading, "certificates=", certificates, "portfolio=", portfolio);
    };

    fetchTrabahadorProfile();
  }, [navigate]);

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleCertificateFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setError("Please select an image file for the certificate.");
      return;
    }
    setNewCertificate((prev) => ({ ...prev, certificateFile: file }));
    setError("");
  };

  const handleCertificateImageClick = () => {
    certificateFileInputRef.current.click();
  };

  const handleAddCertificate = async () => {
    try {
      if (!newCertificate.courseName || !newCertificate.certificateNumber || !newCertificate.issueDate || !newCertificate.certificateFile) {
        setError("Please fill in all certificate fields and select a file.");
        return;
      }

      if (!token || !graduateData?.id) {
        setError("Session expired or graduate ID missing. Please sign in again.");
        navigate("/signin");
        return;
      }

      console.log("Adding certificate for graduate ID:", graduateData.id);
      console.log("Cookies before request:", document.cookie);
      const certificateData = new FormData();
      certificateData.append("courseName", newCertificate.courseName);
      certificateData.append("certificateNumber", newCertificate.certificateNumber);
      certificateData.append("issueDate", newCertificate.issueDate);
      certificateData.append("certificateFile", newCertificate.certificateFile);

      const response = await axios.post(
        `${BACKEND_URL}/api/certificate/graduate/${graduateData.id}`,
        certificateData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Certificate added:", response.data);
      setCertificates((prev) => {
        const updatedCertificates = [...prev, response.data];
        console.log("Updated certificates state:", updatedCertificates);
        return updatedCertificates;
      });
      setNewCertificate({
        courseName: "",
        certificateNumber: "",
        issueDate: "",
        certificateFile: null,
      });
      setShowCertificateModal(false);
      setError("");
    } catch (err) {
      console.error("Failed to add certificate:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.response?.data || "Failed to add certificate. Please try again.";
      setError(errorMessage);
      if (err.response?.status === 401) {
        console.log("Unauthorized certificate request, logging out");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userType");
        localStorage.removeItem("username");
        document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate("/signin");
      }
    }
  };

  const handleCertificateModalClose = () => {
    setShowCertificateModal(false);
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
    });
    setError("");
  };

  const handleCreatePortfolioClick = () => {
    console.log("handleCreatePortfolioClick: certificates length:", certificates.length);
    if (certificates.length === 0) {
      console.log("No certificates, opening certificate modal");
      setShowCertificateModal(true);
    } else {
      console.log("Certificates exist, redirecting to /create-portfolio");
      navigate("/create-portfolio");
    }
  };

  return (
    <div className="trabahador-homepage">
      <TrabahadorNavbar activePage="homepage" />
      <div className="trabahador-main-content">
        <div className="trabahador-content-overlay">
          <div className="trabahador-welcome-container">
            <div className="trabahador-logo-container">
              <div className="trabahador-logo">
                T A R A B A H
                <svg
                  className="trabahador-logo-icon"
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="8" stroke="#0078FF" strokeWidth="2" fill="none" />
                  <path d="M18 18L22 22" stroke="#0078FF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="trabahador-tagline">T A R A ! T R A B A H O</div>
            </div>

            {isLoading ? (
              <div className="trabahador-loading">Loading...</div>
            ) : error ? (
              <div className="trabahador-error">{error}</div>
            ) : (
              <>
                <h1 className="trabahador-welcome-heading">
                  WELCOME {trabahadorName ? trabahadorName.toUpperCase() : "GRADUATE"}!
                </h1>
                <div className="trabahador-actions">
                  {portfolio ? (
                    <div className="trabahador-portfolio-stats">
                      <h3>Portfolio Statistics</h3>
                      <p>Projects: {portfolio.projects?.length || 0}</p>
                      <p>Skills: {portfolio.skills?.length || 0}</p>
                      <p>Created: {new Date(portfolio.createdAt).toLocaleDateString()}</p>
                      <Link to={`/portfolio/${graduateData?.id}`} className="trabahador-action-button">
                        View Portfolio
                      </Link>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleCreatePortfolioClick}
                        className="trabahador-action-button"
                        disabled={isLoading}
                      >
                        CREATE PORTFOLIO
                      </button>
                      {certificates.length > 0 && (
                        <Link to="/create-portfolio" className="trabahador-action-button secondary">
                          Proceed to Create Portfolio
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showCertificateModal && (
        <div className="modal-overlay">
          <div className="certificate-modal">
            <h2 className="certificate-modal-title">Upload TESDA Certificate</h2>
            {error && <div className="error-message">{error}</div>}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="save-btn"
                  onClick={handleAddCertificate}
                  disabled={isLoading}
                >
                  Add Certificate
                </button>
                <button
                  className="cancel-btn"
                  onClick={handleCertificateModalClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TrabahadorHomepage;