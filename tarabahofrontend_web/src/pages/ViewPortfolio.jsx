"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import {
  Card,
  CardBody,
  Typography,
  Button,
  Avatar,
  Dialog,
  DialogBody,
  DialogFooter,
  Chip,
  Spinner,
} from "@material-tailwind/react"

const ViewPortfolio = () => {
  const { graduateId } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const [graduate, setGraduate] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [token, setToken] = useState(null)
  const [shareToken, setShareToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isPublicView, setIsPublicView] = useState(false)
  const [isGraduateView, setIsGraduateView] = useState(false)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"
  const navigate = useNavigate()
  const [selectedProjectImage, setSelectedProjectImage] = useState(null)

  const urlParams = new URLSearchParams(window.location.search)
  const urlShareToken = urlParams.get("share")

  const getShareableUrl = () => {
    const baseUrl = import.meta.env.PROD ? window.location.origin : `http://localhost:3000`
    const currentToken = shareToken || localStorage.getItem(`portfolio_${graduateId}_shareToken`)
    if (currentToken) {
      return `${baseUrl}/portfolio/${graduateId}?share=${currentToken}`
    }
    return `${baseUrl}/portfolio/${graduateId}`
  }

  const fetchShareToken = async (authToken) => {
    try {
      console.log("Fetching share token for graduate ID:", graduateId)
      const response = await axios.get(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio/share-token`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const tokenData = response.data
      setShareToken(tokenData.shareToken)
      localStorage.setItem(`portfolio_${graduateId}_shareToken`, tokenData.shareToken)
      console.log("Share token retrieved:", tokenData.shareToken.substring(0, 8) + "...")
      return tokenData
    } catch (err) {
      console.error("Failed to fetch share token:", err)
      return null
    }
  }

  const normalizePortfolioData = (data) => {
    console.log("Normalizing portfolio data structure:", Object.keys(data))
    const portfolioData = data.portfolio || data
    const graduateData = data.graduate || portfolioData.graduate || {}
    const certificatesData = data.certificates || portfolioData.certificates || []
    const projectsData = data.projects || portfolioData.projects || []

    console.log("Extracted data:", {
      portfolioKeys: Object.keys(portfolioData),
      graduateKeys: Object.keys(graduateData),
      certificateCount: certificatesData.length,
      projectCount: projectsData.length,
    })

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
      email: portfolioData.email || "",
      phone: portfolioData.phone || "",
      website: portfolioData.website || "",
      portfolioCategory: portfolioData.portfolioCategory || "",
      preferredWorkLocation: portfolioData.preferredWorkLocation || "",
      workScheduleAvailability: portfolioData.workScheduleAvailability || "",
      salaryExpectations: portfolioData.salaryExpectations || "",
      skills: portfolioData.skills
        ? portfolioData.skills.map((skill) => ({
            id: skill.id,
            name: skill.name || "Unnamed Skill",
            type: skill.type || "TECHNICAL",
            proficiencyLevel: skill.proficiencyLevel || "",
          }))
        : [],
      experiences: portfolioData.experiences
        ? portfolioData.experiences.map((exp) => ({
            id: exp.id,
            jobTitle: exp.jobTitle || "Unnamed",
            company: exp.employer || "",
            duration: exp.duration || "",
            responsibilities: exp.description || "",
          }))
        : [],
      projects:
        projectsData.length > 0
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
      awardsRecognitions: portfolioData.awardsRecognitions
        ? portfolioData.awardsRecognitions.map((award) => ({
            id: award.id,
            title: award.title || "Unnamed Award",
            issuer: award.issuer || "",
            dateReceived: award.dateReceived || "",
          }))
        : [],
      continuingEducations: portfolioData.continuingEducations
        ? portfolioData.continuingEducations.map((edu) => ({
            id: edu.id,
            courseName: edu.courseName || "Unnamed Course",
            institution: edu.institution || "",
            completionDate: edu.completionDate || "",
          }))
        : [],
      professionalMemberships: portfolioData.professionalMemberships
        ? portfolioData.professionalMemberships.map((mem) => ({
            id: mem.id,
            organization: mem.organization || "Unnamed Organization",
            membershipType: mem.membershipType || "",
            startDate: mem.startDate || "",
          }))
        : [],
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
    }

    console.log("✅ Normalized portfolio data:", {
      fullName: normalized.fullName,
      hasProjects: normalized.projects.length > 0,
      hasSkills: normalized.skills.length > 0,
      hasExperiences: normalized.experiences.length > 0,
    })

    return normalized
  }

  const checkAuthStatus = async () => {
    try {
      const tokenResponse = await axios.get(`${BACKEND_URL}/api/graduate/get-token`, {
        withCredentials: true,
      })
      const fetchedToken = tokenResponse.data.token
      if (fetchedToken) {
        setToken(fetchedToken)
        return true
      }
      return false
    } catch (err) {
      console.log("User not authenticated")
      return false
    }
  }

  const fetchAuthenticatedData = async () => {
    try {
      console.log("Fetching JWT token for graduate ID:", graduateId)
      const tokenResponse = await axios.get(`${BACKEND_URL}/api/graduate/get-token`, {
        withCredentials: true,
      })
      const fetchedToken = tokenResponse.data.token
      console.log("Token response:", tokenResponse.data)
      if (!fetchedToken) {
        throw new Error("No token returned from /api/graduate/get-token")
      }
      setToken(fetchedToken)

      await fetchShareToken(fetchedToken)

      console.log("Fetching portfolio for graduate ID:", graduateId)
      const portfolioResponse = await axios.get(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${fetchedToken}` },
      })
      console.log("Portfolio response:", portfolioResponse.data)
      const normalizedPortfolio = normalizePortfolioData(portfolioResponse.data)
      setPortfolio(normalizedPortfolio)
      setIsGraduateView(true)
      setIsPublicView(false)

      console.log("Fetching graduate data for ID:", graduateId)
      const graduateResponse = await axios.get(`${BACKEND_URL}/api/graduate/${graduateId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${fetchedToken}` },
        params: { includePortfolio: false },
      })
      console.log("Graduate response:", graduateResponse.data)
      setGraduate(graduateResponse.data)

      console.log("Fetching certificates for graduate ID:", graduateId)
      const certificatesResponse = await axios.get(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${fetchedToken}` },
      })
      console.log("Certificates response:", certificatesResponse.data)
      setCertificates(certificatesResponse.data)

      console.log("Fetching projects for portfolio ID:", normalizedPortfolio.id)
      if (normalizedPortfolio.id) {
        const projectsResponse = await axios.get(`${BACKEND_URL}/api/project/portfolio/${normalizedPortfolio.id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${fetchedToken}` },
        })
        console.log("Projects response:", projectsResponse.data)
        setProjects(projectsResponse.data)
      }
    } catch (err) {
      console.error("Failed to fetch authenticated data:", err)
      if (err.response?.status === 401 && urlShareToken) {
        console.log("Unauthorized, trying public view with share token...")
        fetchPublicDataWithToken()
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load portfolio")
      }
    } finally {
      setIsLoading(false)
    }
  }

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

  const getErrorMessage = (err) => {
    const status = err.response?.status
    switch (status) {
      case 400:
        return "❌ Invalid share link. Please ask the portfolio owner for a new link."
      case 401:
        return "🔐 Please sign in to view your portfolio."
      case 404:
        return "❌ Portfolio not found. This share link may have expired."
      default:
        return err.response?.data?.message || "Failed to load portfolio."
    }
  }

  const fetchPublicData = async () => {
    if (urlShareToken) {
      return fetchPublicDataWithToken()
    }

    try {
      console.log("Fetching public portfolio for graduate ID:", graduateId, "(no token - legacy access)")
      const portfolioResponse = await axios.get(
        `${BACKEND_URL}/api/portfolio/public/graduate/${graduateId}/portfolio`,
        { withCredentials: false },
      )

      console.log("Public portfolio response:", portfolioResponse.data)
      const normalizedPortfolio = normalizePortfolioData(portfolioResponse.data)
      setPortfolio(normalizedPortfolio)
      setIsPublicView(true)
      setIsGraduateView(false)
      setIsLoading(false)
    } catch (err) {
      console.error("Failed to fetch public data:", err)
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Public portfolio not found or not accessible",
      )
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      const isAuthenticated = await checkAuthStatus()
      if (isAuthenticated) {
        await fetchAuthenticatedData()
      } else {
        await fetchPublicData()
      }
    }
    initializeData()
  }, [graduateId])

  const generateNewShareToken = async () => {
    if (
      !window.confirm(
        "This will create a NEW share link and INVALIDATE ALL EXISTING LINKS!\n\n" +
          "Anyone with old links will see 'Portfolio not found' errors.\n\n" +
          "Are you sure you want to continue?",
      )
    ) {
      return
    }

    try {
      console.log("Generating new share token for graduate ID:", graduateId)
      const response = await axios.post(
        `${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio/regenerate-token`,
        {},
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      const newTokenData = response.data
      setShareToken(newTokenData.shareToken)
      localStorage.setItem(`portfolio_${graduateId}_shareToken`, newTokenData.shareToken)

      alert(
        `✅ New share link created successfully!\n\n` +
          `📋 ${newTokenData.shareUrl}\n\n` +
          `⚠️ All previous share links are now invalid.`,
      )
    } catch (err) {
      console.error("Failed to generate new share token:", err)
      alert("❌ Failed to generate new share link.\n\nPlease try again or contact support.")
    }
  }

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
      })
    }
  }, [portfolio, isPublicView, isGraduateView, shareToken, urlShareToken])

  const handleCertificateClick = (certificate) => {
    setSelectedCertificate(selectedCertificate?.id === certificate.id ? null : certificate)
  }

  const copyToClipboard = () => {
    const shareableUrl = getShareableUrl()
    const displayUrl = shareableUrl.includes("?share=")
      ? `${window.location.origin}/portfolio/${graduateId}?share=${shareToken?.substring(0, 8)}...`
      : shareableUrl

    navigator.clipboard
      .writeText(shareableUrl)
      .then(() => {
        alert(
          `✅ Secure share link copied!\n\n` +
            `📋 ${displayUrl}\n\n` +
            `🔒 Only people with this exact link can view your portfolio.\n` +
            `💡 Links remain valid until you generate a new one.`,
        )
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
        alert("Failed to copy link. Please try again.")
      })
  }

  const shareToLinkedIn = () => {
    const title = `${portfolio?.fullName || "Portfolio"} - Professional Portfolio`
    const summary =
      portfolio?.professionalSummary ||
      "Check out my professional portfolio showcasing my skills, experiences, and achievements!"
    const shareableUrl = getShareableUrl()

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareableUrl,
    )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`
    window.open(linkedInUrl, "_blank")
  }

  const shareToFacebook = () => {
    const title = `${portfolio?.fullName || "Portfolio"} - Professional Portfolio`
    const summary =
      portfolio?.professionalSummary ||
      "Check out my professional portfolio showcasing my skills, experiences, and achievements!"
    const shareableUrl = getShareableUrl()

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareableUrl,
    )}&quote=${encodeURIComponent(summary)}&title=${encodeURIComponent(title)}`
    window.open(facebookUrl, "_blank")
  }

  const handleRegenerateToken = generateNewShareToken

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this portfolio? This action cannot be undone.")) {
      try {
        console.log("Deleting portfolio for graduate ID:", graduateId)
        await axios.delete(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Portfolio deleted successfully")
        alert("Portfolio deleted successfully.")
        navigate("/graduate-homepage")
      } catch (err) {
        console.error("Failed to delete portfolio:", err)
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to delete portfolio")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Spinner className="h-12 w-12 mx-auto mb-4" />
          <Typography variant="h6" color="blue-gray">
            Loading Portfolio...
          </Typography>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto bg-white shadow-xl">
          <CardBody className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Typography variant="h4" color="red">
                ❌
              </Typography>
            </div>
            <Typography variant="h5" color="red" className="mb-4">
              Access Error
            </Typography>
            <Typography color="gray" className="mb-6">
              {error}
            </Typography>
            {error.includes("share link") && (
              <Link to="/signin">
                <Button color="blue" className="w-full">
                  🔐 Sign in to view your portfolio
                </Button>
              </Link>
            )}
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto bg-white shadow-xl">
          <CardBody className="text-center p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Typography variant="h4" color="amber">
                📂
              </Typography>
            </div>
            <Typography variant="h5" color="amber" className="mb-4">
              Portfolio Not Found
            </Typography>
            <Typography color="gray" className="mb-6">
              The portfolio you're looking for doesn't exist or isn't accessible.
            </Typography>
            <Link to="/">
              <Button color="blue" className="w-full">
                ← Return to Homepage
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>

        <div className="container mx-auto px-6 py-24 relative">
          <div className="flex items-center justify-between max-w-6xl mx-auto gap-16">
            {/* Profile Image - Left Side */}
            {(graduate?.profilePicture || portfolio?.avatar) && (
              <div className="relative flex-shrink-0 animate-fade-in-up">
                <div className="absolute inset-0 bg-white/20 blur-xl scale-110 animate-pulse"></div>
                <div className="absolute inset-0 bg-blue-300/30 blur-2xl scale-125 animate-ping opacity-20"></div>
                <Avatar
                  src={graduate?.profilePicture || portfolio?.avatar}
                  alt={`${portfolio.fullName || "Profile"} Picture`}
                  size="xxl"
                  className="relative shadow-2xl w-80 h-80 backdrop-blur-sm hover:scale-105 transition-all duration-500 animate-float rounded-none border-0"
                />
              </div>
            )}

            {/* Text Content - Right Side */}
            <div className="flex-1 text-left space-y-8">
              <div className="animate-fade-in-up animation-delay-300">
                <Typography
                  variant="h1"
                  className="mb-6 font-extralight text-5xl md:text-6xl lg:text-7xl tracking-tight animate-typing overflow-hidden whitespace-nowrap border-r-4 border-white/50 break-words"
                >
                  {portfolio.fullName || "Professional Portfolio"}
                </Typography>
              </div>

              {portfolio.professionalTitle && (
                <div className="relative animate-fade-in-up animation-delay-600">
                  <Typography
                    variant="h3"
                    className="font-light text-white/90 text-2xl md:text-3xl tracking-wide break-words"
                  >
                    {portfolio.professionalTitle}
                  </Typography>
                  <div className="w-0 h-0.5 bg-white/40 mt-4 animate-expand-line"></div>
                </div>
              )}

              {portfolio.professionalSummary && (
                <div className="max-w-3xl mt-10 animate-fade-in-up animation-delay-900">
                  <Typography
                    variant="lead"
                    className="text-white/80 leading-relaxed text-xl md:text-2xl font-light tracking-wide break-words overflow-wrap-anywhere"
                  >
                    {portfolio.professionalSummary}
                  </Typography>
                </div>
              )}

              <div className="mt-14 flex justify-start animate-fade-in-up animation-delay-1200">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-8 py-4 hover:bg-white/20 hover:scale-105 transition-all duration-300 animate-bounce-subtle">
                  <Chip
                    value={isGraduateView ? "Owner View" : `Public View ${urlShareToken ? "🔒" : ""}`}
                    color="blue-gray"
                    className="bg-transparent text-white border-none font-light text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 animate-wave">
          <svg viewBox="0 0 1200 120" className="w-full h-12 fill-white">
            <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes expand-line {
          from {
            width: 0;
          }
          to {
            width: 6rem;
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-typing {
          animation: typing 3s steps(40, end) 1s forwards;
          width: 0;
        }

        .animate-expand-line {
          animation: expand-line 1s ease-out 2s forwards;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 4s ease-in-out infinite;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-900 {
          animation-delay: 0.9s;
        }

        .animation-delay-1200 {
          animation-delay: 1.2s;
        }
      `}</style>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1 space-y-8">
            {/* Contact Information */}
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <Typography variant="h6" className="font-light text-blue-600 mb-6 text-lg">
                Contact
              </Typography>
              <div className="space-y-4">
                {portfolio.email && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Email
                    </Typography>
                    <Typography variant="small" className="text-gray-800 break-all">
                      {portfolio.email}
                    </Typography>
                  </div>
                )}
                {portfolio.phone && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Phone
                    </Typography>
                    <Typography variant="small" className="text-gray-800">
                      {portfolio.phone}
                    </Typography>
                  </div>
                )}
                {portfolio.website && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Website
                    </Typography>
                    <Typography variant="small" className="text-gray-800 break-all">
                      {portfolio.website}
                    </Typography>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <Typography variant="h6" className="font-light text-blue-600 mb-6 text-lg">
                Skills
              </Typography>
              {portfolio.skills && portfolio.skills.length > 0 ? (
                <div className="space-y-3">
                  {portfolio.skills.map((skill, index) => (
                    <div key={index} className="pb-3 border-b border-gray-50 last:border-b-0">
                      <Typography variant="small" className="font-medium text-gray-800 mb-1">
                        {skill.name}
                      </Typography>
                      <div className="flex items-center space-x-2">
                        <Chip size="sm" value={skill.type} color="blue" className="text-xs font-light" />
                        {skill.proficiencyLevel && (
                          <Typography variant="small" color="gray" className="text-xs">
                            {skill.proficiencyLevel}
                          </Typography>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography variant="small" className="text-gray-500 italic">
                  No skills added yet
                </Typography>
              )}
            </div>

            {/* TESDA Information */}
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <Typography variant="h6" className="font-light text-blue-600 mb-6 text-lg">
                TESDA Information
              </Typography>
              <div className="space-y-4">
                {portfolio.ncLevel && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      NC Level
                    </Typography>
                    <Typography variant="small" className="text-gray-800">
                      {portfolio.ncLevel}
                    </Typography>
                  </div>
                )}
                {portfolio.trainingCenter && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Training Center
                    </Typography>
                    <Typography variant="small" className="text-gray-800">
                      {portfolio.trainingCenter}
                    </Typography>
                  </div>
                )}
                {portfolio.scholarshipType && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Scholarship Type
                    </Typography>
                    <Typography variant="small" className="text-gray-800">
                      {portfolio.scholarshipType}
                    </Typography>
                  </div>
                )}
                {portfolio.trainingDuration && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Training Duration
                    </Typography>
                    <Typography variant="small" className="text-gray-800">
                      {portfolio.trainingDuration}
                    </Typography>
                  </div>
                )}
                {portfolio.tesdaRegistrationNumber && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Registration Number
                    </Typography>
                    <Typography variant="small" className="text-gray-800">
                      {portfolio.tesdaRegistrationNumber}
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-12">
            {/* Experience */}
            <div>
              <Typography variant="h4" className="font-light text-blue-600 mb-8 text-2xl">
                Experience
              </Typography>
              {portfolio.experiences && portfolio.experiences.length > 0 ? (
                <div className="space-y-8">
                  {portfolio.experiences.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-100 pl-8 pb-8">
                      <Typography variant="h6" className="font-medium text-gray-800 mb-2 break-words">
                        {exp.jobTitle}
                      </Typography>
                      {exp.company && (
                        <Typography variant="small" color="blue" className="font-medium mb-2 break-words">
                          {exp.company}
                        </Typography>
                      )}
                      {exp.duration && (
                        <Typography variant="small" color="gray" className="mb-4">
                          {exp.duration}
                        </Typography>
                      )}
                      {exp.responsibilities && (
                        <Typography
                          variant="small"
                          className="text-gray-700 leading-relaxed break-words overflow-wrap-anywhere"
                        >
                          {exp.responsibilities}
                        </Typography>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-lg p-6">
                  <Typography variant="small" className="text-gray-500 italic">
                    No experience added yet
                  </Typography>
                </div>
              )}
            </div>

            {/* Projects */}
            <div>
              <Typography variant="h4" className="font-light text-blue-600 mb-8 text-2xl">
                Projects
              </Typography>
              {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      {project.projectImageFilePath && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={project.projectImageFilePath || "/placeholder.svg"}
                            alt={project.title || "Project"}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                            onClick={() => setSelectedProjectImage(project.projectImageFilePath)}
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <Typography variant="h6" className="font-medium mb-3 break-words">
                          {project.title || "Unnamed Project"}
                        </Typography>
                        {project.description && (
                          <Typography
                            variant="small"
                            color="gray"
                            className="mb-4 leading-relaxed break-words overflow-wrap-anywhere"
                          >
                            {project.description}
                          </Typography>
                        )}
                        {project.startDate && project.endDate && (
                          <Typography variant="small" color="blue" className="font-medium">
                            {new Date(project.startDate).toLocaleDateString()} -{" "}
                            {new Date(project.endDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-lg p-6">
                  <Typography variant="small" className="text-gray-500 italic">
                    No projects added yet
                  </Typography>
                </div>
              )}
            </div>

            {/* Certificates */}
            <div>
              <Typography variant="h4" className="font-light text-blue-600 mb-8 text-2xl">
                Certificates
              </Typography>
              {certificates && certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.map((certificate) => (
                    <div
                      key={certificate.id}
                      className="bg-white border border-gray-100 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow duration-300"
                      onClick={() => handleCertificateClick(certificate)}
                    >
                      <div className="flex items-start space-x-4">
                        {certificate.certificateFilePath && (
                          <img
                            src={certificate.certificateFilePath || "/placeholder.svg"}
                            alt={certificate.courseName || "Certificate"}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <Typography variant="h6" className="font-medium mb-2">
                            {certificate.courseName || "Certificate"}
                          </Typography>
                          <Typography variant="small" color="gray" className="mb-1">
                            {certificate.certificateNumber || "N/A"}
                          </Typography>
                          <Typography variant="small" color="blue">
                            {certificate.issueDate || "N/A"}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-lg p-6">
                  <Typography variant="small" className="text-gray-500 italic">
                    No certificates added yet
                  </Typography>
                </div>
              )}
            </div>

            {/* Awards & Recognition */}
            <div>
              <Typography variant="h4" className="font-light text-blue-600 mb-8 text-2xl">
                Awards & Recognition
              </Typography>
              {portfolio.awardsRecognitions && portfolio.awardsRecognitions.length > 0 ? (
                <div className="space-y-4">
                  {portfolio.awardsRecognitions.map((award, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-lg p-6">
                      <Typography variant="h6" className="font-medium mb-2">
                        {award.title}
                      </Typography>
                      {award.issuer && (
                        <Typography variant="small" color="gray" className="mb-1">
                          Issued by: {award.issuer}
                        </Typography>
                      )}
                      {award.dateReceived && (
                        <Typography variant="small" color="blue">
                          {award.dateReceived}
                        </Typography>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-lg p-6">
                  <Typography variant="small" className="text-gray-500 italic">
                    No awards or recognition added yet
                  </Typography>
                </div>
              )}
            </div>

            {/* Education & Memberships */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Continuing Education */}
              <div>
                <Typography variant="h5" className="font-light text-blue-600 mb-6">
                  Continuing Education
                </Typography>
                {portfolio.continuingEducations && portfolio.continuingEducations.length > 0 ? (
                  <div className="space-y-4">
                    {portfolio.continuingEducations.map((edu, index) => (
                      <div key={index} className="border-l-2 border-blue-100 pl-4 py-2">
                        <Typography variant="small" className="font-medium mb-1">
                          {edu.courseName}
                        </Typography>
                        {edu.institution && (
                          <Typography variant="small" color="gray" className="mb-1">
                            {edu.institution}
                          </Typography>
                        )}
                        {edu.completionDate && (
                          <Typography variant="small" color="blue">
                            {edu.completionDate}
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography variant="small" className="text-gray-500 italic">
                    No continuing education added yet
                  </Typography>
                )}
              </div>

              {/* Professional Memberships */}
              <div>
                <Typography variant="h5" className="font-light text-blue-600 mb-6">
                  Professional Memberships
                </Typography>
                {portfolio.professionalMemberships && portfolio.professionalMemberships.length > 0 ? (
                  <div className="space-y-4">
                    {portfolio.professionalMemberships.map((mem, index) => (
                      <div key={index} className="border-l-2 border-blue-100 pl-4 py-2">
                        <Typography variant="small" className="font-medium mb-1">
                          {mem.organization}
                        </Typography>
                        {mem.membershipType && (
                          <Typography variant="small" color="gray" className="mb-1">
                            {mem.membershipType}
                          </Typography>
                        )}
                        {mem.startDate && (
                          <Typography variant="small" color="blue">
                            Since {mem.startDate}
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography variant="small" className="text-gray-500 italic">
                    No professional memberships added yet
                  </Typography>
                )}
              </div>
            </div>

            {/* References */}
            <div>
              <Typography variant="h4" className="font-light text-blue-600 mb-8 text-2xl">
                References
              </Typography>
              {portfolio.references && portfolio.references.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolio.references.map((ref, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-lg p-6">
                      <Typography variant="h6" className="font-medium mb-2 break-words">
                        {ref.name}
                      </Typography>
                      {ref.position && (
                        <Typography variant="small" color="gray" className="mb-1 break-words">
                          {ref.position}
                        </Typography>
                      )}
                      {ref.company && (
                        <Typography variant="small" color="blue" className="mb-3 break-words">
                          {ref.company}
                        </Typography>
                      )}
                      <div className="space-y-1">
                        {ref.email && (
                          <Typography variant="small" color="gray" className="break-all">
                            {ref.email}
                          </Typography>
                        )}
                        {ref.contact && (
                          <Typography variant="small" color="gray" className="break-words">
                            {ref.contact}
                          </Typography>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-lg p-6">
                  <Typography variant="small" className="text-gray-500 italic">
                    No references added yet
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>

        {isGraduateView && (
          <div className="mt-16 bg-white border border-gray-100 rounded-lg p-8">
            <div className="text-center mb-8">
              <Typography variant="h4" color="blue" className="mb-4 font-light">
                Share Your Portfolio
              </Typography>
              <Typography color="gray" className="max-w-2xl mx-auto font-light">
                Share your professional portfolio with potential employers, clients, or collaborators using secure
                links.
              </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Button onClick={copyToClipboard} color="blue" size="lg" className="font-light">
                Copy Secure Link
              </Button>
              <Button onClick={shareToLinkedIn} color="blue" variant="outlined" size="lg" className="font-light">
                Share to LinkedIn
              </Button>
              <Button onClick={shareToFacebook} color="blue" variant="outlined" size="lg" className="font-light">
                Share to Facebook
              </Button>
            </div>

            {shareToken && (
              <div className="p-6 bg-blue-50 rounded-lg mb-6">
                <Typography variant="h6" color="blue" className="mb-2 font-light">
                  Your Secure Token
                </Typography>
                <Typography variant="small" color="blue-gray" className="font-mono">
                  {shareToken.substring(0, 8)}...{shareToken.slice(-4)}
                </Typography>
                <Typography variant="small" color="gray" className="mt-2 italic">
                  Links using this token will work until you generate a new one.
                </Typography>
              </div>
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={`/portfolio/edit/${graduateId}`}>
                <Button color="blue" size="lg" className="font-light">
                  Edit Portfolio
                </Button>
              </Link>
              <Button onClick={handleRegenerateToken} color="blue" variant="outlined" size="lg" className="font-light">
                Generate New Link
              </Button>
              <Button onClick={handleDelete} color="red" variant="outlined" size="lg" className="font-light">
                Delete Portfolio
              </Button>
            </div>

            <div className="text-center mt-8">
              <Link to="/graduate-homepage">
                <Button color="gray" variant="text" size="lg" className="font-light">
                  ← Back to Homepage
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isPublicView && (
          <div className="mt-16 bg-blue-50 border border-blue-100 rounded-lg p-8 text-center">
            <Typography variant="h5" color="blue" className="mb-4 font-light">
              Secure Portfolio Access
            </Typography>
            <Typography color="blue-gray" className="mb-6 max-w-2xl mx-auto font-light">
              You've accessed this portfolio through a secure private link. This ensures the portfolio owner's privacy
              and control over who can view their information.
            </Typography>
            <Typography color="blue-gray" className="mb-6 font-light">
              Want to edit this portfolio or view your own?
            </Typography>
            <Link to="/signin">
              <Button color="blue" size="lg" className="font-light">
                Sign in here
              </Button>
            </Link>
            {!urlShareToken && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Typography color="amber" className="text-sm font-light">
                  <strong>Legacy Access:</strong> This portfolio allows public access without a share token (less
                  secure). Contact the owner to get a secure share link.
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCertificate && (
        <Dialog open={!!selectedCertificate} handler={() => setSelectedCertificate(null)} size="md">
          <DialogBody className="p-2 flex items-center justify-center min-h-[200px]">
            {selectedCertificate.certificateFilePath ? (
              selectedCertificate.certificateFilePath.endsWith(".pdf") ? (
                <iframe
                  src={`${selectedCertificate.certificateFilePath}#toolbar=0&navpanes=0&scrollbar=0`}
                  title={selectedCertificate.courseName || "Certificate"}
                  className="w-full h-[70vh]"
                />
              ) : (
                <img
                  src={selectedCertificate.certificateFilePath || "/placeholder.svg"}
                  alt={selectedCertificate.courseName || "Certificate"}
                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                />
              )
            ) : (
              <div className="p-8 text-center">
                <Typography variant="small">No certificate file available.</Typography>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="text" color="red" onClick={() => setSelectedCertificate(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {selectedProjectImage && (
        <Dialog open={!!selectedProjectImage} handler={() => setSelectedProjectImage(null)} size="md">
          <DialogBody className="p-2 flex items-center justify-center min-h-[200px]">
            <img
              src={selectedProjectImage || "/placeholder.svg"}
              alt="Enlarged Project"
              className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="text" color="red" onClick={() => setSelectedProjectImage(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  )
}

export default ViewPortfolio
