"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaTrash } from "react-icons/fa";
import "../styles/EditPortfolio.css";

const EditPortfolio = () => {
  const { graduateId } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState("/placeholder.svg");
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const navigate = useNavigate();
  const avatarFileInputRef = useRef(null);

  // Initialize portfolio state
  const initialPortfolioState = {
    fullName: "",
    professionalSummary: "", // For textarea
    professionalTitle: "",
    primaryCourseType: "",
    scholarScheme: "",
    designTemplate: "",
    customSectionJson: "", // For textarea
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
    experiences: [], // Will handle description below
    awardsRecognitions: [],
    continuingEducations: [],
    professionalMemberships: [],
    references: [],
    projectIds: [],
};

  // Fetch portfolio data
    useEffect(() => {
      const fetchPortfolio = async () => {
          setIsLoading(true);
          try {
              console.log("Fetching JWT token for graduate ID:", graduateId);
              const tokenResponse = await axios.get(`${BACKEND_URL}/api/graduate/get-token`, {
                  withCredentials: true,
              });
              const fetchedToken = tokenResponse.data.token;
              console.log("Token response:", tokenResponse.data);
              if (!fetchedToken) {
                  throw new Error("No token returned from /api/graduate/get-token");
              }
              setToken(fetchedToken);

              console.log("Fetching portfolio for graduate ID:", graduateId);
              const portfolioResponse = await axios.get(
                  `${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`,
                  {
                      withCredentials: true,
                      headers: { Authorization: `Bearer ${fetchedToken}` },
                  }
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
                  skills: fetchedPortfolio.skills?.map(skill => ({
                      ...skill,
                      name: skill.name || "",
                      type: skill.type || "TECHNICAL",
                      proficiencyLevel: skill.proficiencyLevel || "",
                  })) || [],
                  experiences: fetchedPortfolio.experiences?.map(exp => ({
                      ...exp,
                      jobTitle: exp.jobTitle || "",
                      employer: exp.employer || "",
                      description: exp.description || "", // For textarea
                      startDate: exp.startDate || "",
                      endDate: exp.endDate || "",
                  })) || [],
                  awardsRecognitions: fetchedPortfolio.awardsRecognitions?.map(award => ({
                      ...award,
                      title: award.title || "",
                      issuer: award.issuer || "",
                      dateReceived: award.dateReceived || "",
                  })) || [],
                  continuingEducations: fetchedPortfolio.continuingEducations?.map(edu => ({
                      ...edu,
                      courseName: edu.courseName || "",
                      institution: edu.institution || "",
                      completionDate: edu.completionDate || "",
                  })) || [],
                  professionalMemberships: fetchedPortfolio.professionalMemberships?.map(mem => ({
                      ...mem,
                      organization: mem.organization || "",
                      membershipType: mem.membershipType || "",
                      startDate: mem.startDate || "",
                  })) || [],
                  references: fetchedPortfolio.references?.map(ref => ({
                      ...ref,
                      name: ref.name || "",
                      relationship: ref.relationship || "",
                      email: ref.email || "",
                      phone: ref.phone || "",
                  })) || [],
                  projectIds: fetchedPortfolio.projectIds || [],
              });
              setPreviewAvatar(fetchedPortfolio.avatar || "/placeholder.svg");
          } catch (err) {
              console.error("Failed to fetch portfolio:", err);
              let errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load portfolio";
              if (err.response?.status === 401) {
                  errorMessage = "Unauthorized: Please sign in again.";
                  console.error("Unauthorized: Redirecting to /signin");
                  navigate("/signin");
              } else if (err.response?.status === 404) {
                  errorMessage = "Portfolio not found for this graduate.";
              }
              setError(errorMessage);
          } finally {
              setIsLoading(false);
          }
      };

      fetchPortfolio();
  }, [graduateId, navigate]);

  // Handle input changes for portfolio fields
  const handlePortfolioChange = (e) => {
    const { name, value } = e.target;
    setPortfolio((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Handle avatar file change
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

  // Handle array changes
  const handleArrayChange = (arrayName, index, field, value) => {
    setPortfolio((prev) => {
      const updatedArray = [...prev[arrayName]];
      updatedArray[index] = { ...updatedArray[index], [field]: value };
      return { ...prev, [arrayName]: updatedArray };
    });
  };

  // Add new item to array
  const addArrayItem = (arrayName, newItem) => {
    setPortfolio((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...newItem, id: `new-${Date.now()}-${Math.random()}` }],
    }));
  };

  // Remove item from array
  const removeArrayItem = (arrayName, index) => {
    setPortfolio((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  // Handle image click
  const handleImageClick = () => avatarFileInputRef.current.click();

  // Handle form submission
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

      const payload = {
        graduateId,
        ...portfolio,
        avatar: avatarUrl || null,
        skills: portfolio.skills.map((skill) => ({
          id: typeof skill.id === 'string' && skill.id.includes("new-") ? null : skill.id,
          name: skill.name,
          type: skill.type,
          proficiencyLevel: skill.proficiencyLevel || null,
        })),
        experiences: portfolio.experiences.map((exp) => ({
          id: typeof exp.id === 'string' && exp.id.includes("new-") ? null : exp.id,
          jobTitle: exp.jobTitle,
          employer: exp.employer,
          description: exp.description || null,
          startDate: exp.startDate ? exp.startDate : null,
          endDate: exp.endDate ? exp.endDate : null,
        })),
        awardsRecognitions: portfolio.awardsRecognitions.map((award) => ({
          id: typeof award.id === 'string' && award.id.includes("new-") ? null : award.id,
          title: award.title,
          issuer: award.issuer || null,
          dateReceived: award.dateReceived ? award.dateReceived : null,
        })),
        continuingEducations: portfolio.continuingEducations.map((edu) => ({
          id: typeof edu.id === 'string' && edu.id.includes("new-") ? null : edu.id,
          courseName: edu.courseName,
          institution: edu.institution || null,
          completionDate: edu.completionDate ? edu.completionDate : null,
        })),
        professionalMemberships: portfolio.professionalMemberships.map((mem) => ({
          id: typeof mem.id === 'string' && mem.id.includes("new-") ? null : mem.id,
          organization: mem.organization,
          membershipType: mem.membershipType || null,
          startDate: mem.startDate ? mem.startDate : null,
        })),
        references: portfolio.references.map((ref) => ({
          id: typeof ref.id === 'string' && ref.id.includes("new-") ? null : ref.id,
          name: ref.name,
          relationship: ref.relationship || null,
          email: ref.email || null,
          phone: ref.phone || null,
        })),
      };

      // Use PUT instead of POST and correct endpoint
      await axios.put(
        `${BACKEND_URL}/api/portfolio/${portfolio.id}`,
        payload,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Portfolio updated successfully");
      setSuccess("Portfolio updated successfully!");
      setTimeout(() => navigate(`/portfolio/${graduateId}`), 2000);
    } catch (err) {
      console.error("Failed to update portfolio:", err);
      let errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update portfolio";
      if (err.response?.status === 401) {
        errorMessage = "Unauthorized: Please sign in again.";
        navigate("/signin");
      } else if (err.response?.status === 404) {
        errorMessage = "Portfolio not found or update failed.";
      } else if (err.response?.status === 405) {
        errorMessage = "Method not allowed. Please contact support.";
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