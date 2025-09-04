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
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const currentUrl = window.location.href;
  const navigate = useNavigate();

  // Function to normalize portfolio data
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
      designTemplate: data.designTemplate || "",
      customSectionJson: data.customSectionJson || null,
      visibility: data.visibility || "PRIVATE",
      avatar: data.avatar || "",
      ncLevel: data.ncLevel || "",
      trainingCenter: data.trainingCenter || "",
      scholarshipType: data.scholarshipType || "",
      trainingDuration: data.trainingDuration || "",
      tesdaRegistrationNumber: data.tesdaRegistrationNumber || "",
      email: data.email || "",
      phone: data.phone || "",
      website: data.website || "",
      portfolioCategory: data.portfolioCategory || null,
      preferredWorkLocation: data.preferredWorkLocation || null,
      workScheduleAvailability: data.workScheduleAvailability || null,
      salaryExpectations: data.salaryExpectations || null,
      skills: data.skills
        ? data.skills.map((skill) => ({
            id: skill.id,
            name: skill.name || "Unnamed Skill",
            type: skill.type || "Not specified",
            proficiencyLevel: skill.proficiencyLevel || "",
          }))
        : [],
      experiences: data.experiences
        ? data.experiences.map((exp) => ({
            id: exp.id,
            jobTitle: exp.jobTitle || "Unnamed",
            employer: exp.employer || "",
            description: exp.description || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            createdAt: exp.createdAt || "",
            updatedAt: exp.updatedAt || "",
          }))
        : [],
      // projects: data.projects
      //   ? data.projects.map((proj) => ({
      //       id: proj.id,
      //       title: proj.title || "Unnamed Project",
      //       description: proj.description || "",
      //       imageUrls: proj.imageUrls || "",
      //       startDate: proj.startDate || "",
      //       endDate: proj.endDate || "",
      //       createdAt: proj.createdAt || "",
      //       updatedAt: proj.updatedAt || "",
      //     }))
      //   : [],
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
            relationship: ref.relationship || "",
            email: ref.email || "",
            phone: ref.phone || "",
          }))
        : [],
      portfolioViews: data.portfolioViews
        ? data.portfolioViews.map((view) => ({
            id: view.id,
            viewTimestamp: view.viewTimestamp || "",
          }))
        : [],
    };
    console.log("Normalized portfolio data:", normalized);
    return normalized;
  };

  // Fetch token, portfolio, graduate, and certificates
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
        visibility: portfolio.visibility,
        ncLevel: portfolio.ncLevel,
        trainingCenter: portfolio.trainingCenter,
        scholarshipType: portfolio.scholarshipType,
        trainingDuration: portfolio.trainingDuration,
        tesdaRegistrationNumber: portfolio.tesdaRegistrationNumber,
        email: portfolio.email,
        phone: portfolio.phone,
        website: portfolio.website,
        skills: portfolio.skills,
        experiences: portfolio.experiences,
        // projects: portfolio.projects,
        awardsRecognitions: portfolio.awardsRecognitions,
        continuingEducations: portfolio.continuingEducations,
        professionalMemberships: portfolio.professionalMemberships,
        references: portfolio.references,
        portfolioViews: portfolio.portfolioViews,
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
    visibility: portfolio.visibility,
    ncLevel: portfolio.ncLevel,
    trainingCenter: portfolio.trainingCenter,
    scholarshipType: portfolio.scholarshipType,
    trainingDuration: portfolio.trainingDuration,
    tesdaRegistrationNumber: portfolio.tesdaRegistrationNumber,
    email: portfolio.email,
    phone: portfolio.phone,
    website: portfolio.website,
    skills: portfolio.skills,
    experiences: portfolio.experiences,
    // projects: portfolio.projects,
    awardsRecognitions: portfolio.awardsRecognitions,
    continuingEducations: portfolio.continuingEducations,
    professionalMemberships: portfolio.professionalMemberships,
    references: portfolio.references,
    portfolioViews: portfolio.portfolioViews,
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
          <h2>Professional Summary</h2>
          <p>{portfolio.professionalSummary ? portfolio.professionalSummary : "Not provided"}</p>
          <h2>Professional Title</h2>
          <p>{portfolio.professionalTitle ? portfolio.professionalTitle : "Not provided"}</p>
          <h2>Primary Course Type</h2>
          <p>{portfolio.primaryCourseType ? portfolio.primaryCourseType : "Not provided"}</p>
          <h2>Scholar Scheme</h2>
          <p>{portfolio.scholarScheme ? portfolio.scholarScheme : "Not provided"}</p>
          <h2>Design Template</h2>
          <p>{portfolio.designTemplate ? portfolio.designTemplate : "Not provided"}</p>
          <h2>Custom Section</h2>
          <pre>{portfolio.customSectionJson ? portfolio.customSectionJson : "No custom section"}</pre>
          <h2>Visibility</h2>
          <p>{portfolio.visibility ? portfolio.visibility : "Not provided"}</p>
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
          <h2>Employment Readiness</h2>
          <p><strong>Portfolio Category:</strong> {portfolio.portfolioCategory ? portfolio.portfolioCategory : "Not provided"}</p>
          <p><strong>Preferred Work Location:</strong> {portfolio.preferredWorkLocation ? portfolio.preferredWorkLocation : "Not provided"}</p>
          <p><strong>Work Schedule Availability:</strong> {portfolio.workScheduleAvailability ? portfolio.workScheduleAvailability : "Not provided"}</p>
          <p><strong>Salary Expectations:</strong> {portfolio.salaryExpectations ? portfolio.salaryExpectations : "Not provided"}</p>
          <h2>Skills</h2>
          {portfolio.skills && Array.isArray(portfolio.skills) && portfolio.skills.length > 0 ? (
            <div className="skill-list">
              <h4>Skills</h4>
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
              <h4>Experiences</h4>
              {portfolio.experiences.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-details">
                    <h5>{exp.jobTitle && exp.employer ? `${exp.jobTitle} at ${exp.employer}` : "Unnamed Experience"}</h5>
                    {exp.description && <p>Description: {exp.description}</p>}
                    {exp.startDate && <p>Start Date: {exp.startDate}</p>}
                    {exp.endDate && <p>End Date: {exp.endDate}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No experiences provided.</p>
          )}
          {/* <h2>Projects</h2>
          {portfolio.projects && Array.isArray(portfolio.projects) && portfolio.projects.length > 0 ? (
            <div className="project-list">
              <h4>Projects</h4>
              {portfolio.projects.map((proj, index) => (
                <div key={index} className="project-item">
                  <div className="project-details">
                    {proj.imageUrls && (
                      <div>
                        {proj.imageUrls.split(",").map((url, idx) => (
                          <img
                            key={idx}
                            src={url.trim()}
                            alt={`${proj.title || "Project"} Image ${idx + 1}`}
                            className="project-preview"
                          />
                        ))}
                      </div>
                    )}
                    <div>
                      <h5>{proj.title || "Unnamed Project"}</h5>
                      {proj.description && <p>Description: {proj.description}</p>}
                      {proj.startDate && <p>Start Date: {proj.startDate}</p>}
                      {proj.endDate && <p>End Date: {proj.endDate}</p>}
                      {proj.imageUrls && (
                        <p>
                          Files: {proj.imageUrls.includes(".pdf") ? "PDF" : "Images"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No projects provided.</p>
          )} */}
          <h2>Awards & Recognitions</h2>
          {portfolio.awardsRecognitions && Array.isArray(portfolio.awardsRecognitions) && portfolio.awardsRecognitions.length > 0 ? (
            <div className="award-list">
              <h4>Awards</h4>
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
              <h4>Education</h4>
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
              <h4>Memberships</h4>
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
              <h4>References</h4>
              {portfolio.references.map((ref, index) => (
                <div key={index} className="reference-item">
                  <div className="reference-details">
                    <h5>{ref.name || "Unnamed Reference"}</h5>
                    {ref.relationship && <p>Relationship: {ref.relationship}</p>}
                    {ref.email && <p>Email: {ref.email}</p>}
                    {ref.phone && <p>Phone: {ref.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No references provided.</p>
          )}
          <h2>Portfolio Views</h2>
          {portfolio.portfolioViews && Array.isArray(portfolio.portfolioViews) && portfolio.portfolioViews.length > 0 ? (
            <div className="view-list">
              <h4>Portfolio Views</h4>
              {portfolio.portfolioViews.map((view, index) => (
                <div key={index} className="view-item">
                  <div className="view-details">
                    <p>Viewed: {view.viewTimestamp || "Unknown"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No portfolio views recorded.</p>
          )}
          <h2>Certificates</h2>
          {certificates && Array.isArray(certificates) && certificates.length > 0 ? (
            <div className="certificate-list">
              <h4>Certificates</h4>
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