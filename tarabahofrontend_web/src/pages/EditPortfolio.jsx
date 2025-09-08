"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaTrash, FaPen } from "react-icons/fa";
import "../styles/EditPortfolio.css";

const EditPortfolio = () => {
  const { graduateId } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState("/placeholder.svg");
  const [certificates, setCertificates] = useState([]);
  const [modifiedCertificates, setModifiedCertificates] = useState(new Set());
  const [isAddingCertificate, setIsAddingCertificate] = useState(false);
  const [editingCertificateId, setEditingCertificateId] = useState(null);
  const [newCertificate, setNewCertificate] = useState({
    courseName: "",
    certificateNumber: "",
    issueDate: "",
    certificateFile: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const navigate = useNavigate();
  const avatarFileInputRef = useRef(null);
  const certificateFileInputRef = useRef(null);

  const initialPortfolioState = {
    fullName: "",
    professionalSummary: "",
    professionalTitle: "",
    primaryCourseType: "",
    scholarScheme: "",
    designTemplate: "",
    customSectionJson: "",
    visibility: "PRIVATE",
    avatar: "",
    ncLevel: "",
    trainingCenter: "",
    scholarshipType: "",
    trainingDuration: "",
    tesdaRegistrationNumber: "",
    email: "",
    phone: "",
    website: "",
    portfolioCategory: "",
    preferredWorkLocation: "",
    workScheduleAvailability: "",
    salaryExpectations: "",
    skills: [],
    experiences: [],
    awardsRecognitions: [],
    continuingEducations: [],
    professionalMemberships: [],
    references: [],
    projectIds: [],
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching portfolio for graduate ID:", graduateId);
        const portfolioResponse = await axios.get(
          `${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`,
          { withCredentials: true }
        );
        console.log("Portfolio response:", portfolioResponse.data);
        const fetchedPortfolio = portfolioResponse.data;
        setPortfolio({
          ...initialPortfolioState,
          ...fetchedPortfolio,
          professionalSummary: fetchedPortfolio.professionalSummary || "",
          customSectionJson: fetchedPortfolio.customSectionJson || "",
          email: fetchedPortfolio.email || "",
          phone: fetchedPortfolio.phone || "",
          website: fetchedPortfolio.website || "",
          avatar: fetchedPortfolio.avatar || "",
          skills: fetchedPortfolio.skills?.map((skill) => ({
            ...skill,
            name: skill.name || "",
            type: skill.type || "TECHNICAL",
            proficiencyLevel: skill.proficiencyLevel || "",
          })) || [],
          experiences: fetchedPortfolio.experiences?.map((exp) => ({
            ...exp,
            jobTitle: exp.jobTitle || "",
            employer: exp.employer || "",
            description: exp.description || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
          })) || [],
          awardsRecognitions: fetchedPortfolio.awardsRecognitions?.map((award) => ({
            ...award,
            title: award.title || "",
            issuer: award.issuer || "",
            dateReceived: award.dateReceived || "",
          })) || [],
          continuingEducations: fetchedPortfolio.continuingEducations?.map((edu) => ({
            ...edu,
            courseName: edu.courseName || "",
            institution: edu.institution || "",
            completionDate: edu.completionDate || "",
          })) || [],
          professionalMemberships: fetchedPortfolio.professionalMemberships?.map((mem) => ({
            ...mem,
            organization: mem.organization || "",
            membershipType: mem.membershipType || "",
            startDate: mem.startDate || "",
          })) || [],
          references: fetchedPortfolio.references?.map((ref) => ({
            ...ref,
            name: ref.name || "",
            relationship: ref.relationship || "",
            email: ref.email || "",
            phone: ref.phone || "",
          })) || [],
          projectIds: fetchedPortfolio.projectIds || [],
        });
        setPreviewAvatar(fetchedPortfolio.avatar || "/placeholder.svg");

        console.log("Fetching certificates for graduate ID:", graduateId);
        const certificateResponse = await axios.get(
          `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
          { withCredentials: true }
        );
        console.log("Certificates response:", certificateResponse.data);
        setCertificates(
          certificateResponse.data.map((cert) => ({
            id: cert.id,
            courseName: cert.courseName || "",
            certificateNumber: cert.certificateNumber || "",
            issueDate: cert.issueDate || "",
            certificateFilePath: cert.certificateFilePath || null,
            preview: cert.certificateFilePath || "/placeholder.svg",
            portfolioId: cert.portfolioId || fetchedPortfolio.id,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch portfolio or certificates:", err);
        let errorMessage =
          err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load portfolio";
        if (err.response?.status === 401) {
          errorMessage = "Session expired. Please sign in again.";
          console.error("Unauthorized: Redirecting to /signin");
          navigate("/signin");
        } else if (err.response?.status === 404) {
          errorMessage = "Portfolio or certificates not found for this graduate.";
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [graduateId, navigate]);

  const handlePortfolioChange = (e) => {
    const { name, value } = e.target;
    setPortfolio((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setError("Please select an image file for the avatar.");
      return;
    }
    setSelectedAvatarFile(file);
    setPreviewAvatar(file ? URL.createObjectURL(file) : "/placeholder.svg");
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

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleAddCertificate = () => {
    if (!newCertificate.courseName || !newCertificate.certificateNumber || !newCertificate.issueDate) {
      setError("Please fill in all required certificate fields.");
      return;
    }
    const newCert = {
      id: `new-${Date.now()}`,
      courseName: newCertificate.courseName,
      certificateNumber: newCertificate.certificateNumber,
      issueDate: newCertificate.issueDate,
      certificateFile: newCertificate.certificateFile,
      preview: newCertificate.certificateFile ? URL.createObjectURL(newCertificate.certificateFile) : null,
      portfolioId: portfolio.id,
    };
    setCertificates((prev) => [...prev, newCert]);
    setModifiedCertificates((prev) => new Set(prev).add(newCert.id));
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
    });
    setIsAddingCertificate(false);
    setEditingCertificateId(null);
    setError("");
  };

  const handleEditCertificate = (certificate) => {
    setEditingCertificateId(certificate.id);
    setNewCertificate({
      courseName: certificate.courseName,
      certificateNumber: certificate.certificateNumber,
      issueDate: certificate.issueDate,
      certificateFile: null,
    });
    setIsAddingCertificate(true);
  };

  const handleUpdateCertificate = () => {
    if (!newCertificate.courseName || !newCertificate.certificateNumber || !newCertificate.issueDate) {
      setError("Please fill in all required certificate fields.");
      return;
    }
    setCertificates((prev) =>
      prev.map((cert) =>
        cert.id === editingCertificateId
          ? {
              ...cert,
              courseName: newCertificate.courseName,
              certificateNumber: newCertificate.certificateNumber,
              issueDate: newCertificate.issueDate,
              certificateFile: newCertificate.certificateFile || cert.certificateFile,
              preview: newCertificate.certificateFile
                ? URL.createObjectURL(newCertificate.certificateFile)
                : cert.preview,
            }
          : cert
      )
    );
    setModifiedCertificates((prev) => new Set(prev).add(editingCertificateId));
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
    });
    setEditingCertificateId(null);
    setIsAddingCertificate(false);
    setError("");
  };

  const handleRemoveCertificate = (id) => {
    setCertificates((prev) => prev.filter((cert) => cert.id !== id));
    setModifiedCertificates((prev) => new Set(prev).add(id));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setPortfolio((prev) => {
      const updatedArray = [...prev[arrayName]];
      updatedArray[index] = { ...updatedArray[index], [field]: value };
      return { ...prev, [arrayName]: updatedArray };
    });
  };

  const addArrayItem = (arrayName, newItem) => {
    setPortfolio((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...newItem, id: `new-${Date.now()}-${Math.random()}` }],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setPortfolio((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const handleImageClick = () => avatarFileInputRef.current.click();
  const handleCertificateImageClick = () => certificateFileInputRef.current.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      console.log("Submitting portfolio update:", portfolio);
      let avatarUrl = portfolio.avatar || "";
      if (selectedAvatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append("file", selectedAvatarFile);
        console.log("Uploading avatar with FormData:");
        for (const [key, value] of formDataAvatar.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }
        const uploadResponse = await axios.post(
          `${BACKEND_URL}/api/graduate/${graduateId}/upload-picture`,
          formDataAvatar,
          { withCredentials: true }
        );
        avatarUrl = uploadResponse.data.profilePicture;
        console.log("Avatar uploaded:", avatarUrl);
      }

      // Handle certificates
      const certificateIds = [];
      const existingCertificateIds = new Set(
        (
          await axios.get(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
            withCredentials: true,
          })
        ).data.map((cert) => cert.id)
      );

      for (const cert of certificates) {
        if (!modifiedCertificates.has(cert.id)) {
          if (typeof cert.id === "string" && cert.id.includes("new-")) {
            // New certificate, include it
          } else if (existingCertificateIds.has(cert.id)) {
            certificateIds.push(cert.id);
            continue;
          }
        }

        const certificateData = new FormData();
        certificateData.append("courseName", cert.courseName || "");
        certificateData.append("certificateNumber", cert.certificateNumber || "");
        certificateData.append("issueDate", cert.issueDate || "");
        // Only append portfolioId if it exists, as a string
        if (cert.portfolioId) {
          certificateData.append("portfolioId", cert.portfolioId.toString());
        }
        // Only append graduateId for PUT requests
        if (typeof cert.id !== "string" || !cert.id.includes("new-")) {
          certificateData.append("graduateId", graduateId.toString());
        }
        if (cert.certificateFile instanceof File) {
          certificateData.append("certificateFile", cert.certificateFile);
        }

        console.log("Certificate FormData entries for ID:", cert.id);
        for (const [key, value] of certificateData.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }

        if (typeof cert.id === "string" && cert.id.includes("new-")) {
          console.log("Creating new certificate for graduate ID:", graduateId);
          try {
            const certResponse = await axios.post(
              `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
              certificateData,
              { withCredentials: true }
            );
            console.log("Certificate created:", certResponse.data);
            certificateIds.push(certResponse.data.id);
          } catch (err) {
            console.error("Failed to create certificate:", err);
            if (err.response?.status === 401) {
              setError("Session expired. Please sign in again.");
              navigate("/signin");
              return;
            } else if (err.response?.status === 415) {
              setError("Unsupported media type. Please check certificate data format.");
              return;
            } else if (err.response?.status === 400) {
              setError(`Failed to create certificate: ${err.response?.data?.message || "Invalid data"}`);
              return;
            }
            throw err;
          }
        } else {
          console.log("Updating certificate with ID:", cert.id);
          try {
            const certResponse = await axios.put(
              `${BACKEND_URL}/api/certificate/${cert.id}`,
              certificateData,
              { withCredentials: true }
            );
            console.log("Certificate updated:", certResponse.data);
            certificateIds.push(cert.id);
          } catch (err) {
            console.error("Failed to update certificate ID:", cert.id, err);
            if (err.response?.status === 401) {
              setError("Session expired. Please sign in again.");
              navigate("/signin");
              return;
            } else if (err.response?.status === 415) {
              setError("Unsupported media type. Please check certificate data format.");
              return;
            } else if (err.response?.status === 400) {
              setError(`Failed to update certificate: ${err.response?.data?.message || "Invalid data"}`);
              return;
            }
            throw err;
          }
        }
      }

      // Delete certificates that were removed
      const certificatesToDelete = Array.from(existingCertificateIds).filter(
        (id) => !certificates.some((cert) => cert.id === id) && modifiedCertificates.has(id)
      );
      for (const certId of certificatesToDelete) {
        console.log("Deleting certificate ID:", certId);
        await axios.delete(`${BACKEND_URL}/api/certificate/${certId}`, {
          withCredentials: true,
        });
      }

      // Clear modifiedCertificates after processing
      setModifiedCertificates(new Set());

      const payload = {
        graduateId,
        ...portfolio,
        avatar: avatarUrl || null,
        certificateIds,
        skills: portfolio.skills.map((skill) => ({
          id: typeof skill.id === "string" && skill.id.includes("new-") ? null : skill.id,
          name: skill.name,
          type: skill.type,
          proficiencyLevel: skill.proficiencyLevel || null,
        })),
        experiences: portfolio.experiences.map((exp) => ({
          id: typeof exp.id === "string" && exp.id.includes("new-") ? null : exp.id,
          jobTitle: exp.jobTitle,
          employer: exp.employer,
          description: exp.description || null,
          startDate: exp.startDate ? exp.startDate : null,
          endDate: exp.endDate ? exp.endDate : null,
        })),
        awardsRecognitions: portfolio.awardsRecognitions.map((award) => ({
          id: typeof award.id === "string" && award.id.includes("new-") ? null : award.id,
          title: award.title,
          issuer: award.issuer || null,
          dateReceived: award.dateReceived ? award.dateReceived : null,
        })),
        continuingEducations: portfolio.continuingEducations.map((edu) => ({
          id: typeof edu.id === "string" && edu.id.includes("new-") ? null : edu.id,
          courseName: edu.courseName,
          institution: edu.institution || null,
          completionDate: edu.completionDate ? edu.completionDate : null,
        })),
        professionalMemberships: portfolio.professionalMemberships.map((mem) => ({
          id: typeof mem.id === "string" && mem.id.includes("new-") ? null : mem.id,
          organization: mem.organization,
          membershipType: mem.membershipType || null,
          startDate: mem.startDate ? mem.startDate : null,
        })),
        references: portfolio.references.map((ref) => ({
          id: typeof ref.id === "string" && ref.id.includes("new-") ? null : ref.id,
          name: ref.name,
          relationship: ref.relationship || null,
          email: ref.email || null,
          phone: ref.phone || null,
        })),
      };

      console.log("Updating portfolio with payload:", payload);
      await axios.put(
        `${BACKEND_URL}/api/portfolio/${portfolio.id}`,
        payload,
        { withCredentials: true }
      );
      console.log("Portfolio updated successfully");
      setSuccess("Portfolio updated successfully!");
      setTimeout(() => navigate(`/portfolio/${graduateId}`), 2000);
    } catch (err) {
      console.error("Failed to update portfolio:", err);
      let errorMessage =
        err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update portfolio";
      if (err.response?.status === 401) {
        errorMessage = "Session expired. Please sign in again.";
        navigate("/signin");
      } else if (err.response?.status === 404) {
        errorMessage = "Portfolio or certificates not found or update failed.";
      } else if (err.response?.status === 400) {
        errorMessage = `Bad Request: ${err.response?.data?.message || "Invalid data provided."}`;
      } else if (err.response?.status === 415) {
        errorMessage = "Unsupported media type. Please check data format.";
      }
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return <div className="edit-portfolio-loading">Loading...</div>;
  }
  if (error && !success) {
    return <div className="edit-portfolio-error">{error}</div>;
  }
  if (!portfolio) {
    return <div className="edit-portfolio-no-data">No portfolio found or access denied.</div>;
  }

  return (
    <div className="edit-portfolio-page">
      <div className="edit-portfolio-container">
        <h1>Edit Portfolio</h1>
        {success && <div className="edit-portfolio-success">{success}</div>}
        {error && <div className="edit-portfolio-error">{error}</div>}
        <form onSubmit={handleSubmit} className="edit-portfolio-form">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={portfolio.fullName}
              onChange={handlePortfolioChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Professional Summary</label>
            <textarea
              name="professionalSummary"
              value={portfolio.professionalSummary || ""}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Professional Title</label>
            <input
              type="text"
              name="professionalTitle"
              value={portfolio.professionalTitle}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Primary Course Type</label>
            <input
              type="text"
              name="primaryCourseType"
              value={portfolio.primaryCourseType}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Scholar Scheme</label>
            <input
              type="text"
              name="scholarScheme"
              value={portfolio.scholarScheme}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Design Template</label>
            <select
              name="designTemplate"
              value={portfolio.designTemplate}
              onChange={handlePortfolioChange}
            >
              <option value="default">Default</option>
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
            </select>
          </div>
          <div className="form-group">
            <label>Custom Section (JSON)</label>
            <textarea
              name="customSectionJson"
              value={portfolio.customSectionJson || ""}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Visibility</label>
            <select
              name="visibility"
              value={portfolio.visibility}
              onChange={handlePortfolioChange}
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
          <div className="form-group">
            <label>Profile Photo</label>
            <div className="avatar-upload">
              <img
                src={previewAvatar}
                alt="Avatar Preview"
                className="avatar-preview"
                onClick={handleImageClick}
                style={{ cursor: "pointer", width: "100px", height: "100px", borderRadius: "50%" }}
              />
              <p className="avatar-help-text">Click the image or button to upload a profile picture</p>
              <button
                type="button"
                className="avatar-upload-button"
                onClick={handleImageClick}
              >
                Choose Image
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                ref={avatarFileInputRef}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <h2>TESDA Information</h2>
          <div className="form-group">
            <label>NC Level</label>
            <input
              type="text"
              name="ncLevel"
              value={portfolio.ncLevel}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Training Center</label>
            <input
              type="text"
              name="trainingCenter"
              value={portfolio.trainingCenter}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Scholarship Type</label>
            <input
              type="text"
              name="scholarshipType"
              value={portfolio.scholarshipType}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Training Duration</label>
            <input
              type="text"
              name="trainingDuration"
              value={portfolio.trainingDuration}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>TESDA Registration Number</label>
            <input
              type="text"
              name="tesdaRegistrationNumber"
              value={portfolio.tesdaRegistrationNumber}
              onChange={handlePortfolioChange}
            />
          </div>

          <h2>Contact Information</h2>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={portfolio.email}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={portfolio.phone}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="text"
              name="website"
              value={portfolio.website}
              onChange={handlePortfolioChange}
            />
          </div>

          <h2>Employment Readiness</h2>
          <div className="form-group">
            <label>Portfolio Category</label>
            <input
              type="text"
              name="portfolioCategory"
              value={portfolio.portfolioCategory}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Preferred Work Location</label>
            <input
              type="text"
              name="preferredWorkLocation"
              value={portfolio.preferredWorkLocation}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Work Schedule Availability</label>
            <input
              type="text"
              name="workScheduleAvailability"
              value={portfolio.workScheduleAvailability}
              onChange={handlePortfolioChange}
            />
          </div>
          <div className="form-group">
            <label>Salary Expectations</label>
            <input
              type="text"
              name="salaryExpectations"
              value={portfolio.salaryExpectations}
              onChange={handlePortfolioChange}
            />
          </div>

          <h2>Certificates</h2>
          <button
            type="button"
            className="add-certificate-button"
            onClick={() => {
              setIsAddingCertificate(true);
              setEditingCertificateId(null);
              setNewCertificate({
                courseName: "",
                certificateNumber: "",
                issueDate: "",
                certificateFile: null,
              });
            }}
          >
            <FaPlus /> Add Certificate
          </button>
          {isAddingCertificate && (
            <div className="certificate-form">
              <div className="form-group">
                <label htmlFor="courseName">Course Name</label>
                <input
                  type="text"
                  id="courseName"
                  name="courseName"
                  value={newCertificate.courseName}
                  onChange={handleCertificateInputChange}
                  placeholder="Enter course name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="certificateNumber">Certificate Number</label>
                <input
                  type="text"
                  id="certificateNumber"
                  name="certificateNumber"
                  value={newCertificate.certificateNumber}
                  onChange={handleCertificateInputChange}
                  placeholder="Enter certificate number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="issueDate">Issue Date</label>
                <input
                  type="date"
                  id="issueDate"
                  name="issueDate"
                  value={newCertificate.issueDate}
                  onChange={handleCertificateInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="certificateFile">Certificate File</label>
                <div className="certificate-upload">
                  <img
                    src={
                      newCertificate.certificateFile
                        ? URL.createObjectURL(newCertificate.certificateFile)
                        : "/placeholder.svg"
                    }
                    alt="Certificate Preview"
                    className="certificate-preview"
                    onClick={handleCertificateImageClick}
                    style={{ cursor: "pointer", width: "100px", height: "100px" }}
                  />
                  <button
                    type="button"
                    className="certificate-upload-button"
                    onClick={handleCertificateImageClick}
                  >
                    Choose File
                  </button>
                  <input
                    type="file"
                    id="certificateFile"
                    accept="image/*"
                    onChange={handleCertificateFileChange}
                    ref={certificateFileInputRef}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
              <div className="certificate-form-actions">
                <button
                  type="button"
                  className="certificate-save-button"
                  onClick={editingCertificateId ? handleUpdateCertificate : handleAddCertificate}
                >
                  {editingCertificateId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="certificate-cancel-button"
                  onClick={() => {
                    setIsAddingCertificate(false);
                    setEditingCertificateId(null);
                    setNewCertificate({
                      courseName: "",
                      certificateNumber: "",
                      issueDate: "",
                      certificateFile: null,
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {certificates.length > 0 && (
            <div className="certificate-list">
              <h4>Added Certificates</h4>
              {certificates.map((cert) => (
                <div key={cert.id} className="certificate-item">
                  <div className="certificate-details">
                    <h5>{cert.courseName}</h5>
                    <p>Certificate Number: {cert.certificateNumber}</p>
                    <p>Issue Date: {cert.issueDate}</p>
                    {cert.preview && (
                      <img
                        src={cert.preview}
                        alt="Certificate Preview"
                        className="certificate-preview"
                        style={{ width: "50px", height: "50px" }}
                      />
                    )}
                  </div>
                  <div className="certificate-actions">
                    <button
                      type="button"
                      className="certificate-edit-button"
                      onClick={() => handleEditCertificate(cert)}
                    >
                      <FaPen />
                    </button>
                    <button
                      type="button"
                      className="certificate-remove-button"
                      onClick={() => handleRemoveCertificate(cert.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2>Skills</h2>
          {portfolio.skills.map((skill, index) => (
            <div key={skill.id || `skill-${index}`} className="array-item">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => handleArrayChange("skills", index, "name", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={skill.type}
                  onChange={(e) => handleArrayChange("skills", index, "type", e.target.value)}
                  required
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="LANGUAGE">Language</option>
                  <option value="DIGITAL">Digital</option>
                  <option value="SOFT">Soft</option>
                  <option value="INDUSTRY_SPECIFIC">Industry Specific</option>
                </select>
              </div>
              <div className="form-group">
                <label>Proficiency Level</label>
                <input
                  type="text"
                  value={skill.proficiencyLevel}
                  onChange={(e) =>
                    handleArrayChange("skills", index, "proficiencyLevel", e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem("skills", index)}
                className="remove-button"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addArrayItem("skills", { name: "", type: "TECHNICAL", proficiencyLevel: "" })
            }
            className="add-button"
          >
            <FaPlus /> Add Skill
          </button>

          <h2>Experiences</h2>
          {portfolio.experiences.map((exp, index) => (
            <div key={exp.id || `exp-${index}`} className="array-item">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={exp.jobTitle}
                  onChange={(e) => handleArrayChange("experiences", index, "jobTitle", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Employer</label>
                <input
                  type="text"
                  value={exp.employer}
                  onChange={(e) => handleArrayChange("experiences", index, "employer", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={exp.description || ""}
                  onChange={(e) =>
                    handleArrayChange("experiences", index, "description", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={exp.startDate ? exp.startDate : ""}
                  onChange={(e) =>
                    handleArrayChange("experiences", index, "startDate", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={exp.endDate ? exp.endDate : ""}
                  onChange={(e) => handleArrayChange("experiences", index, "endDate", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem("experiences", index)}
                className="remove-button"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addArrayItem("experiences", {
                jobTitle: "",
                employer: "",
                description: "",
                startDate: "",
                endDate: "",
              })
            }
            className="add-button"
          >
            <FaPlus /> Add Experience
          </button>

          <h2>Awards & Recognitions</h2>
          {portfolio.awardsRecognitions.map((award, index) => (
            <div key={award.id || `award-${index}`} className="array-item">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={award.title}
                  onChange={(e) =>
                    handleArrayChange("awardsRecognitions", index, "title", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Issuer</label>
                <input
                  type="text"
                  value={award.issuer}
                  onChange={(e) =>
                    handleArrayChange("awardsRecognitions", index, "issuer", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Date Received</label>
                <input
                  type="date"
                  value={award.dateReceived ? award.dateReceived : ""}
                  onChange={(e) =>
                    handleArrayChange("awardsRecognitions", index, "dateReceived", e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem("awardsRecognitions", index)}
                className="remove-button"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addArrayItem("awardsRecognitions", { title: "", issuer: "", dateReceived: "" })
            }
            className="add-button"
          >
            <FaPlus /> Add Award
          </button>

          <h2>Continuing Education</h2>
          {portfolio.continuingEducations.map((edu, index) => (
            <div key={edu.id || `edu-${index}`} className="array-item">
              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  value={edu.courseName}
                  onChange={(e) =>
                    handleArrayChange("continuingEducations", index, "courseName", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) =>
                    handleArrayChange("continuingEducations", index, "institution", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Completion Date</label>
                <input
                  type="date"
                  value={edu.completionDate ? edu.completionDate : ""}
                  onChange={(e) =>
                    handleArrayChange("continuingEducations", index, "completionDate", e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem("continuingEducations", index)}
                className="remove-button"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addArrayItem("continuingEducations", {
                courseName: "",
                institution: "",
                completionDate: "",
              })
            }
            className="add-button"
          >
            <FaPlus /> Add Education
          </button>

          <h2>Professional Memberships</h2>
          {portfolio.professionalMemberships.map((mem, index) => (
            <div key={mem.id || `mem-${index}`} className="array-item">
              <div className="form-group">
                <label>Organization</label>
                <input
                  type="text"
                  value={mem.organization}
                  onChange={(e) =>
                    handleArrayChange("professionalMemberships", index, "organization", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Membership Type</label>
                <input
                  type="text"
                  value={mem.membershipType}
                  onChange={(e) =>
                    handleArrayChange("professionalMemberships", index, "membershipType", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={mem.startDate ? mem.startDate : ""}
                  onChange={(e) =>
                    handleArrayChange("professionalMemberships", index, "startDate", e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem("professionalMemberships", index)}
                className="remove-button"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addArrayItem("professionalMemberships", {
                organization: "",
                membershipType: "",
                startDate: "",
              })
            }
            className="add-button"
          >
            <FaPlus /> Add Membership
          </button>

          <h2>References</h2>
          {portfolio.references.map((ref, index) => (
            <div key={ref.id || `ref-${index}`} className="array-item">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={ref.name}
                  onChange={(e) => handleArrayChange("references", index, "name", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <input
                  type="text"
                  value={ref.relationship}
                  onChange={(e) =>
                    handleArrayChange("references", index, "relationship", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={ref.email}
                  onChange={(e) => handleArrayChange("references", index, "email", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={ref.phone}
                  onChange={(e) => handleArrayChange("references", index, "phone", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem("references", index)}
                className="remove-button"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addArrayItem("references", { name: "", relationship: "", email: "", phone: "" })
            }
            className="add-button"
          >
            <FaPlus /> Add Reference
          </button>

          <div className="form-actions">
            <button type="submit" className="save-button">
              Save Changes
            </button>
            <Link to={`/portfolio/${graduateId}`} className="cancel-button">
              Back to View
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPortfolio;