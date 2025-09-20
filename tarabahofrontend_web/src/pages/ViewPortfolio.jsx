"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/ViewPortfolio.css";

const ViewPortfolio = () => {
  const { graduateId } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [graduate, setGraduate] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const currentUrl = window.location.href;
  const navigate = useNavigate();

  // Function to normalize portfolio data to match PortfolioCreation fields
  const normalizePortfolioData = (data) => {
    console.log("Normalizing portfolio data:", data);
    const normalized = {
      id: data.id,
      graduateId: data.graduate?.id || data.graduateId,
      fullName: data.fullName || "Unnamed",
      professionalSummary: data.professionalSummary || "",
      professionalTitle: data.professionalTitle || "",
      primaryCourseType: data.primaryCourseType || "",
      scholarScheme: data.scholarScheme || "",
      customSectionJson: data.customSectionJson || "",
      avatar: data.avatar || "",
      ncLevel: data.ncLevel || "",
      trainingCenter: data.trainingCenter || "",
      scholarshipType: data.scholarshipType || "",
      trainingDuration: data.trainingDuration || "",
      tesdaRegistrationNumber: data.tesdaRegistrationNumber || "",
      email: data.email || "",
      phone: data.phone || "",
      website: data.website || "",
      portfolioCategory: data.portfolioCategory || "",
      preferredWorkLocation: data.preferredWorkLocation || "",
      workScheduleAvailability: data.workScheduleAvailability || "",
      salaryExpectations: data.salaryExpectations || "",
      skills: data.skills
        ? data.skills.map((skill) => ({
            id: skill.id,
            name: skill.name || "Unnamed Skill",
            type: skill.type || "TECHNICAL",
            proficiencyLevel: skill.proficiencyLevel || "",
          }))
        : [],
      experiences: data.experiences
        ? data.experiences.map((exp) => ({
            id: exp.id,
            jobTitle: exp.jobTitle || "Unnamed",
            company: exp.employer || "",
            duration: exp.duration || "",
            responsibilities: exp.description || "",
          }))
        : [],
      projects: data.projects
        ? data.projects.map((project) => ({
            id: project.id,
            title: project.title || "Unnamed Project",
            description: project.description || "",
            imageUrls: project.imageUrls || "",
            startDate: project.startDate || "",
            endDate: project.endDate || "",
            projectImageFilePath: project.projectImageFilePath || "",
          }))
        : [],
      awardsRecognitions: data.awardsRecognitions
        ? data.awardsRecognitions.map((award) => ({
            id: award.id,
            title: award.title || "Unnamed Award",
            issuer: award.issuer || "",
            dateReceived: award.dateReceived || "",
          }))
        : [],
      continuingEducations: data.continuingEducations
        ? data.continuingEducations.map((edu) => ({
            id: edu.id,
            courseName: edu.courseName || "Unnamed Course",
            institution: edu.institution || "",
            completionDate: edu.completionDate || "",
          }))
        : [],
      professionalMemberships: data.professionalMemberships
        ? data.professionalMemberships.map((mem) => ({
            id: mem.id,
            organization: mem.organization || "Unnamed Organization",
            membershipType: mem.membershipType || "",
            startDate: mem.startDate || "",
          }))
        : [],
      references: data.references
        ? data.references.map((ref) => ({
            id: ref.id,
            name: ref.name || "Unnamed Reference",
            position: ref.relationship || "",
            company: ref.company || "",
            contact: ref.phone || "",
            email: ref.email || "",
          }))
        : [],
    };
    console.log("Normalized portfolio data:", normalized);
    return normalized;
  };

  // Fetch token, portfolio, graduate, certificates, and projects
  useEffect(() => {
    const fetchInitialData = async () => {
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

        // Fetch portfolio
        console.log("Fetching portfolio for graduate ID:", graduateId);
        const portfolioResponse = await axios.get(
          `${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${fetchedToken}` },
          }
        );
        console.log("Portfolio response:", portfolioResponse.data);
        // Normalize the portfolio data before setting state
        const normalizedPortfolio = normalizePortfolioData(portfolioResponse.data);
        setPortfolio(normalizedPortfolio);

        // Fetch graduate data
        console.log("Fetching graduate data for ID:", graduateId);
        const graduateResponse = await axios.get(`${BACKEND_URL}/api/graduate/${graduateId}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${fetchedToken}` },
          params: { includePortfolio: false },
        });
        console.log("Graduate response:", graduateResponse.data);
        setGraduate(graduateResponse.data);

        // Fetch certificates
        console.log("Fetching certificates for graduate ID:", graduateId);
        const certificatesResponse = await axios.get(
          `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${fetchedToken}` },
          }
        );
        console.log("Certificates response:", certificatesResponse.data);
        setCertificates(certificatesResponse.data);

        // Fetch projects
        console.log("Fetching projects for portfolio ID:", normalizedPortfolio.id);
        if (normalizedPortfolio.id) {
          const projectsResponse = await axios.get(
            `${BACKEND_URL}/api/project/portfolio/${normalizedPortfolio.id}`,
            {
              withCredentials: true,
              headers: { Authorization: `Bearer ${fetchedToken}` },
            }
          );
          console.log("Projects response:", projectsResponse.data);
          setProjects(projectsResponse.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to load portfolio"
        );
        if (err.response?.status === 401) {
          console.error("Unauthorized: Redirecting to /signin");
          navigate("/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [graduateId, navigate]);

  // Debug portfolio state before rendering
  useEffect(() => {
    if (portfolio) {
      console.log("Portfolio state at render:", {
        fullName: portfolio.fullName,
        professionalSummary: portfolio.professionalSummary,
        professionalTitle: portfolio.professionalTitle,
        primaryCourseType: portfolio.primaryCourseType,
        scholarScheme: portfolio.scholarScheme,
        designTemplate: portfolio.designTemplate,
   
        ncLevel: portfolio.ncLevel,
        trainingCenter: portfolio.trainingCenter,
        scholarshipType: portfolio.scholarshipType,
        trainingDuration: portfolio.trainingDuration,
        tesdaRegistrationNumber: portfolio.tesdaRegistrationNumber,
        email: portfolio.email,
        phone: portfolio.phone,
        website: portfolio.website,
        portfolioCategory: portfolio.portfolioCategory,
        preferredWorkLocation: portfolio.preferredWorkLocation,
        workScheduleAvailability: portfolio.workScheduleAvailability,
        salaryExpectations: portfolio.salaryExpectations,
        skills: portfolio.skills,
        experiences: portfolio.experiences,
        projects: portfolio.projects,
        awardsRecognitions: portfolio.awardsRecognitions,
        continuingEducations: portfolio.continuingEducations,
        professionalMemberships: portfolio.professionalMemberships,
        references: portfolio.references,
      });
    }
  }, [portfolio]);

  const handleCertificateClick = (certificate) => {
    setSelectedCertificate(selectedCertificate?.id === certificate.id ? null : certificate);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      alert("Link copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy:", err);
      alert("Failed to copy link.");
    });
  };

  const shareToLinkedIn = () => {
    const title = "My Portfolio";
    const summary = portfolio?.professionalSummary || "Check out my professional portfolio!";
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      currentUrl
    )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
    window.open(linkedInUrl, "_blank");
  };

  const shareToFacebook = () => {
    const title = "My Portfolio";
    const summary = portfolio?.professionalSummary || "Check out my professional portfolio!";
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentUrl
    )}&quote=${encodeURIComponent(summary)}&title=${encodeURIComponent(title)}`;
    window.open(facebookUrl, "_blank");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this portfolio? This action cannot be undone.")) {
      try {
        console.log("Deleting portfolio for graduate ID:", graduateId);
        await axios.delete(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Portfolio deleted successfully");
        alert("Portfolio deleted successfully.");
        navigate("/graduate-homepage");
      } catch (err) {
        console.error("Failed to delete portfolio:", err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to delete portfolio"
        );
      }
    }
  };

  if (isLoading) {
    console.log("Rendering: isLoading");
    return <div className="view-portfolio-loading">Loading...</div>;
  }
  if (error) {
    console.log("Rendering: error", error);
    return <div className="view-portfolio-error">{error}</div>;
  }
  if (!portfolio) {
    console.log("Rendering: no portfolio");
    return <div className="view-portfolio-no-data">No portfolio found or access denied.</div>;
  }

  console.log("Rendering: portfolio data", {
    fullName: portfolio.fullName,
    professionalSummary: portfolio.professionalSummary,
    professionalTitle: portfolio.professionalTitle,
    primaryCourseType: portfolio.primaryCourseType,
    scholarScheme: portfolio.scholarScheme,
    designTemplate: portfolio.designTemplate,
    ncLevel: portfolio.ncLevel,
    trainingCenter: portfolio.trainingCenter,
    scholarshipType: portfolio.scholarshipType,
    trainingDuration: portfolio.trainingDuration,
    tesdaRegistrationNumber: portfolio.tesdaRegistrationNumber,
    email: portfolio.email,
    phone: portfolio.phone,
    website: portfolio.website,
    portfolioCategory: portfolio.portfolioCategory,
    preferredWorkLocation: portfolio.preferredWorkLocation,
    workScheduleAvailability: portfolio.workScheduleAvailability,
    salaryExpectations: portfolio.salaryExpectations,
    skills: portfolio.skills,
    experiences: portfolio.experiences,
    projects: portfolio.projects,
    awardsRecognitions: portfolio.awardsRecognitions,
    continuingEducations: portfolio.continuingEducations,
    professionalMemberships: portfolio.professionalMemberships,
    references: portfolio.references,
  });

  return (
    <div className="view-portfolio-page">
      <div className="view-portfolio-container">
        {graduate?.profilePicture && (
          <div className="profile-picture-container">
            <img
              src={graduate.profilePicture || "/placeholder.svg"}
              alt="Graduate Profile"
              className="profile-picture"
            />
          </div>
        )}
        <h1>{portfolio.fullName || "Unnamed Portfolio"}</h1>
        <div className="portfolio-details">
          <h2>Basic Information</h2>
          <p><strong>Full Name:</strong> {portfolio.fullName ? portfolio.fullName : "Not provided"}</p>
          <p><strong>Professional Title:</strong> {portfolio.professionalTitle ? portfolio.professionalTitle : "Not provided"}</p>
          <p><strong>Professional Summary:</strong> {portfolio.professionalSummary ? portfolio.professionalSummary : "Not provided"}</p>
          <p><strong>Primary Course Type:</strong> {portfolio.primaryCourseType ? portfolio.primaryCourseType : "Not provided"}</p>

          <h2>TESDA Information</h2>
          <p><strong>NC Level:</strong> {portfolio.ncLevel ? portfolio.ncLevel : "Not provided"}</p>
          <p><strong>Training Center:</strong> {portfolio.trainingCenter ? portfolio.trainingCenter : "Not provided"}</p>
          <p><strong>Scholarship Type:</strong> {portfolio.scholarshipType ? portfolio.scholarshipType : "Not provided"}</p>
          <p><strong>Training Duration:</strong> {portfolio.trainingDuration ? portfolio.trainingDuration : "Not provided"}</p>
          <p><strong>TESDA Registration Number:</strong> {portfolio.tesdaRegistrationNumber ? portfolio.tesdaRegistrationNumber : "Not provided"}</p>

          <h2>Contact Information</h2>
          <p><strong>Email:</strong> {portfolio.email ? portfolio.email : "Not provided"}</p>
          <p><strong>Phone:</strong> {portfolio.phone ? portfolio.phone : "Not provided"}</p>
          <p><strong>Website:</strong> {portfolio.website ? portfolio.website : "Not provided"}</p>

          <h2>Skills</h2>
          {portfolio.skills && Array.isArray(portfolio.skills) && portfolio.skills.length > 0 ? (
            <div className="skill-list">
              {portfolio.skills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <div className="skill-details">
                    <h5>{skill.name || "Unnamed Skill"}</h5>
                    <p>Type: {skill.type || "Not specified"}</p>
                    {skill.proficiencyLevel && <p>Proficiency: {skill.proficiencyLevel}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No skills provided.</p>
          )}

          <h2>Experiences</h2>
          {portfolio.experiences && Array.isArray(portfolio.experiences) && portfolio.experiences.length > 0 ? (
            <div className="experience-list">
              {portfolio.experiences.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-details">
                    <h5>{exp.jobTitle && exp.company ? `${exp.jobTitle} at ${exp.company}` : "Unnamed Experience"}</h5>
                    {exp.responsibilities && <p>Responsibilities: {exp.responsibilities}</p>}
                    {exp.duration && <p>Duration: {exp.duration}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No experiences provided.</p>
          )}

          <h2>Awards & Recognitions</h2>
          {portfolio.awardsRecognitions && Array.isArray(portfolio.awardsRecognitions) && portfolio.awardsRecognitions.length > 0 ? (
            <div className="award-list">
              {portfolio.awardsRecognitions.map((award, index) => (
                <div key={index} className="award-item">
                  <div className="award-details">
                    <h5>{award.title || "Unnamed Award"}</h5>
                    {award.issuer && <p>Issuer: {award.issuer}</p>}
                    {award.dateReceived && <p>Issued: {award.dateReceived}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No awards provided.</p>
          )}

          <h2>Continuing Education</h2>
          {portfolio.continuingEducations && Array.isArray(portfolio.continuingEducations) && portfolio.continuingEducations.length > 0 ? (
            <div className="education-list">
              {portfolio.continuingEducations.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="education-details">
                    <h5>{edu.courseName || "Unnamed Course"}</h5>
                    {edu.institution && <p>Institution: {edu.institution}</p>}
                    {edu.completionDate && <p>Completed: {edu.completionDate}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No continuing education provided.</p>
          )}

          <h2>Professional Memberships</h2>
          {portfolio.professionalMemberships && Array.isArray(portfolio.professionalMemberships) && portfolio.professionalMemberships.length > 0 ? (
            <div className="membership-list">
              {portfolio.professionalMemberships.map((mem, index) => (
                <div key={index} className="membership-item">
                  <div className="membership-details">
                    <h5>{mem.organization || "Unnamed Organization"}</h5>
                    {mem.membershipType && <p>Type: {mem.membershipType}</p>}
                    {mem.startDate && <p>Joined: {mem.startDate}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No professional memberships provided.</p>
          )}

          <h2>References</h2>
          {portfolio.references && Array.isArray(portfolio.references) && portfolio.references.length > 0 ? (
            <div className="reference-list">
              {portfolio.references.map((ref, index) => (
                <div key={index} className="reference-item">
                  <div className="reference-details">
                    <h5>{ref.name || "Unnamed Reference"}</h5>
                    {ref.position && <p>Position: {ref.position}</p>}
                    {ref.company && <p>Company: {ref.company}</p>}
                    {ref.email && <p>Email: {ref.email}</p>}
                    {ref.contact && <p>Contact: {ref.contact}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No references provided.</p>
          )}

          <h2>Certificates</h2>
          {certificates && Array.isArray(certificates) && certificates.length > 0 ? (
            <div className="certificate-list">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="certificate-item">
                  <div className="certificate-details">
                    {certificate.certificateFilePath && (
                      <img
                        src={certificate.certificateFilePath}
                        alt={certificate.courseName || "Certificate"}
                        className="certificate-preview"
                      />
                    )}
                    <div>
                      <h5>
                        <button
                          onClick={() => handleCertificateClick(certificate)}
                          className="certificate-link"
                        >
                          {certificate.courseName || "Unnamed Certificate"}
                        </button>
                      </h5>
                      <p>Certificate Number: {certificate.certificateNumber || "Not provided"}</p>
                      <p>Issue Date: {certificate.issueDate || "Not provided"}</p>
                    </div>
                  </div>
                  {selectedCertificate?.id === certificate.id && (
                    <div className="certificate-preview">
                      {certificate.certificateFilePath ? (
                        certificate.certificateFilePath.endsWith(".pdf") ? (
                          <iframe
                            src={`${certificate.certificateFilePath}#toolbar=0`}
                            title={certificate.courseName || "Certificate"}
                          />
                        ) : (
                          <img
                            src={certificate.certificateFilePath}
                            alt={certificate.courseName || "Certificate"}
                          />
                        )
                      ) : (
                        <p>No certificate file available.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No certificates available.</p>
          )}

          {/* Projects Section - Added below Certificates */}
          <h2>Projects</h2>
          {projects && Array.isArray(projects) && projects.length > 0 ? (
            <div className="project-list">
              {projects.map((project) => (
                <div key={project.id} className="project-item">
                  <div className="project-details">
                    {project.projectImageFilePath && (
                      <img
                        src={project.projectImageFilePath}
                        alt={project.title || "Project"}
                        className="project-preview"
                      />
                    )}
                    <div>
                      <h5>{project.title || "Unnamed Project"}</h5>
                      {project.description && <p>{project.description}</p>}
                      {project.startDate && project.endDate && (
                        <p>
                          <strong>Timeline:</strong> {new Date(project.startDate).toLocaleDateString()} -{" "}
                          {new Date(project.endDate).toLocaleDateString()}
                        </p>
                      )}
                      {project.imageUrls && (
                        <p>
                          <strong>Additional Images:</strong> {project.imageUrls}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No projects available.</p>
          )}
        </div>
        <div className="share-buttons">
          <button onClick={copyToClipboard} className="share-button">
            Copy Link
          </button>
          <button onClick={shareToLinkedIn} className="share-button">
            Share to LinkedIn
          </button>
          <button onClick={shareToFacebook} className="share-button">
            Share to Facebook
          </button>
          <Link to={`/portfolio/edit/${graduateId}`} className="edit-portfolio-button">
            Edit Portfolio
          </Link>
        </div>
        <button onClick={handleDelete} className="delete-button">
          Delete Portfolio
        </button>
        <Link to="/graduate-homepage" className="view-portfolio-back-button">
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default ViewPortfolio;