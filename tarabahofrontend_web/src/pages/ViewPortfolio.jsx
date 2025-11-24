"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { FaPen, FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa"
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
  Input,
  Textarea,
  IconButton,
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
  const [isEditMode, setIsEditMode] = useState(false) // Shows edit icons
  const [editingSections, setEditingSections] = useState({
    header: false,
    contact: false,
    skills: false,
    tesda: false,
    certificates: false,
    experience: false,
    projects: false,
    awards: false,
    education: false,
    memberships: false,
    references: false,
  })
  const [editingPortfolio, setEditingPortfolio] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState("")
  const [saveError, setSaveError] = useState("")
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null)
  const [modifiedCertificates, setModifiedCertificates] = useState(new Set())
  const [modifiedProjects, setModifiedProjects] = useState(new Set())
  const [isAddingCertificate, setIsAddingCertificate] = useState(false)
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingCertificateId, setEditingCertificateId] = useState(null)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [newCertificate, setNewCertificate] = useState({
    courseName: "",
    certificateNumber: "",
    issueDate: "",
    certificateFile: null,
  })
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    projectImageFile: null,
  })
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"
  const navigate = useNavigate()
  const [selectedProjectImage, setSelectedProjectImage] = useState(null)
  const avatarFileInputRef = useRef(null)
  const certificateFileInputRef = useRef(null)
  const projectFileInputRef = useRef(null)

  const urlParams = new URLSearchParams(window.location.search)
  const urlShareToken = urlParams.get("share")

  const getShareableUrl = () => {
    const baseUrl = import.meta.env.PROD ? window.location.origin : `http://localhost:5173`
    const currentToken = shareToken || localStorage.getItem(`portfolio_${graduateId}_shareToken`)
    if (currentToken) {
      return `${baseUrl}/portfolio/${graduateId}?share=${currentToken}`
    }
    return `${baseUrl}/portfolio/${graduateId}`
  }

  // Get design theme colors and layout based on designTemplate
  const getDesignTheme = (template) => {
    const themes = {
      "bread-pastry": {
        headerGradient: "from-amber-500 via-orange-500 to-amber-600",
        headerBg: "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600",
        sidebarBg: "bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700",
        headerBarBg: "bg-gray-800",
        accentColor: "amber",
        textColor: "text-amber-600",
        borderColor: "border-amber-300",
        bgColor: "bg-amber-50",
        cardBorder: "border-amber-200",
        buttonColor: "amber",
        lightBg: "bg-amber-50",
        mediumBg: "bg-amber-100",
        darkBg: "bg-amber-200",
        pageBg: "bg-amber-50",
        // Unique layout: Centered card-based design
        layoutType: "centered-cards",
        headerLayout: "centered",
        headerTextAlign: "text-center",
        headerFlexDirection: "flex-col items-center",
        avatarSize: "w-40 h-40",
        avatarPosition: "mb-6",
        cardStyle: "rounded-3xl shadow-xl border-2 border-amber-200",
        cardPadding: "p-8",
        contentGrid: "grid-cols-1 md:grid-cols-2",
        sectionSpacing: "space-y-8",
        typographySize: "text-4xl md:text-5xl",
        titleWeight: "font-bold",
        sectionHeaderStyle: "rounded-t-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4",
        sectionContentStyle: "rounded-b-2xl bg-white p-6 border-2 border-amber-200",
        useCardSections: true,
      },
      "cookery": {
        headerGradient: "from-red-500 via-pink-500 to-red-600",
        headerBg: "bg-gradient-to-br from-red-500 via-pink-500 to-red-600",
        sidebarBg: "bg-gradient-to-br from-red-600 via-pink-600 to-red-700",
        headerBarBg: "bg-red-700",
        accentColor: "red",
        textColor: "text-red-600",
        borderColor: "border-red-300",
        bgColor: "bg-red-50",
        cardBorder: "border-red-100",
        buttonColor: "red",
        lightBg: "bg-red-50",
        mediumBg: "bg-red-100",
        darkBg: "bg-red-200",
        pageBg: "bg-red-50",
        // Unique layout: Top header with two-column content below
        layoutType: "top-header",
        headerLayout: "centered",
        headerTextAlign: "text-center",
        headerFlexDirection: "flex-col items-center",
        avatarSize: "w-48 h-48",
        avatarPosition: "mb-8",
        cardStyle: "rounded-xl shadow-lg border-l-4 border-red-500",
        cardPadding: "p-6",
        contentGrid: "grid-cols-1 lg:grid-cols-2",
        sectionSpacing: "space-y-6",
        typographySize: "text-5xl md:text-6xl",
        titleWeight: "font-extrabold",
        sectionHeaderStyle: "bg-red-600 text-white px-5 py-3 rounded-t-lg font-bold uppercase text-sm",
        sectionContentStyle: "bg-white p-6 rounded-b-lg border-2 border-red-200",
        useCardSections: true,
      },
      "housekeeping": {
        headerGradient: "from-gray-700 to-gray-700",
        headerBg: "bg-gray-700", // Dark gray header
        sidebarBg: "bg-gray-200", // Light gray sidebar
        headerBarBg: "bg-gray-700", // Dark gray for header bar
        accentColor: "gray",
        textColor: "text-gray-800", // Dark gray text
        borderColor: "border-gray-400", // Gray borders
        bgColor: "bg-white",
        cardBorder: "border-gray-400",
        buttonColor: "gray",
        lightBg: "bg-gray-200",
        mediumBg: "bg-gray-300",
        darkBg: "bg-gray-400",
        pageBg: "bg-white",
        // Unique layout: Top header + Left sidebar + Right content (matching image)
        layoutType: "housekeeping-layout", // Special layout for housekeeping
        headerLayout: "centered",
        headerTextAlign: "text-center",
        headerFlexDirection: "flex-col items-center",
        avatarSize: "w-32 h-32",
        avatarPosition: "mb-6",
        cardStyle: "rounded-none shadow-none", // No rounded corners, no shadow
        cardPadding: "p-6",
        contentGrid: "grid-cols-1",
        sectionSpacing: "space-y-6",
        typographySize: "text-4xl md:text-5xl",
        titleWeight: "font-bold",
        sectionHeaderStyle: "text-gray-800 font-bold uppercase text-sm mb-2 pb-2 border-b border-gray-600", // Dark gray text with line underneath
        sectionContentStyle: "bg-transparent p-0", // No background, no padding
        useCardSections: false,
        headerTextColor: "text-white", // White text in header
        sidebarTextColor: "text-gray-800", // Dark gray text in sidebar
        mainTextColor: "text-gray-800", // Dark gray text in main content
      },
      "food-beverage": {
        headerGradient: "from-green-500 via-teal-500 to-green-600",
        headerBg: "bg-gradient-to-br from-green-500 via-teal-500 to-green-600",
        sidebarBg: "bg-gradient-to-br from-green-600 via-teal-600 to-green-700",
        headerBarBg: "bg-green-700",
        accentColor: "green",
        textColor: "text-green-600",
        borderColor: "border-green-300",
        bgColor: "bg-green-50",
        cardBorder: "border-green-100",
        buttonColor: "green",
        lightBg: "bg-green-50",
        mediumBg: "bg-green-100",
        darkBg: "bg-green-200",
        pageBg: "bg-green-50",
        // Unique layout: Right sidebar with main content on left
        layoutType: "right-sidebar",
        headerLayout: "right-left",
        headerTextAlign: "text-right",
        headerFlexDirection: "flex-row-reverse items-center",
        avatarSize: "w-32 h-32",
        avatarPosition: "mb-6",
        cardStyle: "rounded-2xl shadow-xl border-2 border-green-200",
        cardPadding: "p-6",
        contentGrid: "grid-cols-1",
        sectionSpacing: "space-y-8",
        typographySize: "text-4xl md:text-5xl",
        titleWeight: "font-semibold",
        sectionHeaderStyle: "bg-gradient-to-r from-green-600 to-teal-600 text-white px-5 py-3 rounded-t-2xl font-bold uppercase text-sm",
        sectionContentStyle: "bg-white p-6 rounded-b-2xl border-2 border-green-200",
        useCardSections: true,
      },
      "bartending-barista": {
        headerGradient: "from-blue-500 via-blue-500 to-blue-500",
        headerBg: "bg-blue-500",
        sidebarBg: "bg-blue-500",
        headerBarBg: "bg-transparent",
        accentColor: "blue",
        textColor: "text-gray-800",
        borderColor: "border-gray-300",
        bgColor: "bg-gray-50",
        cardBorder: "border-gray-300",
        buttonColor: "blue",
        lightBg: "bg-gray-50",
        mediumBg: "bg-gray-100",
        darkBg: "bg-gray-200",
        pageBg: "bg-gray-50",
        // Unique layout: Split view with simple headers
        layoutType: "split-view",
        headerLayout: "centered",
        headerTextAlign: "text-left",
        headerFlexDirection: "flex-col items-center",
        avatarSize: "w-32 h-32",
        avatarPosition: "mb-8",
        cardStyle: "rounded-lg shadow-md",
        cardPadding: "p-6",
        contentGrid: "grid-cols-1",
        sectionSpacing: "space-y-8",
        typographySize: "text-3xl",
        titleWeight: "font-bold",
        sectionHeaderStyle: "text-gray-800 font-bold uppercase text-sm mb-2",
        sectionContentStyle: "bg-white border-t border-gray-300 pt-4",
        useCardSections: false,
        useSimpleHeaders: true,
      },
      "default": {
        headerGradient: "from-blue-600 via-blue-700 to-blue-800",
        headerBg: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
        sidebarBg: "bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900",
        headerBarBg: "bg-blue-800",
        accentColor: "blue",
        textColor: "text-blue-600",
        borderColor: "border-blue-300",
        bgColor: "bg-blue-50",
        cardBorder: "border-blue-100",
        buttonColor: "blue",
        lightBg: "bg-blue-50",
        mediumBg: "bg-blue-100",
        darkBg: "bg-blue-200",
        pageBg: "bg-gray-50",
        layoutType: "left-sidebar",
        headerLayout: "left-right",
        headerTextAlign: "text-left",
        headerFlexDirection: "flex-row items-center",
        avatarSize: "w-32 h-32",
        avatarPosition: "mb-6",
        cardStyle: "rounded-lg shadow-md",
        cardPadding: "p-6",
        contentGrid: "grid-cols-1",
        sectionSpacing: "space-y-6",
        typographySize: "text-3xl md:text-4xl",
        titleWeight: "font-semibold",
        sectionHeaderStyle: "bg-blue-800 text-white px-4 py-3 font-bold uppercase text-sm",
        sectionContentStyle: "bg-white p-6 border-t-2 border-blue-300",
        useCardSections: false,
      },
    }
    return themes[template] || themes["default"]
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
      designTemplate: portfolioData.designTemplate || "default",
      visibility: portfolioData.visibility || "PUBLIC",
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
      designTemplate: normalized.designTemplate,
      primaryCourseType: normalized.primaryCourseType,
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
      { withCredentials: true }
    );
    
    console.log("📦 API Response Structure:", {
      isCompleteResponse: portfolioResponse.data.portfolio !== undefined,
      hasPortfolio: !!portfolioResponse.data.portfolio,
      hasGraduate: !!portfolioResponse.data.graduate,
      certificateCount: (portfolioResponse.data.certificates || []).length,
      projectCount: (portfolioResponse.data.projects || []).length,
    });
    
    const normalizedPortfolio = normalizePortfolioData(portfolioResponse.data);
    
    setPortfolio(normalizedPortfolio);
    
    const graduateData = portfolioResponse.data.graduate || 
                       (portfolioResponse.data.portfolio ? portfolioResponse.data.portfolio.graduate : null) ||
                       { 
                         id: graduateId, 
                         fullName: normalizedPortfolio.fullName,
                         profilePicture: normalizedPortfolio.avatar 
                       };
    setGraduate(graduateData);
    
    const certs = portfolioResponse.data.certificates || 
                (portfolioResponse.data.portfolio ? portfolioResponse.data.portfolio.certificates : []);
    setCertificates(certs);
    
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
    setIsLoading(true);
    if (urlShareToken) {
      await fetchPublicData(); // Prioritize public view for share token
    } else {
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        await fetchAuthenticatedData();
      } else {
        navigate("/signin");
      }
    }
    setIsLoading(false);
  };
  initializeData();
}, [graduateId, navigate, urlShareToken]);

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

  // Get design theme - calculate early so it's available for all renders
  const designTheme = portfolio ? getDesignTheme(portfolio.designTemplate || "default") : getDesignTheme("default")
  
  // Debug: Log the design template being used
  useEffect(() => {
    if (portfolio) {
      console.log("Portfolio Design Template:", portfolio.designTemplate, "Theme:", designTheme)
    }
  }, [portfolio, designTheme])

  const handleCertificateClick = (certificate) => {
    setSelectedCertificate(selectedCertificate?.id === certificate.id ? null : certificate)
  }

  const copyToClipboard = async () => {
  const shareableUrl = getShareableUrl();
  const displayUrl = shareableUrl.includes("?share=")
    ? `${window.location.origin}/portfolio/${graduateId}?share=${shareToken?.substring(0, 8)}...`
    : shareableUrl;

  try {
    await navigator.clipboard.writeText(shareableUrl);
    alert(
      `Secure share link copied!\n\n` +
      `Link: ${displayUrl}\n\n` +
      `Only people with this exact link can view your portfolio.\n` +
      `Links remain valid until you generate a new one.`
    );
  } catch (err) {
    console.error("Failed to copy:", err);
    // Fallback: let user copy manually
    const userConfirmed = window.confirm(
      `Failed to copy automatically.\n\n` +
      `Your link:\n${shareableUrl}\n\n` +
      `Click OK to copy manually.`
    );
    if (userConfirmed) {
      prompt("Copy this link:", shareableUrl);
    }
  }
};

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

  const handleEditModeToggle = () => {
    if (!isEditMode) {
      // Entering edit mode - create a copy of portfolio for editing and show edit icons
      const portfolioCopy = JSON.parse(JSON.stringify(portfolio))
      // Ensure experiences have the correct field structure
      if (portfolioCopy.experiences) {
        portfolioCopy.experiences = portfolioCopy.experiences.map((exp) => ({
          ...exp,
          employer: exp.company || exp.employer || "",
          description: exp.responsibilities || exp.description || "",
        }))
      }
      setEditingPortfolio(portfolioCopy)
      setSaveSuccess("")
      setSaveError("")
      // Reset all section edit states
      setEditingSections({
        header: false,
        contact: false,
        skills: false,
        tesda: false,
        certificates: false,
        experience: false,
        projects: false,
        awards: false,
        education: false,
        memberships: false,
        references: false,
      })
      // Reset certificate and project editing states
      setIsAddingCertificate(false)
      setIsAddingProject(false)
      setEditingCertificateId(null)
      setEditingProjectId(null)
      setNewCertificate({
        courseName: "",
        certificateNumber: "",
        issueDate: "",
        certificateFile: null,
      })
      setNewProject({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        projectImageFile: null,
      })
      setModifiedCertificates(new Set())
      setModifiedProjects(new Set())
    } else {
      // Exiting edit mode - cancel all edits
      setEditingPortfolio(null)
      setSelectedAvatarFile(null)
      setEditingSections({
        header: false,
        contact: false,
        skills: false,
        tesda: false,
        certificates: false,
        experience: false,
        projects: false,
        awards: false,
        education: false,
        memberships: false,
        references: false,
      })
      // Reset certificate and project editing states
      setIsAddingCertificate(false)
      setIsAddingProject(false)
      setEditingCertificateId(null)
      setEditingProjectId(null)
      setNewCertificate({
        courseName: "",
        certificateNumber: "",
        issueDate: "",
        certificateFile: null,
      })
      setNewProject({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        projectImageFile: null,
      })
      setModifiedCertificates(new Set())
      setModifiedProjects(new Set())
    }
    setIsEditMode(!isEditMode)
  }

  const handleSectionEditToggle = (section) => {
    setEditingSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
    setSaveError("")
  }

  const handleFieldChange = (field, value) => {
    setEditingPortfolio((prev) => ({
      ...prev,
      [field]: value,
    }))
    setSaveError("")
  }

  const handleArrayFieldChange = (arrayName, index, field, value) => {
    setEditingPortfolio((prev) => {
      const updatedArray = [...prev[arrayName]]
      updatedArray[index] = { ...updatedArray[index], [field]: value }
      return { ...prev, [arrayName]: updatedArray }
    })
    setSaveError("")
  }

  const handleAddArrayItem = (arrayName, newItem) => {
    setEditingPortfolio((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), { ...newItem, id: `new-${Date.now()}-${Math.random()}` }],
    }))
    setSaveError("")
  }

  const handleRemoveArrayItem = (arrayName, index) => {
    setEditingPortfolio((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }))
    setSaveError("")
  }

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0]
    if (file && !file.type.startsWith("image/")) {
      setSaveError("Please select an image file for the avatar.")
      return
    }
    setSelectedAvatarFile(file)
    setSaveError("")
  }

  const handleCertificateFileChange = (e) => {
    const file = e.target.files[0]
    if (file && !file.type.startsWith("image/")) {
      setSaveError("Please select an image file for the certificate.")
      return
    }
    setNewCertificate((prev) => ({ ...prev, certificateFile: file }))
    setSaveError("")
  }

  const handleProjectFileChange = (e) => {
    const file = e.target.files[0]
    if (file && !file.type.startsWith("image/")) {
      setSaveError("Please select an image file for the project.")
      return
    }
    setNewProject((prev) => ({ ...prev, projectImageFile: file }))
    setSaveError("")
  }

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target
    setNewCertificate((prev) => ({ ...prev, [name]: value }))
    setSaveError("")
  }

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target
    setNewProject((prev) => ({ ...prev, [name]: value }))
    setSaveError("")
  }

  const isCertificateFormValid = () => {
    return (
      newCertificate.courseName.trim() !== "" &&
      newCertificate.certificateNumber.trim() !== "" &&
      newCertificate.issueDate.trim() !== "" &&
      (editingCertificateId ? true : newCertificate.certificateFile !== null)
    )
  }

  const isProjectFormValid = () => {
    return (
      newProject.title.trim() !== "" &&
      newProject.description.trim() !== "" &&
      newProject.startDate.trim() !== "" &&
      newProject.endDate.trim() !== "" &&
      (editingProjectId ? true : newProject.projectImageFile !== null)
    )
  }

  const handleAddCertificate = () => {
    if (!isCertificateFormValid()) {
      setSaveError("Please fill in all required certificate fields, including the certificate file.")
      return
    }
    const newCert = {
      id: `new-${Date.now()}`,
      courseName: newCertificate.courseName,
      certificateNumber: newCertificate.certificateNumber,
      issueDate: newCertificate.issueDate,
      certificateFile: newCertificate.certificateFile,
      preview: newCertificate.certificateFile ? URL.createObjectURL(newCertificate.certificateFile) : "/placeholder.svg",
      portfolioId: portfolio?.id,
    }
    setCertificates((prev) => [...prev, newCert])
    setModifiedCertificates((prev) => new Set(prev).add(newCert.id))
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
    })
    setIsAddingCertificate(false)
    setEditingCertificateId(null)
    setSaveError("")
  }

  const handleAddProject = () => {
    if (!isProjectFormValid()) {
      setSaveError("Please fill in all required project fields, including the project image.")
      return
    }
    const newProj = {
      id: `new-${Date.now()}`,
      title: newProject.title,
      description: newProject.description,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      projectImageFile: newProject.projectImageFile,
      preview: newProject.projectImageFile ? URL.createObjectURL(newProject.projectImageFile) : "/placeholder.svg",
      portfolioId: portfolio?.id,
    }
    setProjects((prev) => [...prev, newProj])
    setModifiedProjects((prev) => new Set(prev).add(newProj.id))
    setNewProject({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      projectImageFile: null,
    })
    setIsAddingProject(false)
    setEditingProjectId(null)
    setSaveError("")
  }

  const handleEditCertificate = (certificate) => {
    setEditingCertificateId(certificate.id)
    setNewCertificate({
      courseName: certificate.courseName || "",
      certificateNumber: certificate.certificateNumber || "",
      issueDate: certificate.issueDate || "",
      certificateFile: null,
    })
    setIsAddingCertificate(true)
  }

  const handleEditProject = (project) => {
    setEditingProjectId(project.id)
    setNewProject({
      title: project.title || "",
      description: project.description || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      projectImageFile: null,
    })
    setIsAddingProject(true)
  }

  const handleUpdateCertificate = () => {
    if (!isCertificateFormValid()) {
      setSaveError("Please fill in all required certificate fields.")
      return
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
                : cert.preview || cert.certificateFilePath || "/placeholder.svg",
            }
          : cert,
      ),
    )
    setModifiedCertificates((prev) => new Set(prev).add(editingCertificateId))
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
    })
    setEditingCertificateId(null)
    setIsAddingCertificate(false)
    setSaveError("")
  }

  const handleUpdateProject = () => {
    if (!isProjectFormValid()) {
      setSaveError("Please fill in all required project fields.")
      return
    }
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === editingProjectId
          ? {
              ...proj,
              title: newProject.title,
              description: newProject.description,
              startDate: newProject.startDate,
              endDate: newProject.endDate,
              projectImageFile: newProject.projectImageFile || proj.projectImageFile,
              preview: newProject.projectImageFile
                ? URL.createObjectURL(newProject.projectImageFile)
                : proj.preview || proj.projectImageFilePath || "/placeholder.svg",
            }
          : proj,
      ),
    )
    setModifiedProjects((prev) => new Set(prev).add(editingProjectId))
    setNewProject({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      projectImageFile: null,
    })
    setEditingProjectId(null)
    setIsAddingProject(false)
    setSaveError("")
  }

  const handleRemoveCertificate = (id) => {
    setCertificates((prev) => prev.filter((cert) => cert.id !== id))
    setModifiedCertificates((prev) => new Set(prev).add(id))
  }

  const handleRemoveProject = (id) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id))
    setModifiedProjects((prev) => new Set(prev).add(id))
  }

  const handleCertificateImageClick = () => certificateFileInputRef.current?.click()
  const handleProjectImageClick = () => projectFileInputRef.current?.click()

  const handleSavePortfolio = async () => {
    setIsSaving(true)
    setSaveError("")
    setSaveSuccess("")

    try {
      let avatarUrl = editingPortfolio.avatar || ""
      if (selectedAvatarFile) {
        const formDataAvatar = new FormData()
        formDataAvatar.append("file", selectedAvatarFile)
        const uploadResponse = await axios.post(
          `${BACKEND_URL}/api/graduate/${graduateId}/upload-picture`,
          formDataAvatar,
          { withCredentials: true },
        )
        avatarUrl = uploadResponse.data.profilePicture
      }

      // Handle Certificates - same logic as EditPortfolio.jsx
      const certificateIds = []
      const existingCertificateIds = new Set(
        (
          await axios.get(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          })
        ).data.map((cert) => cert.id),
      )

      for (const cert of certificates) {
        if (!modifiedCertificates.has(cert.id)) {
          if (typeof cert.id === "string" && cert.id.includes("new-")) {
          } else if (existingCertificateIds.has(cert.id)) {
            certificateIds.push(cert.id)
            continue
          }
        }

        const certificateData = new FormData()
        certificateData.append("courseName", cert.courseName || "")
        certificateData.append("certificateNumber", cert.certificateNumber || "")
        certificateData.append("issueDate", cert.issueDate || "")
        if (cert.portfolioId) {
          certificateData.append("portfolioId", cert.portfolioId.toString())
        }
        if (typeof cert.id !== "string" || !cert.id.includes("new-")) {
          certificateData.append("graduateId", graduateId.toString())
        }
        if (cert.certificateFile instanceof File) {
          certificateData.append("certificateFile", cert.certificateFile)
        }

        if (typeof cert.id === "string" && cert.id.includes("new-")) {
          console.log("Creating new certificate for graduate ID:", graduateId)
          try {
            const certResponse = await axios.post(
              `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
              certificateData,
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
              },
            )
            console.log("Certificate created:", certResponse.data)
            certificateIds.push(certResponse.data.id)
          } catch (err) {
            console.error("Failed to create certificate:", err)
            if (err.response?.status === 401) {
              setSaveError("Session expired. Please sign in again.")
              navigate("/signin")
              return
            } else if (err.response?.status === 415) {
              setSaveError("Unsupported media type. Please check certificate data format.")
              return
            } else if (err.response?.status === 400) {
              setSaveError(`Failed to create certificate: ${err.response?.data?.message || "Invalid data"}`)
              return
            }
            throw err
          }
        } else {
          console.log("Updating certificate with ID:", cert.id)
          try {
            const certResponse = await axios.put(`${BACKEND_URL}/api/certificate/${cert.id}`, certificateData, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            })
            console.log("Certificate updated:", certResponse.data)
            certificateIds.push(cert.id)
          } catch (err) {
            console.error("Failed to update certificate ID:", cert.id, err)
            if (err.response?.status === 401) {
              setSaveError("Session expired. Please sign in again.")
              navigate("/signin")
              return
            } else if (err.response?.status === 415) {
              setSaveError("Unsupported media type. Please check certificate data format.")
              return
            } else if (err.response?.status === 400) {
              setSaveError(`Failed to update certificate: ${err.response?.data?.message || "Invalid data"}`)
              return
            }
            throw err
          }
        }
      }

      const certificatesToDelete = Array.from(existingCertificateIds).filter(
        (id) => !certificates.some((cert) => cert.id === id) && modifiedCertificates.has(id),
      )
      for (const certId of certificatesToDelete) {
        console.log("Deleting certificate ID:", certId)
        await axios.delete(`${BACKEND_URL}/api/certificate/${certId}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      // Handle Projects - same logic as EditPortfolio.jsx
      const projectIds = []
      const existingProjectIds = new Set(
        (
          await axios.get(`${BACKEND_URL}/api/project/portfolio/${editingPortfolio.id}`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          })
        ).data.map((proj) => proj.id),
      )

      for (const proj of projects) {
        if (!modifiedProjects.has(proj.id)) {
          if (typeof proj.id === "string" && proj.id.includes("new-")) {
          } else if (existingProjectIds.has(proj.id)) {
            projectIds.push(proj.id)
            continue
          }
        }

        const projectData = new FormData()
        projectData.append("portfolioId", editingPortfolio.id.toString())
        projectData.append("title", proj.title || "")
        projectData.append("description", proj.description || "")
        if (proj.startDate) projectData.append("startDate", proj.startDate)
        if (proj.endDate) projectData.append("endDate", proj.endDate)
        if (proj.projectImageFile instanceof File) {
          projectData.append("projectImageFile", proj.projectImageFile)
        }

        if (typeof proj.id === "string" && proj.id.includes("new-")) {
          console.log("Creating new project for portfolio ID:", editingPortfolio.id)
          try {
            const projResponse = await axios.post(`${BACKEND_URL}/api/project`, projectData, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            })
            console.log("Project created:", projResponse.data)
            projectIds.push(projResponse.data.id)
          } catch (err) {
            console.error("Failed to create project:", err)
            if (err.response?.status === 401) {
              setSaveError("Session expired. Please sign in again.")
              navigate("/signin")
              return
            } else if (err.response?.status === 415) {
              setSaveError("Unsupported media type. Please check project data format.")
              return
            } else if (err.response?.status === 400) {
              setSaveError(`Failed to create project: ${err.response?.data?.message || "Invalid data"}`)
              return
            }
            throw err
          }
        } else {
          console.log("Updating project with ID:", proj.id)
          try {
            const projResponse = await axios.put(`${BACKEND_URL}/api/project/${proj.id}`, projectData, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            })
            console.log("Project updated:", projResponse.data)
            projectIds.push(proj.id)
          } catch (err) {
            console.error("Failed to update project ID:", proj.id, err)
            if (err.response?.status === 401) {
              setSaveError("Session expired. Please sign in again.")
              navigate("/signin")
              return
            } else if (err.response?.status === 415) {
              setSaveError("Unsupported media type. Please check project data format.")
              return
            } else if (err.response?.status === 400) {
              setSaveError(`Failed to update project: ${err.response?.data?.message || "Invalid data"}`)
              return
            }
            throw err
          }
        }
      }

      const projectsToDelete = Array.from(existingProjectIds).filter(
        (id) => !projects.some((proj) => proj.id === id) && modifiedProjects.has(id),
      )
      for (const projId of projectsToDelete) {
        console.log("Deleting project ID:", projId)
        await axios.delete(`${BACKEND_URL}/api/project/${projId}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      setModifiedCertificates(new Set())
      setModifiedProjects(new Set())

      const payload = {
        graduateId,
        ...editingPortfolio,
        avatar: avatarUrl || editingPortfolio.avatar || null,
        certificateIds,
        projectIds,
        skills: editingPortfolio.skills?.map((skill) => ({
          id: typeof skill.id === "string" && skill.id.includes("new-") ? null : skill.id,
          name: skill.name,
          type: skill.type,
          proficiencyLevel: skill.proficiencyLevel || null,
        })) || [],
        experiences: editingPortfolio.experiences?.map((exp) => ({
          id: typeof exp.id === "string" && exp.id.includes("new-") ? null : exp.id,
          jobTitle: exp.jobTitle,
          employer: exp.employer,
          description: exp.description || null,
          startDate: exp.startDate ? exp.startDate : null,
          endDate: exp.endDate ? exp.endDate : null,
        })) || [],
        awardsRecognitions: editingPortfolio.awardsRecognitions?.map((award) => ({
          id: typeof award.id === "string" && award.id.includes("new-") ? null : award.id,
          title: award.title,
          issuer: award.issuer || null,
          dateReceived: award.dateReceived ? award.dateReceived : null,
        })) || [],
        continuingEducations: editingPortfolio.continuingEducations?.map((edu) => ({
          id: typeof edu.id === "string" && edu.id.includes("new-") ? null : edu.id,
          courseName: edu.courseName,
          institution: edu.institution || null,
          completionDate: edu.completionDate ? edu.completionDate : null,
        })) || [],
        professionalMemberships: editingPortfolio.professionalMemberships?.map((mem) => ({
          id: typeof mem.id === "string" && mem.id.includes("new-") ? null : mem.id,
          organization: mem.organization,
          membershipType: mem.membershipType || null,
          startDate: mem.startDate ? mem.startDate : null,
        })) || [],
        references: editingPortfolio.references?.map((ref) => ({
          id: typeof ref.id === "string" && ref.id.includes("new-") ? null : ref.id,
          name: ref.name,
          relationship: ref.relationship || null,
          email: ref.email || null,
          phone: ref.phone || null,
        })) || [],
      }

      await axios.put(`${BACKEND_URL}/api/portfolio/${editingPortfolio.id}`, payload, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })

      // Refresh portfolio data
      const portfolioResponse = await axios.get(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })
      const normalizedPortfolio = normalizePortfolioData(portfolioResponse.data)
      setPortfolio(normalizedPortfolio)

      // Refresh certificates and projects
      const certificatesResponse = await axios.get(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })
      setCertificates(certificatesResponse.data)

      if (normalizedPortfolio.id) {
        const projectsResponse = await axios.get(`${BACKEND_URL}/api/project/portfolio/${normalizedPortfolio.id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        })
        setProjects(projectsResponse.data)
      }

      setEditingPortfolio(null)
      setSelectedAvatarFile(null)
      setModifiedCertificates(new Set())
      setModifiedProjects(new Set())
      setIsEditMode(false)
      setSaveSuccess("Portfolio updated successfully!")
      setTimeout(() => setSaveSuccess(""), 3000)
    } catch (err) {
      console.error("Failed to save portfolio:", err)
      setSaveError(
        err.response?.data?.message || err.response?.data?.error || err.message || "Failed to save portfolio",
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSection = async (section) => {
    setIsSaving(true)
    setSaveError("")
    setSaveSuccess("")

    try {
      // Handle avatar upload for header section
      let avatarUrl = editingPortfolio.avatar || ""
      if (section === "header" && selectedAvatarFile) {
        const formDataAvatar = new FormData()
        formDataAvatar.append("file", selectedAvatarFile)
        const uploadResponse = await axios.post(
          `${BACKEND_URL}/api/graduate/${graduateId}/upload-picture`,
          formDataAvatar,
          { withCredentials: true },
        )
        avatarUrl = uploadResponse.data.profilePicture
        setSelectedAvatarFile(null)
      }

      // Handle certificates section
      if (section === "certificates") {
        const certificateIds = []
        const existingCertificateIds = new Set(
          (
            await axios.get(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            })
          ).data.map((cert) => cert.id),
        )

        for (const cert of certificates) {
          if (!modifiedCertificates.has(cert.id)) {
            if (typeof cert.id === "string" && cert.id.includes("new-")) {
            } else if (existingCertificateIds.has(cert.id)) {
              certificateIds.push(cert.id)
              continue
            }
          }

          const certificateData = new FormData()
          certificateData.append("courseName", cert.courseName || "")
          certificateData.append("certificateNumber", cert.certificateNumber || "")
          certificateData.append("issueDate", cert.issueDate || "")
          if (cert.portfolioId) {
            certificateData.append("portfolioId", cert.portfolioId.toString())
          }
          if (typeof cert.id !== "string" || !cert.id.includes("new-")) {
            certificateData.append("graduateId", graduateId.toString())
          }
          if (cert.certificateFile instanceof File) {
            certificateData.append("certificateFile", cert.certificateFile)
          }

          if (typeof cert.id === "string" && cert.id.includes("new-")) {
            const certResponse = await axios.post(
              `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
              certificateData,
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
              },
            )
            certificateIds.push(certResponse.data.id)
          } else {
            await axios.put(`${BACKEND_URL}/api/certificate/${cert.id}`, certificateData, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            })
            certificateIds.push(cert.id)
          }
        }

        const certificatesToDelete = Array.from(existingCertificateIds).filter(
          (id) => !certificates.some((cert) => cert.id === id) && modifiedCertificates.has(id),
        )
        for (const certId of certificatesToDelete) {
          await axios.delete(`${BACKEND_URL}/api/certificate/${certId}`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          })
        }

        setModifiedCertificates(new Set())
        
        // Refresh certificates
        const certificatesResponse = await axios.get(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        })
        setCertificates(certificatesResponse.data)
      }

      // Handle projects section
      if (section === "projects") {
        const projectIds = []
        const existingProjectIds = new Set(
          (
            await axios.get(`${BACKEND_URL}/api/project/portfolio/${editingPortfolio.id}`, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            })
          ).data.map((proj) => proj.id),
        )

        for (const proj of projects) {
          if (!modifiedProjects.has(proj.id)) {
            if (typeof proj.id === "string" && proj.id.includes("new-")) {
            } else if (existingProjectIds.has(proj.id)) {
              projectIds.push(proj.id)
              continue
            }
          }

          const projectData = new FormData()
          projectData.append("portfolioId", editingPortfolio.id.toString())
          projectData.append("title", proj.title || "")
          projectData.append("description", proj.description || "")
          if (proj.startDate) projectData.append("startDate", proj.startDate)
          if (proj.endDate) projectData.append("endDate", proj.endDate)
          if (proj.projectImageFile instanceof File) {
            projectData.append("projectImageFile", proj.projectImageFile)
          }

          if (typeof proj.id === "string" && proj.id.includes("new-")) {
            const projResponse = await axios.post(`${BACKEND_URL}/api/project`, projectData, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            })
            projectIds.push(projResponse.data.id)
          } else {
            await axios.put(`${BACKEND_URL}/api/project/${proj.id}`, projectData, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            })
            projectIds.push(proj.id)
          }
        }

        const projectsToDelete = Array.from(existingProjectIds).filter(
          (id) => !projects.some((proj) => proj.id === id) && modifiedProjects.has(id),
        )
        for (const projId of projectsToDelete) {
          await axios.delete(`${BACKEND_URL}/api/project/${projId}`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          })
        }

        setModifiedProjects(new Set())
        
        // Refresh projects
        if (editingPortfolio.id) {
          const projectsResponse = await axios.get(`${BACKEND_URL}/api/project/portfolio/${editingPortfolio.id}`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          })
          setProjects(projectsResponse.data)
        }
      }

      // Build payload with all editingPortfolio data to preserve unsaved changes in other sections
      const payload = {
        graduateId,
        ...editingPortfolio, // Start with editingPortfolio to preserve all current edits
        avatar: section === "header" ? (avatarUrl || editingPortfolio.avatar || portfolio.avatar) : editingPortfolio.avatar || portfolio.avatar,
      }

      // Update the specific section being saved (already in editingPortfolio, but ensure it's properly formatted)
      if (section === "header") {
        payload.fullName = editingPortfolio.fullName
        payload.professionalTitle = editingPortfolio.professionalTitle
        payload.professionalSummary = editingPortfolio.professionalSummary
        payload.avatar = avatarUrl || editingPortfolio.avatar || portfolio.avatar
      } else if (section === "contact") {
        payload.email = editingPortfolio.email
        payload.phone = editingPortfolio.phone
        payload.website = editingPortfolio.website
      } else if (section === "skills") {
        payload.skills = editingPortfolio.skills?.map((skill) => ({
          id: typeof skill.id === "string" && skill.id.includes("new-") ? null : skill.id,
          name: skill.name,
          type: skill.type,
          proficiencyLevel: skill.proficiencyLevel || null,
        })) || []
      } else if (section === "tesda") {
        payload.ncLevel = editingPortfolio.ncLevel
        payload.trainingCenter = editingPortfolio.trainingCenter
        payload.scholarshipType = editingPortfolio.scholarshipType
        payload.trainingDuration = editingPortfolio.trainingDuration
        payload.tesdaRegistrationNumber = editingPortfolio.tesdaRegistrationNumber
      } else if (section === "experience") {
        payload.experiences = editingPortfolio.experiences?.map((exp) => ({
          id: typeof exp.id === "string" && exp.id.includes("new-") ? null : exp.id,
          jobTitle: exp.jobTitle,
          employer: exp.employer,
          description: exp.description || null,
          startDate: exp.startDate ? exp.startDate : null,
          endDate: exp.endDate ? exp.endDate : null,
        })) || []
      } else if (section === "awards") {
        payload.awardsRecognitions = editingPortfolio.awardsRecognitions?.map((award) => ({
          id: typeof award.id === "string" && award.id.includes("new-") ? null : award.id,
          title: award.title,
          issuer: award.issuer || null,
          dateReceived: award.dateReceived ? award.dateReceived : null,
        })) || []
      } else if (section === "education") {
        payload.continuingEducations = editingPortfolio.continuingEducations?.map((edu) => ({
          id: typeof edu.id === "string" && edu.id.includes("new-") ? null : edu.id,
          courseName: edu.courseName,
          institution: edu.institution || null,
          completionDate: edu.completionDate ? edu.completionDate : null,
        })) || []
      } else if (section === "memberships") {
        payload.professionalMemberships = editingPortfolio.professionalMemberships?.map((mem) => ({
          id: typeof mem.id === "string" && mem.id.includes("new-") ? null : mem.id,
          organization: mem.organization,
          membershipType: mem.membershipType || null,
          startDate: mem.startDate ? mem.startDate : null,
        })) || []
      } else if (section === "references") {
        payload.references = editingPortfolio.references?.map((ref) => ({
          id: typeof ref.id === "string" && ref.id.includes("new-") ? null : ref.id,
          name: ref.name,
          relationship: ref.relationship || null,
          email: ref.email || null,
          phone: ref.phone || null,
        })) || []
      }

      // Ensure all array fields are properly formatted from editingPortfolio
      payload.skills = editingPortfolio.skills?.map((skill) => ({
        id: typeof skill.id === "string" && skill.id.includes("new-") ? null : skill.id,
        name: skill.name,
        type: skill.type,
        proficiencyLevel: skill.proficiencyLevel || null,
      })) || []
      payload.experiences = editingPortfolio.experiences?.map((exp) => ({
        id: typeof exp.id === "string" && exp.id.includes("new-") ? null : exp.id,
        jobTitle: exp.jobTitle,
        employer: exp.employer,
        description: exp.description || null,
        startDate: exp.startDate ? exp.startDate : null,
        endDate: exp.endDate ? exp.endDate : null,
      })) || []
      payload.awardsRecognitions = editingPortfolio.awardsRecognitions?.map((award) => ({
        id: typeof award.id === "string" && award.id.includes("new-") ? null : award.id,
        title: award.title,
        issuer: award.issuer || null,
        dateReceived: award.dateReceived ? award.dateReceived : null,
      })) || []
      payload.continuingEducations = editingPortfolio.continuingEducations?.map((edu) => ({
        id: typeof edu.id === "string" && edu.id.includes("new-") ? null : edu.id,
        courseName: edu.courseName,
        institution: edu.institution || null,
        completionDate: edu.completionDate ? edu.completionDate : null,
      })) || []
      payload.professionalMemberships = editingPortfolio.professionalMemberships?.map((mem) => ({
        id: typeof mem.id === "string" && mem.id.includes("new-") ? null : mem.id,
        organization: mem.organization,
        membershipType: mem.membershipType || null,
        startDate: mem.startDate ? mem.startDate : null,
      })) || []
      payload.references = editingPortfolio.references?.map((ref) => ({
        id: typeof ref.id === "string" && ref.id.includes("new-") ? null : ref.id,
        name: ref.name,
        relationship: ref.relationship || null,
        email: ref.email || null,
        phone: ref.phone || null,
      })) || []

      // Add certificate and project IDs if they exist
      if (section === "certificates") {
        const existingCertificateIds = (
          await axios.get(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          })
        ).data.map((cert) => cert.id)
        payload.certificateIds = existingCertificateIds
      } else if (editingPortfolio.certificateIds || portfolio.certificateIds) {
        payload.certificateIds = editingPortfolio.certificateIds || portfolio.certificateIds
      }

      if (section === "projects") {
        if (editingPortfolio.id) {
          const existingProjectIds = (
            await axios.get(`${BACKEND_URL}/api/project/portfolio/${editingPortfolio.id}`, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            })
          ).data.map((proj) => proj.id)
          payload.projectIds = existingProjectIds
        }
      } else if (editingPortfolio.projectIds || portfolio.projectIds) {
        payload.projectIds = editingPortfolio.projectIds || portfolio.projectIds
      }

      await axios.put(`${BACKEND_URL}/api/portfolio/${editingPortfolio.id}`, payload, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })

      // Refresh portfolio data
      const portfolioResponse = await axios.get(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })
      const normalizedPortfolio = normalizePortfolioData(portfolioResponse.data)
      setPortfolio(normalizedPortfolio)
      
      // Update editingPortfolio with fresh data, but preserve unsaved changes in sections still in edit mode
      const portfolioCopy = JSON.parse(JSON.stringify(normalizedPortfolio))
      if (portfolioCopy.experiences) {
        portfolioCopy.experiences = portfolioCopy.experiences.map((exp) => ({
          ...exp,
          employer: exp.company || exp.employer || "",
          description: exp.responsibilities || exp.description || "",
        }))
      }
      
      // Merge with existing editingPortfolio to preserve unsaved changes in other sections (excluding the one we just saved)
      const mergedPortfolio = {
        ...portfolioCopy,
        // Preserve unsaved changes from sections still in edit mode (excluding the section we just saved)
        ...(editingSections.header && section !== "header" && {
          fullName: editingPortfolio.fullName,
          professionalTitle: editingPortfolio.professionalTitle,
          professionalSummary: editingPortfolio.professionalSummary,
        }),
        ...(editingSections.contact && section !== "contact" && {
          email: editingPortfolio.email,
          phone: editingPortfolio.phone,
          website: editingPortfolio.website,
        }),
        ...(editingSections.skills && section !== "skills" && {
          skills: editingPortfolio.skills,
        }),
        ...(editingSections.tesda && section !== "tesda" && {
          ncLevel: editingPortfolio.ncLevel,
          trainingCenter: editingPortfolio.trainingCenter,
          scholarshipType: editingPortfolio.scholarshipType,
          trainingDuration: editingPortfolio.trainingDuration,
          tesdaRegistrationNumber: editingPortfolio.tesdaRegistrationNumber,
        }),
        ...(editingSections.experience && section !== "experience" && {
          experiences: editingPortfolio.experiences,
        }),
        ...(editingSections.awards && section !== "awards" && {
          awardsRecognitions: editingPortfolio.awardsRecognitions,
        }),
        ...(editingSections.education && section !== "education" && {
          continuingEducations: editingPortfolio.continuingEducations,
        }),
        ...(editingSections.memberships && section !== "memberships" && {
          professionalMemberships: editingPortfolio.professionalMemberships,
        }),
        ...(editingSections.references && section !== "references" && {
          references: editingPortfolio.references,
        }),
      }
      
      setEditingPortfolio(mergedPortfolio)

      // Close the edit mode for this section only
      setEditingSections((prev) => ({
        ...prev,
        [section]: false,
      }))

      setSaveSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`)
      setTimeout(() => setSaveSuccess(""), 3000)
    } catch (err) {
      console.error(`Failed to save ${section}:`, err)
      setSaveError(
        err.response?.data?.message || err.response?.data?.error || err.message || `Failed to save ${section}`,
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageClick = () => {
    if (isEditMode && editingSections.header) {
      avatarFileInputRef.current?.click()
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
    <div className={`min-h-screen ${designTheme.pageBg || "bg-gray-50"} py-8 px-4`}>
      <div className={`mx-auto bg-white ${designTheme.layoutType === "housekeeping-layout" ? "max-w-6xl shadow-xl rounded-none" : "max-w-7xl shadow-2xl rounded-2xl"} overflow-hidden`}>
        {/* Housekeeping Layout: Top header + Left sidebar + Right content */}
        {designTheme.layoutType === "housekeeping-layout" ? (
          <div>
            {/* Top Header - Full Width Dark Gray */}
            <div className={`${designTheme.headerBg} text-white p-8 ${designTheme.headerFlexDirection} ${designTheme.headerTextAlign}`}>
              {isEditMode && editingSections.header ? (
                <>
                  <Input
                    value={editingPortfolio?.fullName || ""}
                    onChange={(e) => handleFieldChange("fullName", e.target.value)}
                    className={`!${designTheme.typographySize} !${designTheme.titleWeight} !bg-white/20 !border-white/40 !text-white placeholder:text-white/60 uppercase`}
                    placeholder="Full Name"
                  />
                  <Input
                    value={editingPortfolio?.professionalTitle || ""}
                    onChange={(e) => handleFieldChange("professionalTitle", e.target.value)}
                    className="!text-lg !font-normal !bg-white/20 !border-white/40 !text-white placeholder:text-white/60 uppercase mt-2"
                    placeholder="Professional Title"
                  />
                </>
              ) : (
                <>
                  <Typography variant="h1" className={`${designTheme.typographySize} ${designTheme.titleWeight} text-white uppercase tracking-wide mb-2`}>
                    {portfolio.fullName || "Professional Portfolio"}
                  </Typography>
                  {portfolio.professionalTitle && (
                    <Typography variant="h6" className="text-white text-lg font-normal uppercase tracking-wide">
                      {portfolio.professionalTitle}
                    </Typography>
                  )}
                </>
              )}
              {isGraduateView && isEditMode && (
                <IconButton
                  size="sm"
                  variant="text"
                  className="text-white hover:bg-white/20 mt-2"
                  onClick={() => handleSectionEditToggle("header")}
                >
                  <FaPen className="w-4 h-4" />
                </IconButton>
              )}
              {isEditMode && editingSections.header && (
                <Button
                  variant="gradient"
                  color="white"
                  onClick={() => handleSaveSection("header")}
                  disabled={isSaving}
                  className="flex items-center gap-2 mt-4"
                >
                  <FaSave className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </div>

            {/* Main Content: Left Sidebar + Right Content */}
            <div className="flex flex-col lg:flex-row">
              {/* Left Sidebar - Light Gray Background */}
              <div className={`${designTheme.sidebarBg} w-full lg:w-80 flex-shrink-0 p-8 border-r border-gray-400`}>
                {/* Contact Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className={`${designTheme.sidebarTextColor || "text-gray-800"} font-bold text-sm uppercase pb-2 border-b border-gray-600`}>
                      Contact
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton size="sm" variant="text" onClick={() => handleSectionEditToggle("contact")}>
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <div className="mt-3 space-y-3">
                    {isEditMode && editingSections.contact ? (
                      <>
                        <Input
                          size="sm"
                          value={editingPortfolio?.email || ""}
                          onChange={(e) => handleFieldChange("email", e.target.value)}
                          placeholder="Email"
                          className="!border-gray-300"
                        />
                        <Input
                          size="sm"
                          value={editingPortfolio?.phone || ""}
                          onChange={(e) => handleFieldChange("phone", e.target.value)}
                          placeholder="Phone"
                          className="!border-gray-300"
                        />
                        <Input
                          size="sm"
                          value={editingPortfolio?.website || ""}
                          onChange={(e) => handleFieldChange("website", e.target.value)}
                          placeholder="Website"
                          className="!border-gray-300"
                        />
                        <Button size="sm" onClick={() => handleSaveSection("contact")} disabled={isSaving}>
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                      </>
                    ) : (portfolio.email || portfolio.phone || portfolio.website) ? (
                      <>
                        {portfolio.email && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">✉️</span>
                            <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} text-sm break-all`}>
                              {portfolio.email}
                            </Typography>
                          </div>
                        )}
                        {portfolio.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">📞</span>
                            <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} text-sm`}>
                              {portfolio.phone}
                            </Typography>
                          </div>
                        )}
                        {portfolio.website && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">📍</span>
                            <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} text-sm`}>
                              {portfolio.website}
                            </Typography>
                          </div>
                        )}
                      </>
                    ) : (
                      <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} italic text-xs`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Education Section */}
                <div className="mb-6">
                  <Typography variant="h6" className={`${designTheme.sidebarTextColor || "text-gray-800"} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                    Education
                  </Typography>
                  <div className="mt-3 space-y-2">
                    {portfolio.trainingCenter || portfolio.ncLevel || portfolio.scholarshipType ? (
                      <>
                        {portfolio.trainingCenter && (
                          <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} text-sm font-semibold`}>
                            {portfolio.trainingCenter}
                          </Typography>
                        )}
                        {portfolio.ncLevel && (
                          <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} text-sm`}>
                            • {portfolio.ncLevel}
                          </Typography>
                        )}
                        {portfolio.scholarshipType && (
                          <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} text-sm`}>
                            • {portfolio.scholarshipType}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} italic text-xs`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Skills Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className={`${designTheme.sidebarTextColor || "text-gray-800"} font-bold text-sm uppercase pb-2 border-b border-gray-600`}>
                      Skills
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton size="sm" variant="text" onClick={() => handleSectionEditToggle("skills")}>
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <div className="mt-3">
                    {portfolio.skills && portfolio.skills.length > 0 ? (
                      <ul className="space-y-1 list-disc list-inside">
                        {portfolio.skills.map((skill, index) => (
                          <li key={index}>
                            <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} text-sm`}>
                              {skill.name}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} italic text-xs`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>

                {/* TESDA Information */}
                <div>
                  <Typography variant="h6" className={`${designTheme.sidebarTextColor || "text-gray-800"} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                    TESDA
                  </Typography>
                  <div className="mt-3 space-y-2">
                    {portfolio.trainingDuration || portfolio.tesdaRegistrationNumber ? (
                      <>
                        {portfolio.trainingDuration && (
                          <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} text-sm`}>
                            • Duration: {portfolio.trainingDuration}
                          </Typography>
                        )}
                        {portfolio.tesdaRegistrationNumber && (
                          <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} text-sm`}>
                            • Reg. #: {portfolio.tesdaRegistrationNumber}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="small" className={`${designTheme.sidebarTextColor || "text-gray-800"} italic text-xs`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Main Content - White Background */}
              <div className="flex-1 bg-white p-8">
                {/* Professional Summary */}
                <div className="mb-8">
                  <Typography variant="h6" className={`${designTheme.mainTextColor || "text-gray-800"} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                    Professional Summary
                  </Typography>
                  <div className="mt-3">
                    {isEditMode && editingSections.header ? (
                      <Textarea
                        value={editingPortfolio?.professionalSummary || ""}
                        onChange={(e) => handleFieldChange("professionalSummary", e.target.value)}
                        className="!border-gray-300"
                        rows={4}
                      />
                    ) : portfolio.professionalSummary ? (
                      <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} leading-relaxed`}>
                        {portfolio.professionalSummary}
                      </Typography>
                    ) : (
                      <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} italic`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Work Experience */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className={`${designTheme.mainTextColor || "text-gray-800"} font-bold text-sm uppercase pb-2 border-b border-gray-600`}>
                      Work Experience
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton size="sm" variant="text" onClick={() => handleSectionEditToggle("experience")}>
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <div className="mt-3">
                    {portfolio.experiences && portfolio.experiences.length > 0 ? (
                      <div className="space-y-6">
                        {portfolio.experiences.map((exp, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} font-semibold`}>
                                  {exp.employer || exp.company || "Company"}
                                </Typography>
                                <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"}`}>
                                  {exp.jobTitle || "Position"}
                                </Typography>
                              </div>
                              {(exp.startDate || exp.endDate) && (
                                <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} text-right`}>
                                  {exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : exp.startDate || exp.endDate}
                                </Typography>
                              )}
                            </div>
                            {exp.description && (
                              <ul className="list-disc list-inside mt-2">
                                <li>
                                  <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"}`}>
                                    {exp.description}
                                  </Typography>
                                </li>
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} italic`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Certificates */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className={`${designTheme.mainTextColor || "text-gray-800"} font-bold text-sm uppercase pb-2 border-b border-gray-600`}>
                      Certificates
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton size="sm" variant="text" onClick={() => handleSectionEditToggle("certificates")}>
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <div className="mt-3">
                    {certificates.length > 0 ? (
                      <div className="space-y-3">
                        {certificates.map((certificate, index) => (
                          <div key={index}>
                            <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} font-medium`}>
                              {certificate.courseName}
                            </Typography>
                            {certificate.certificateNumber && (
                              <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} text-xs`}>
                                #{certificate.certificateNumber}
                              </Typography>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} italic`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Projects */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className={`${designTheme.mainTextColor || "text-gray-800"} font-bold text-sm uppercase pb-2 border-b border-gray-600`}>
                      Projects
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton size="sm" variant="text" onClick={() => handleSectionEditToggle("projects")}>
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <div className="mt-3">
                    {projects.length > 0 ? (
                      <div className="space-y-4">
                        {projects.map((project, index) => (
                          <div key={index}>
                            <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} font-semibold`}>
                              {project.title}
                            </Typography>
                            {project.description && (
                              <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} text-xs mt-1`}>
                                {project.description}
                              </Typography>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} italic`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Awards & Recognition */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className={`${designTheme.mainTextColor || "text-gray-800"} font-bold text-sm uppercase pb-2 border-b border-gray-600`}>
                      Awards & Recognition
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton size="sm" variant="text" onClick={() => handleSectionEditToggle("awards")}>
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <div className="mt-3">
                    {portfolio.awardsRecognitions && portfolio.awardsRecognitions.length > 0 ? (
                      <div className="space-y-3">
                        {portfolio.awardsRecognitions.map((award, index) => (
                          <div key={index}>
                            <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} font-medium`}>
                              {award.title}
                            </Typography>
                            {award.issuer && (
                              <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} text-xs`}>
                                {award.issuer}
                              </Typography>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} italic`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Continuing Education */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className={`${designTheme.mainTextColor || "text-gray-800"} font-bold text-sm uppercase pb-2 border-b border-gray-600`}>
                      Continuing Education
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton size="sm" variant="text" onClick={() => handleSectionEditToggle("education")}>
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <div className="mt-3">
                    {portfolio.continuingEducations && portfolio.continuingEducations.length > 0 ? (
                      <div className="space-y-3">
                        {portfolio.continuingEducations.map((edu, index) => (
                          <div key={index}>
                            <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} font-medium`}>
                              {edu.courseName}
                            </Typography>
                            {edu.institution && (
                              <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} text-xs`}>
                                {edu.institution}
                              </Typography>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} italic`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Professional Memberships */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className={`${designTheme.mainTextColor || "text-gray-800"} font-bold text-sm uppercase pb-2 border-b border-gray-600`}>
                      Professional Memberships
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton size="sm" variant="text" onClick={() => handleSectionEditToggle("memberships")}>
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <div className="mt-3">
                    {portfolio.professionalMemberships && portfolio.professionalMemberships.length > 0 ? (
                      <div className="space-y-3">
                        {portfolio.professionalMemberships.map((mem, index) => (
                          <div key={index}>
                            <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} font-medium`}>
                              {mem.organization}
                            </Typography>
                            {mem.membershipType && (
                              <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} text-xs`}>
                                {mem.membershipType}
                              </Typography>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} italic`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>

                {/* References */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className={`${designTheme.mainTextColor || "text-gray-800"} font-bold text-sm uppercase pb-2 border-b border-gray-600`}>
                      References
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton size="sm" variant="text" onClick={() => handleSectionEditToggle("references")}>
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <div className="mt-3">
                    {portfolio.references && portfolio.references.length > 0 ? (
                      <div className="space-y-3">
                        {portfolio.references.map((ref, index) => (
                          <div key={index}>
                            <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} font-medium`}>
                              {ref.name}
                            </Typography>
                            {ref.position && (
                              <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} text-xs`}>
                                {ref.position}
                              </Typography>
                            )}
                            {ref.company && (
                              <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} text-xs`}>
                                {ref.company}
                              </Typography>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography variant="small" className={`${designTheme.mainTextColor || "text-gray-800"} italic`}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Share Your Portfolio Section - Only for graduate view */}
            {isGraduateView && (
              <div className="mt-8 bg-white border border-gray-300 rounded-lg p-8">
                <div className="text-center mb-8">
                  <Typography variant="h4" className={`${designTheme.textColor || "text-gray-800"} mb-4 font-light`}>
                    Share Your Portfolio
                  </Typography>
                  <Typography className="text-gray-600 max-w-2xl mx-auto font-light">
                    Share your professional portfolio with potential employers, clients, or collaborators using secure
                    links.
                  </Typography>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Button onClick={copyToClipboard} color={designTheme.buttonColor || "gray"} size="lg" className="font-light">
                    Copy Secure Link
                  </Button>
                  <Button onClick={shareToLinkedIn} color={designTheme.buttonColor || "gray"} variant="outlined" size="lg" className="font-light">
                    Share to LinkedIn
                  </Button>
                  <Button onClick={shareToFacebook} color={designTheme.buttonColor || "gray"} variant="outlined" size="lg" className="font-light">
                    Share to Facebook
                  </Button>
                </div>

                {shareToken && (
                  <div className="p-6 bg-gray-100 rounded-lg mb-6">
                    <Typography variant="h6" className={`${designTheme.textColor || "text-gray-800"} mb-2 font-light`}>
                      Your Secure Token
                    </Typography>
                    <Typography variant="small" className="text-gray-700 font-mono">
                      {shareToken.substring(0, 8)}...{shareToken.slice(-4)}
                    </Typography>
                    <Typography variant="small" className="text-gray-600 mt-2 italic">
                      Links using this token will work until you generate a new one.
                    </Typography>
                  </div>
                )}

                {saveSuccess && (
                  <Card className="mb-6 bg-green-50 border border-green-200">
                    <CardBody>
                      <Typography color="green" className="text-center">
                        {saveSuccess}
                      </Typography>
                    </CardBody>
                  </Card>
                )}

                {saveError && (
                  <Card className="mb-6 bg-red-50 border border-red-200">
                    <CardBody>
                      <Typography color="red" className="text-center">
                        {saveError}
                      </Typography>
                    </CardBody>
                  </Card>
                )}

                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    onClick={handleEditModeToggle}
                    color={isEditMode ? "red" : designTheme.buttonColor || "gray"}
                    size="lg"
                    className="font-light flex items-center gap-2"
                  >
                    {isEditMode ? (
                      <>
                        <FaTimes className="w-4 h-4" />
                        Cancel Edit
                      </>
                    ) : (
                      <>
                        <FaPen className="w-4 h-4" />
                        Edit Portfolio
                      </>
                    )}
                  </Button>
                  {isEditMode && (
                    <Button
                      onClick={handleSavePortfolio}
                      color="green"
                      size="lg"
                      className="font-light flex items-center gap-2"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Spinner className="w-4 h-4" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  )}
                  {!isEditMode && (
                    <>
                      <Button
                        onClick={handleRegenerateToken}
                        color={designTheme.buttonColor || "gray"}
                        variant="outlined"
                        size="lg"
                        className="font-light"
                      >
                        Generate New Link
                      </Button>
                      <Button onClick={handleDelete} color="red" variant="outlined" size="lg" className="font-light">
                        Delete Portfolio
                      </Button>
                    </>
                  )}
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
          </div>
        ) : (
          <>
            {/* Default Layout */}
            <div className={`${designTheme.headerBg} text-white relative overflow-hidden`}>
            {/* Background pattern */}
            <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>
            <div className="px-6 py-24 relative">
          {/* Back Button - Visible only in public view */}
          
          <div className={`${designTheme.headerFlexDirection} w-full gap-16`}>
            {/* Profile Image */}
            {(graduate?.profilePicture || portfolio?.avatar || isEditMode) && (
              <div className={`relative flex-shrink-0 animate-fade-in-up ${designTheme.avatarPosition}`}>
                <div className="absolute inset-0 bg-white/20 blur-xl scale-110 animate-pulse"></div>
                <div className={`absolute inset-0 blur-2xl scale-125 animate-ping opacity-20 ${
                  designTheme.accentColor === "amber" ? "bg-amber-300/30" :
                  designTheme.accentColor === "red" ? "bg-red-300/30" :
                  designTheme.accentColor === "blue" ? "bg-blue-300/30" :
                  designTheme.accentColor === "green" ? "bg-green-300/30" :
                  designTheme.accentColor === "purple" ? "bg-purple-300/30" :
                  "bg-blue-300/30"
                }`}></div>
                <Avatar
                  src={
                    isEditMode && selectedAvatarFile
                      ? URL.createObjectURL(selectedAvatarFile)
                      : graduate?.profilePicture || portfolio?.avatar
                  }
                  alt={`${portfolio.fullName || "Profile"} Picture`}
                  size="xxl"
                  className={`relative shadow-2xl ${designTheme.avatarSize} backdrop-blur-sm transition-all duration-500 animate-float rounded-none border-0 ${
                    isEditMode ? "cursor-pointer hover:scale-110 hover:ring-4 hover:ring-white/50" : "hover:scale-105"
                  }`}
                  onClick={handleImageClick}
                />
                {isEditMode && !editingSections.header && (
                  <div className={`absolute bottom-2 right-2 rounded-full p-2 shadow-lg cursor-pointer ${
                    designTheme.accentColor === "amber" ? "bg-amber-500 hover:bg-amber-600" :
                    designTheme.accentColor === "red" ? "bg-red-500 hover:bg-red-600" :
                    designTheme.accentColor === "blue" ? "bg-blue-500 hover:bg-blue-600" :
                    designTheme.accentColor === "green" ? "bg-green-500 hover:bg-green-600" :
                    designTheme.accentColor === "purple" ? "bg-purple-500 hover:bg-purple-600" :
                    "bg-blue-500 hover:bg-blue-600"
                  }`}
                    onClick={() => handleSectionEditToggle("header")}>
                    <FaPen className="w-4 h-4 text-white" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  ref={avatarFileInputRef}
                  className="hidden"
                />
              </div>
            )}

            {/* Text Content */}
            <div className={`flex-1 ${designTheme.headerTextAlign} space-y-8`}>
              <div className={`animate-fade-in-up animation-delay-300 flex items-center gap-3 ${
                designTheme.headerLayout === "centered" ? "justify-center" : 
                designTheme.headerLayout === "right-left" ? "justify-end" : "justify-start"
              }`}>
                {isEditMode && editingSections.header ? (
                  <div className="flex-1">
                    <Input
                      value={editingPortfolio?.fullName || ""}
                      onChange={(e) => handleFieldChange("fullName", e.target.value)}
                      className={`!${designTheme.typographySize} !${designTheme.titleWeight} !bg-white/20 !border-white/40 !text-white placeholder:text-white/60`}
                      placeholder="Full Name"
                    />
                  </div>
                ) : (
                  <Typography
                    variant="h1"
                    className={`mb-6 ${designTheme.titleWeight} ${designTheme.typographySize} tracking-tight animate-typing overflow-hidden whitespace-nowrap border-r-4 border-white/50 break-words`}
                  >
                    {portfolio.fullName || "Professional Portfolio"}
                  </Typography>
                )}
                {isGraduateView && isEditMode && (
                  <IconButton
                    size="sm"
                    variant="text"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleSectionEditToggle("header")}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>

              {(portfolio.professionalTitle || (isEditMode && editingSections.header)) && (
                <div className="relative animate-fade-in-up animation-delay-600 flex items-center gap-3">
                  {isEditMode && editingSections.header ? (
                    <div className="flex-1">
                      <Input
                        value={editingPortfolio?.professionalTitle || ""}
                        onChange={(e) => handleFieldChange("professionalTitle", e.target.value)}
                        className="!text-2xl md:!text-3xl !font-light !bg-white/20 !border-white/40 !text-white placeholder:text-white/60"
                        placeholder="Professional Title"
                      />
                    </div>
                  ) : (
                    <>
                      <Typography
                        variant="h3"
                        className="font-light text-white/90 text-2xl md:text-3xl tracking-wide break-words"
                      >
                        {portfolio.professionalTitle}
                      </Typography>
                      <div className="w-0 h-0.5 bg-white/40 mt-4 animate-expand-line"></div>
                    </>
                  )}
                </div>
              )}

              {(portfolio.professionalSummary || (isEditMode && editingSections.header)) && (
                <div className={`mt-10 animate-fade-in-up animation-delay-900 ${
                  designTheme.headerLayout === "centered" ? "max-w-3xl mx-auto" : 
                  designTheme.headerLayout === "right-left" ? "max-w-3xl ml-auto" : 
                  "max-w-3xl"
                }`}>
                  {isEditMode && editingSections.header ? (
                    <Textarea
                      value={editingPortfolio?.professionalSummary || ""}
                      onChange={(e) => handleFieldChange("professionalSummary", e.target.value)}
                      className="!text-xl md:!text-2xl !font-light !bg-white/20 !border-white/40 !text-white placeholder:text-white/60"
                      placeholder="Professional Summary"
                      rows={4}
                    />
                  ) : (
                    <Typography
                      variant="lead"
                      className="text-white/80 leading-relaxed text-xl md:text-2xl font-light tracking-wide break-words overflow-wrap-anywhere"
                    >
                      {portfolio.professionalSummary}
                    </Typography>
                  )}
                </div>
              )}
              {isEditMode && editingSections.header && (
                <div className={`mt-6 flex ${
                  designTheme.headerLayout === "centered" ? "justify-center" : 
                  designTheme.headerLayout === "right-left" ? "justify-start" : 
                  "justify-end"
                }`}>
                  <Button
                    variant="gradient"
                    color="white"
                    onClick={() => handleSaveSection("header")}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <FaSave className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}

              <div className={`mt-14 flex animate-fade-in-up animation-delay-1200 ${
                designTheme.headerLayout === "centered" ? "justify-center" : 
                designTheme.headerLayout === "right-left" ? "justify-end" : 
                "justify-start"
              }`}>
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

      <div className="px-6 py-16">
        <div className={`grid ${designTheme.contentGrid} gap-12`}>
          <div className={`${
            designTheme.contentGrid.includes("lg:grid-cols-4") ? "lg:col-span-1" : 
            designTheme.contentGrid.includes("lg:grid-cols-3") ? "lg:col-span-1" : 
            designTheme.contentGrid.includes("lg:grid-cols-2") ? "lg:col-span-1" : 
            ""
          } ${designTheme.sectionSpacing}`}>
            {/* Contact Information */}
            <div className={`bg-white border ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding}`}>
              <div className="flex items-center justify-between mb-6">
                <Typography variant="h6" className={`font-light ${designTheme.textColor} text-lg`}>
                  Contact
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="sm" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("contact")}
                    className={editingSections.contact ? designTheme.textColor : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              <div className="space-y-4">
                {(portfolio.email || isEditMode) && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Email
                    </Typography>
                    {isEditMode && editingSections.contact ? (
                      <Input
                        size="sm"
                        value={editingPortfolio?.email || ""}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        placeholder="Email address"
                        className="!border-gray-300"
                      />
                    ) : (
                      <Typography variant="small" className="text-gray-800 break-all">
                        {portfolio.email}
                      </Typography>
                    )}
                  </div>
                )}
                {(portfolio.phone || isEditMode) && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Phone
                    </Typography>
                    {isEditMode && editingSections.contact ? (
                      <Input
                        size="sm"
                        value={editingPortfolio?.phone || ""}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        placeholder="Phone number"
                        className="!border-gray-300"
                      />
                    ) : (
                      <Typography variant="small" className="text-gray-800">
                        {portfolio.phone}
                      </Typography>
                    )}
                  </div>
                )}
                {(portfolio.website || isEditMode) && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Website
                    </Typography>
                    {isEditMode && editingSections.contact ? (
                      <Input
                        size="sm"
                        value={editingPortfolio?.website || ""}
                        onChange={(e) => handleFieldChange("website", e.target.value)}
                        placeholder="Website URL"
                        className="!border-gray-300"
                      />
                    ) : (
                      <Typography variant="small" className="text-gray-800 break-all">
                        {portfolio.website}
                      </Typography>
                    )}
                  </div>
                )}
              </div>
              {isEditMode && editingSections.contact && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="gradient"
                    color={designTheme.buttonColor}
                    size="sm"
                    onClick={() => handleSaveSection("contact")}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <FaSave className="w-3 h-3" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className={`bg-white border ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding}`}>
              <div className="flex items-center justify-between mb-6">
                <Typography variant="h6" className={`font-light ${designTheme.textColor} text-lg`}>
                  Skills
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="sm" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("skills")}
                    className={editingSections.skills ? designTheme.textColor : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              {((portfolio.skills && portfolio.skills.length > 0) || (isEditMode && editingSections.skills)) ? (
                <div className="space-y-3">
                  {(isEditMode && editingSections.skills ? editingPortfolio?.skills : portfolio.skills)?.map((skill, index) => (
                    <div key={index} className="pb-3 border-b border-gray-50 last:border-b-0">
                      {isEditMode && editingSections.skills ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              size="sm"
                              value={skill.name || ""}
                              onChange={(e) => handleArrayFieldChange("skills", index, "name", e.target.value)}
                              placeholder="Skill name"
                              className="!border-gray-300 flex-1"
                            />
                            <IconButton
                              size="sm"
                              variant="text"
                              color="red"
                              onClick={() => handleRemoveArrayItem("skills", index)}
                            >
                              <FaTrash className="w-3 h-3" />
                            </IconButton>
                          </div>
                          <Input
                            size="sm"
                            value={skill.proficiencyLevel || ""}
                            onChange={(e) => handleArrayFieldChange("skills", index, "proficiencyLevel", e.target.value)}
                            placeholder="Proficiency level"
                            className="!border-gray-300"
                          />
                        </div>
                      ) : (
                        <>
                          <Typography variant="small" className="font-medium text-gray-800 mb-1">
                            {skill.name}
                          </Typography>
                          <div className="flex items-center space-x-2">
                            <Chip size="sm" value={skill.type} color={designTheme.buttonColor} className="text-xs font-light" />
                            {skill.proficiencyLevel && (
                              <Typography variant="small" color="gray" className="text-xs">
                                {skill.proficiencyLevel}
                              </Typography>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {isEditMode && editingSections.skills && (
                    <Button
                      variant="outlined"
                      size="sm"
                      color={designTheme.buttonColor}
                      onClick={() => handleAddArrayItem("skills", { name: "", type: "TECHNICAL", proficiencyLevel: "" })}
                      className="w-full flex items-center justify-center gap-2 mt-2"
                    >
                      <FaPlus className="w-3 h-3" />
                      Add Skill
                    </Button>
                  )}
                  {isEditMode && editingSections.skills && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="gradient"
                        color={designTheme.buttonColor}
                        size="sm"
                        onClick={() => handleSaveSection("skills")}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <FaSave className="w-3 h-3" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Typography variant="small" className="text-gray-500 italic">
                  No skills added yet
                </Typography>
              )}
            </div>

            {/* TESDA Information */}
            <div className={`bg-white border ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding}`}>
              <div className="flex items-center justify-between mb-6">
                <Typography variant="h6" className={`font-light ${designTheme.textColor} text-lg`}>
                  TESDA Information
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="sm" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("tesda")}
                    className={editingSections.tesda ? designTheme.textColor : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              <div className="space-y-4">
                {(portfolio.ncLevel || (isEditMode && editingSections.tesda)) && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      NC Level
                    </Typography>
                    {isEditMode && editingSections.tesda ? (
                      <Input
                        size="sm"
                        value={editingPortfolio?.ncLevel || ""}
                        onChange={(e) => handleFieldChange("ncLevel", e.target.value)}
                        placeholder="NC Level"
                        className="!border-gray-300"
                      />
                    ) : (
                      <Typography variant="small" className="text-gray-800">
                        {portfolio.ncLevel}
                      </Typography>
                    )}
                  </div>
                )}
                {(portfolio.trainingCenter || (isEditMode && editingSections.tesda)) && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Training Center
                    </Typography>
                    {isEditMode && editingSections.tesda ? (
                      <Input
                        size="sm"
                        value={editingPortfolio?.trainingCenter || ""}
                        onChange={(e) => handleFieldChange("trainingCenter", e.target.value)}
                        placeholder="Training Center"
                        className="!border-gray-300"
                      />
                    ) : (
                      <Typography variant="small" className="text-gray-800">
                        {portfolio.trainingCenter}
                      </Typography>
                    )}
                  </div>
                )}
                {(portfolio.scholarshipType || (isEditMode && editingSections.tesda)) && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Scholarship Type
                    </Typography>
                    {isEditMode && editingSections.tesda ? (
                      <Input
                        size="sm"
                        value={editingPortfolio?.scholarshipType || ""}
                        onChange={(e) => handleFieldChange("scholarshipType", e.target.value)}
                        placeholder="Scholarship Type"
                        className="!border-gray-300"
                      />
                    ) : (
                      <Typography variant="small" className="text-gray-800">
                        {portfolio.scholarshipType}
                      </Typography>
                    )}
                  </div>
                )}
                {(portfolio.trainingDuration || (isEditMode && editingSections.tesda)) && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Training Duration
                    </Typography>
                    {isEditMode && editingSections.tesda ? (
                      <Input
                        size="sm"
                        value={editingPortfolio?.trainingDuration || ""}
                        onChange={(e) => handleFieldChange("trainingDuration", e.target.value)}
                        placeholder="Training Duration"
                        className="!border-gray-300"
                      />
                    ) : (
                      <Typography variant="small" className="text-gray-800">
                        {portfolio.trainingDuration}
                      </Typography>
                    )}
                  </div>
                )}
                {(portfolio.tesdaRegistrationNumber || (isEditMode && editingSections.tesda)) && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Registration Number
                    </Typography>
                    {isEditMode && editingSections.tesda ? (
                      <Input
                        size="sm"
                        value={editingPortfolio?.tesdaRegistrationNumber || ""}
                        onChange={(e) => handleFieldChange("tesdaRegistrationNumber", e.target.value)}
                        placeholder="TESDA Registration Number"
                        className="!border-gray-300"
                      />
                    ) : (
                      <Typography variant="small" className="text-gray-800">
                        {portfolio.tesdaRegistrationNumber}
                      </Typography>
                    )}
                  </div>
                )}
              </div>
              {isEditMode && editingSections.tesda && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="gradient"
                    color={designTheme.buttonColor}
                    size="sm"
                    onClick={() => handleSaveSection("tesda")}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <FaSave className="w-3 h-3" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </div>
 
          <div className={`${
            designTheme.contentGrid.includes("lg:grid-cols-4") ? "lg:col-span-3" : 
            designTheme.contentGrid.includes("lg:grid-cols-3") ? "lg:col-span-2" : 
            designTheme.contentGrid.includes("lg:grid-cols-2") ? "lg:col-span-1" : 
            ""
          }`}>
            {/* Certificates */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className={`font-light ${designTheme.textColor} ${designTheme.typographySize.includes("text-4xl") ? "text-xl md:text-2xl" : designTheme.typographySize.includes("text-3xl") ? "text-lg md:text-xl" : "text-2xl"}`}>
                  Certificates
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="sm" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("certificates")}
                    className={editingSections.certificates ? designTheme.textColor : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              {isEditMode && editingSections.certificates && isAddingCertificate && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                  <Typography variant="h6" className="text-gray-800 font-semibold mb-4">
                    {editingCertificateId ? "Edit Certificate" : "Add New Certificate"}
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Course Name *
                      </Typography>
                      <Input
                        size="lg"
                        name="courseName"
                        value={newCertificate.courseName}
                        onChange={handleCertificateInputChange}
                        placeholder="Enter course name"
                        required
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Certificate Number *
                      </Typography>
                      <Input
                        size="lg"
                        name="certificateNumber"
                        value={newCertificate.certificateNumber}
                        onChange={handleCertificateInputChange}
                        placeholder="Enter certificate number"
                        required
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                      Issue Date *
                    </Typography>
                    <Input
                      type="date"
                      size="lg"
                      name="issueDate"
                      value={newCertificate.issueDate}
                      onChange={handleCertificateInputChange}
                      required
                      className="!border-gray-300 focus:!border-blue-500"
                    />
                  </div>
                  <div className="mt-4">
                    <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                      Certificate File {editingCertificateId ? "(Optional)" : "*"}
                    </Typography>
                    <div className="flex items-center gap-4">
                      {newCertificate.certificateFile ? (
                        <Avatar
                          src={URL.createObjectURL(newCertificate.certificateFile)}
                          alt="Certificate Preview"
                          size="lg"
                          className="ring-2 ring-blue-200"
                        />
                      ) : editingCertificateId ? (
                        <Avatar
                          src={certificates.find((cert) => cert.id === editingCertificateId)?.certificateFilePath || "/placeholder.svg"}
                          alt="Certificate Preview"
                          size="lg"
                          className="ring-2 ring-blue-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center">
                          <Typography variant="h5" className="text-gray-600">
                            📄
                          </Typography>
                        </div>
                      )}
                      <Button
                        variant="outlined"
                        color={designTheme.buttonColor}
                        onClick={handleCertificateImageClick}
                        className="flex items-center gap-2"
                      >
                        <FaPlus className="w-4 h-4" />
                        Choose File
                      </Button>
                      <input
                        type="file"
                        id="certificateFile"
                        accept="image/*"
                        onChange={handleCertificateFileChange}
                        ref={certificateFileInputRef}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      variant="gradient"
                      color={designTheme.buttonColor}
                      onClick={editingCertificateId ? handleUpdateCertificate : handleAddCertificate}
                      disabled={!isCertificateFormValid()}
                    >
                      {editingCertificateId ? "Update Certificate" : "Add Certificate"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => {
                        setIsAddingCertificate(false)
                        setEditingCertificateId(null)
                        setNewCertificate({
                          courseName: "",
                          certificateNumber: "",
                          issueDate: "",
                          certificateFile: null,
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {((certificates && certificates.length > 0) || (isEditMode && editingSections.certificates)) ? (
                <div className="space-y-4">
                  {!isAddingCertificate && isEditMode && editingSections.certificates && (
                    <Button
                      variant="outlined"
                      color="blue"
                      onClick={() => {
                        setIsAddingCertificate(true)
                        setEditingCertificateId(null)
                        setNewCertificate({ courseName: "", certificateNumber: "", issueDate: "", certificateFile: null })
                      }}
                      className="flex items-center gap-2 w-full"
                    >
                      <FaPlus className="w-4 h-4" />
                      Add Certificate
                    </Button>
                  )}

                  {certificates && certificates.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {certificates.map((certificate) => (
                        <Card key={certificate.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              {(certificate.preview || certificate.certificateFilePath) && (
                                <Avatar
                                  src={certificate.preview || certificate.certificateFilePath || "/placeholder.svg"}
                                  alt="Certificate Preview"
                                  size="lg"
                                  className="ring-2 ring-blue-200"
                                />
                              )}
                              <div>
                                <Typography variant="h6" className="text-gray-800 font-semibold">
                                  {certificate.courseName}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                  Certificate #: {certificate.certificateNumber}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                  Issued: {certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : "N/A"}
                                </Typography>
                              </div>
                            </div>
                            {isEditMode && editingSections.certificates && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="text"
                                  color="blue"
                                  onClick={() => handleEditCertificate(certificate)}
                                  className="flex items-center gap-1"
                                >
                                  <FaPen className="w-4 h-4" /> Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="text"
                                  color="red"
                                  onClick={() => handleRemoveCertificate(certificate.id)}
                                  className="flex items-center gap-1"
                                >
                                  <FaTrash className="w-4 h-4" /> Remove
                                </Button>
                              </div>
                            )}
                            {!isEditMode || !editingSections.certificates ? (
                              <div
                                className="cursor-pointer"
                                onClick={() => handleCertificateClick(certificate)}
                              >
                                <Typography variant="small" color="blue">
                                  View
                                </Typography>
                              </div>
                            ) : null}
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                  {isEditMode && editingSections.certificates && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        variant="gradient"
                        color="blue"
                        onClick={() => handleSaveSection("certificates")}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <FaSave className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-lg p-6">
                  <Typography variant="small" className="text-gray-500 italic">
                    No certificates added yet
                  </Typography>
                </div>
              )}
            </div>
            
            {/* Experience */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className="font-light text-blue-600 text-2xl">
                  Experience
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="sm" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("experience")}
                    className={editingSections.experience ? "text-blue-600" : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              {((portfolio.experiences && portfolio.experiences.length > 0) || (isEditMode && editingSections.experience)) ? (
                <div className="space-y-8">
                  {(isEditMode && editingSections.experience ? editingPortfolio?.experiences : portfolio.experiences)?.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-100 pl-8 pb-8 relative">
                      {isEditMode && editingSections.experience && (
                        <IconButton
                          size="sm"
                          variant="text"
                          color="red"
                          className="absolute top-0 right-0"
                          onClick={() => handleRemoveArrayItem("experiences", index)}
                        >
                          <FaTrash className="w-4 h-4" />
                        </IconButton>
                      )}
                      {isEditMode && editingSections.experience ? (
                        <div className="space-y-3">
                          <Input
                            size="md"
                            value={exp.jobTitle || ""}
                            onChange={(e) => handleArrayFieldChange("experiences", index, "jobTitle", e.target.value)}
                            placeholder="Job Title"
                            className="!border-gray-300"
                          />
                          <Input
                            size="md"
                            value={exp.employer || ""}
                            onChange={(e) => handleArrayFieldChange("experiences", index, "employer", e.target.value)}
                            placeholder="Company"
                            className="!border-gray-300"
                          />
                          <Textarea
                            size="md"
                            value={exp.description || ""}
                            onChange={(e) =>
                              handleArrayFieldChange("experiences", index, "description", e.target.value)
                            }
                            placeholder="Responsibilities"
                            className="!border-gray-300"
                            rows={3}
                          />
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  ))}
                  {isEditMode && editingSections.experience && (
                    <Button
                      variant="outlined"
                      size="md"
                      color="blue"
                      onClick={() =>
                        handleAddArrayItem("experiences", {
                          jobTitle: "",
                          employer: "",
                          description: "",
                          startDate: "",
                          endDate: "",
                        })
                      }
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Add Experience
                    </Button>
                  )}
                  {isEditMode && editingSections.experience && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        variant="gradient"
                        color="blue"
                        onClick={() => handleSaveSection("experience")}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <FaSave className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
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
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className="font-light text-blue-600 text-2xl">
                  Projects
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="sm" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("projects")}
                    className={editingSections.projects ? "text-blue-600" : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              {isEditMode && editingSections.projects && isAddingProject && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                  <Typography variant="h6" className="text-gray-800 font-semibold mb-4">
                    {editingProjectId ? "Edit Project" : "Add New Project"}
                  </Typography>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Project Title *
                      </Typography>
                      <Input
                        size="lg"
                        name="title"
                        value={newProject.title}
                        onChange={handleProjectInputChange}
                        placeholder="Enter project title"
                        required
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                      Description *
                    </Typography>
                    <Textarea
                      size="lg"
                      name="description"
                      value={newProject.description}
                      onChange={handleProjectInputChange}
                      placeholder="Describe your project"
                      required
                      className="!border-gray-300 focus:!border-blue-500"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Start Date *
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        name="startDate"
                        value={newProject.startDate}
                        onChange={handleProjectInputChange}
                        required
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        End Date *
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        name="endDate"
                        value={newProject.endDate}
                        onChange={handleProjectInputChange}
                        required
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                      Project Image {editingProjectId ? "(Optional)" : "*"}
                    </Typography>
                    <div className="flex items-center gap-4">
                      {newProject.projectImageFile ? (
                        <Avatar
                          src={URL.createObjectURL(newProject.projectImageFile)}
                          alt="Project Preview"
                          size="lg"
                          className="ring-2 ring-blue-200"
                        />
                      ) : editingProjectId ? (
                        <Avatar
                          src={projects.find((proj) => proj.id === editingProjectId)?.projectImageFilePath || "/placeholder.svg"}
                          alt="Project Preview"
                          size="lg"
                          className="ring-2 ring-blue-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center">
                          <Typography variant="h5" className="text-gray-600">
                            📷
                          </Typography>
                        </div>
                      )}
                      <Button
                        variant="outlined"
                        color="blue"
                        onClick={handleProjectImageClick}
                        className="flex items-center gap-2"
                      >
                        <FaPlus className="w-4 h-4" />
                        Choose Image
                      </Button>
                      <input
                        type="file"
                        id="projectImageFile"
                        accept="image/*"
                        onChange={handleProjectFileChange}
                        ref={projectFileInputRef}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      variant="gradient"
                      color="blue"
                      onClick={editingProjectId ? handleUpdateProject : handleAddProject}
                      disabled={!isProjectFormValid()}
                    >
                      {editingProjectId ? "Update Project" : "Add Project"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => {
                        setIsAddingProject(false)
                        setEditingProjectId(null)
                        setNewProject({
                          title: "",
                          description: "",
                          startDate: "",
                          endDate: "",
                          projectImageFile: null,
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {((projects && projects.length > 0) || (isEditMode && editingSections.projects)) ? (
                <div className="space-y-4">
                  {!isAddingProject && isEditMode && editingSections.projects && (
                    <Button
                      variant="outlined"
                      color="blue"
                      onClick={() => {
                        setIsAddingProject(true)
                        setEditingProjectId(null)
                        setNewProject({ title: "", description: "", startDate: "", endDate: "", projectImageFile: null })
                      }}
                      className="flex items-center gap-2 w-full"
                    >
                      <FaPlus className="w-4 h-4" />
                      Add Project
                    </Button>
                  )}

                  {projects && projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {projects.map((project) => (
                        <Card key={project.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
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
                          <CardBody className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
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
                              {isEditMode && editingSections.projects && (
                                <div className="flex flex-col gap-2">
                                  <Button
                                    size="sm"
                                    variant="text"
                                    color="blue"
                                    onClick={() => handleEditProject(project)}
                                    className="flex items-center gap-1"
                                  >
                                    <FaPen className="w-4 h-4" /> Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="text"
                                    color="red"
                                    onClick={() => handleRemoveProject(project.id)}
                                    className="flex items-center gap-1"
                                  >
                                    <FaTrash className="w-4 h-4" /> Remove
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                  {isEditMode && editingSections.projects && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        variant="gradient"
                        color="blue"
                        onClick={() => handleSaveSection("projects")}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <FaSave className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-lg p-6">
                  <Typography variant="small" className="text-gray-500 italic">
                    No projects added yet
                  </Typography>
                </div>
              )}
            </div>

            {/* Awards & Recognition */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className="font-light text-blue-600 text-2xl">
                  Awards & Recognition
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="sm" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("awards")}
                    className={editingSections.awards ? "text-blue-600" : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              {((portfolio.awardsRecognitions && portfolio.awardsRecognitions.length > 0) || (isEditMode && editingSections.awards)) ? (
                <div className="space-y-4">
                  {(isEditMode && editingSections.awards ? editingPortfolio?.awardsRecognitions : portfolio.awardsRecognitions)?.map((award, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-lg p-6 relative">
                      {isEditMode && editingSections.awards && (
                        <IconButton
                          size="sm"
                          variant="text"
                          color="red"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveArrayItem("awardsRecognitions", index)}
                        >
                          <FaTrash className="w-4 h-4" />
                        </IconButton>
                      )}
                      {isEditMode && editingSections.awards ? (
                        <div className="space-y-3">
                          <Input
                            size="md"
                            value={award.title || ""}
                            onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "title", e.target.value)}
                            placeholder="Award Title"
                            className="!border-gray-300"
                          />
                          <Input
                            size="md"
                            value={award.issuer || ""}
                            onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "issuer", e.target.value)}
                            placeholder="Issued by"
                            className="!border-gray-300"
                          />
                          <Input
                            type="date"
                            size="md"
                            value={award.dateReceived || ""}
                            onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "dateReceived", e.target.value)}
                            className="!border-gray-300"
                          />
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  ))}
                  {isEditMode && editingSections.awards && (
                    <Button
                      variant="outlined"
                      size="md"
                      color="blue"
                      onClick={() => handleAddArrayItem("awardsRecognitions", { title: "", issuer: "", dateReceived: "" })}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Add Award
                    </Button>
                  )}
                  {isEditMode && editingSections.awards && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        variant="gradient"
                        color="blue"
                        onClick={() => handleSaveSection("awards")}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <FaSave className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
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
                <div className="flex items-center justify-between mb-6">
                  <Typography variant="h5" className="font-light text-blue-600">
                    Continuing Education
                  </Typography>
                  {isGraduateView && isEditMode && (
                    <IconButton 
                      size="sm" 
                      variant="text" 
                      onClick={() => handleSectionEditToggle("education")}
                      className={editingSections.education ? "text-blue-600" : ""}
                    >
                      <FaPen className="w-4 h-4" />
                    </IconButton>
                  )}
                </div>
                {((portfolio.continuingEducations && portfolio.continuingEducations.length > 0) || (isEditMode && editingSections.education)) ? (
                  <div className="space-y-4">
                    {(isEditMode && editingSections.education ? editingPortfolio?.continuingEducations : portfolio.continuingEducations)?.map((edu, index) => (
                      <div key={index} className="border-l-2 border-blue-100 pl-4 py-2 relative">
                        {isEditMode && editingSections.education && (
                          <IconButton
                            size="sm"
                            variant="text"
                            color="red"
                            className="absolute top-0 right-0"
                            onClick={() => handleRemoveArrayItem("continuingEducations", index)}
                          >
                            <FaTrash className="w-3 h-3" />
                          </IconButton>
                        )}
                        {isEditMode && editingSections.education ? (
                          <div className="space-y-2 pr-8">
                            <Input
                              size="sm"
                              value={edu.courseName || ""}
                              onChange={(e) => handleArrayFieldChange("continuingEducations", index, "courseName", e.target.value)}
                              placeholder="Course Name"
                              className="!border-gray-300"
                            />
                            <Input
                              size="sm"
                              value={edu.institution || ""}
                              onChange={(e) => handleArrayFieldChange("continuingEducations", index, "institution", e.target.value)}
                              placeholder="Institution"
                              className="!border-gray-300"
                            />
                            <Input
                              type="date"
                              size="sm"
                              value={edu.completionDate || ""}
                              onChange={(e) => handleArrayFieldChange("continuingEducations", index, "completionDate", e.target.value)}
                              className="!border-gray-300"
                            />
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    ))}
                    {isEditMode && editingSections.education && (
                      <Button
                        variant="outlined"
                        size="sm"
                        color="blue"
                        onClick={() => handleAddArrayItem("continuingEducations", { courseName: "", institution: "", completionDate: "" })}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <FaPlus className="w-3 h-3" />
                        Add Education
                      </Button>
                    )}
                    {isEditMode && editingSections.education && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="gradient"
                          color="blue"
                          size="sm"
                          onClick={() => handleSaveSection("education")}
                          disabled={isSaving}
                          className="flex items-center gap-2"
                        >
                          <FaSave className="w-3 h-3" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Typography variant="small" className="text-gray-500 italic">
                    No continuing education added yet
                  </Typography>
                )}
              </div>

              {/* Professional Memberships */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <Typography variant="h5" className="font-light text-blue-600">
                    Professional Memberships
                  </Typography>
                  {isGraduateView && isEditMode && (
                    <IconButton 
                      size="sm" 
                      variant="text" 
                      onClick={() => handleSectionEditToggle("memberships")}
                      className={editingSections.memberships ? "text-blue-600" : ""}
                    >
                      <FaPen className="w-4 h-4" />
                    </IconButton>
                  )}
                </div>
                {((portfolio.professionalMemberships && portfolio.professionalMemberships.length > 0) || (isEditMode && editingSections.memberships)) ? (
                  <div className="space-y-4">
                    {(isEditMode && editingSections.memberships ? editingPortfolio?.professionalMemberships : portfolio.professionalMemberships)?.map((mem, index) => (
                      <div key={index} className="border-l-2 border-blue-100 pl-4 py-2 relative">
                        {isEditMode && editingSections.memberships && (
                          <IconButton
                            size="sm"
                            variant="text"
                            color="red"
                            className="absolute top-0 right-0"
                            onClick={() => handleRemoveArrayItem("professionalMemberships", index)}
                          >
                            <FaTrash className="w-3 h-3" />
                          </IconButton>
                        )}
                        {isEditMode && editingSections.memberships ? (
                          <div className="space-y-2 pr-8">
                            <Input
                              size="sm"
                              value={mem.organization || ""}
                              onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "organization", e.target.value)}
                              placeholder="Organization"
                              className="!border-gray-300"
                            />
                            <Input
                              size="sm"
                              value={mem.membershipType || ""}
                              onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "membershipType", e.target.value)}
                              placeholder="Membership Type"
                              className="!border-gray-300"
                            />
                            <Input
                              type="date"
                              size="sm"
                              value={mem.startDate || ""}
                              onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "startDate", e.target.value)}
                              className="!border-gray-300"
                            />
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    ))}
                    {isEditMode && editingSections.memberships && (
                      <Button
                        variant="outlined"
                        size="sm"
                        color="blue"
                        onClick={() => handleAddArrayItem("professionalMemberships", { organization: "", membershipType: "", startDate: "" })}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <FaPlus className="w-3 h-3" />
                        Add Membership
                      </Button>
                    )}
                    {isEditMode && editingSections.memberships && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="gradient"
                          color="blue"
                          size="sm"
                          onClick={() => handleSaveSection("memberships")}
                          disabled={isSaving}
                          className="flex items-center gap-2"
                        >
                          <FaSave className="w-3 h-3" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
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
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className="font-light text-blue-600 text-2xl">
                  References
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="sm" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("references")}
                    className={editingSections.references ? "text-blue-600" : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              {((portfolio.references && portfolio.references.length > 0) || (isEditMode && editingSections.references)) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(isEditMode && editingSections.references ? editingPortfolio?.references : portfolio.references)?.map((ref, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-lg p-6 relative">
                      {isEditMode && editingSections.references && (
                        <IconButton
                          size="sm"
                          variant="text"
                          color="red"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveArrayItem("references", index)}
                        >
                          <FaTrash className="w-4 h-4" />
                        </IconButton>
                      )}
                      {isEditMode && editingSections.references ? (
                        <div className="space-y-3 pr-8">
                          <Input
                            size="md"
                            value={ref.name || ""}
                            onChange={(e) => handleArrayFieldChange("references", index, "name", e.target.value)}
                            placeholder="Name"
                            className="!border-gray-300"
                          />
                          <Input
                            size="md"
                            value={ref.relationship || ref.position || ""}
                            onChange={(e) => handleArrayFieldChange("references", index, "relationship", e.target.value)}
                            placeholder="Relationship/Position"
                            className="!border-gray-300"
                          />
                          <Input
                            size="md"
                            value={ref.company || ""}
                            onChange={(e) => handleArrayFieldChange("references", index, "company", e.target.value)}
                            placeholder="Company"
                            className="!border-gray-300"
                          />
                          <Input
                            type="email"
                            size="md"
                            value={ref.email || ""}
                            onChange={(e) => handleArrayFieldChange("references", index, "email", e.target.value)}
                            placeholder="Email"
                            className="!border-gray-300"
                          />
                          <Input
                            size="md"
                            value={ref.phone || ref.contact || ""}
                            onChange={(e) => handleArrayFieldChange("references", index, "phone", e.target.value)}
                            placeholder="Phone"
                            className="!border-gray-300"
                          />
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  ))}
                  {isEditMode && editingSections.references && (
                    <div className="md:col-span-2">
                      <Button
                        variant="outlined"
                        size="md"
                        color="blue"
                        onClick={() => handleAddArrayItem("references", { name: "", relationship: "", company: "", email: "", phone: "" })}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <FaPlus className="w-4 h-4" />
                        Add Reference
                      </Button>
                    </div>
                  )}
                  {isEditMode && editingSections.references && (
                    <div className="mt-6 flex justify-end md:col-span-2">
                      <Button
                        variant="gradient"
                        color="blue"
                        onClick={() => handleSaveSection("references")}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <FaSave className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
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
              <Button onClick={copyToClipboard} color={designTheme.buttonColor} size="lg" className="font-light">
                Copy Secure Link
              </Button>
              <Button onClick={shareToLinkedIn} color={designTheme.buttonColor} variant="outlined" size="lg" className="font-light">
                Share to LinkedIn
              </Button>
              <Button onClick={shareToFacebook} color={designTheme.buttonColor} variant="outlined" size="lg" className="font-light">
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

            {saveSuccess && (
              <Card className="mb-6 bg-green-50 border border-green-200">
                <CardBody>
                  <Typography color="green" className="text-center">
                    {saveSuccess}
                  </Typography>
                </CardBody>
              </Card>
            )}

            {saveError && (
              <Card className="mb-6 bg-red-50 border border-red-200">
                <CardBody>
                  <Typography color="red" className="text-center">
                    {saveError}
                  </Typography>
                </CardBody>
              </Card>
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={handleEditModeToggle}
                color={isEditMode ? "red" : "blue"}
                size="lg"
                className="font-light flex items-center gap-2"
              >
                {isEditMode ? (
                  <>
                    <FaTimes className="w-4 h-4" />
                    Cancel Edit
                  </>
                ) : (
                  <>
                    <FaPen className="w-4 h-4" />
                    Edit Portfolio
                  </>
                )}
              </Button>
              {isEditMode && (
                <Button
                  onClick={handleSavePortfolio}
                  color="green"
                  size="lg"
                  className="font-light flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Spinner className="w-4 h-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
              {!isEditMode && (
                <>
                  <Button
                    onClick={handleRegenerateToken}
                    color="blue"
                    variant="outlined"
                    size="lg"
                    className="font-light"
                  >
                    Generate New Link
                  </Button>
                  <Button onClick={handleDelete} color="red" variant="outlined" size="lg" className="font-light">
                    Delete Portfolio
                  </Button>
                </>
              )}
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
          </>
        )}
      </div>
    </div>
  )
}

export default ViewPortfolio