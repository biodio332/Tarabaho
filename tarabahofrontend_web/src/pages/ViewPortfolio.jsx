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
  const [shareToken, setShareToken] = useState(null); // ← NEW: Store share token
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPublicView, setIsPublicView] = useState(false);
  const [isGraduateView, setIsGraduateView] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const navigate = useNavigate();
  const [selectedProjectImage, setSelectedProjectImage] = useState(null);

  // ← NEW: Get share token from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const urlShareToken = urlParams.get('share');

  // Helper function to get the shareable URL
  const getShareableUrl = () => {
    const baseUrl = import.meta.env.PROD ? window.location.origin : `http://localhost:3000`;
    const currentToken = shareToken || localStorage.getItem(`portfolio_${graduateId}_shareToken`);
    
    if (currentToken) {
      return `${baseUrl}/portfolio/${graduateId}?share=${currentToken}`;
    }
    return `${baseUrl}/portfolio/${graduateId}`;
  };

  // ← NEW: Get share token for this portfolio (authenticated users only)
  const fetchShareToken = async (authToken) => {
    try {
      console.log("Fetching share token for graduate ID:", graduateId);
      const response = await axios.get(
        `${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio/share-token`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      
      const tokenData = response.data;
      setShareToken(tokenData.shareToken);
      localStorage.setItem(`portfolio_${graduateId}_shareToken`, tokenData.shareToken);
      console.log("Share token retrieved:", tokenData.shareToken.substring(0, 8) + "...");
      
      return tokenData;
    } catch (err) {
      console.error("Failed to fetch share token:", err);
      return null;
    }
  };

  // Function to normalize portfolio data to match PortfolioCreation fields
    const normalizePortfolioData = (data) => {
    console.log("Normalizing portfolio data structure:", Object.keys(data));
    
    // ← EXTRACT: Get the actual portfolio data (it's nested under "portfolio")
    const portfolioData = data.portfolio || data;
    
    // ← EXTRACT: Get graduate data (could be nested or direct)
    const graduateData = data.graduate || portfolioData.graduate || {};
    
    // ← EXTRACT: Get certificates (could be nested or direct)
    const certificatesData = data.certificates || portfolioData.certificates || [];
    
    // ← EXTRACT: Get projects (could be nested or direct)
    const projectsData = data.projects || portfolioData.projects || [];
    
    console.log("Extracted data:", {
      portfolioKeys: Object.keys(portfolioData),
      graduateKeys: Object.keys(graduateData),
      certificateCount: certificatesData.length,
      projectCount: projectsData.length
    });
    
    const normalized = {
      id: portfolioData.id,
      graduateId: portfolioData.graduateId || graduateData.id,
      fullName: portfolioData.fullName || graduateData.fullName || "Unnamed",
      professionalSummary: portfolioData.professionalSummary || "",
      professionalTitle: portfolioData.professionalTitle || "",
      primaryCourseType: portfolioData.primaryCourseType || "",
      scholarScheme: portfolioData.scholarScheme || "",
      customSectionJson: portfolioData.customSectionJson || "",
      avatar: portfolioData.avatar || graduateData.profilePicture || "",
      ncLevel: portfolioData.ncLevel || "",
      trainingCenter: portfolioData.trainingCenter || "",
      scholarshipType: portfolioData.scholarshipType || "",
      trainingDuration: portfolioData.trainingDuration || "",
      tesdaRegistrationNumber: portfolioData.tesdaRegistrationNumber || "",
      email: portfolioData.email || "", // Keep for now, hide in public view if needed
      phone: portfolioData.phone || "",
      website: portfolioData.website || "",
      portfolioCategory: portfolioData.portfolioCategory || "",
      preferredWorkLocation: portfolioData.preferredWorkLocation || "",
      workScheduleAvailability: portfolioData.workScheduleAvailability || "",
      salaryExpectations: portfolioData.salaryExpectations || "",
      
      // Skills (from portfolio)
      skills: portfolioData.skills
        ? portfolioData.skills.map((skill) => ({
            id: skill.id,
            name: skill.name || "Unnamed Skill",
            type: skill.type || "TECHNICAL",
            proficiencyLevel: skill.proficiencyLevel || "",
          }))
        : [],
      
      // Experiences (from portfolio)
      experiences: portfolioData.experiences
        ? portfolioData.experiences.map((exp) => ({
            id: exp.id,
            jobTitle: exp.jobTitle || "Unnamed",
            company: exp.employer || "",
            duration: exp.duration || "",
            responsibilities: exp.description || "",
          }))
        : [],
      
      // Projects (use the extracted projects array)
      projects: projectsData.length > 0 
        ? projectsData.map((project) => ({
            id: project.id,
            title: project.title || "Unnamed Project",
            description: project.description || "",
            imageUrls: project.imageUrls || "",
            startDate: project.startDate || "",
            endDate: project.endDate || "",
            projectImageFilePath: project.projectImageFilePath || "",
          }))
        : portfolioData.projects
          ? portfolioData.projects.map((project) => ({
              id: project.id,
              title: project.title || "Unnamed Project",
              description: project.description || "",
              imageUrls: project.imageUrls || "",
              startDate: project.startDate || "",
              endDate: project.endDate || "",
              projectImageFilePath: project.projectImageFilePath || "",
            }))
          : [],
      
      // Awards
      awardsRecognitions: portfolioData.awardsRecognitions
        ? portfolioData.awardsRecognitions.map((award) => ({
            id: award.id,
            title: award.title || "Unnamed Award",
            issuer: award.issuer || "",
            dateReceived: award.dateReceived || "",
          }))
        : [],
      
      // Continuing Education
      continuingEducations: portfolioData.continuingEducations
        ? portfolioData.continuingEducations.map((edu) => ({
            id: edu.id,
            courseName: edu.courseName || "Unnamed Course",
            institution: edu.institution || "",
            completionDate: edu.completionDate || "",
          }))
        : [],
      
      // Professional Memberships
      professionalMemberships: portfolioData.professionalMemberships
        ? portfolioData.professionalMemberships.map((mem) => ({
            id: mem.id,
            organization: mem.organization || "Unnamed Organization",
            membershipType: mem.membershipType || "",
            startDate: mem.startDate || "",
          }))
        : [],
      
      // References
      references: portfolioData.references
        ? portfolioData.references.map((ref) => ({
            id: ref.id,
            name: ref.name || "Unnamed Reference",
            position: ref.relationship || "",
            company: ref.company || "",
            contact: ref.phone || "",
            email: ref.email || "",
          }))
        : [],
    };
    
    console.log("✅ Normalized portfolio data:", {
      fullName: normalized.fullName,
      hasProjects: normalized.projects.length > 0,
      hasSkills: normalized.skills.length > 0,
      hasExperiences: normalized.experiences.length > 0
    });
    
    return normalized;
  };
  // Check if user is authenticated graduate
  const checkAuthStatus = async () => {
    try {
      const tokenResponse = await axios.get(`${BACKEND_URL}/api/graduate/get-token`, {
        withCredentials: true,
      });
      const fetchedToken = tokenResponse.data.token;
      if (fetchedToken) {
        setToken(fetchedToken);
        return true;
      }
      return false;
    } catch (err) {
      console.log("User not authenticated");
      return false;
    }
  };

  // Fetch token, portfolio, graduate, certificates, and projects for authenticated users
  const fetchAuthenticatedData = async () => {
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

      // ← NEW: Fetch share token first
      await fetchShareToken(fetchedToken);

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
      const normalizedPortfolio = normalizePortfolioData(portfolioResponse.data);
      setPortfolio(normalizedPortfolio);
      setIsGraduateView(true);
      setIsPublicView(false);

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
      console.error("Failed to fetch authenticated data:", err);
      // If unauthorized, try public view with URL token
      if (err.response?.status === 401 && urlShareToken) {
        console.log("Unauthorized, trying public view with share token...");
        fetchPublicDataWithToken();
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to load portfolio"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ← NEW: Fetch public portfolio with share token from URL
  const fetchPublicDataWithToken = async () => {
    try {
      if (!urlShareToken) {
        throw new Error("Share token is required for public access");
      }
      
      console.log("🔄 Fetching complete public portfolio for ID:", graduateId);
      console.log("🔑 Share token:", urlShareToken.substring(0, 8) + "...");
      
      const portfolioResponse = await axios.get(
        `${BACKEND_URL}/api/portfolio/public/graduate/${graduateId}/portfolio?share=${urlShareToken}`,
        { 
          withCredentials: true,  // ← FIXED: Enable cookies for session tracking
        }
      );
      
      // ← FIXED: Log the ACTUAL response structure
      console.log("📦 API Response Structure:", {
        isCompleteResponse: portfolioResponse.data.portfolio !== undefined,
        hasPortfolio: !!portfolioResponse.data.portfolio,
        hasGraduate: !!portfolioResponse.data.graduate,
        certificateCount: (portfolioResponse.data.certificates || []).length,
        projectCount: (portfolioResponse.data.projects || []).length,
        directPortfolioKeys: portfolioResponse.data.portfolio ? Object.keys(portfolioResponse.data.portfolio) : Object.keys(portfolioResponse.data)
      });
      
      // ← FIXED: Pass the COMPLETE response to normalizer
      const normalizedPortfolio = normalizePortfolioData(portfolioResponse.data);
      
      // ← FIXED: Set ALL states from the response
      setPortfolio(normalizedPortfolio);
      
      // Graduate (could be Map or object)
      const graduateData = portfolioResponse.data.graduate || 
                          (portfolioResponse.data.portfolio ? portfolioResponse.data.portfolio.graduate : null) ||
                          { 
                            id: graduateId, 
                            fullName: normalizedPortfolio.fullName,
                            profilePicture: normalizedPortfolio.avatar 
                          };
      setGraduate(graduateData);
      
      // Certificates
      const certs = portfolioResponse.data.certificates || 
                  (portfolioResponse.data.portfolio ? portfolioResponse.data.portfolio.certificates : []);
      setCertificates(certs);
      
      // Projects  
      const projs = portfolioResponse.data.projects || 
                  (portfolioResponse.data.portfolio ? portfolioResponse.data.portfolio.projects : []);
      setProjects(projs);
      
      setIsPublicView(true);
      setIsGraduateView(false);
      setIsLoading(false);
      
      console.log("✅ Public portfolio loaded with:", {
        graduate: !!graduateData,
        certificates: certs.length,
        projects: projs.length,
        skills: normalizedPortfolio.skills?.length || 0,
        experiences: normalizedPortfolio.experiences?.length || 0
      });
      
    } catch (err) {
      console.error("❌ Failed to fetch public data:", err.response?.status, err.message);
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  // ← HELPER: Better error messages
  const getErrorMessage = (err) => {
    const status = err.response?.status;
    switch (status) {
      case 400: return "❌ Invalid share link. Please ask the portfolio owner for a new link.";
      case 401: return "🔐 Please sign in to view this portfolio.";
      case 404: return "❌ Portfolio not found. This share link may have expired.";
      default: return err.response?.data?.message || "Failed to load portfolio.";
    }
  };

  // ← UPDATED: Simple public data fetch (no token - for backward compatibility)
  const fetchPublicData = async () => {
    // If we have a URL token, use the secure method
    if (urlShareToken) {
      return fetchPublicDataWithToken();
    }
    
    // Fallback to old method (no token required - less secure)
    try {
      console.log("Fetching public portfolio for graduate ID:", graduateId, "(no token - legacy access)");
      const portfolioResponse = await axios.get(
        `${BACKEND_URL}/api/portfolio/public/graduate/${graduateId}/portfolio`,
        { withCredentials: false }
      );
      
      console.log("Public portfolio response:", portfolioResponse.data);
      const normalizedPortfolio = normalizePortfolioData(portfolioResponse.data);
      setPortfolio(normalizedPortfolio);
      setIsPublicView(true);
      setIsGraduateView(false);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch public data:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Public portfolio not found or not accessible"
      );
      setIsLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      const isAuthenticated = await checkAuthStatus();
      
      if (isAuthenticated) {
        await fetchAuthenticatedData();
      } else {
        // Try public view (with or without token)
        await fetchPublicData();
      }
    };

    initializeData();
  }, [graduateId]);

  // ← NEW: Generate new share token (for graduate view only)
  const generateNewShareToken = async () => {
    if (!window.confirm(
      "This will create a NEW share link and INVALIDATE ALL EXISTING LINKS!\n\n" +
      "Anyone with old links will see 'Portfolio not found' errors.\n\n" +
      "Are you sure you want to continue?"
    )) {
      return;
    }

    try {
      console.log("Generating new share token for graduate ID:", graduateId);
      const response = await axios.post(
        `${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio/regenerate-token`,
        {},
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const newTokenData = response.data;
      setShareToken(newTokenData.shareToken);
      localStorage.setItem(`portfolio_${graduateId}_shareToken`, newTokenData.shareToken);
      
      alert(
        `✅ New share link created successfully!\n\n` +
        `📋 ${newTokenData.shareUrl}\n\n` +
        `⚠️ All previous share links are now invalid.`
      );
      
    } catch (err) {
      console.error("Failed to generate new share token:", err);
      alert(
        "❌ Failed to generate new share link.\n\n" +
        "Please try again or contact support."
      );
    }
  };

  
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
        isPublicView,
        isGraduateView,
        hasShareToken: !!shareToken,
        urlHasToken: !!urlShareToken,
      });
    }
  }, [portfolio, isPublicView, isGraduateView, shareToken, urlShareToken]);

  const handleCertificateClick = (certificate) => {
    setSelectedCertificate(selectedCertificate?.id === certificate.id ? null : certificate);
  };

  // ← UPDATED: Copy secure share link
  const copyToClipboard = () => {
    const shareableUrl = getShareableUrl();
    const displayUrl = shareableUrl.includes('?share=') 
      ? `${window.location.origin}/portfolio/${graduateId}?share=${shareToken?.substring(0, 8)}...`
      : shareableUrl;
    
    navigator.clipboard.writeText(shareableUrl).then(() => {
      alert(
        `✅ Secure share link copied!\n\n` +
        `📋 ${displayUrl}\n\n` +
        `🔒 Only people with this exact link can view your portfolio.\n` +
        `💡 Links remain valid until you generate a new one.`
      );
    }).catch((err) => {
      console.error("Failed to copy:", err);
      alert("Failed to copy link. Please try again.");
    });
  };

  // ← UPDATED: Share to LinkedIn with secure token
  const shareToLinkedIn = () => {
    const title = `${portfolio?.fullName || "Portfolio"} - Professional Portfolio`;
    const summary = portfolio?.professionalSummary || "Check out my professional portfolio showcasing my skills, experiences, and achievements!";
    const shareableUrl = getShareableUrl();
    
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
    window.open(linkedInUrl, "_blank");
  };

  // ← UPDATED: Share to Facebook with secure token
  const shareToFacebook = () => {
    const title = `${portfolio?.fullName || "Portfolio"} - Professional Portfolio`;
    const summary = portfolio?.professionalSummary || "Check out my professional portfolio showcasing my skills, experiences, and achievements!";
    const shareableUrl = getShareableUrl();
    
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}&quote=${encodeURIComponent(summary)}&title=${encodeURIComponent(title)}`;
    window.open(facebookUrl, "_blank");
  };

  // ← NEW: Manual token regeneration
  const handleRegenerateToken = generateNewShareToken; // Already defined above

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
    return (
      <div className="view-portfolio-error" style={{ 
        textAlign: 'center', 
        padding: '40px', 
        background: '#f8d7da', 
        borderRadius: '8px', 
        margin: '20px',
        color: '#721c24'
      }}>
        <h3>❌ Access Error</h3>
        <p>{error}</p>
        {error.includes('share link') && (
          <p style={{ marginTop: '10px' }}>
            <Link to="/signin" style={{ color: '#721c24', textDecoration: 'underline' }}>
              🔐 Sign in to view your portfolio
            </Link>
          </p>
        )}
      </div>
    );
  }
  if (!portfolio) {
    console.log("Rendering: no portfolio");
    return (
      <div className="view-portfolio-no-data" style={{ 
        textAlign: 'center', 
        padding: '40px', 
        background: '#fff3cd', 
        borderRadius: '8px', 
        margin: '20px',
        color: '#856404'
      }}>
        <h3>📂 Portfolio Not Found</h3>
        <p>The portfolio you're looking for doesn't exist or isn't accessible.</p>
        <Link to="/" style={{ color: '#856404', textDecoration: 'underline' }}>
          ← Return to Homepage
        </Link>
      </div>
    );
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
          {/* ← FIXED: Separate containers for each view */}
      {isGraduateView ? (
        // Graduate view - use your existing complex CSS
        <div className="profile-picture-container">
          {graduate?.profilePicture && (
            <img
              src={graduate.profilePicture}
              alt="Graduate Profile"
              className="profile-picture"
            />
          )}
        </div>
      ) : (
        // Public view - simple, reliable styling
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '2rem'
        }}>
          {(graduate?.profilePicture || portfolio?.avatar) && (
            <img
              src={graduate?.profilePicture || portfolio?.avatar}
              alt={`${portfolio.fullName || 'Profile'} Picture`}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #e9ecef',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'block'
              }}
            />
          )}
        </div>
      )}

        <h1>{portfolio.fullName || "Unnamed Portfolio"}</h1>
        
        {/* ← NEW: Access Type Indicator */}
        <div className="access-indicator" style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {isGraduateView ? (
            <span style={{ color: '#28a745', background: '#d4edda' }}>
              👤 Owner View
            </span>
          ) : (
            <span style={{ color: '#007bff', background: '#cce7ff' }}>
              👁️ Secure Public View
              {urlShareToken && (
                <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}>
                  🔒 (Private Link)
                </span>
              )}
            </span>
          )}
        </div>

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

          {/* Projects Section */}
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
                        onClick={() => setSelectedProjectImage(project.projectImageFilePath)}
                      />
                    )}
                    <div className="project-title">
                      <h5>{project.title || "Unnamed Project"}</h5>
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

        {/* ← NEW: Enhanced Action Buttons for Graduate View */}
        {isGraduateView && (
          <div className="graduate-actions">
            {/* ← NEW: Share Section with Two Options */}
            <div className="share-section" style={{ 
              background: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              borderLeft: '4px solid #007bff'
            }}>
              <h3 style={{ marginTop: 0, color: '#495057' }}>🔗 Share Your Portfolio</h3>
              
              <div className="share-buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                <button 
                  onClick={copyToClipboard} 
                  className="share-button primary"
                  style={{ 
                    background: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 16px', 
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copy Secure Share Link
                </button>
                
                <button 
                  onClick={shareToLinkedIn} 
                  className="share-button"
                  style={{ 
                    background: '#0077b5', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 16px', 
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  💼 Share to LinkedIn
                </button>
                
                <button 
                  onClick={shareToFacebook} 
                  className="share-button"
                  style={{ 
                    background: '#1877f2', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 16px', 
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  📘 Share to Facebook
                </button>
              </div>

              {/* ← NEW: Token Management */}
              {shareToken && (
                <div className="token-info" style={{ 
                  background: '#e7f3ff', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  marginTop: '10px',
                  fontSize: '14px'
                }}>
                  <p style={{ margin: 0, color: '#0c5460' }}>
                    <strong>🔒 Your Secure Token:</strong> {shareToken.substring(0, 8)}...{shareToken.slice(-4)}
                  </p>
                  <p style={{ 
                    margin: '5px 0 0 0', 
                    fontSize: '12px', 
                    color: '#6c757d',
                    fontStyle: 'italic'
                  }}>
                    Links using this token will work until you generate a new one.
                  </p>
                </div>
              )}

              {/* ← NEW: Generate New Token Button */}
              <div style={{ marginTop: '15px' }}>
                <button 
                  onClick={handleRegenerateToken}
                  className="regenerate-button"
                  style={{ 
                    background: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  🔄 Generate New Share Link
                </button>
                <small style={{ 
                  display: 'block', 
                  marginTop: '5px', 
                  color: '#dc3545', 
                  fontSize: '12px' 
                }}>
                  ⚠️ This will invalidate ALL existing share links
                </small>
              </div>
            </div>

            {/* ← Existing Edit/Delete Buttons */}
            <div className="edit-delete-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
              <Link 
                to={`/portfolio/edit/${graduateId}`} 
                className="edit-portfolio-button"
                style={{ 
                  background: '#28a745', 
                  color: 'white', 
                  textDecoration: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '6px',
                  fontWeight: '500'
                }}
              >
                ✏️ Edit Portfolio
              </Link>
              
              <button 
                onClick={handleDelete} 
                className="delete-button"
                style={{ 
                  background: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                🗑️ Delete Portfolio
              </button>
            </div>
            
            <Link 
              to="/graduate-homepage" 
              className="view-portfolio-back-button"
              style={{ 
                display: 'inline-block', 
                color: '#6c757d', 
                textDecoration: 'none', 
                padding: '8px 16px', 
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                marginBottom: '20px'
              }}
            >
              ← Back to Homepage
            </Link>
          </div>
        )}

        {/* ← UPDATED: Enhanced Public View Footer */}
        {isPublicView && (
          <div className="public-view-footer" style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginTop: '30px',
            textAlign: 'center',
            borderLeft: '4px solid #007bff'
          }}>
            <h4 style={{ color: '#495057', marginTop: 0 }}>🔒 Secure Portfolio Access</h4>
            <p style={{ color: '#6c757d', marginBottom: '10px' }}>
              You've accessed this portfolio through a secure private link.
            </p>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>
              👤 Want to edit this portfolio or view your own?{' '}
              <Link to="/signin" style={{ color: '#007bff', fontWeight: '500' }}>
                Sign in here
              </Link>
            </p>
            {!urlShareToken && (
              <p style={{ 
                color: '#856404', 
                background: '#fff3cd', 
                padding: '8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                marginTop: '10px'
              }}>
                ⚠️ <strong>Legacy Access:</strong> This portfolio allows public access without a share token 
                (less secure). Contact the owner to get a secure share link.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Project Image Modal */}
      {selectedProjectImage && (
        <div className="modal-overlay" onClick={() => setSelectedProjectImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-button" 
              onClick={() => setSelectedProjectImage(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
            <img 
              src={selectedProjectImage} 
              alt="Enlarged Project" 
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedCertificate && (
        <div className="modal-overlay" onClick={() => setSelectedCertificate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-button" 
              onClick={() => setSelectedCertificate(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
            <div className="certificate-modal-content">
              {selectedCertificate.certificateFilePath ? (
                selectedCertificate.certificateFilePath.endsWith(".pdf") ? (
                  <iframe
                    src={`${selectedCertificate.certificateFilePath}#toolbar=0&navpanes=0&scrollbar=0`}
                    title={selectedCertificate.courseName || "Certificate"}
                    style={{ width: '100%', height: '80vh', border: 'none' }}
                  />
                ) : (
                  <img
                    src={selectedCertificate.certificateFilePath}
                    alt={selectedCertificate.courseName || "Certificate"}
                    style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                  />
                )
              ) : (
                <p>No certificate file available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPortfolio;