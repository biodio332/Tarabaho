"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaTrash, FaPen } from "react-icons/fa";
import "../styles/PortfolioCreation.css";

const PortfolioCreation = () => {
  const [formData, setFormData] = useState({
    professionalSummary: "",
    primaryCourseType: "",
    scholarScheme: "",
    designTemplate: "default",
    customSectionJson: "",
    visibility: "PUBLIC",
    avatar: "",
    fullName: "",
    professionalTitle: "",
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
  });
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState("/placeholder.svg");
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [awardsRecognitions, setAwardsRecognitions] = useState([]);
  const [continuingEducations, setContinuingEducations] = useState([]);
  const [professionalMemberships, setProfessionalMemberships] = useState([]);
  const [references, setReferences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [isAddingAward, setIsAddingAward] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [isAddingMembership, setIsAddingMembership] = useState(false);
  const [isAddingReference, setIsAddingReference] = useState(false);
  const [isAddingCertificate, setIsAddingCertificate] = useState(false);
  const [editingCertificateId, setEditingCertificateId] = useState(null);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    projectFile: null,
  });
  const [newSkill, setNewSkill] = useState({
    name: "",
    type: "TECHNICAL",
    proficiencyLevel: "",
  });
  const [newExperience, setNewExperience] = useState({
    jobTitle: "",
    company: "",
    duration: "",
    responsibilities: "",
  });
  const [newAward, setNewAward] = useState({
    title: "",
    issuer: "",
    dateReceived: "",
  });
  const [newEducation, setNewEducation] = useState({
    courseName: "",
    institution: "",
    completionDate: "",
  });
  const [newMembership, setNewMembership] = useState({
    organization: "",
    membershipType: "",
    startDate: "",
  });
  const [newReference, setNewReference] = useState({
    name: "",
    position: "",
    company: "",
    contact: "",
    email: "",
  });
  const [newCertificate, setNewCertificate] = useState({
    courseName: "",
    certificateNumber: "",
    issueDate: "",
    certificateFile: null,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [graduateId, setGraduateId] = useState(null);
  const navigate = useNavigate();
  const avatarFileInputRef = useRef(null);
  const projectFileInputRef = useRef(null);
  const certificateFileInputRef = useRef(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const validSkillTypes = ["TECHNICAL", "LANGUAGE", "DIGITAL", "SOFT", "INDUSTRY_SPECIFIC"];

  useEffect(() => {
    const fetchTokenAndProfileData = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) {
          setError("User not logged in. Please sign in.");
          navigate("/signin");
          return;
        }

        const tokenResponse = await axios.get(`${BACKEND_URL}/api/graduate/get-token`, {
          withCredentials: true,
        });
        const fetchedToken = tokenResponse.data.token;
        if (!fetchedToken) {
          setError("Authentication token missing. Please sign in again.");
          navigate("/signin");
          return;
        }
        setToken(fetchedToken);

        const graduateResponse = await axios.get(`${BACKEND_URL}/api/graduate/username/${username}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${fetchedToken}` },
        });
        setGraduateId(graduateResponse.data.id);
        if (graduateResponse.data.profilePicture) {
          setPreviewAvatar(graduateResponse.data.profilePicture);
          setFormData((prev) => ({ ...prev, avatar: graduateResponse.data.profilePicture }));
        }
      } catch (err) {
        setError("Failed to load profile data. Please try again.");
        if (err.response?.status === 401) navigate("/signin");
      }
    };
    fetchTokenAndProfileData();
  }, [BACKEND_URL, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleProjectFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Please select an image or PDF file for the project sample.");
      return;
    }
    setNewProject((prev) => ({ ...prev, projectFile: file }));
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

  const handleSkillInputChange = (e) => {
    const { name, value } = e.target;
    setNewSkill((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleExperienceInputChange = (e) => {
    const { name, value } = e.target;
    setNewExperience((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleAwardInputChange = (e) => {
    const { name, value } = e.target;
    setNewAward((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleEducationInputChange = (e) => {
    const { name, value } = e.target;
    setNewEducation((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleMembershipInputChange = (e) => {
    const { name, value } = e.target;
    setNewMembership((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleReferenceInputChange = (e) => {
    const { name, value } = e.target;
    setNewReference((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleAddSkill = () => {
    if (!newSkill.name || newSkill.name.trim() === "") {
      setError("Please fill in the skill name.");
      return;
    }
    if (!validSkillTypes.includes(newSkill.type)) {
      setError(`Please select a valid skill type: ${validSkillTypes.join(", ")}`);
      return;
    }
    setSkills((prev) => [...prev, { ...newSkill }]);
    setNewSkill({ name: "", type: "TECHNICAL", proficiencyLevel: "" });
    setIsAddingSkill(false);
    setError("");
  };

  const handleAddExperience = () => {
    if (!newExperience.jobTitle || !newExperience.company) {
      setError("Please fill in the job title and company.");
      return;
    }
    setExperiences((prev) => [...prev, { ...newExperience }]);
    setNewExperience({ jobTitle: "", company: "", duration: "", responsibilities: "" });
    setIsAddingExperience(false);
    setError("");
  };

  const handleAddAward = () => {
    if (!newAward.title) {
      setError("Please fill in the award title.");
      return;
    }
    setAwardsRecognitions((prev) => [...prev, { ...newAward }]);
    setNewAward({ title: "", issuer: "", dateReceived: "" });
    setIsAddingAward(false);
    setError("");
  };

  const handleAddEducation = () => {
    if (!newEducation.courseName) {
      setError("Please fill in the course name.");
      return;
    }
    setContinuingEducations((prev) => [...prev, { ...newEducation }]);
    setNewEducation({ courseName: "", institution: "", completionDate: "" });
    setIsAddingEducation(false);
    setError("");
  };

  const handleAddMembership = () => {
    if (!newMembership.organization) {
      setError("Please fill in the organization name.");
      return;
    }
    setProfessionalMemberships((prev) => [...prev, { ...newMembership }]);
    setNewMembership({ organization: "", membershipType: "", startDate: "" });
    setIsAddingMembership(false);
    setError("");
  };

  const handleAddProject = () => {
    if (!newProject.title || !newProject.projectFile) {
      setError("Please fill in the project title and select a file.");
      return;
    }
    setProjects((prev) => [
      ...prev,
      {
        title: newProject.title,
        description: newProject.description,
        projectFile: newProject.projectFile,
        preview: newProject.projectFile.type.startsWith("image/")
          ? URL.createObjectURL(newProject.projectFile)
          : null,
      },
    ]);
    setNewProject({ title: "", description: "", projectFile: null });
    setIsAddingProject(false);
    setError("");
  };

  const handleAddReference = () => {
    if (!newReference.name) {
      setError("Please fill in the reference name.");
      return;
    }
    setReferences((prev) => [...prev, { ...newReference }]);
    setNewReference({ name: "", position: "", company: "", contact: "", email: "" });
    setIsAddingReference(false);
    setError("");
  };

  const handleAddCertificate = () => {
    if (!newCertificate.courseName || !newCertificate.certificateNumber || !newCertificate.issueDate) {
      setError("Please fill in all required certificate fields.");
      return;
    }
    setCertificates((prev) => [
      ...prev,
      {
        id: Date.now(), // Temporary ID for frontend
        courseName: newCertificate.courseName,
        certificateNumber: newCertificate.certificateNumber,
        issueDate: newCertificate.issueDate,
        certificateFile: newCertificate.certificateFile,
        preview: newCertificate.certificateFile ? URL.createObjectURL(newCertificate.certificateFile) : null,
      },
    ]);
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
    });
    setIsAddingCertificate(false);
    setError("");
  };

  const handleEditCertificate = (certificate) => {
    setEditingCertificateId(certificate.id);
    setNewCertificate({
      courseName: certificate.courseName,
      certificateNumber: certificate.certificateNumber,
      issueDate: certificate.issueDate,
      certificateFile: certificate.certificateFile,
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
              certificateFile: newCertificate.certificateFile,
              preview: newCertificate.certificateFile ? URL.createObjectURL(newCertificate.certificateFile) : cert.preview,
            }
          : cert
      )
    );
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
  };

  const handleRemoveSkill = (index) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExperience = (index) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAward = (index) => {
    setAwardsRecognitions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveEducation = (index) => {
    setContinuingEducations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveMembership = (index) => {
    setProfessionalMemberships((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveProject = (index) => {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveReference = (index) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = () => avatarFileInputRef.current.click();
  const handleProjectImageClick = () => projectFileInputRef.current.click();
  const handleCertificateImageClick = () => certificateFileInputRef.current.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const validatedSkills = skills.map((skill) => {
      if (!skill.name || skill.name.trim() === "") {
        throw new Error("Skill name is required.");
      }
      if (!validSkillTypes.includes(skill.type)) {
        throw new Error(`Invalid skill type for ${skill.name}. Must be one of: ${validSkillTypes.join(", ")}`);
      }
      return {
        name: skill.name,
        type: skill.type,
        proficiencyLevel: skill.proficiencyLevel || null,
      };
    });

    try {
      const username = localStorage.getItem("username");
      if (!username || !token || !graduateId) {
        setError("User not logged in, token missing, or graduate ID not found. Please sign in.");
        navigate("/signin");
        setIsLoading(false);
        return;
      }

      let avatarUrl = formData.avatar || "";
      if (selectedAvatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append("file", selectedAvatarFile);
        const uploadResponse = await axios.post(
          `${BACKEND_URL}/api/graduate/${graduateId}/upload-picture`,
          formDataAvatar,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          }
        );
        avatarUrl = uploadResponse.data.profilePicture;
      }

      const certificateIds = [];
      for (const cert of certificates) {
        const certificateData = new FormData();
        certificateData.append("courseName", cert.courseName);
        certificateData.append("certificateNumber", cert.certificateNumber);
        certificateData.append("issueDate", cert.issueDate);
        if (cert.certificateFile) {
          certificateData.append("certificateFile", cert.certificateFile);
        }
        const certResponse = await axios.post(
          `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
          certificateData,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          }
        );
        certificateIds.push(certResponse.data.id);
      }

      const payload = {
        graduateId: graduateId,
        professionalSummary: formData.professionalSummary,
        primaryCourseType: formData.primaryCourseType,
        scholarScheme: formData.scholarScheme || "None",
        designTemplate: formData.designTemplate,
        customSectionJson: formData.customSectionJson || null,
        visibility: formData.visibility,
        avatar: avatarUrl || null,
        fullName: formData.fullName,
        professionalTitle: formData.professionalTitle || null,
        ncLevel: formData.ncLevel || null,
        trainingCenter: formData.trainingCenter || null,
        scholarshipType: formData.scholarshipType || null,
        trainingDuration: formData.trainingDuration || null,
        tesdaRegistrationNumber: formData.tesdaRegistrationNumber || null,
        email: formData.email || null,
        phone: formData.phone || null,
        website: formData.website || null,
        portfolioCategory: formData.portfolioCategory || null,
        preferredWorkLocation: formData.preferredWorkLocation || null,
        workScheduleAvailability: formData.workScheduleAvailability || null,
        salaryExpectations: formData.salaryExpectations || null,
        skills: validatedSkills,
        experiences: experiences.map((exp) => ({
          jobTitle: exp.jobTitle,
          company: exp.company,
          duration: exp.duration || null,
          responsibilities: exp.responsibilities || null,
        })),
        projectIds: [],
        awardsRecognitions: awardsRecognitions.map((award) => ({
          title: award.title,
          issuer: award.issuer || null,
          dateReceived: award.dateReceived || null,
        })),
        continuingEducations: continuingEducations.map((edu) => ({
          courseName: edu.courseName,
          institution: edu.institution || null,
          completionDate: edu.completionDate || null,
        })),
        professionalMemberships: professionalMemberships.map((mem) => ({
          organization: mem.organization,
          membershipType: mem.membershipType || null,
          startDate: mem.startDate || null,
        })),
        references: references.map((ref) => ({
          name: ref.name,
          position: ref.position || null,
          company: ref.company || null,
          contact: ref.contact || null,
          email: ref.email || null,
        })),
        certificateIds: certificateIds,
      };

      console.log("Sending portfolio payload:", JSON.stringify(payload, null, 2));

      const portfolioResponse = await axios.post(
        `${BACKEND_URL}/api/portfolio`,
        payload,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const portfolioId = portfolioResponse.data.id;
      localStorage.setItem("portfolioId", portfolioId);

      for (const proj of projects) {
        const formDataProject = new FormData();
        formDataProject.append("portfolioId", portfolioId);
        formDataProject.append("title", proj.title);
        formDataProject.append("description", proj.description || "");
        formDataProject.append("file", proj.projectFile);
        await axios.post(
          `${BACKEND_URL}/api/project`,
          formDataProject,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          }
        );
      }

      console.log("Portfolio created with ID:", portfolioId);
      navigate("/graduate-homepage");
    } catch (err) {
      let errorMessage = "Failed to create portfolio";
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = `Bad Request: ${err.response.data || "Invalid data provided"}`;
          console.error("Response data:", err.response.data);
        } else if (err.response.status === 401) {
          errorMessage = "Unauthorized: Please sign in again.";
          navigate("/signin");
        } else if (err.response.status === 403) {
          errorMessage = "Forbidden: You are not authorized to perform this action.";
        } else if (err.response.status === 409) {
          errorMessage = "Portfolio already exists for this graduate.";
        } else {
          errorMessage = err.response.data || err.response.statusText || "Failed to create portfolio";
        }
      } else {
        errorMessage = `Network error: ${err.message}`;
      }
      setError(`Error ${err.response?.status || "Unknown"}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="portfolio-creation-page" style={{ color: "#333" }}>
      <div className="portfolio-creation-container">
        <h1>Create Your Portfolio</h1>
        {error && <div className="portfolio-error">{error}</div>}
        <form onSubmit={handleSubmit} className="portfolio-form">
          {/* File Uploads */}
          <div className="form-group">
            <h3>File Uploads</h3>
            <label htmlFor="avatar">Profile Photo</label>
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
                disabled={isLoading}
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






          {/* Basic Information */}
          <div className="form-group">
            <h3>Basic Information</h3>
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              disabled={isLoading}
            />
            <label htmlFor="professionalTitle">Professional Title</label>
            <input
              type="text"
              id="professionalTitle"
              name="professionalTitle"
              value={formData.professionalTitle}
              onChange={handleInputChange}
              placeholder="Enter your professional title"
              disabled={isLoading}
            />
            <label htmlFor="professionalSummary">Professional Summary</label>
            <textarea
              id="professionalSummary"
              name="professionalSummary"
              value={formData.professionalSummary}
              onChange={handleInputChange}
              placeholder="Brief summary of your professional background"
              required
              disabled={isLoading}
            />
          </div>

          {/* TESDA Information */}
          <div className="form-group">
            <h3>TESDA Information</h3>
            <label htmlFor="ncLevel">NC Level</label>
            <input
              type="text"
              id="ncLevel"
              name="ncLevel"
              value={formData.ncLevel}
              onChange={handleInputChange}
              placeholder="e.g., NC II"
              disabled={isLoading}
            />
            <label htmlFor="trainingCenter">Training Center/Institution</label>
            <input
              type="text"
              id="trainingCenter"
              name="trainingCenter"
              value={formData.trainingCenter}
              onChange={handleInputChange}
              placeholder="Enter training center or institution"
              disabled={isLoading}
            />
            <label htmlFor="scholarshipType">Scholarship Type</label>
            <input
              type="text"
              id="scholarshipType"
              name="scholarshipType"
              value={formData.scholarshipType}
              onChange={handleInputChange}
              placeholder="e.g., Full Scholarship"
              disabled={isLoading}
            />
            <label htmlFor="trainingDuration">Training Duration</label>
            <input
              type="text"
              id="trainingDuration"
              name="trainingDuration"
              value={formData.trainingDuration}
              onChange={handleInputChange}
              placeholder="e.g., January 2023 - June 2023"
              disabled={isLoading}
            />
            <label htmlFor="tesdaRegistrationNumber">TESDA Registration Number</label>
            <input
              type="text"
              id="tesdaRegistrationNumber"
              name="tesdaRegistrationNumber"
              value={formData.tesdaRegistrationNumber}
              onChange={handleInputChange}
              placeholder="Enter TESDA registration number"
              disabled={isLoading}
            />
          </div>

          {/* Contact Information */}
          <div className="form-group">
            <h3>Contact Information</h3>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              disabled={isLoading}
            />
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="Enter your website URL"
              disabled={isLoading}
            />
          </div>

          {/* Certificates */}
          <div className="form-group">
            <h3>Certificates</h3>
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
              disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                      disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {certificates.length > 0 && (
              <div className="certificate-list">
                <h4>Added Certificates</h4>
                {certificates.map((cert, index) => (
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
                        disabled={isLoading}
                      >
                        <FaPen />
                      </button>
                      <button
                        type="button"
                        className="certificate-remove-button"
                        onClick={() => handleRemoveCertificate(cert.id)}
                        disabled={isLoading}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="form-group">
            <h3>Skills</h3>
            <button
              type="button"
              className="add-skill-button"
              onClick={() => setIsAddingSkill(true)}
              disabled={isLoading}
            >
              <FaPlus /> Add Skill
            </button>
            {isAddingSkill && (
              <div className="skill-form">
                <div className="form-group">
                  <label htmlFor="skillName">Skill Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newSkill.name}
                    onChange={handleSkillInputChange}
                    placeholder="e.g., Welding"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="skillType">Skill Type</label>
                  <select
                    name="type"
                    value={newSkill.type}
                    onChange={handleSkillInputChange}
                    disabled={isLoading}
                  >
                    {validSkillTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="proficiencyLevel">Proficiency</label>
                  <input
                    type="text"
                    name="proficiencyLevel"
                    value={newSkill.proficiencyLevel}
                    onChange={handleSkillInputChange}
                    placeholder="e.g., Expert"
                    disabled={isLoading}
                  />
                </div>
                <div className="skill-form-actions">
                  <button
                    type="button"
                    className="skill-save-button"
                    onClick={handleAddSkill}
                    disabled={isLoading}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="skill-cancel-button"
                    onClick={() => setIsAddingSkill(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {skills.length > 0 && (
              <div className="skill-list">
                <h4>Added Skills</h4>
                {skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-details">
                      <h5>{skill.name}</h5>
                      <p>Type: {skill.type}</p>
                      {skill.proficiencyLevel && <p>Proficiency: {skill.proficiencyLevel}</p>}
                    </div>
                    <button
                      type="button"
                      className="skill-remove-button"
                      onClick={() => handleRemoveSkill(index)}
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experiences */}
          <div className="form-group">
            <h3>Experiences</h3>
            <button
              type="button"
              className="add-experience-button"
              onClick={() => setIsAddingExperience(true)}
              disabled={isLoading}
            >
              <FaPlus /> Add Experience
            </button>
            {isAddingExperience && (
              <div className="experience-form">
                <div className="form-group">
                  <label htmlFor="jobTitle">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={newExperience.jobTitle}
                    onChange={handleExperienceInputChange}
                    placeholder="e.g., Software Engineer"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={newExperience.company}
                    onChange={handleExperienceInputChange}
                    placeholder="e.g., ABC Corp"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="duration">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={newExperience.duration}
                    onChange={handleExperienceInputChange}
                    placeholder="e.g., Jan 2020 - Dec 2022"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="responsibilities">Responsibilities</label>
                  <textarea
                    name="responsibilities"
                    value={newExperience.responsibilities}
                    onChange={handleExperienceInputChange}
                    placeholder="Describe your responsibilities"
                    disabled={isLoading}
                  />
                </div>
                <div className="experience-form-actions">
                  <button
                    type="button"
                    className="experience-save-button"
                    onClick={handleAddExperience}
                    disabled={isLoading}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="experience-cancel-button"
                    onClick={() => setIsAddingExperience(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {experiences.length > 0 && (
              <div className="experience-list">
                <h4>Added Experiences</h4>
                {experiences.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="experience-details">
                      <h5>{exp.jobTitle} at {exp.company}</h5>
                      {exp.duration && <p>Duration: {exp.duration}</p>}
                      {exp.responsibilities && <p>Responsibilities: {exp.responsibilities}</p>}
                    </div>
                    <button
                      type="button"
                      className="experience-remove-button"
                      onClick={() => handleRemoveExperience(index)}
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Awards & Recognitions */}
          <div className="form-group">
            <h3>Awards & Recognitions</h3>
            <button
              type="button"
              className="add-award-button"
              onClick={() => setIsAddingAward(true)}
              disabled={isLoading}
            >
              <FaPlus /> Add Award
            </button>
            {isAddingAward && (
              <div className="award-form">
                <div className="form-group">
                  <label htmlFor="title">Award Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newAward.title}
                    onChange={handleAwardInputChange}
                    placeholder="e.g., Best Employee"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="issuer">Issuer</label>
                  <input
                    type="text"
                    name="issuer"
                    value={newAward.issuer}
                    onChange={handleAwardInputChange}
                    placeholder="e.g., XYZ Organization"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dateReceived">Issue Date</label>
                  <input
                    type="date"
                    name="dateReceived"
                    value={newAward.dateReceived}
                    onChange={handleAwardInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="award-form-actions">
                  <button
                    type="button"
                    className="award-save-button"
                    onClick={handleAddAward}
                    disabled={isLoading}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="award-cancel-button"
                    onClick={() => setIsAddingAward(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {awardsRecognitions.length > 0 && (
              <div className="award-list">
                <h4>Added Awards</h4>
                {awardsRecognitions.map((award, index) => (
                  <div key={index} className="award-item">
                    <div className="award-details">
                      <h5>{award.title}</h5>
                      {award.issuer && <p>Issuer: {award.issuer}</p>}
                      {award.dateReceived && <p>Issued: {award.dateReceived}</p>}
                    </div>
                    <button
                      type="button"
                      className="award-remove-button"
                      onClick={() => handleRemoveAward(index)}
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Continuing Education */}
          <div className="form-group">
            <h3>Continuing Education</h3>
            <button
              type="button"
              className="add-education-button"
              onClick={() => setIsAddingEducation(true)}
              disabled={isLoading}
            >
              <FaPlus /> Add Education
            </button>
            {isAddingEducation && (
              <div className="education-form">
                <div className="form-group">
                  <label htmlFor="courseName">Course Name</label>
                  <input
                    type="text"
                    name="courseName"
                    value={newEducation.courseName}
                    onChange={handleEducationInputChange}
                    placeholder="e.g., Advanced Welding"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="institution">Institution</label>
                  <input
                    type="text"
                    name="institution"
                    value={newEducation.institution}
                    onChange={handleEducationInputChange}
                    placeholder="e.g., TESDA Institute"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="completionDate">Completion Date</label>
                  <input
                    type="date"
                    name="completionDate"
                    value={newEducation.completionDate}
                    onChange={handleEducationInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="education-form-actions">
                  <button
                    type="button"
                    className="education-save-button"
                    onClick={handleAddEducation}
                    disabled={isLoading}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="education-cancel-button"
                    onClick={() => setIsAddingEducation(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {continuingEducations.length > 0 && (
              <div className="education-list">
                <h4>Added Education</h4>
                {continuingEducations.map((edu, index) => (
                  <div key={index} className="education-item">
                    <div className="education-details">
                      <h5>{edu.courseName}</h5>
                      {edu.institution && <p>Institution: {edu.institution}</p>}
                      {edu.completionDate && <p>Completed: {edu.completionDate}</p>}
                    </div>
                    <button
                      type="button"
                      className="education-remove-button"
                      onClick={() => handleRemoveEducation(index)}
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Professional Memberships */}
          <div className="form-group">
            <h3>Professional Memberships</h3>
            <button
              type="button"
              className="add-membership-button"
              onClick={() => setIsAddingMembership(true)}
              disabled={isLoading}
            >
              <FaPlus /> Add Membership
            </button>
            {isAddingMembership && (
              <div className="membership-form">
                <div className="form-group">
                  <label htmlFor="organization">Organization</label>
                  <input
                    type="text"
                    name="organization"
                    value={newMembership.organization}
                    onChange={handleMembershipInputChange}
                    placeholder="e.g., IEEE"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="membershipType">Membership Type</label>
                  <input
                    type="text"
                    name="membershipType"
                    value={newMembership.membershipType}
                    onChange={handleMembershipInputChange}
                    placeholder="e.g., Professional Member"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="startDate">Join Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={newMembership.startDate}
                    onChange={handleMembershipInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="membership-form-actions">
                  <button
                    type="button"
                    className="membership-save-button"
                    onClick={handleAddMembership}
                    disabled={isLoading}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="membership-cancel-button"
                    onClick={() => setIsAddingMembership(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {professionalMemberships.length > 0 && (
              <div className="membership-list">
                <h4>Added Memberships</h4>
                {professionalMemberships.map((mem, index) => (
                  <div key={index} className="membership-item">
                    <div className="membership-details">
                      <h5>{mem.organization}</h5>
                      {mem.membershipType && <p>Type: {mem.membershipType}</p>}
                      {mem.startDate && <p>Joined: {mem.startDate}</p>}
                    </div>
                    <button
                      type="button"
                      className="membership-remove-button"
                      onClick={() => handleRemoveMembership(index)}
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* References */}
          <div className="form-group">
            <h3>References</h3>
            <button
              type="button"
              className="add-reference-button"
              onClick={() => setIsAddingReference(true)}
              disabled={isLoading}
            >
              <FaPlus /> Add Reference
            </button>
            {isAddingReference && (
              <div className="reference-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newReference.name}
                    onChange={handleReferenceInputChange}
                    placeholder="e.g., John Doe"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="position">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={newReference.position}
                    onChange={handleReferenceInputChange}
                    placeholder="e.g., Manager"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={newReference.company}
                    onChange={handleReferenceInputChange}
                    placeholder="e.g., ABC Corp"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact">Contact Info</label>
                  <input
                    type="text"
                    name="contact"
                    value={newReference.contact}
                    onChange={handleReferenceInputChange}
                    placeholder="e.g., +1234567890"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newReference.email}
                    onChange={handleReferenceInputChange}
                    placeholder="e.g., john.doe@example.com"
                    disabled={isLoading}
                  />
                </div>
                <div className="reference-form-actions">
                  <button
                    type="button"
                    className="reference-save-button"
                    onClick={handleAddReference}
                    disabled={isLoading}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="reference-cancel-button"
                    onClick={() => setIsAddingReference(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {references.length > 0 && (
              <div className="reference-list">
                <h4>Added References</h4>
                {references.map((ref, index) => (
                  <div key={index} className="reference-item">
                    <div className="reference-details">
                      <h5>{ref.name}</h5>
                      {ref.position && <p>Position: {ref.position}</p>}
                      {ref.company && <p>Company: {ref.company}</p>}
                      {ref.contact && <p>Contact: {ref.contact}</p>}
                      {ref.email && <p>Email: {ref.email}</p>}
                    </div>
                    <button
                      type="button"
                      className="reference-remove-button"
                      onClick={() => handleRemoveReference(index)}
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

 <div className="form-group">
<label>Project Samples</label>
            <button
              type="button"
              className="add-project-button"
              onClick={() => setIsAddingProject(true)}
              disabled={isLoading}
            >
              <FaPlus /> Add Project Sample
            </button>
            {isAddingProject && (
              <div className="project-form">
                <div className="form-group">
                  <label htmlFor="title">Project Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newProject.title}
                    onChange={handleProjectInputChange}
                    placeholder="Enter project title"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    name="description"
                    value={newProject.description}
                    onChange={handleProjectInputChange}
                    placeholder="Describe the project"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="projectFile">Project File</label>
                  <div className="project-upload">
                    <img
                      src={
                        newProject.projectFile && newProject.projectFile.type.startsWith("image/")
                          ? URL.createObjectURL(newProject.projectFile)
                          : "/placeholder.svg"
                      }
                      alt="Project Preview"
                      className="project-preview"
                      onClick={handleProjectImageClick}
                    />
                    {newProject.projectFile && !newProject.projectFile.type.startsWith("image/") && (
                      <p className="project-file-name">{newProject.projectFile.name}</p>
                    )}
                    <button
                      type="button"
                      className="project-upload-button"
                      onClick={handleProjectImageClick}
                      disabled={isLoading}
                    >
                      Choose File
                    </button>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleProjectFileChange}
                      ref={projectFileInputRef}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
                <div className="project-form-actions">
                  <button
                    type="button"
                    className="project-save-button"
                    onClick={handleAddProject}
                    disabled={isLoading}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="project-cancel-button"
                    onClick={() => setIsAddingProject(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {projects.length > 0 && (
              <div className="project-list">
                <h4>Added Projects</h4>
                {projects.map((proj, index) => (
                  <div key={index} className="project-item">
                    <div className="project-details">
                      <img
                        src={proj.preview || "/placeholder.svg"}
                        alt="Project Preview"
                        className="project-preview"
                      />
                      <div>
                        <h5>{proj.title}</h5>
                        {proj.description && <p>Description: {proj.description}</p>}
                        {proj.projectFile && !proj.projectFile.type.startsWith("image/") && (
                          <p>File: {proj.projectFile.name}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="project-remove-button"
                      onClick={() => handleRemoveProject(index)}
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}

 </div>

          <div className="form-group">
            <label htmlFor="primaryCourseType">Primary Course Type</label>
            <input
              type="text"
              id="primaryCourseType"
              name="primaryCourseType"
              value={formData.primaryCourseType}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="designTemplate">Design Template</label>
            <select
              id="designTemplate"
              name="designTemplate"
              value={formData.designTemplate}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="default">Default</option>
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="visibility">Visibility</label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
          <button type="submit" className="portfolio-submit-button" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Portfolio"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PortfolioCreation;