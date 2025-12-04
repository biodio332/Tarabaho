"use client"

import { useState, useEffect, useRef, Fragment } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { FaPen, FaSave, FaTimes, FaPlus, FaTrash, FaCheckCircle, FaExclamationCircle, FaCamera, FaInfoCircle } from "react-icons/fa"
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
  Select,
  Option,
} from "@material-tailwind/react"

const VALID_SKILL_TYPES = ["TECHNICAL", "LANGUAGE", "DIGITAL", "SOFT", "INDUSTRY_SPECIFIC"]
const SKILL_PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"]
const NC_LEVEL_OPTIONS = ["NC I", "NC II", "NC III", "NC IV", "NC V", "NC VI", "Additional"]

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
  const [fieldErrors, setFieldErrors] = useState({})
  const [isNcLevelAdditional, setIsNcLevelAdditional] = useState(false)
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
  const [projectSubmitAttempted, setProjectSubmitAttempted] = useState(false)
  const [certificateSubmitAttempted, setCertificateSubmitAttempted] = useState(false)
  const [experienceSubmitAttempted, setExperienceSubmitAttempted] = useState({})
  const [awardSubmitAttempted, setAwardSubmitAttempted] = useState({})
  const [educationSubmitAttempted, setEducationSubmitAttempted] = useState({})
  const [membershipSubmitAttempted, setMembershipSubmitAttempted] = useState({})
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"
  const navigate = useNavigate()
  const [selectedProjectImage, setSelectedProjectImage] = useState(null)
  const avatarFileInputRef = useRef(null)
  const certificateFileInputRef = useRef(null)
  const projectFileInputRef = useRef(null)

  // Show More/Show Less state for content density
  const INITIAL_ITEMS_LIMIT = 6
  const [showAllCertificates, setShowAllCertificates] = useState(false)
  const [showAllExperiences, setShowAllExperiences] = useState(false)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [showAllAwards, setShowAllAwards] = useState(false)
  const [showAllEducation, setShowAllEducation] = useState(false)
  const [showAllMemberships, setShowAllMemberships] = useState(false)
  const [showAllReferences, setShowAllReferences] = useState(false)

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: "success", // "success" or "error"
    title: "",
    message: "",
    link: "",
  })

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  // Validation functions
  const updateFieldError = (fieldName, errorMessage) => {
    setFieldErrors((prev) => {
      const updated = { ...prev }
      if (errorMessage) {
        updated[fieldName] = errorMessage
      } else {
        delete updated[fieldName]
      }
      return updated
    })
  }

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const isValidWebsiteUrl = (value) => {
    if (!value) return true
    const trimmedValue = value.trim()
    if (!/^https:\/\/(www\.)?/i.test(trimmedValue)) {
      return false
    }
    try {
      const url = new URL(trimmedValue)
      return url.protocol === "https:"
    } catch (err) {
      return false
    }
  }

  const validateField = (fieldName, value) => {
    const trimmedValue = typeof value === "string" ? value.trim() : value
    let message = ""

    switch (fieldName) {
      case "tesdaRegistrationNumber":
        if (trimmedValue && !/^\d+$/.test(trimmedValue)) {
          message = "TESDA registration number must contain digits only."
        }
        break
      case "email":
        if (trimmedValue) {
          if (!isValidEmail(trimmedValue) || !trimmedValue.toLowerCase().endsWith("@gmail.com")) {
            message = "Please provide a valid Gmail address."
          }
        }
        break
      case "phone":
        if (trimmedValue) {
          if (!/^\d+$/.test(trimmedValue)) {
            message = "Phone number must contain digits only."
          } else if (trimmedValue.length !== 11) {
            message = "Phone number must be exactly 11 digits."
          }
        }
        break
      case "website":
        if (trimmedValue && !isValidWebsiteUrl(trimmedValue)) {
          message = "Website must be a valid https URL (e.g., https://www.example.com)."
        }
        break
      case "certificateNumber":
        if (trimmedValue && !/^\d+$/.test(trimmedValue)) {
          message = "Certificate number must contain digits only."
        }
        break
      case "referencePhone":
        if (trimmedValue) {
          if (!/^\d+$/.test(trimmedValue)) {
            message = "Reference phone number must contain digits only."
          } else if (trimmedValue.length !== 11) {
            message = "Reference phone number must be exactly 11 digits."
          }
        }
        break
      case "referenceEmail":
        if (trimmedValue) {
          if (!isValidEmail(trimmedValue) || !trimmedValue.toLowerCase().endsWith("@gmail.com")) {
            message = "Please provide a valid Gmail address."
          }
        }
        break
      default:
        break
    }

    updateFieldError(fieldName, message)
    return !message
  }

  // Get design theme colors and layout based on designTemplate
  const getDesignTheme = (template) => {
    const themes = {
      "Default Template 2": {
        headerGradient: "from-amber-500 via-orange-500 to-amber-600",
        headerBg: "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600",
        accentColor: "amber",
        textColor: "text-amber-600",
        borderColor: "border-amber-200",
        bgColor: "bg-amber-50",
        cardBorder: "border-amber-100",
        buttonColor: "amber",
        lightBg: "bg-amber-50",
        mediumBg: "bg-amber-100",
        darkBg: "bg-amber-200",
        // Layout properties
        headerLayout: "centered", // centered, left-right, right-left
        headerTextAlign: "text-center",
        headerFlexDirection: "flex-col items-center",
        avatarSize: "w-64 h-64",
        avatarPosition: "mb-6",
        cardStyle: "rounded-2xl shadow-lg",
        cardPadding: "p-8",
        contentGrid: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        sectionSpacing: "space-y-10",
        typographySize: "text-4xl md:text-5xl lg:text-6xl",
        titleWeight: "font-bold",
      },
      "cookery": {
        headerGradient: "from-red-500 via-pink-500 to-red-600",
        headerBg: "bg-gradient-to-br from-red-500 via-pink-500 to-red-600",
        accentColor: "red",
        textColor: "text-red-600",
        borderColor: "border-red-200",
        bgColor: "bg-red-50",
        cardBorder: "border-red-100",
        buttonColor: "red",
        lightBg: "bg-red-50",
        mediumBg: "bg-red-100",
        darkBg: "bg-red-200",
        // Layout properties
        headerLayout: "left-right",
        headerTextAlign: "text-left",
        headerFlexDirection: "flex-row items-center",
        avatarSize: "w-72 h-72",
        avatarPosition: "mr-8",
        cardStyle: "rounded-xl shadow-md border-2",
        cardPadding: "p-6",
        contentGrid: "grid-cols-1 lg:grid-cols-2",
        sectionSpacing: "space-y-8",
        typographySize: "text-5xl md:text-6xl lg:text-7xl",
        titleWeight: "font-extrabold",
      },
      "Default Template 1": {
        headerGradient: "from-blue-500 via-indigo-500 to-blue-600",
        headerBg: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
        accentColor: "blue",
        textColor: "text-blue-600",
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50",
        cardBorder: "border-blue-100",
        buttonColor: "blue",
        lightBg: "bg-blue-50",
        mediumBg: "bg-blue-100",
        darkBg: "bg-blue-200",
        // Layout properties
        headerLayout: "left-right",
        headerTextAlign: "text-left",
        headerFlexDirection: "flex-row items-center",
        avatarSize: "w-80 h-80",
        avatarPosition: "mr-12",
        cardStyle: "rounded-lg shadow-xl",
        cardPadding: "p-6",
        contentGrid: "grid-cols-1 lg:grid-cols-4",
        sectionSpacing: "space-y-12",
        typographySize: "text-5xl md:text-6xl lg:text-7xl",
        titleWeight: "font-extralight",
      },
      "Agriculture and Fishery": {
        headerGradient: "from-gray-800 via-gray-700 to-gray-900",
        headerBg: "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900",
        accentColor: "gray",
        textColor: "text-gray-900",
        borderColor: "border-gray-400",
        bgColor: "bg-gray-50",
        cardBorder: "border-gray-300",
        buttonColor: "gray",
        lightBg: "bg-gray-50",
        mediumBg: "bg-gray-100",
        darkBg: "bg-gray-200",
        // Layout properties
        headerLayout: "left-right",
        headerTextAlign: "text-left",
        headerFlexDirection: "flex-row items-center",
        avatarSize: "w-48 h-48",
        avatarPosition: "mr-8",
        cardStyle: "rounded-xl shadow-lg border-2",
        cardPadding: "p-6",
        contentGrid: "grid-cols-1 lg:grid-cols-2",
        sectionSpacing: "space-y-8",
        typographySize: "text-3xl md:text-4xl lg:text-5xl",
        titleWeight: "font-bold",
      },
      "Tourism": {
        headerGradient: "from-purple-500 via-violet-500 to-purple-600",
        headerBg: "bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600",
        accentColor: "purple",
        textColor: "text-purple-600",
        borderColor: "border-purple-200",
        bgColor: "bg-purple-50",
        cardBorder: "border-purple-100",
        buttonColor: "purple",
        lightBg: "bg-purple-50",
        mediumBg: "bg-purple-100",
        darkBg: "bg-purple-200",
        // Layout properties
        headerLayout: "centered",
        headerTextAlign: "text-center",
        headerFlexDirection: "flex-col items-center",
        avatarSize: "w-56 h-56",
        avatarPosition: "mb-8",
        cardStyle: "rounded-full shadow-lg border-4",
        cardPadding: "p-10",
        contentGrid: "grid-cols-1 md:grid-cols-3",
        sectionSpacing: "space-y-6",
        typographySize: "text-3xl md:text-4xl lg:text-5xl",
        titleWeight: "font-light",
      },
      "default": {
        headerGradient: "from-blue-600 via-blue-700 to-blue-800",
        headerBg: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
        accentColor: "blue",
        textColor: "text-blue-600",
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50",
        cardBorder: "border-blue-100",
        buttonColor: "blue",
        lightBg: "bg-blue-50",
        mediumBg: "bg-blue-100",
        darkBg: "bg-blue-200",
        // Layout properties
        headerLayout: "left-right",
        headerTextAlign: "text-left",
        headerFlexDirection: "flex-row items-center",
        avatarSize: "w-80 h-80",
        avatarPosition: "mr-12",
        cardStyle: "rounded-lg shadow-xl",
        cardPadding: "p-6",
        contentGrid: "grid-cols-1 lg:grid-cols-4",
        sectionSpacing: "space-y-12",
        typographySize: "text-5xl md:text-6xl lg:text-7xl",
        titleWeight: "font-extralight",
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
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
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
        ? portfolioData.references.map((ref) => {
            // Get relationship value - handle both relationship and position from backend
            const relationshipVal = ref.relationship || ref.position || ""
            // Get phone value - handle both phone and contact from backend
            const phoneVal = ref.phone || ref.contact || ""
            
            return {
            id: ref.id,
            name: ref.name || "Unnamed Reference",
              relationship: relationshipVal,
              position: relationshipVal, // Keep both for backward compatibility
            company: ref.company || "",
              phone: phoneVal,
              contact: phoneVal, // Keep both for backward compatibility
            email: ref.email || "",
            }
          })
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
    // Show custom confirmation modal instead of window.confirm
    setShowConfirmModal(true)
  }

  const handleConfirmGenerateToken = async () => {
    setShowConfirmModal(false)
    
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

      // Show success notification
      setNotification({
        show: true,
        type: "success",
        title: "New share link created successfully!",
        message: "All previous share links are now invalid.",
        link: newTokenData.shareUrl,
      })

      // Auto-hide notification after 6 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }))
      }, 6000)
    } catch (err) {
      console.error("Failed to generate new share token:", err)
      
      // Show error notification
      setNotification({
        show: true,
        type: "error",
        title: "Failed to generate new share link",
        message: "Please try again or contact support.",
        link: "",
      })

      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }))
      }, 5000)
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

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setShowDeleteModal(false)
    
    try {
      if (!token) {
        setNotification({
          show: true,
          type: "error",
          title: "Authentication Error",
          message: "Authentication token not available. Please refresh the page.",
          link: "",
        })
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }))
        }, 5000)
        setIsDeleting(false)
        return
      }

        console.log("Deleting portfolio for graduate ID:", graduateId)
        await axios.delete(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        timeout: 30000, // 30 second timeout
        })
      
        console.log("Portfolio deleted successfully")
      
      // Show success notification
      setNotification({
        show: true,
        type: "success",
        title: "Portfolio Deleted",
        message: "Your portfolio has been deleted successfully.",
        link: "",
      })
      
      // Navigate after a short delay to show the notification
      setTimeout(() => {
        navigate("/graduate-homepage")
      }, 2000)
      } catch (err) {
        console.error("Failed to delete portfolio:", err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to delete portfolio"
      
      setNotification({
        show: true,
        type: "error",
        title: "Delete Failed",
        message: errorMessage,
        link: "",
      })
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }))
      }, 5000)
      
      setIsDeleting(false)
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
      setIsNcLevelAdditional(false)
    } else {
      // Exiting edit mode - cancel all edits
      setEditingPortfolio(null)
      setSelectedAvatarFile(null)
      setIsNcLevelAdditional(false)
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
    // Initialize editingPortfolio if it's null
    if (!editingPortfolio && portfolio) {
      const portfolioCopy = {
        ...portfolio,
        skills: portfolio.skills ? [...portfolio.skills] : [],
        experiences: portfolio.experiences ? [...portfolio.experiences] : [],
        awardsRecognitions: portfolio.awardsRecognitions ? [...portfolio.awardsRecognitions] : [],
        continuingEducations: portfolio.continuingEducations ? [...portfolio.continuingEducations] : [],
        professionalMemberships: portfolio.professionalMemberships ? [...portfolio.professionalMemberships] : [],
        references: portfolio.references ? [...portfolio.references] : [],
      }
      setEditingPortfolio(portfolioCopy)
    }
    setEditingSections((prev) => {
      const newState = {
        ...prev,
        [section]: !prev[section],
      }
      // Initialize isNcLevelAdditional when entering TESDA edit mode
      if (section === "tesda" && newState.tesda) {
        const currentNcLevel = editingPortfolio?.ncLevel || portfolio?.ncLevel
        if (currentNcLevel && !NC_LEVEL_OPTIONS.slice(0, -1).includes(currentNcLevel)) {
          setIsNcLevelAdditional(true)
        } else {
          setIsNcLevelAdditional(false)
        }
      }
      return newState
    })
    setSaveError("")
  }

  const handleFieldChange = (field, value) => {
    // Handle NC Level "Additional" selection
    if (field === "ncLevel") {
      if (value === "Additional") {
        setIsNcLevelAdditional(true)
        // Keep the previous custom value if it exists and is not a standard option, otherwise set empty
        const prevValue = editingPortfolio?.ncLevel
        if (prevValue && !NC_LEVEL_OPTIONS.slice(0, -1).includes(prevValue)) {
          // Keep the custom value, don't update ncLevel
          setSaveError("")
          return
        } else {
          // Set to empty string for new custom input
          setEditingPortfolio((prev) => ({
            ...prev,
            [field]: "",
          }))
          setSaveError("")
          return
        }
      } else if (NC_LEVEL_OPTIONS.slice(0, -1).includes(value)) {
        // Standard NC level selected
        setIsNcLevelAdditional(false)
        setEditingPortfolio((prev) => ({
          ...prev,
          [field]: value,
        }))
        setSaveError("")
        return
      } else {
        // Custom value being typed (when isNcLevelAdditional is true)
        setEditingPortfolio((prev) => ({
          ...prev,
          [field]: value,
        }))
        setSaveError("")
        return
      }
    }
    setEditingPortfolio((prev) => ({
      ...prev,
      [field]: value,
    }))
    setSaveError("")
    // Validate fields that need validation
    if (["email", "phone", "website", "tesdaRegistrationNumber"].includes(field)) {
      validateField(field, value)
    }
  }

  const handleArrayFieldChange = (arrayName, index, field, value) => {
    // Clear error state when user interacts with date fields to prevent showing errors at top
    if ((field === "startDate" || field === "endDate" || field === "dateReceived" || field === "completionDate") && 
        (arrayName === "experiences" || arrayName === "awardsRecognitions" || arrayName === "continuingEducations" || arrayName === "professionalMemberships")) {
      setSaveError("")
    }
    
    // Validate year is exactly 4 digits for date fields
    let correctedValue = value
    if ((field === "startDate" || field === "endDate" || field === "dateReceived" || field === "completionDate") && value) {
      correctedValue = validateAndCorrectDate(value)
    }
    
    setEditingPortfolio((prev) => {
      const updatedArray = [...prev[arrayName]]
      // For phone/contact fields, ensure we clear both fields when value is empty
      if (arrayName === "references" && (field === "phone" || field === "contact")) {
        updatedArray[index] = { 
          ...updatedArray[index], 
          phone: correctedValue || "",
          contact: correctedValue || ""
        }
      } else {
        updatedArray[index] = { ...updatedArray[index], [field]: correctedValue }
      }
      return { ...prev, [arrayName]: updatedArray }
    })
    setSaveError("")
    // Validate specific fields
    if (arrayName === "references") {
      if (field === "phone" || field === "contact") {
        validateField("referencePhone", correctedValue)
        // Also store error with indexed key for display
        const fieldKey = `referencePhone_${index}`
        const trimmedValue = typeof correctedValue === "string" ? correctedValue.trim() : correctedValue
        let message = ""
        if (trimmedValue) {
          if (!/^\d+$/.test(trimmedValue)) {
            message = "Reference phone number must contain digits only."
          } else if (trimmedValue.length !== 11) {
            message = "Reference phone number must be exactly 11 digits."
          }
        }
        updateFieldError(fieldKey, message)
      } else if (field === "email") {
        validateField("referenceEmail", correctedValue)
        // Also store error with indexed key for display
        const fieldKey = `referenceEmail_${index}`
        const trimmedValue = typeof correctedValue === "string" ? correctedValue.trim() : correctedValue
        let message = ""
        if (trimmedValue) {
          if (!isValidEmail(trimmedValue) || !trimmedValue.toLowerCase().endsWith("@gmail.com")) {
            message = "Please provide a valid Gmail address."
          }
        }
        updateFieldError(fieldKey, message)
      }
    } else if (arrayName === "certificates" && field === "certificateNumber") {
      validateField("certificateNumber", correctedValue)
    }
  }

  const handleArrayFieldBlur = (arrayName, index, field, value) => {
    // Validate and correct date on blur for date fields
    if ((field === "startDate" || field === "endDate" || field === "dateReceived" || field === "completionDate") && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setEditingPortfolio((prev) => {
          const updatedArray = [...prev[arrayName]]
          updatedArray[index] = { ...updatedArray[index], [field]: correctedValue }
          return { ...prev, [arrayName]: updatedArray }
        })
      }
    }
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

  const validateAndCorrectDate = (dateValue) => {
    if (!dateValue) return dateValue
    
    // Date format should be YYYY-MM-DD
    // Check if the year part has more than 4 digits
    const datePattern = /^(\d{4,})-(\d{2})-(\d{2})$/
    const match = dateValue.match(datePattern)
    
    if (match) {
      const year = match[1]
      const month = match[2]
      const day = match[3]
      
      // If year has more than 4 digits, truncate to first 4 digits
      if (year.length > 4) {
        const correctedYear = year.substring(0, 4)
        return `${correctedYear}-${month}-${day}`
      }
    } else if (dateValue.length > 0) {
      // Handle cases where user might type year with more than 4 digits
      // Check if value starts with 5+ digits followed by a dash
      const yearMatch = dateValue.match(/^(\d{5,})(-.*)$/)
      if (yearMatch) {
        // Truncate year to 4 digits and keep the rest
        const truncatedYear = dateValue.substring(0, 4)
        const restOfValue = dateValue.substring(4)
        return truncatedYear + restOfValue
      }
    }
    
    return dateValue
  }

  // Validation helper functions
  const validateDateNotFuture = (dateValue, fieldName) => {
    if (!dateValue) return { valid: true }
    const today = new Date().toISOString().split('T')[0]
    if (dateValue > today) {
      return { 
        valid: false, 
        message: `${fieldName} cannot be a future date.` 
      }
    }
    return { valid: true }
  }

  const validateProjectDates = (startDate, endDate) => {
    const today = new Date().toISOString().split('T')[0]
    
    if (!startDate) {
      return { valid: false, message: "Please fill in the start date." }
    }
    if (!endDate) {
      return { valid: false, message: "Please fill in the end date." }
    }
    if (startDate > today) {
      return { valid: false, message: "Start Date cannot be a future date." }
    }
    if (endDate >= today) {
      return { valid: false, message: "End Date cannot be today or a future date." }
    }
    if (endDate < startDate) {
      return { valid: false, message: "End Date cannot be before Start Date." }
    }
    return { valid: true }
  }

  const validateExperienceDates = (startDate, endDate) => {
    const today = new Date().toISOString().split('T')[0]
    
    if (!startDate) {
      return { valid: false, message: "Please fill in the start date." }
    }
    if (!endDate) {
      return { valid: false, message: "Please fill in the end date." }
    }
    if (startDate > today) {
      return { valid: false, message: "Start Date cannot be a future date." }
    }
    if (endDate > today) {
      return { valid: false, message: "End Date cannot be a future date." }
    }
    if (endDate < startDate) {
      return { valid: false, message: "End Date cannot be before Start Date." }
    }
    return { valid: true }
  }

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target
    
    // Clear error state when user interacts with date fields to prevent showing errors at top
    if (name === "issueDate") {
      setSaveError("")
    }
    
    // Validate year is exactly 4 digits for issueDate field
    if (name === "issueDate" && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewCertificate((prev) => ({ ...prev, [name]: correctedValue }))
        return
      }
    }
    
    setNewCertificate((prev) => ({ ...prev, [name]: value }))
    setSaveError("")
    // Validate certificate number
    if (name === "certificateNumber") {
      validateField("certificateNumber", value)
    }
  }

  const handleCertificateInputBlur = (e) => {
    const { name, value } = e.target
    
    // Validate and correct date on blur for issueDate field
    if (name === "issueDate" && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewCertificate((prev) => {
          const updated = { ...prev, [name]: correctedValue }
          return updated
        })
      }
    }
  }

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target
    
    // Clear error state when user interacts with date fields to prevent showing errors at top
    if (name === "startDate" || name === "endDate") {
      setSaveError("")
    }
    
    // Validate year is exactly 4 digits for date fields
    if ((name === "startDate" || name === "endDate") && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewProject((prev) => {
          const updated = { ...prev, [name]: correctedValue }
          return updated
        })
        return
      }
    }
    
    setNewProject((prev) => ({ ...prev, [name]: value }))
    setSaveError("")
  }

  const handleProjectInputBlur = (e) => {
    const { name, value } = e.target
    
    // Validate and correct date on blur for date fields
    if ((name === "startDate" || name === "endDate") && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewProject((prev) => {
          const updated = { ...prev, [name]: correctedValue }
          return updated
        })
      }
    }
  }

  const isCertificateFormValid = () => {
    return (
      newCertificate.courseName.trim() !== "" &&
      newCertificate.certificateNumber.trim() !== "" &&
      newCertificate.issueDate.trim() !== ""
    )
  }

  const isProjectFormValid = () => {
    return (
      newProject.title.trim() !== "" &&
      newProject.startDate.trim() !== "" &&
      newProject.endDate.trim() !== ""
    )
  }

  const handleAddCertificate = () => {
    setCertificateSubmitAttempted(true)
    if (!isCertificateFormValid()) {
      setSaveError("Please fill in all required certificate fields.")
      return
    }
    // Validate certificate number format - must contain only digits
    if (newCertificate.certificateNumber && newCertificate.certificateNumber.trim() !== "") {
      const certNumber = newCertificate.certificateNumber.trim()
      if (!/^\d+$/.test(certNumber)) {
        setSaveError("Certificate number must contain digits only.")
        return
      }
    }
    // Check for certificate number validation errors
    if (fieldErrors.certificateNumber) {
      setSaveError(fieldErrors.certificateNumber)
      return
    }
    // Validate issue date is not in the future
    const dateValidation = validateDateNotFuture(newCertificate.issueDate, "Issue Date")
    if (!dateValidation.valid) {
      setSaveError(dateValidation.message)
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
    setCertificateSubmitAttempted(false)
    setSaveError("")
  }

  const handleAddProject = () => {
    setProjectSubmitAttempted(true)
    if (!isProjectFormValid()) {
      setSaveError("Please fill in all required project fields.")
      return
    }
    // Validate project dates
    const dateValidation = validateProjectDates(newProject.startDate, newProject.endDate)
    if (!dateValidation.valid) {
      setSaveError(dateValidation.message)
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
    setProjectSubmitAttempted(false)
    setSaveError("")
  }

  const handleEditCertificate = (certificate) => {
    setEditingCertificateId(certificate.id)
    setCertificateSubmitAttempted(false)
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
    setProjectSubmitAttempted(false)
    // Extract date part from LocalDateTime format (YYYY-MM-DDTHH:mm:ss -> YYYY-MM-DD)
    const formatDateForInput = (dateStr) => {
      if (!dateStr) return ""
      // If it's already in YYYY-MM-DD format, return as is
      if (!dateStr.includes("T")) return dateStr
      // Extract date part from LocalDateTime
      return dateStr.split("T")[0]
    }
    setNewProject({
      title: project.title || "",
      description: project.description || "",
      startDate: formatDateForInput(project.startDate) || "",
      endDate: formatDateForInput(project.endDate) || "",
      projectImageFile: null,
    })
    setIsAddingProject(true)
  }

  const handleUpdateCertificate = () => {
    setCertificateSubmitAttempted(true)
    if (!isCertificateFormValid()) {
      setSaveError("Please fill in all required certificate fields.")
      return
    }
    // Validate certificate number format - must contain only digits
    if (newCertificate.certificateNumber && newCertificate.certificateNumber.trim() !== "") {
      const certNumber = newCertificate.certificateNumber.trim()
      if (!/^\d+$/.test(certNumber)) {
        setSaveError("Certificate number must contain digits only.")
        return
      }
    }
    // Check for certificate number validation errors
    if (fieldErrors.certificateNumber) {
      setSaveError(fieldErrors.certificateNumber)
      return
    }
    // Validate issue date is not in the future
    const dateValidation = validateDateNotFuture(newCertificate.issueDate, "Issue Date")
    if (!dateValidation.valid) {
      setSaveError(dateValidation.message)
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
    setCertificateSubmitAttempted(false)
    setSaveError("")
  }

  const handleUpdateProject = () => {
    setProjectSubmitAttempted(true)
    if (!isProjectFormValid()) {
      setSaveError("Please fill in all required project fields.")
      return
    }
    // Validate project dates
    const dateValidation = validateProjectDates(newProject.startDate, newProject.endDate)
    if (!dateValidation.valid) {
      setSaveError(dateValidation.message)
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
    setProjectSubmitAttempted(false)
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
        // Validate certificate issue date before saving
        if (cert.issueDate) {
          const dateValidation = validateDateNotFuture(cert.issueDate, "Issue Date")
          if (!dateValidation.valid) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: `Certificate "${cert.courseName || 'Untitled'}": ${dateValidation.message}`,
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }

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
        // Validate project dates before saving
        if (proj.startDate || proj.endDate) {
          const dateValidation = validateProjectDates(proj.startDate || "", proj.endDate || "")
          if (!dateValidation.valid) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: `Project "${proj.title || 'Untitled'}": ${dateValidation.message}`,
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }

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
        if (proj.startDate && proj.startDate.trim() !== "") {
          // Convert date string (YYYY-MM-DD) to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
          const startDateStr = proj.startDate.includes("T") ? proj.startDate : `${proj.startDate}T00:00:00`
          projectData.append("startDate", startDateStr)
        }
        if (proj.endDate && proj.endDate.trim() !== "") {
          // Convert date string (YYYY-MM-DD) to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
          const endDateStr = proj.endDate.includes("T") ? proj.endDate : `${proj.endDate}T00:00:00`
          projectData.append("endDate", endDateStr)
        }
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
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
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

      // Validate all dates before building payload
      // Validate experiences
      for (const exp of editingPortfolio.experiences || []) {
        // Check if all required fields are filled
        if (!exp.jobTitle || exp.jobTitle.trim() === "") {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fill in all required experience fields: Job Title, Company, Start Date, and End Date.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        if (!exp.company || (exp.company && typeof exp.company === "string" && exp.company.trim() === "") && (!exp.employer || (exp.employer && typeof exp.employer === "string" && exp.employer.trim() === ""))) {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fill in all required experience fields: Job Title, Company, Start Date, and End Date.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        if (!exp.startDate || exp.startDate.trim() === "") {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fill in all required experience fields: Job Title, Company, Start Date, and End Date.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        if (!exp.endDate || exp.endDate.trim() === "") {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fill in all required experience fields: Job Title, Company, Start Date, and End Date.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        // Validate dates
        const dateValidation = validateExperienceDates(exp.startDate || "", exp.endDate || "")
        if (!dateValidation.valid) {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: `Experience "${exp.jobTitle}": ${dateValidation.message}`,
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
      }

      // Validate awards
      for (const award of editingPortfolio.awardsRecognitions || []) {
        // Check if all required fields are filled
        if (!award.title || award.title.trim() === "") {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fill in all required award fields: Award Title and Date Received are required.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        if (!award.dateReceived || award.dateReceived.trim() === "") {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fill in all required award fields: Award Title and Date Received are required.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        // Validate date is not in the future
        const dateValidation = validateDateNotFuture(award.dateReceived, "Date Received")
        if (!dateValidation.valid) {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: `Award "${award.title}": ${dateValidation.message}`,
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
      }

      // Validate education
      for (const edu of editingPortfolio.continuingEducations || []) {
        // Check if all required fields are filled
        if (!edu.courseName || edu.courseName.trim() === "") {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fill in all required education fields: Course Name and Completion Date are required.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        if (!edu.completionDate || edu.completionDate.trim() === "") {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fill in all required education fields: Course Name and Completion Date are required.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        // Validate date is not in the future
        const dateValidation = validateDateNotFuture(edu.completionDate, "Completion Date")
        if (!dateValidation.valid) {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: `Education "${edu.courseName}": ${dateValidation.message}`,
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
      }

      // Validate memberships
      for (const mem of editingPortfolio.professionalMemberships || []) {
        // Check if all required fields are filled
        if (!mem.organization || mem.organization.trim() === "") {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fill in all required membership fields: Organization and Start Date are required.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        if (!mem.startDate || mem.startDate.trim() === "") {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fill in all required membership fields: Organization and Start Date are required.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        // Validate date is not in the future
        const dateValidation = validateDateNotFuture(mem.startDate, "Start Date")
        if (!dateValidation.valid) {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: `Membership "${mem.organization}": ${dateValidation.message}`,
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
      }

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
        references: editingPortfolio.references?.map((ref) => {
          // Get relationship value - check both relationship and position fields
          // Prioritize relationship, fallback to position
          let relationshipValue = null
          if (ref.relationship && typeof ref.relationship === "string" && ref.relationship.trim() !== "") {
            relationshipValue = ref.relationship.trim()
          } else if (ref.position && typeof ref.position === "string" && ref.position.trim() !== "") {
            relationshipValue = ref.position.trim()
          }
          
          // Get phone value - check both phone and contact fields
          // Prioritize phone, fallback to contact
          let phoneValue = null
          if (ref.phone && typeof ref.phone === "string" && ref.phone.trim() !== "") {
            phoneValue = ref.phone.trim()
          } else if (ref.contact && typeof ref.contact === "string" && ref.contact.trim() !== "") {
            phoneValue = ref.contact.trim()
          }

          return {
          id: typeof ref.id === "string" && ref.id.includes("new-") ? null : ref.id,
            name: ref.name && typeof ref.name === "string" && ref.name.trim() !== "" ? ref.name.trim() : null,
            relationship: relationshipValue,
            company: ref.company && typeof ref.company === "string" && ref.company.trim() !== "" ? ref.company.trim() : null,
            email: ref.email && typeof ref.email === "string" && ref.email.trim() !== "" ? ref.email.trim() : null,
            phone: phoneValue,
          }
        }) || [],
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
      setNotification({
        show: true,
        type: "success",
        title: "Portfolio Saved!",
        message: "Portfolio updated successfully!",
        link: "",
      })
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }))
      }, 4000)
    } catch (err) {
      console.error("Failed to save portfolio:", err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to save portfolio"
      setNotification({
        show: true,
        type: "error",
        title: "Save Failed",
        message: errorMessage,
        link: "",
      })
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }))
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSection = async (section) => {
    setIsSaving(true)
    setSaveError("")
    setSaveSuccess("")

    try {
      // Ensure editingPortfolio is initialized
      if (!editingPortfolio) {
        if (!portfolio) {
          setNotification({
            show: true,
            type: "error",
            title: "Data Error",
            message: "Portfolio data not available",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        const portfolioCopy = {
          ...portfolio,
          skills: portfolio.skills ? [...portfolio.skills] : [],
          experiences: portfolio.experiences ? [...portfolio.experiences] : [],
          awardsRecognitions: portfolio.awardsRecognitions ? [...portfolio.awardsRecognitions] : [],
          continuingEducations: portfolio.continuingEducations ? [...portfolio.continuingEducations] : [],
          professionalMemberships: portfolio.professionalMemberships ? [...portfolio.professionalMemberships] : [],
          references: portfolio.references ? [...portfolio.references] : [],
        }
        setEditingPortfolio(portfolioCopy)
        setNotification({
          show: true,
          type: "error",
          title: "Please Try Again",
          message: "Portfolio data initialized. Please try saving again.",
          link: "",
        })
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }))
        }, 5000)
        setIsSaving(false)
        return
      }

      // Ensure portfolio ID exists
      if (!editingPortfolio.id && !portfolio?.id) {
        setNotification({
          show: true,
          type: "error",
          title: "Data Error",
          message: "Portfolio ID not available. Please refresh the page.",
          link: "",
        })
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }))
        }, 5000)
        setIsSaving(false)
        return
      }

      // Use portfolio.id if editingPortfolio.id is missing
      const portfolioId = editingPortfolio.id || portfolio.id

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
        if (!token) {
          setNotification({
            show: true,
            type: "error",
            title: "Authentication Error",
            message: "Authentication token not available. Please refresh the page.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        
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
          // Skip if certificate hasn't been modified and already exists
          if (!modifiedCertificates.has(cert.id)) {
            if (typeof cert.id === "string" && cert.id.includes("new-")) {
              // New certificate that hasn't been modified - skip if empty
              if (!cert.courseName || !cert.courseName.trim()) {
                continue
              }
            } else if (existingCertificateIds.has(cert.id)) {
              certificateIds.push(cert.id)
              continue
            }
          }

          // Validate required fields for new certificates
          if (typeof cert.id === "string" && cert.id.includes("new-")) {
            if (!cert.courseName || !cert.courseName.trim()) {
              console.warn("Skipping certificate with empty courseName")
              continue
            }
            // Check file size (max 10MB)
            if (cert.certificateFile instanceof File) {
              const maxSize = 10 * 1024 * 1024 // 10MB
              if (cert.certificateFile.size > maxSize) {
                setNotification({
                  show: true,
                  type: "error",
                  title: "File Too Large",
                  message: "Certificate file is too large. Maximum size is 10MB.",
                  link: "",
                })
                setTimeout(() => {
                  setNotification(prev => ({ ...prev, show: false }))
                }, 5000)
                setIsSaving(false)
                return
              }
            }
          }
          
          // Validate certificate number format - must contain only digits
          if (cert.certificateNumber && cert.certificateNumber.trim() !== "") {
            const certNumber = cert.certificateNumber.trim()
            if (!/^\d+$/.test(certNumber)) {
              setNotification({
                show: true,
                type: "error",
                title: "Validation Error",
                message: `Certificate "${cert.courseName || 'Untitled'}": Certificate number must contain digits only.`,
                link: "",
              })
              setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }))
              }, 5000)
              setIsSaving(false)
              return
            }
          }

          const certificateData = new FormData()
          certificateData.append("courseName", cert.courseName || "")
          certificateData.append("certificateNumber", cert.certificateNumber || "")
          certificateData.append("issueDate", cert.issueDate || "")
          
          // Always include graduateId
          certificateData.append("graduateId", graduateId.toString())
          
          if (cert.portfolioId) {
            certificateData.append("portfolioId", cert.portfolioId.toString())
          }
          
          if (cert.certificateFile instanceof File) {
            certificateData.append("certificateFile", cert.certificateFile)
          }

          try {
          if (typeof cert.id === "string" && cert.id.includes("new-")) {
            const certResponse = await axios.post(
              `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
              certificateData,
              {
                withCredentials: true,
                  headers: { 
                    Authorization: `Bearer ${token}`,
                    // Don't set Content-Type for FormData - axios will set it automatically with boundary
                  },
                  timeout: 30000, // 30 second timeout
              },
            )
            certificateIds.push(certResponse.data.id)
          } else {
            await axios.put(`${BACKEND_URL}/api/certificate/${cert.id}`, certificateData, {
              withCredentials: true,
                headers: { 
                  Authorization: `Bearer ${token}`,
                  // Don't set Content-Type for FormData - axios will set it automatically with boundary
                },
                timeout: 30000, // 30 second timeout
            })
            certificateIds.push(cert.id)
            }
          } catch (certError) {
            console.error(`Failed to save certificate ${cert.id}:`, certError)
            console.error(`Certificate data:`, {
              courseName: cert.courseName,
              certificateNumber: cert.certificateNumber,
              issueDate: cert.issueDate,
              hasFile: cert.certificateFile instanceof File,
              fileSize: cert.certificateFile instanceof File ? cert.certificateFile.size : 'N/A',
            })
            
            // Handle specific error cases
            if (certError.response?.status === 401) {
              setNotification({
                show: true,
                type: "error",
                title: "Session Expired",
                message: "Session expired. Please sign in again.",
                link: "",
              })
              setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }))
                navigate("/signin")
              }, 3000)
              setIsSaving(false)
              return
            } else if (certError.response?.status === 415) {
              setNotification({
                show: true,
                type: "error",
                title: "Invalid File Format",
                message: "Unsupported media type. Please check certificate file format.",
                link: "",
              })
              setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }))
              }, 5000)
              setIsSaving(false)
              return
            } else if (certError.response?.status === 400) {
              setNotification({
                show: true,
                type: "error",
                title: "Save Failed",
                message: `Failed to save certificate: ${certError.response?.data?.message || "Invalid data"}`,
                link: "",
              })
              setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }))
              }, 5000)
              setIsSaving(false)
              return
            } else if (certError.code === 'ERR_NETWORK' || certError.code === 'ECONNABORTED') {
              setNotification({
                show: true,
                type: "error",
                title: "Network Error",
                message: "Network error. Please check your connection and try again.",
                link: "",
              })
              setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }))
              }, 5000)
              setIsSaving(false)
              return
            }
            
            // Re-throw to be caught by outer try-catch
            throw certError
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
        // Validate all project dates before saving
        for (const proj of projects) {
          if (proj.startDate || proj.endDate) {
            const dateValidation = validateProjectDates(proj.startDate || "", proj.endDate || "")
            if (!dateValidation.valid) {
              setNotification({
                show: true,
                type: "error",
                title: "Validation Error",
                message: `Project "${proj.title || 'Untitled'}": ${dateValidation.message}`,
                link: "",
              })
              setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }))
              }, 5000)
              setIsSaving(false)
              return
            }
          }
        }

        const projectIds = []
        const existingProjectIds = new Set(
          (
            await axios.get(`${BACKEND_URL}/api/project/portfolio/${portfolioId}`, {
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
          projectData.append("portfolioId", portfolioId.toString())
          projectData.append("title", proj.title || "")
          projectData.append("description", proj.description || "")
          if (proj.startDate && proj.startDate.trim() !== "") {
            // Convert date string (YYYY-MM-DD) to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
            const startDateStr = proj.startDate.includes("T") ? proj.startDate : `${proj.startDate}T00:00:00`
            projectData.append("startDate", startDateStr)
          }
          if (proj.endDate && proj.endDate.trim() !== "") {
            // Convert date string (YYYY-MM-DD) to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
            const endDateStr = proj.endDate.includes("T") ? proj.endDate : `${proj.endDate}T00:00:00`
            projectData.append("endDate", endDateStr)
          }
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
              headers: { 
                Authorization: `Bearer ${token}`,
                // Don't set Content-Type for FormData - axios will set it automatically with boundary
              },
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
        if (portfolioId) {
          const projectsResponse = await axios.get(`${BACKEND_URL}/api/project/portfolio/${portfolioId}`, {
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
        // Check for existing field errors in contact fields
        if (fieldErrors.email || fieldErrors.phone || fieldErrors.website) {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fix all validation errors in the contact fields before saving.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        // Validate email format - must be valid Gmail
        if (editingPortfolio.email && editingPortfolio.email.trim() !== "") {
          const emailValue = editingPortfolio.email.trim()
          if (!isValidEmail(emailValue) || !emailValue.toLowerCase().endsWith("@gmail.com")) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please provide a valid Gmail address.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }
        // Validate phone format - must contain only digits and be exactly 11 digits
        if (editingPortfolio.phone && editingPortfolio.phone.trim() !== "") {
          const phoneValue = editingPortfolio.phone.trim()
          if (!/^\d+$/.test(phoneValue)) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Phone number must contain digits only.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          if (phoneValue.length !== 11) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Phone number must be exactly 11 digits.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }
        // Validate website format - must be valid https URL
        if (editingPortfolio.website && editingPortfolio.website.trim() !== "") {
          const websiteValue = editingPortfolio.website.trim()
          if (!isValidWebsiteUrl(websiteValue)) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Website must be a valid https URL (e.g., https://www.example.com).",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }
        payload.email = editingPortfolio.email
        payload.phone = editingPortfolio.phone
        payload.website = editingPortfolio.website
      } else if (section === "skills") {
        // Validate all required skill fields before saving
        for (const skill of editingPortfolio.skills || []) {
          if (!skill.name || skill.name.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required skill fields: Skill Name is required.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }
        payload.skills = editingPortfolio.skills
          ?.filter((skill) => skill.name && skill.name.trim() !== "") // Filter out entries with empty name
          .map((skill) => ({
            id: typeof skill.id === "string" && skill.id.includes("new-") ? null : skill.id,
            name: skill.name.trim(),
            type: skill.type && skill.type.trim() !== "" ? skill.type.trim() : "TECHNICAL",
            proficiencyLevel: skill.proficiencyLevel && skill.proficiencyLevel.trim() !== "" ? skill.proficiencyLevel.trim() : null,
          })) || []
      } else if (section === "tesda") {
        // Check for TESDA registration number validation errors
        if (fieldErrors.tesdaRegistrationNumber) {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fix the TESDA registration number validation error before saving.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        // Validate TESDA registration number format - must contain only digits
        if (editingPortfolio.tesdaRegistrationNumber && editingPortfolio.tesdaRegistrationNumber.trim() !== "") {
          const regNumber = editingPortfolio.tesdaRegistrationNumber.trim()
          if (!/^\d+$/.test(regNumber)) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "TESDA registration number must contain digits only.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }
        payload.ncLevel = editingPortfolio.ncLevel
        payload.trainingCenter = editingPortfolio.trainingCenter
        payload.scholarshipType = editingPortfolio.scholarshipType
        payload.trainingDuration = editingPortfolio.trainingDuration
        payload.tesdaRegistrationNumber = editingPortfolio.tesdaRegistrationNumber
      } else if (section === "experience") {
        // Validate all required experience fields before saving
        for (const exp of editingPortfolio.experiences || []) {
          // Check if all required fields are filled
          if (!exp.jobTitle || exp.jobTitle.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required experience fields: Job Title, Company, Start Date, and End Date.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          if (!exp.company || (exp.company && typeof exp.company === "string" && exp.company.trim() === "") && (!exp.employer || (exp.employer && typeof exp.employer === "string" && exp.employer.trim() === ""))) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required experience fields: Job Title, Company, Start Date, and End Date.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          if (!exp.startDate || exp.startDate.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required experience fields: Job Title, Company, Start Date, and End Date.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          if (!exp.endDate || exp.endDate.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required experience fields: Job Title, Company, Start Date, and End Date.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          // Validate dates
          const dateValidation = validateExperienceDates(exp.startDate || "", exp.endDate || "")
          if (!dateValidation.valid) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: `Experience "${exp.jobTitle}": ${dateValidation.message}`,
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }
        payload.experiences = editingPortfolio.experiences
          ?.filter((exp) => exp.jobTitle && exp.jobTitle.trim() !== "" && 
                           (exp.company && exp.company.trim() !== "" || exp.employer && exp.employer.trim() !== "") &&
                           exp.startDate && exp.startDate.trim() !== "" &&
                           exp.endDate && exp.endDate.trim() !== "") // Filter out entries missing required fields
          .map((exp) => ({
            id: typeof exp.id === "string" && exp.id.includes("new-") ? null : exp.id,
            jobTitle: exp.jobTitle.trim(),
            employer: (exp.company || exp.employer || "").trim() || null,
            description: (exp.responsibilities || exp.description || "").trim() || null,
            startDate: exp.startDate && exp.startDate.trim() !== "" ? exp.startDate : null,
            endDate: exp.endDate && exp.endDate.trim() !== "" ? exp.endDate : null,
          })) || []
      } else if (section === "awards") {
        // Validate all required award fields before saving
        for (const award of editingPortfolio.awardsRecognitions || []) {
          if (!award.title || award.title.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required award fields: Award Title and Date Received are required.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          if (!award.dateReceived || award.dateReceived.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required award fields: Award Title and Date Received are required.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          // Validate date is not in the future
          const dateValidation = validateDateNotFuture(award.dateReceived, "Date Received")
          if (!dateValidation.valid) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: `Award "${award.title}": ${dateValidation.message}`,
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }
        payload.awardsRecognitions = editingPortfolio.awardsRecognitions
          ?.filter((award) => award.title && award.title.trim() !== "" && award.dateReceived && award.dateReceived.trim() !== "") // Filter out entries missing required fields
          .map((award) => ({
            id: typeof award.id === "string" && award.id.includes("new-") ? null : award.id,
            title: award.title.trim(),
            issuer: award.issuer && award.issuer.trim() !== "" ? award.issuer.trim() : null,
            dateReceived: award.dateReceived && award.dateReceived.trim() !== "" ? award.dateReceived : null,
          })) || []
      } else if (section === "education") {
        // Validate all education dates before saving
        for (const edu of editingPortfolio.continuingEducations || []) {
          if (edu.courseName && edu.courseName.trim() !== "") {
            if (edu.completionDate) {
              const dateValidation = validateDateNotFuture(edu.completionDate, "Completion Date")
              if (!dateValidation.valid) {
                setNotification({
                  show: true,
                  type: "error",
                  title: "Validation Error",
                  message: `Education "${edu.courseName}": ${dateValidation.message}`,
                  link: "",
                })
                setTimeout(() => {
                  setNotification(prev => ({ ...prev, show: false }))
                }, 5000)
                setIsSaving(false)
                return
              }
            }
          }
        }
        // Validate all required education fields before saving
        for (const edu of editingPortfolio.continuingEducations || []) {
          if (!edu.courseName || edu.courseName.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required education fields: Course Name and Completion Date are required.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          if (!edu.completionDate || edu.completionDate.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required education fields: Course Name and Completion Date are required.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          // Validate date is not in the future
          const dateValidation = validateDateNotFuture(edu.completionDate, "Completion Date")
          if (!dateValidation.valid) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: `Education "${edu.courseName}": ${dateValidation.message}`,
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }
        payload.continuingEducations = editingPortfolio.continuingEducations
          ?.filter((edu) => edu.courseName && edu.courseName.trim() !== "" && edu.completionDate && edu.completionDate.trim() !== "") // Filter out entries missing required fields
          .map((edu) => {
            const completionDate = edu.completionDate 
              ? (typeof edu.completionDate === 'string' && edu.completionDate.trim() !== "" ? edu.completionDate.trim() : null)
              : null
            return {
              id: typeof edu.id === "string" && edu.id.includes("new-") ? null : edu.id,
              courseName: edu.courseName.trim(),
              institution: edu.institution && typeof edu.institution === 'string' && edu.institution.trim() !== "" ? edu.institution.trim() : null,
              completionDate: completionDate,
            }
          }) || []
      } else if (section === "memberships") {
        // Validate all membership dates before saving
        for (const mem of editingPortfolio.professionalMemberships || []) {
          if (mem.organization && mem.organization.trim() !== "") {
            if (mem.startDate) {
              const dateValidation = validateDateNotFuture(mem.startDate, "Start Date")
              if (!dateValidation.valid) {
                setNotification({
                  show: true,
                  type: "error",
                  title: "Validation Error",
                  message: `Membership "${mem.organization}": ${dateValidation.message}`,
                  link: "",
                })
                setTimeout(() => {
                  setNotification(prev => ({ ...prev, show: false }))
                }, 5000)
                setIsSaving(false)
                return
              }
            }
          }
        }
        // Validate all required membership fields before saving
        for (const mem of editingPortfolio.professionalMemberships || []) {
          if (!mem.organization || mem.organization.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required membership fields: Organization and Start Date are required.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          if (!mem.startDate || mem.startDate.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required membership fields: Organization and Start Date are required.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          // Validate date is not in the future
          const dateValidation = validateDateNotFuture(mem.startDate, "Start Date")
          if (!dateValidation.valid) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: `Membership "${mem.organization}": ${dateValidation.message}`,
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }
        payload.professionalMemberships = editingPortfolio.professionalMemberships
          ?.filter((mem) => mem.organization && mem.organization.trim() !== "" && mem.startDate && mem.startDate.trim() !== "") // Filter out entries missing required fields
          .map((mem) => ({
            id: typeof mem.id === "string" && mem.id.includes("new-") ? null : mem.id,
            organization: mem.organization.trim(),
            membershipType: mem.membershipType && mem.membershipType.trim() !== "" ? mem.membershipType.trim() : null,
            startDate: mem.startDate && mem.startDate.trim() !== "" ? mem.startDate : null,
          })) || []
      } else if (section === "references") {
        // Check for any existing field errors in references
        const hasReferenceErrors = (editingPortfolio.references || []).some((ref, index) => {
          return fieldErrors[`referencePhone_${index}`] || fieldErrors[`referenceEmail_${index}`]
        })
        if (hasReferenceErrors) {
          setNotification({
            show: true,
            type: "error",
            title: "Validation Error",
            message: "Please fix all validation errors in the reference fields before saving.",
            link: "",
          })
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
          }, 5000)
          setIsSaving(false)
          return
        }
        // Validate all required reference fields before saving
        for (const ref of editingPortfolio.references || []) {
          if (!ref.name || ref.name.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required reference fields: Name, Email, and Phone are required.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          if (!ref.email || ref.email.trim() === "") {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required reference fields: Name, Email, and Phone are required.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          // Check phone or contact field
          const phoneValue = (ref.phone && typeof ref.phone === "string" && ref.phone.trim() !== "") 
            ? ref.phone.trim() 
            : (ref.contact && typeof ref.contact === "string" && ref.contact.trim() !== "") 
              ? ref.contact.trim() 
              : null
          if (!phoneValue) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: "Please fill in all required reference fields: Name, Email, and Phone are required.",
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          // Validate phone number format - must contain only digits
          if (!/^\d+$/.test(phoneValue)) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: `Reference "${ref.name || 'Untitled'}": Contact number must contain digits only.`,
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
          // Validate phone number length - must be exactly 11 digits
          if (phoneValue.length !== 11) {
            setNotification({
              show: true,
              type: "error",
              title: "Validation Error",
              message: `Reference "${ref.name || 'Untitled'}": Contact number must be exactly 11 digits.`,
              link: "",
            })
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }))
            }, 5000)
            setIsSaving(false)
            return
          }
        }
        payload.references = editingPortfolio.references
          ?.filter((ref) => {
            // Filter out entries missing required fields
            const hasName = ref.name && ref.name.trim() !== ""
            const hasEmail = ref.email && ref.email.trim() !== ""
            const hasPhone = (ref.phone && ref.phone.trim() !== "") || (ref.contact && ref.contact.trim() !== "")
            return hasName && hasEmail && hasPhone
          })
          .map((ref) => {
          // Get relationship value - check both relationship and position fields
          // Prioritize relationship, fallback to position
          let relationshipValue = null
          if (ref.relationship && typeof ref.relationship === "string" && ref.relationship.trim() !== "") {
            relationshipValue = ref.relationship.trim()
          } else if (ref.position && typeof ref.position === "string" && ref.position.trim() !== "") {
            relationshipValue = ref.position.trim()
          }
          
          // Get phone value - check both phone and contact fields
          // Prioritize phone, fallback to contact
          let phoneValue = null
          if (ref.phone && typeof ref.phone === "string" && ref.phone.trim() !== "") {
            phoneValue = ref.phone.trim()
          } else if (ref.contact && typeof ref.contact === "string" && ref.contact.trim() !== "") {
            phoneValue = ref.contact.trim()
          }

          const companyValue =
            ref.company && typeof ref.company === "string" && ref.company.trim() !== "" ? ref.company.trim() : null

            return {
            id: typeof ref.id === "string" && ref.id.includes("new-") ? null : ref.id,
            name: ref.name.trim(),
              relationship: relationshipValue,
              company: companyValue,
              email: ref.email && typeof ref.email === "string" && ref.email.trim() !== "" ? ref.email.trim() : null,
              phone: phoneValue,
            }
          }) || []
      }

      // Ensure all array fields are properly formatted from editingPortfolio
      payload.skills = editingPortfolio.skills
        ?.filter((skill) => skill.name && skill.name.trim() !== "") // Filter out entries with empty name
        .map((skill) => ({
          id: typeof skill.id === "string" && skill.id.includes("new-") ? null : skill.id,
          name: skill.name.trim(),
          type: skill.type && skill.type.trim() !== "" ? skill.type.trim() : "TECHNICAL",
          proficiencyLevel: skill.proficiencyLevel && skill.proficiencyLevel.trim() !== "" ? skill.proficiencyLevel.trim() : null,
        })) || []
      payload.experiences = editingPortfolio.experiences
        ?.filter((exp) => exp.jobTitle && exp.jobTitle.trim() !== "") // Filter out entries with empty jobTitle
        .map((exp) => ({
          id: typeof exp.id === "string" && exp.id.includes("new-") ? null : exp.id,
          jobTitle: exp.jobTitle.trim(),
          employer: (exp.company || exp.employer || "").trim() || null,
          description: (exp.responsibilities || exp.description || "").trim() || null,
          startDate: exp.startDate && exp.startDate.trim() !== "" ? exp.startDate : null,
          endDate: exp.endDate && exp.endDate.trim() !== "" ? exp.endDate : null,
        })) || []
      payload.awardsRecognitions = editingPortfolio.awardsRecognitions
        ?.filter((award) => award.title && award.title.trim() !== "" && award.dateReceived && award.dateReceived.trim() !== "") // Filter out entries missing required fields
        .map((award) => ({
          id: typeof award.id === "string" && award.id.includes("new-") ? null : award.id,
          title: award.title.trim(),
          issuer: award.issuer && award.issuer.trim() !== "" ? award.issuer.trim() : null,
          dateReceived: award.dateReceived && award.dateReceived.trim() !== "" ? award.dateReceived : null,
        })) || []
      payload.continuingEducations = editingPortfolio.continuingEducations
        ?.filter((edu) => edu.courseName && edu.courseName.trim() !== "" && edu.completionDate && edu.completionDate.trim() !== "") // Filter out entries missing required fields
        .map((edu) => ({
          id: typeof edu.id === "string" && edu.id.includes("new-") ? null : edu.id,
          courseName: edu.courseName.trim(),
          institution: edu.institution && edu.institution.trim() !== "" ? edu.institution.trim() : null,
          completionDate: edu.completionDate && edu.completionDate.trim() !== "" ? edu.completionDate : null,
        })) || []
      payload.professionalMemberships = editingPortfolio.professionalMemberships
        ?.filter((mem) => mem.organization && mem.organization.trim() !== "" && mem.startDate && mem.startDate.trim() !== "") // Filter out entries missing required fields
        .map((mem) => ({
          id: typeof mem.id === "string" && mem.id.includes("new-") ? null : mem.id,
          organization: mem.organization.trim(),
          membershipType: mem.membershipType && mem.membershipType.trim() !== "" ? mem.membershipType.trim() : null,
          startDate: mem.startDate && mem.startDate.trim() !== "" ? mem.startDate : null,
        })) || []
      payload.references = editingPortfolio.references
        ?.filter((ref) => {
          // Filter out entries missing required fields
          const hasName = ref.name && ref.name.trim() !== ""
          const hasEmail = ref.email && ref.email.trim() !== ""
          const hasPhone = (ref.phone && ref.phone.trim() !== "") || (ref.contact && ref.contact.trim() !== "")
          return hasName && hasEmail && hasPhone
        })
        .map((ref) => {
          // Get relationship value - check both relationship and position fields
          // Prioritize relationship, fallback to position
          let relationshipValue = null
          if (ref.relationship && typeof ref.relationship === "string" && ref.relationship.trim() !== "") {
            relationshipValue = ref.relationship.trim()
          } else if (ref.position && typeof ref.position === "string" && ref.position.trim() !== "") {
            relationshipValue = ref.position.trim()
          }
          
          // Get phone value - check both phone and contact fields
          // Prioritize phone, fallback to contact
          let phoneValue = null
          if (ref.phone && typeof ref.phone === "string" && ref.phone.trim() !== "") {
            phoneValue = ref.phone.trim()
          } else if (ref.contact && typeof ref.contact === "string" && ref.contact.trim() !== "") {
            phoneValue = ref.contact.trim()
          }

          const companyValue =
            ref.company && typeof ref.company === "string" && ref.company.trim() !== "" ? ref.company.trim() : null

            return {
            id: typeof ref.id === "string" && ref.id.includes("new-") ? null : ref.id,
            name: ref.name.trim(),
              relationship: relationshipValue,
              company: companyValue,
              email: ref.email && typeof ref.email === "string" && ref.email.trim() !== "" ? ref.email.trim() : null,
              phone: phoneValue,
            }
          }) || []

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
        if (portfolioId) {
          const existingProjectIds = (
            await axios.get(`${BACKEND_URL}/api/project/portfolio/${portfolioId}`, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            })
          ).data.map((proj) => proj.id)
          payload.projectIds = existingProjectIds
        }
      } else if (editingPortfolio.projectIds || portfolio.projectIds) {
        payload.projectIds = editingPortfolio.projectIds || portfolio.projectIds
      }

      // Log payload for debugging
      console.log(`Saving ${section} section:`, JSON.stringify(payload, null, 2))
      
      await axios.put(`${BACKEND_URL}/api/portfolio/${portfolioId}`, payload, {
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
      
      // Refresh graduate data if header section was saved (to update profilePicture)
      if (section === "header") {
        const graduateResponse = await axios.get(`${BACKEND_URL}/api/graduate/${graduateId}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        })
        setGraduate(graduateResponse.data)
        setSelectedAvatarFile(null)
      }
      
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

      setNotification({
        show: true,
        type: "success",
        title: "Saved Successfully!",
        message: `${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`,
        link: "",
      })
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }))
      }, 4000)
    } catch (err) {
      console.error(`Failed to save ${section}:`, err)
      console.error(`Error response:`, err.response?.data)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.response?.data || err.message || `Failed to save ${section}`
      const errorText = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
      setNotification({
        show: true,
        type: "error",
        title: "Save Failed",
        message: errorText,
        link: "",
      })
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }))
      }, 5000)
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
    <>
      {/* Enhanced Animated Notification */}
      {notification.show && (
        <div
          className={`fixed top-6 right-6 z-[9999] min-w-[420px] max-w-[550px] rounded-xl shadow-2xl animate-slide-in-right backdrop-blur-sm ${
            notification.type === "success"
              ? "bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-2 border-green-400 shadow-green-200/50"
              : "bg-gradient-to-br from-red-50 via-rose-50 to-red-100 border-2 border-red-400 shadow-red-200/50"
          }`}
          style={{
            animation: "slideInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
          }}
        >
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  notification.type === "success"
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                    : "bg-gradient-to-br from-red-500 to-rose-600 text-white"
                }`}
              >
                {notification.type === "success" ? (
                  <FaCheckCircle className="w-7 h-7" />
                ) : (
                  <FaExclamationCircle className="w-7 h-7" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-bold text-xl mb-2 ${
                    notification.type === "success" ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {notification.title}
                </h3>
                <p
                  className={`text-base leading-relaxed ${
                    notification.type === "success" ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {notification.message}
                </p>
                {notification.link && (
                  <div className="mt-3 p-3 bg-white/80 rounded-lg border border-gray-300 shadow-sm">
                    <p className="text-xs font-semibold text-gray-700 mb-1">New Share Link:</p>
                    <p className="text-xs font-mono text-gray-900 break-all bg-gray-50 p-2 rounded">{notification.link}</p>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(notification.link)
                          setNotification(prev => ({
                            ...prev,
                            message: "Link copied to clipboard!",
                          }))
                        } catch (err) {
                          console.error("Failed to copy:", err)
                        }
                      }}
                      className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 underline transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-white/50"
                aria-label="Close notification"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Enhanced Progress bar */}
          <div className="h-1.5 bg-gray-300/50 rounded-b-xl overflow-hidden">
            <div
              className={`h-full ${
                notification.type === "success" 
                  ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                  : "bg-gradient-to-r from-red-500 to-rose-600"
              }`}
              style={{
                animation: "shrinkWidth 4s linear forwards",
              }}
            />
          </div>
        </div>
      )}

      {/* Animated Confirmation Modal */}
      {showConfirmModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[10000] animate-fade-in"
            onClick={() => setShowConfirmModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-modal-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                    <FaExclamationCircle className="w-8 h-8 text-amber-600" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">
                  Generate New Share Link?
                </h3>

                {/* Message */}
                <div className="text-gray-600 text-center space-y-2 mb-6">
                  <p className="font-semibold text-amber-700">
                    This will create a NEW share link and INVALIDATE ALL EXISTING LINKS!
                  </p>
                  <p>
                    Anyone with old links will see 'Portfolio not found' errors.
                  </p>
                  <p className="font-medium">
                    Are you sure you want to continue?
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outlined"
                    color="gray"
                    className="flex-1 font-light"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="amber"
                    className="flex-1 font-light"
                    onClick={handleConfirmGenerateToken}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Portfolio Confirmation Modal */}
      {showDeleteModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[10000] animate-fade-in backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-modal-scale-in border-2 border-red-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                    <FaExclamationCircle className="w-10 h-10 text-red-600" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">
                  Delete Portfolio?
                </h3>

                {/* Message */}
                <div className="text-gray-600 text-center space-y-3 mb-6">
                  <p className="font-semibold text-red-700 text-lg">
                    ⚠️ This action cannot be undone!
                  </p>
                  <p className="text-base">
                    Are you absolutely sure you want to delete your portfolio?
                  </p>
                  <p className="text-sm text-gray-500">
                    All your portfolio data, certificates, projects, and other information will be permanently removed.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outlined"
                    color="gray"
                    className="flex-1 font-light"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="red"
                    className="flex-1 font-light flex items-center justify-center gap-2"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Spinner className="w-4 h-4" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FaTrash className="w-4 h-4" />
                        Delete Portfolio
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight {
          0% {
            transform: translateX(100%) scale(0.9);
            opacity: 0;
          }
          50% {
            transform: translateX(-10px) scale(1.02);
            opacity: 0.8;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalScaleIn {
          0% {
            transform: scale(0.7) translateY(-20px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) translateY(0);
            opacity: 0.9;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-modal-scale-in {
          animation: modalScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div className={`min-h-screen ${portfolio?.designTemplate === "Agriculture and Fishery" ? "bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200" : portfolio?.designTemplate === "Tourism" ? "bg-white" : "bg-gray-50"} py-8 px-4`}>
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        {portfolio?.designTemplate === "Agriculture and Fishery" ? (
          <div className="px-6 py-8 bg-gradient-to-br from-gray-50 via-gray-100 via-gray-200 to-gray-100" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Sidebar - Profile Image, Contact, Skills, TESDA */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Image Container */}
                {(graduate?.profilePicture || portfolio?.avatar || isEditMode) && (
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 flex justify-center items-center border-2 border-gray-300 shadow-md">
                    <div className="relative">
                      <Avatar
                        src={
                          isEditMode && selectedAvatarFile
                            ? URL.createObjectURL(selectedAvatarFile)
                            : graduate?.profilePicture || portfolio?.avatar || "/placeholder.svg"
                        }
                        alt={`${portfolio.fullName || "Profile"} Picture`}
                        size="xxl"
                        className="w-48 h-48 shadow-xl ring-4 ring-gray-300"
                        onClick={isEditMode && editingSections.header ? handleImageClick : undefined}
                      />
                      {/* Camera Icon Overlay - Only in edit mode when editing header */}
                      {isEditMode && editingSections.header && (
                        <div 
                          className="absolute rounded-full shadow-lg cursor-pointer border-2 border-white bg-white/90 hover:bg-white"
                          onClick={handleImageClick}
                          style={{ 
                            bottom: '0',
                            right: '0',
                            transform: 'translate(15%, 15%)',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FaCamera className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
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
                  </div>
                )}
                
                {/* Contact Information */}
                <div className={`bg-white border-2 ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding} shadow-md`}>
                  <div className="flex items-center justify-between mb-5">
                    <Typography variant="h6" className={`font-bold ${designTheme.textColor} text-xl`} style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.01em" }}>
                      Contact
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton 
                        size="md" 
                        variant="text" 
                        onClick={() => handleSectionEditToggle("contact")}
                        className={editingSections.contact ? designTheme.textColor : ""}
                      >
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <div className="space-y-3">
                    {(portfolio.email || isEditMode) && (
                      <div>
                        <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Email
                        </Typography>
                        {isEditMode && editingSections.contact ? (
                          <>
                            <Input
                              type="email"
                              size="md"
                              value={editingPortfolio?.email || ""}
                              onChange={(e) => handleFieldChange("email", e.target.value)}
                              placeholder="Email address"
                              className={`!border-gray-300 ${fieldErrors.email ? "!border-red-500" : ""}`}
                            />
                            {fieldErrors.email && (
                              <Typography variant="small" color="red" className="mt-1">
                                {fieldErrors.email}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="small" className="text-gray-900 break-all font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {portfolio.email}
                          </Typography>
                        )}
                      </div>
                    )}
                    {(portfolio.phone || isEditMode) && (
                      <div>
                        <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Phone
                        </Typography>
                        {isEditMode && editingSections.contact ? (
                          <>
                            <Input
                              type="tel"
                              size="md"
                              value={editingPortfolio?.phone || ""}
                              onChange={(e) => handleFieldChange("phone", e.target.value)}
                              placeholder="Phone number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={11}
                              className={`!border-gray-300 ${fieldErrors.phone ? "!border-red-500" : ""}`}
                            />
                            {fieldErrors.phone && (
                              <Typography variant="small" color="red" className="mt-1">
                                {fieldErrors.phone}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="small" className="text-gray-900 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {portfolio.phone}
                          </Typography>
                        )}
                      </div>
                    )}
                    {(portfolio.website || isEditMode) && (
                      <div>
                        <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Website
                        </Typography>
                        {isEditMode && editingSections.contact ? (
                          <>
                            <Input
                              type="url"
                              size="md"
                              value={editingPortfolio?.website || ""}
                              onChange={(e) => handleFieldChange("website", e.target.value)}
                              placeholder="https://www.example.com"
                              className={`!border-gray-300 ${fieldErrors.website ? "!border-red-500" : ""}`}
                            />
                            {fieldErrors.website && (
                              <Typography variant="small" color="red" className="mt-1">
                                {fieldErrors.website}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="small" className="text-gray-900 break-all font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                        size="md"
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
                <div className={`bg-white border-2 ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding} shadow-md`}>
                  <div className="flex items-center justify-between mb-5">
                    <Typography variant="h6" className={`font-bold ${designTheme.textColor} text-xl`} style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.01em" }}>
                      Skills
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton 
                        size="md" 
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
                        <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
                          {isEditMode && editingSections.skills ? (
                            <div className="space-y-2">
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  Skill Name *
                                </Typography>
                              <div className="flex gap-2">
                                <Input
                                  size="md"
                                  value={skill.name || ""}
                                  onChange={(e) => handleArrayFieldChange("skills", index, "name", e.target.value)}
                                    placeholder="e.g. Latte Art"
                                  required
                                  className="!border-gray-300 flex-1"
                                />
                                <IconButton
                                  size="md"
                                  variant="text"
                                  color="red"
                                  onClick={() => handleRemoveArrayItem("skills", index)}
                                >
                                  <FaTrash className="w-3 h-3" />
                                </IconButton>
                              </div>
                              </div>
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  Skill Type
                                </Typography>
                                <Select
                                  size="md"
                                  label="Select Skill Type"
                                  value={skill.type || "TECHNICAL"}
                                  onChange={(value) =>
                                    handleArrayFieldChange("skills", index, "type", value || "TECHNICAL")
                                  }
                                  className="!border-gray-300 [&>div]:text-gray-900"
                                >
                                  {VALID_SKILL_TYPES.map((type) => (
                                    <Option key={type} value={type}>
                                      {type}
                                    </Option>
                                  ))}
                                </Select>
                              </div>
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  Proficiency Level
                                </Typography>
                                <Select
                                  size="md"
                                  label="Select Proficiency Level"
                                  value={skill.proficiencyLevel || "Beginner"}
                                  onChange={(value) =>
                                    handleArrayFieldChange("skills", index, "proficiencyLevel", value || "Beginner")
                                  }
                                  className="!border-gray-300 [&>div]:text-gray-900"
                                >
                                  {SKILL_PROFICIENCY_LEVELS.map((level) => (
                                    <Option key={level} value={level}>
                                      {level}
                                    </Option>
                                  ))}
                                </Select>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Typography variant="small" className="font-bold text-gray-900 mb-1 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {skill.name}
                              </Typography>
                              <div className="flex items-center space-x-2">
                                <Chip size="md" value={skill.type} color={designTheme.buttonColor} className="text-xs font-semibold" />
                                {skill.proficiencyLevel && (
                                  <Typography variant="small" className="text-gray-600 text-xs font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                          size="md"
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
                            size="md"
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
                    <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                      No skills added yet
                    </Typography>
                  )}
                </div>

                {/* TESDA Information */}
                <div className={`bg-white border-2 ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding} shadow-md`}>
                  <div className="flex items-center justify-between mb-5">
                    <Typography variant="h6" className={`font-bold ${designTheme.textColor} text-xl`} style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.01em" }}>
                      TESDA Information
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton 
                        size="md" 
                        variant="text" 
                        onClick={() => handleSectionEditToggle("tesda")}
                        className={editingSections.tesda ? designTheme.textColor : ""}
                      >
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <div className="space-y-3">
                    {(portfolio.ncLevel || (isEditMode && editingSections.tesda)) && (
                      <div>
                        <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          NC Level
                        </Typography>
                        {isEditMode && editingSections.tesda ? (
                          <>
                            <Select
                              size="md"
                              label="Select NC Level"
                              value={
                                editingPortfolio?.ncLevel && NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)
                                  ? editingPortfolio.ncLevel
                                  : editingPortfolio?.ncLevel && !NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)
                                  ? "Additional"
                                  : ""
                              }
                              onChange={(value) => handleFieldChange("ncLevel", value || "")}
                              className="!border-gray-300 [&>div]:text-gray-900"
                            >
                              {NC_LEVEL_OPTIONS.map((level) => (
                                <Option key={level} value={level}>
                                  {level}
                                </Option>
                              ))}
                            </Select>
                            {((editingPortfolio?.ncLevel && !NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)) || isNcLevelAdditional) && (
                              <div className="mt-2">
                                <Input
                                  size="md"
                                  value={
                                    editingPortfolio?.ncLevel && !NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)
                                      ? editingPortfolio.ncLevel
                                      : ""
                                  }
                                  onChange={(e) => handleFieldChange("ncLevel", e.target.value)}
                                  placeholder="Enter custom NC Level"
                                  className="!border-gray-300"
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <Typography variant="small" className="text-gray-900 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {portfolio.ncLevel}
                          </Typography>
                        )}
                      </div>
                    )}
                    {(portfolio.trainingCenter || (isEditMode && editingSections.tesda)) && (
                      <div>
                        <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Training Center
                        </Typography>
                        {isEditMode && editingSections.tesda ? (
                          <Input
                            size="md"
                            value={editingPortfolio?.trainingCenter || ""}
                            onChange={(e) => handleFieldChange("trainingCenter", e.target.value)}
                            placeholder="Training Center"
                            className="!border-gray-300"
                          />
                        ) : (
                          <Typography variant="small" className="text-gray-900 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {portfolio.trainingCenter}
                          </Typography>
                        )}
                      </div>
                    )}
                    {(portfolio.scholarshipType || (isEditMode && editingSections.tesda)) && (
                      <div>
                        <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Scholarship Type
                        </Typography>
                        {isEditMode && editingSections.tesda ? (
                          <Input
                            size="md"
                            value={editingPortfolio?.scholarshipType || ""}
                            onChange={(e) => handleFieldChange("scholarshipType", e.target.value)}
                            placeholder="Scholarship Type"
                            className="!border-gray-300"
                          />
                        ) : (
                          <Typography variant="small" className="text-gray-900 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {portfolio.scholarshipType}
                          </Typography>
                        )}
                      </div>
                    )}
                    {(portfolio.trainingDuration || (isEditMode && editingSections.tesda)) && (
                      <div>
                        <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Training Duration
                        </Typography>
                        {isEditMode && editingSections.tesda ? (
                          <Input
                            size="md"
                            value={editingPortfolio?.trainingDuration || ""}
                            onChange={(e) => handleFieldChange("trainingDuration", e.target.value)}
                            placeholder="Training Duration"
                            className="!border-gray-300"
                          />
                        ) : (
                          <Typography variant="small" className="text-gray-900 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {portfolio.trainingDuration}
                          </Typography>
                        )}
                      </div>
                    )}
                    {(portfolio.tesdaRegistrationNumber || (isEditMode && editingSections.tesda)) && (
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <Typography variant="small" className="text-gray-700 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Registration Number
                          </Typography>
                          <div className="relative group inline-flex items-center">
                            <FaInfoCircle className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-auto whitespace-normal">
                              <div className="text-left leading-relaxed">
                                To know your TESDA Registration Number{" "}
                                <a 
                                  href="https://www.tesda.gov.ph/RWAC" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-300 hover:text-blue-200 underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  click here
                                </a>
                              </div>
                              <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                        {isEditMode && editingSections.tesda ? (
                          <>
                            <Input
                              size="md"
                              value={editingPortfolio?.tesdaRegistrationNumber || ""}
                              onChange={(e) => handleFieldChange("tesdaRegistrationNumber", e.target.value)}
                              placeholder="Registration Number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className={`!border-gray-300 ${fieldErrors.tesdaRegistrationNumber ? "!border-red-500" : ""}`}
                            />
                            {fieldErrors.tesdaRegistrationNumber && (
                              <Typography variant="small" color="red" className="mt-1">
                                {fieldErrors.tesdaRegistrationNumber}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="small" className="text-gray-900 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                        size="md"
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

              {/* Right Side - Name and Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Name Container */}
                <div className="relative bg-white border-2 border-gray-300 rounded-xl shadow-lg p-8 bg-gradient-to-br from-white to-gray-50/30">
                  {/* Edit Button - Top Right */}
                  {isGraduateView && isEditMode && (
                    <div className="absolute top-4 right-4">
                      <IconButton
                        size="md"
                        variant="text"
                        className={`${editingSections.header ? "text-gray-600 hover:bg-gray-100" : "text-gray-700 hover:bg-gray-100"}`}
                        onClick={() => handleSectionEditToggle("header")}
                      >
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    </div>
                  )}
                  {isEditMode && editingSections.header ? (
                    <div className="space-y-4 pr-12">
                      <Input
                        value={editingPortfolio?.fullName || ""}
                        onChange={(e) => handleFieldChange("fullName", e.target.value)}
                        className={`!${designTheme.typographySize} !${designTheme.titleWeight} !bg-white/20 !border-gray-300 !text-gray-900 !max-w-full`}
                        placeholder="Full Name"
                      />
                      <Input
                        value={editingPortfolio?.professionalTitle || ""}
                        onChange={(e) => handleFieldChange("professionalTitle", e.target.value)}
                        className="!text-lg !bg-white/20 !border-gray-300 !text-gray-900"
                        placeholder="Professional Title"
                      />
                      <Textarea
                        value={editingPortfolio?.professionalSummary || ""}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value.length <= 300) {
                            handleFieldChange("professionalSummary", value)
                          }
                        }}
                        className="!text-base !bg-white/20 !border-gray-300 !text-gray-900"
                        placeholder="Professional Summary"
                        rows={4}
                        maxLength={300}
                      />
                      <Typography variant="small" className="text-gray-600 mt-1">
                        {(editingPortfolio?.professionalSummary || "").length}/300 characters
                      </Typography>
                      <div className="flex justify-end">
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
                    </div>
                  ) : (
                    <>
                      <Typography
                        variant="h1"
                        className={`${designTheme.titleWeight} ${designTheme.typographySize} tracking-tight text-gray-900 break-words ${isGraduateView && isEditMode ? "pr-12" : ""}`}
                        style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.02em" }}
                      >
                        {portfolio.fullName || "Professional Portfolio"}
                      </Typography>
                      {portfolio.professionalTitle && (
                        <Typography
                          variant="h6"
                          className="text-gray-700 font-semibold mt-3 text-lg"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {portfolio.professionalTitle}
                        </Typography>
                      )}
                      {portfolio.professionalSummary && (
                        <Typography
                          variant="lead"
                          className="text-gray-800 leading-relaxed mt-5 break-words overflow-wrap-anywhere text-base"
                          style={{ fontFamily: "'Inter', sans-serif", lineHeight: "1.75" }}
                        >
                          {portfolio.professionalSummary}
                        </Typography>
                      )}
                    </>
                  )}
                </div>

                {/* Main Content Container */}
                <div className={`bg-white border-2 ${designTheme.cardBorder} rounded-xl shadow-lg p-10 space-y-10`}>
                  {/* Certificates Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-2xl md:text-3xl`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                        Certificates
                      </Typography>
                      {isGraduateView && isEditMode && (
                        <IconButton 
                          size="md" 
                          variant="text" 
                          onClick={() => handleSectionEditToggle("certificates")}
                          className={editingSections.certificates ? designTheme.textColor : ""}
                        >
                          <FaPen className="w-4 h-4" />
                        </IconButton>
                      )}
                    </div>
                    {isEditMode && editingSections.certificates ? (
                      <>
                        {isAddingCertificate && (
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
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  required
                                  className={`!border-gray-300 focus:!border-blue-500 ${fieldErrors.certificateNumber ? "!border-red-500" : ""}`}
                                />
                                {fieldErrors.certificateNumber && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    {fieldErrors.certificateNumber}
                                  </Typography>
                                )}
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
                                onBlur={handleCertificateInputBlur}
                                max={(() => {
                                  const today = new Date()
                                  return today.toISOString().split('T')[0]
                                })()}
                                required
                                className="!border-gray-300 focus:!border-blue-500"
                              />
                              {certificateSubmitAttempted && !newCertificate.issueDate && (
                                <Typography variant="small" color="red" className="mt-1">
                                  Please fill in the issue date.
                                </Typography>
                              )}
                              {newCertificate.issueDate && (() => {
                                const today = new Date().toISOString().split('T')[0]
                                return newCertificate.issueDate > today
                              })() && (
                                <Typography variant="small" color="red" className="mt-1">
                                  Issue Date cannot be a future date.
                                </Typography>
                              )}
                            </div>
                            <div className="mt-4">
                              <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                                Certificate File (Optional)
                              </Typography>
                              <div className="flex items-center gap-4">
                                {newCertificate.certificateFile ? (
                                  <Avatar
                                    src={URL.createObjectURL(newCertificate.certificateFile)}
                                    alt="Certificate Preview"
                                    size="lg"
                                    className={`ring-2 ${designTheme.borderColor}`}
                                  />
                                ) : editingCertificateId ? (
                                  <Avatar
                                    src={certificates.find((cert) => cert.id === editingCertificateId)?.certificateFilePath || "/placeholder.svg"}
                                    alt="Certificate Preview"
                                    size="lg"
                                    className={`ring-2 ${designTheme.borderColor}`}
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
                                  setCertificateSubmitAttempted(false)
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

                        <div className="space-y-4">
                          {!isAddingCertificate && (
                            <Button
                              variant="outlined"
                              color={designTheme.buttonColor}
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
                                          className={`ring-2 ${designTheme.borderColor}`}
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
                                    <div className="flex gap-2">
                                      <Button
                                        size="md"
                                        variant="text"
                                        color={designTheme.buttonColor}
                                        onClick={() => handleEditCertificate(certificate)}
                                        className="flex items-center gap-1"
                                      >
                                        <FaPen className="w-4 h-4" /> Edit
                                      </Button>
                                      <Button
                                        size="md"
                                        variant="text"
                                        color="red"
                                        onClick={() => handleRemoveCertificate(certificate.id)}
                                        className="flex items-center gap-1"
                                      >
                                        <FaTrash className="w-4 h-4" /> Remove
                                      </Button>
                                    </div>
                                  </CardBody>
                                </Card>
                              ))}
                            </div>
                          )}

                          <div className="mt-6 flex justify-end">
                            <Button
                              variant="gradient"
                              color={designTheme.buttonColor}
                              onClick={() => handleSaveSection("certificates")}
                              disabled={isSaving}
                              className="flex items-center gap-2"
                            >
                              <FaSave className="w-4 h-4" />
                              {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : certificates && certificates.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {certificates.map((certificate) => (
                          <Card key={certificate.id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <CardBody className="flex flex-col items-start gap-3">
                              <div className="flex items-center gap-3 w-full">
                                {(certificate.preview || certificate.certificateFilePath) && (
                                  <Avatar
                                    src={certificate.preview || certificate.certificateFilePath || "/placeholder.svg"}
                                    alt="Certificate Preview"
                                    size="md"
                                    className="ring-2 ring-gray-400 shadow-md flex-shrink-0"
                                  />
                                )}
                                <div className="flex-grow min-w-0">
                                  <Typography variant="h6" className="text-gray-900 font-bold text-sm truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {certificate.courseName}
                                  </Typography>
                                  {certificate.certificateNumber && (
                                    <Typography variant="small" className="text-gray-700 font-medium mt-1 text-xs">
                                      #{certificate.certificateNumber}
                                    </Typography>
                                  )}
                                  {certificate.issueDate && (
                                    <Typography variant="small" className="text-gray-600 mt-1 text-xs">
                                      {certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : "N/A"}
                                    </Typography>
                                  )}
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No certificates added yet"}
                        </Typography>
                      </div>
                    )}
                  </div>

                  {/* Experience Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-2xl md:text-3xl`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                        Experience
                      </Typography>
                      {isGraduateView && isEditMode && (
                        <IconButton 
                          size="md" 
                          variant="text" 
                          onClick={() => handleSectionEditToggle("experience")}
                          className={editingSections.experience ? designTheme.textColor : ""}
                        >
                          <FaPen className="w-4 h-4" />
                        </IconButton>
                      )}
                    </div>
                    {isEditMode && editingSections.experience ? (
                      <div className="space-y-8">
                        {(editingPortfolio?.experiences || []).map((exp, index) => (
                          <div key={index} className={`border-l-2 ${designTheme.cardBorder} pl-8 pb-8`}>
                            <div className="space-y-4">
                              <div className="flex justify-end -mt-2">
                                <IconButton
                                  size="md"
                                  variant="text"
                                  color="red"
                                  onClick={() => handleRemoveArrayItem("experiences", index)}
                                  aria-label="Remove experience"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </IconButton>
                              </div>
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  Job Title *
                                </Typography>
                                <Input
                                  size="md"
                                  value={exp.jobTitle || ""}
                                  onChange={(e) => handleArrayFieldChange("experiences", index, "jobTitle", e.target.value)}
                                  placeholder="e.g. Sous Chef"
                                  required
                                  className="!border-gray-300"
                                />
                              </div>
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  Company / Employer *
                                </Typography>
                                <Input
                                  size="md"
                                  value={exp.company || exp.employer || ""}
                                  onChange={(e) => handleArrayFieldChange("experiences", index, "company", e.target.value)}
                                  placeholder="e.g. Bistro Manila"
                                  required
                                  className="!border-gray-300"
                                />
                              </div>
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  Start Date *
                                </Typography>
                                <Input
                                  type="date"
                                  size="md"
                                  value={exp.startDate || ""}
                                  onChange={(e) => handleArrayFieldChange("experiences", index, "startDate", e.target.value)}
                                  onBlur={(e) => handleArrayFieldBlur("experiences", index, "startDate", e.target.value)}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                  required
                                  className="!border-gray-300"
                                />
                                {exp.startDate && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return exp.startDate > today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    Start Date cannot be a future date.
                                  </Typography>
                                )}
                              </div>
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  End Date *
                                </Typography>
                                <Input
                                  type="date"
                                  size="md"
                                  value={exp.endDate || ""}
                                  onChange={(e) => handleArrayFieldChange("experiences", index, "endDate", e.target.value)}
                                  onBlur={(e) => handleArrayFieldBlur("experiences", index, "endDate", e.target.value)}
                                  min={exp.startDate || undefined}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                  required
                                  className="!border-gray-300"
                                />
                                {exp.startDate && exp.endDate && exp.endDate < exp.startDate && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    End Date cannot be before Start Date.
                                  </Typography>
                                )}
                                {exp.endDate && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return exp.endDate > today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    End Date cannot be a future date.
                                  </Typography>
                                )}
                              </div>
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  Responsibilities / Highlights
                                </Typography>
                                <Textarea
                                  size="md"
                                  value={exp.responsibilities || exp.description || ""}
                                  onChange={(e) =>
                                    handleArrayFieldChange("experiences", index, "responsibilities", e.target.value)
                                  }
                                  placeholder="Summarize key contributions"
                                  className="!border-gray-300"
                                  rows={3}
                                  maxLength={300}
                                />
                                <div className="flex justify-between items-center mt-1">
                                  <Typography variant="small" className="text-gray-500">
                                    {(exp.responsibilities || exp.description || "").length}/300 characters
                                  </Typography>
                                  {(exp.responsibilities || exp.description || "").length > 300 && (
                                    <Typography variant="small" color="red">
                                      Responsibilities cannot exceed 300 characters.
                                    </Typography>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outlined"
                          size="md"
                          color={designTheme.buttonColor}
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
                        <div className="mt-6 flex justify-end">
                          <Button
                            variant="gradient"
                            color={designTheme.buttonColor}
                            onClick={() => handleSaveSection("experience")}
                            disabled={isSaving}
                            className="flex items-center gap-2"
                          >
                            <FaSave className="w-4 h-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    ) : portfolio.experiences && portfolio.experiences.length > 0 ? (
                      <div className="space-y-6">
                        {portfolio.experiences.map((exp, index) => (
                          <div key={index} className="border-l-4 border-gray-600 pl-6 pb-6 relative bg-gradient-to-r from-gray-50/50 to-transparent rounded-r-lg p-5">
                            <Typography variant="h6" className="font-bold text-gray-900 mb-1 break-words text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {exp.jobTitle}
                            </Typography>
                            {exp.company && (
                              <Typography variant="small" className={`${designTheme.textColor} font-semibold mb-1 break-words text-sm`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                {exp.company}
                              </Typography>
                            )}
                            {(exp.startDate || exp.endDate) && (
                              <Typography variant="small" className="text-gray-600 font-medium mb-3 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : "N/A"} -{" "}
                                {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "N/A"}
                              </Typography>
                            )}
                            {exp.responsibilities && (
                              <Typography
                                variant="small"
                                className="text-gray-800 leading-relaxed break-words overflow-wrap-anywhere text-xs"
                                style={{ fontFamily: "'Inter', sans-serif", lineHeight: "1.6" }}
                              >
                                {exp.responsibilities}
                              </Typography>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No experience added yet"}
                        </Typography>
                      </div>
                    )}
                  </div>

                  {/* Projects Section */}
                  <div>
              <div className="flex items-center justify-between mb-3">
                      <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-2xl md:text-3xl`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                        Projects
                      </Typography>
                      {isGraduateView && isEditMode && (
                        <IconButton 
                          size="md" 
                          variant="text" 
                          onClick={() => handleSectionEditToggle("projects")}
                          className={editingSections.projects ? designTheme.textColor : ""}
                        >
                          <FaPen className="w-4 h-4" />
                        </IconButton>
                      )}
                    </div>
                    {isEditMode && editingSections.projects ? (
                      <div className="space-y-4">
                        {isAddingProject && (
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
                                Description (Optional)
                              </Typography>
                              <Textarea
                                size="lg"
                                name="description"
                                value={newProject.description}
                                onChange={handleProjectInputChange}
                                placeholder="Describe your project"
                                className="!border-gray-300 focus:!border-blue-500"
                                rows={3}
                                maxLength={300}
                              />
                              <div className="flex justify-between items-center mt-1">
                                <Typography variant="small" className="text-gray-500">
                                  {newProject.description.length}/300 characters
                                </Typography>
                                {newProject.description.length > 300 && (
                                  <Typography variant="small" color="red">
                                    Description cannot exceed 300 characters.
                                  </Typography>
                                )}
                              </div>
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
                                  onBlur={handleProjectInputBlur}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                  required
                                  className="!border-gray-300 focus:!border-blue-500"
                                />
                                {projectSubmitAttempted && !newProject.startDate && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    Please fill in the start date.
                                  </Typography>
                                )}
                                {newProject.startDate && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return newProject.startDate > today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    Start Date cannot be a future date.
                                  </Typography>
                                )}
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
                                  onBlur={handleProjectInputBlur}
                                  min={newProject.startDate || undefined}
                                  max={(() => {
                                    const yesterday = new Date()
                                    yesterday.setDate(yesterday.getDate() - 1)
                                    return yesterday.toISOString().split('T')[0]
                                  })()}
                                  required
                                  className="!border-gray-300 focus:!border-blue-500"
                                />
                                {projectSubmitAttempted && !newProject.endDate && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    Please fill in the end date.
                                  </Typography>
                                )}
                                {newProject.startDate && newProject.endDate && newProject.endDate < newProject.startDate && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    End Date cannot be before Start Date.
                                  </Typography>
                                )}
                                {newProject.endDate && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return newProject.endDate >= today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    End Date cannot be today or a future date.
                                  </Typography>
                                )}
                              </div>
                            </div>
                            <div className="mt-4">
                              <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                                Project Image (Optional)
                              </Typography>
                              <div className="flex items-center gap-4">
                                {newProject.projectImageFile ? (
                                  <Avatar
                                    src={URL.createObjectURL(newProject.projectImageFile)}
                                    alt="Project Preview"
                                    size="lg"
                                    className={`ring-2 ${designTheme.borderColor}`}
                                  />
                                ) : editingProjectId ? (
                                  <Avatar
                                    src={projects.find((proj) => proj.id === editingProjectId)?.projectImageFilePath || "/placeholder.svg"}
                                    alt="Project Preview"
                                    size="lg"
                                    className={`ring-2 ${designTheme.borderColor}`}
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
                                  color={designTheme.buttonColor}
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
                                color={designTheme.buttonColor}
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
                                  setProjectSubmitAttempted(false)
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

                        {!isAddingProject && (
                          <Button
                            variant="outlined"
                            color={designTheme.buttonColor}
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                      <Typography variant="h6" className="font-medium text-gray-900 mb-2 break-words text-base">
                                        {project.title || "Unnamed Project"}
                                      </Typography>
                                      {project.description && (
                                        <Typography
                                          variant="small"
                                          color="gray"
                                          className="mb-3 leading-relaxed break-words overflow-wrap-anywhere text-xs line-clamp-3"
                                        >
                                          {project.description}
                                        </Typography>
                                      )}
                                      {project.startDate && project.endDate && (
                                        <Typography variant="small" className={`${designTheme.textColor} font-semibold text-xs`}>
                                          {new Date(project.startDate).toLocaleDateString()} -{" "}
                                          {new Date(project.endDate).toLocaleDateString()}
                                        </Typography>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <Button
                                        size="md"
                                        variant="text"
                                        color={designTheme.buttonColor}
                                        onClick={() => handleEditProject(project)}
                                        className="flex items-center gap-1"
                                      >
                                        <FaPen className="w-4 h-4" /> Edit
                                      </Button>
                                      <Button
                                        size="md"
                                        variant="text"
                                        color="red"
                                        onClick={() => handleRemoveProject(project.id)}
                                        className="flex items-center gap-1"
                                      >
                                        <FaTrash className="w-4 h-4" /> Remove
                                      </Button>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                        )}

                        <div className="mt-6 flex justify-end">
                          <Button
                            variant="gradient"
                            color={designTheme.buttonColor}
                            onClick={() => handleSaveSection("projects")}
                            disabled={isSaving}
                            className="flex items-center gap-2"
                          >
                            <FaSave className="w-4 h-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    ) : projects && projects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projects.map((project) => (
                          <Card key={project.id} className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            {project.projectImageFilePath && (
                              <div className="relative h-40 overflow-hidden">
                                <img
                                  src={project.projectImageFilePath || "/placeholder.svg"}
                                  alt={project.title || "Project"}
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                  onClick={() => setSelectedProjectImage(project.projectImageFilePath)}
                                />
                              </div>
                            )}
                            <CardBody className="p-4 bg-gradient-to-br from-white to-gray-50/30">
                              <Typography variant="h6" className="font-bold text-gray-900 mb-2 break-words text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {project.title || "Unnamed Project"}
                              </Typography>
                              {project.description && (
                                <Typography
                                  variant="small"
                                  className="text-gray-700 mb-3 leading-relaxed break-words overflow-wrap-anywhere text-xs line-clamp-3"
                                  style={{ fontFamily: "'Inter', sans-serif", lineHeight: "1.6" }}
                                >
                                  {project.description}
                                </Typography>
                              )}
                              {project.startDate && project.endDate && (
                                <Typography variant="small" className={`${designTheme.textColor} font-semibold text-xs`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                  {new Date(project.startDate).toLocaleDateString()} -{" "}
                                  {new Date(project.endDate).toLocaleDateString()}
                                </Typography>
                              )}
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No projects added yet"}
                        </Typography>
                      </div>
                    )}
                  </div>

                  {/* Awards & Recognition Section */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-2xl md:text-3xl`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                        Awards & Recognition
                      </Typography>
                      {isGraduateView && isEditMode && (
                        <IconButton 
                          size="md" 
                          variant="text" 
                          onClick={() => handleSectionEditToggle("awards")}
                          className={editingSections.awards ? designTheme.textColor : ""}
                        >
                          <FaPen className="w-4 h-4" />
                        </IconButton>
                      )}
                    </div>
                    {isEditMode && editingSections.awards ? (
                      <div className="space-y-4">
                        {(editingPortfolio?.awardsRecognitions || []).map((award, index) => (
                          <div key={index} className="bg-white border border-gray-100 rounded-lg p-6">
                            <div className="space-y-3">
                              <div className="flex justify-end -mt-2">
                                <IconButton
                                  size="md"
                                  variant="text"
                                  color="red"
                                  onClick={() => handleRemoveArrayItem("awardsRecognitions", index)}
                                  aria-label="Remove award"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </IconButton>
                              </div>
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  Award Title *
                                </Typography>
                                <Input
                                  size="md"
                                  value={award.title || ""}
                                  onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "title", e.target.value)}
                                  placeholder="e.g. Best in Pastry Arts"
                                  required
                                  className="!border-gray-300"
                                />
                              </div>
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  Issuer
                                </Typography>
                                <Input
                                  size="md"
                                  value={award.issuer || ""}
                                  onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "issuer", e.target.value)}
                                  placeholder="e.g. TESDA"
                                  className="!border-gray-300"
                                />
                              </div>
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  Date Received *
                                </Typography>
                                <Input
                                  type="date"
                                  size="md"
                                  value={award.dateReceived || ""}
                                  onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "dateReceived", e.target.value)}
                                  onBlur={(e) => handleArrayFieldBlur("awardsRecognitions", index, "dateReceived", e.target.value)}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                  required
                                  className="!border-gray-300"
                                />
                                {award.dateReceived && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return award.dateReceived > today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    Date Received cannot be a future date.
                                  </Typography>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outlined"
                          size="md"
                          color={designTheme.buttonColor}
                          onClick={() => handleAddArrayItem("awardsRecognitions", { title: "", issuer: "", dateReceived: "" })}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <FaPlus className="w-4 h-4" />
                          Add Award
                        </Button>
                        <div className="mt-6 flex justify-end">
                          <Button
                            variant="gradient"
                            color={designTheme.buttonColor}
                            size="md"
                            onClick={() => handleSaveSection("awards")}
                            disabled={isSaving}
                            className="flex items-center gap-2"
                          >
                            <FaSave className="w-3 h-3" />
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    ) : portfolio.awardsRecognitions && portfolio.awardsRecognitions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolio.awardsRecognitions.map((award, index) => (
                          <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <Typography variant="h6" className="font-bold text-gray-900 mb-2 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {award.title}
                            </Typography>
                            {award.issuer && (
                              <Typography variant="small" className="text-gray-700 font-medium mb-1 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {award.issuer}
                              </Typography>
                            )}
                            {award.dateReceived && (
                              <Typography variant="small" className={`${designTheme.textColor} font-semibold text-xs`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                {award.dateReceived}
                              </Typography>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No awards or recognition added yet"}
                        </Typography>
                      </div>
                    )}
                  </div>

                  {/* Continuing Education & Professional Memberships */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Continuing Education */}
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-xl md:text-2xl`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                          Continuing Education
                        </Typography>
                        {isGraduateView && isEditMode && (
                          <IconButton 
                            size="md" 
                            variant="text" 
                            onClick={() => handleSectionEditToggle("education")}
                            className={editingSections.education ? designTheme.textColor : ""}
                          >
                            <FaPen className="w-4 h-4" />
                          </IconButton>
                        )}
                      </div>
                      {isEditMode && editingSections.education ? (
                        <div className="space-y-3">
                          {(editingPortfolio?.continuingEducations || []).map((edu, index) => (
                            <div key={index} className="border-l-2 border-gray-200 pl-4 py-2 bg-white rounded-lg shadow-sm">
                              <div className="flex justify-end -mt-2">
                                <IconButton
                                  size="md"
                                  variant="text"
                                  color="red"
                                  onClick={() => handleRemoveArrayItem("continuingEducations", index)}
                                  aria-label="Remove education"
                                >
                                  <FaTrash className="w-3 h-3" />
                                </IconButton>
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Course Name *
                                </Typography>
                                <Input
                                  size="md"
                                  value={edu.courseName || ""}
                                  onChange={(e) => handleArrayFieldChange("continuingEducations", index, "courseName", e.target.value)}
                                  placeholder="e.g. Advanced Baking Workshop"
                                  required
                                  className="!border-gray-300"
                                />
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Institution
                                </Typography>
                                <Input
                                  size="md"
                                  value={edu.institution || ""}
                                  onChange={(e) => handleArrayFieldChange("continuingEducations", index, "institution", e.target.value)}
                                  placeholder="e.g. TESDA Training Center"
                                  className="!border-gray-300"
                                />
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Completion Date *
                                </Typography>
                                <Input
                                  type="date"
                                  size="md"
                                  value={edu.completionDate || ""}
                                  onChange={(e) => handleArrayFieldChange("continuingEducations", index, "completionDate", e.target.value)}
                                  onBlur={(e) => handleArrayFieldBlur("continuingEducations", index, "completionDate", e.target.value)}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                  required
                                  className="!border-gray-300"
                                />
                                {edu.completionDate && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return edu.completionDate > today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    Completion Date cannot be a future date.
                                  </Typography>
                                )}
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outlined"
                            size="md"
                            color={designTheme.buttonColor}
                            onClick={() => handleAddArrayItem("continuingEducations", { courseName: "", institution: "", completionDate: "" })}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <FaPlus className="w-4 h-4" />
                            Add Education
                          </Button>
                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="gradient"
                              color={designTheme.buttonColor}
                              size="md"
                              onClick={() => handleSaveSection("education")}
                              disabled={isSaving}
                              className="flex items-center gap-2"
                            >
                              <FaSave className="w-3 h-3" />
                              {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </div>
                      ) : portfolio.continuingEducations && portfolio.continuingEducations.length > 0 ? (
                        <div className="space-y-3">
                          {portfolio.continuingEducations.map((edu, index) => (
                            <div key={index} className="border-l-4 border-gray-600 pl-4 py-2 bg-gradient-to-r from-gray-50/50 to-transparent rounded-r-lg">
                              <Typography variant="small" className="font-bold text-gray-900 mb-1 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {edu.courseName}
                              </Typography>
                              {edu.institution && (
                                <Typography variant="small" className="text-gray-700 font-medium mb-1 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                  {edu.institution}
                                </Typography>
                              )}
                              {edu.completionDate && (
                                <Typography variant="small" className={`${designTheme.textColor} font-semibold text-xs`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                  {edu.completionDate}
                                </Typography>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No continuing education added yet"}
                        </Typography>
                      )}
                    </div>

                    {/* Professional Memberships */}
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-xl md:text-2xl`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                          Professional Memberships
                        </Typography>
                        {isGraduateView && isEditMode && (
                          <IconButton 
                            size="md" 
                            variant="text" 
                            onClick={() => handleSectionEditToggle("memberships")}
                            className={editingSections.memberships ? designTheme.textColor : ""}
                          >
                            <FaPen className="w-4 h-4" />
                          </IconButton>
                        )}
                      </div>
                      {isEditMode && editingSections.memberships ? (
                        <div className="space-y-3">
                          {(editingPortfolio?.professionalMemberships || []).map((mem, index) => (
                            <div key={index} className="border-l-2 border-gray-200 pl-4 py-2 bg-white rounded-lg shadow-sm">
                              <div className="flex justify-end -mt-2">
                                <IconButton
                                  size="md"
                                  variant="text"
                                  color="red"
                                  onClick={() => handleRemoveArrayItem("professionalMemberships", index)}
                                  aria-label="Remove membership"
                                >
                                  <FaTrash className="w-3 h-3" />
                                </IconButton>
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Organization *
                                </Typography>
                                <Input
                                  size="md"
                                  value={mem.organization || ""}
                                  onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "organization", e.target.value)}
                                  placeholder="e.g. Philippine Chefs Association"
                                  required
                                  className="!border-gray-300"
                                />
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Membership Type
                                </Typography>
                                <Input
                                  size="md"
                                  value={mem.membershipType || ""}
                                  onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "membershipType", e.target.value)}
                                  placeholder="e.g. Regular Member"
                                  className="!border-gray-300"
                                />
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Start Date *
                                </Typography>
                                <Input
                                  type="date"
                                  size="md"
                                  value={mem.startDate || ""}
                                  onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "startDate", e.target.value)}
                                  onBlur={(e) => handleArrayFieldBlur("professionalMemberships", index, "startDate", e.target.value)}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                  required
                                  className="!border-gray-300"
                                />
                                {mem.startDate && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return mem.startDate > today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    Start Date cannot be a future date.
                                  </Typography>
                                )}
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outlined"
                            size="md"
                            color={designTheme.buttonColor}
                            onClick={() => handleAddArrayItem("professionalMemberships", { organization: "", membershipType: "", startDate: "" })}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <FaPlus className="w-4 h-4" />
                            Add Membership
                          </Button>
                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="gradient"
                              color={designTheme.buttonColor}
                              size="md"
                              onClick={() => handleSaveSection("memberships")}
                              disabled={isSaving}
                              className="flex items-center gap-2"
                            >
                              <FaSave className="w-3 h-3" />
                              {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </div>
                      ) : portfolio.professionalMemberships && portfolio.professionalMemberships.length > 0 ? (
                        <div className="space-y-3">
                          {portfolio.professionalMemberships.map((mem, index) => (
                            <div key={index} className="border-l-4 border-gray-600 pl-4 py-2 bg-gradient-to-r from-gray-50/50 to-transparent rounded-r-lg">
                              <Typography variant="small" className="font-bold text-gray-900 mb-1 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {mem.organization}
                              </Typography>
                              {mem.membershipType && (
                                <Typography variant="small" className="text-gray-700 font-medium mb-1 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                  {mem.membershipType}
                                </Typography>
                              )}
                              {mem.startDate && (
                                <Typography variant="small" className={`${designTheme.textColor} font-semibold text-xs`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                  Since {mem.startDate}
                                </Typography>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No professional memberships added yet"}
                        </Typography>
                      )}
                    </div>
                  </div>

                  {/* References Section */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-2xl md:text-3xl`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                        References
                      </Typography>
                      {isGraduateView && isEditMode && (
                        <IconButton 
                          size="md" 
                          variant="text" 
                          onClick={() => handleSectionEditToggle("references")}
                          className={editingSections.references ? designTheme.textColor : ""}
                        >
                          <FaPen className="w-4 h-4" />
                        </IconButton>
                      )}
                    </div>
                    {isEditMode && editingSections.references ? (
                      <div className="space-y-4">
                        {(editingPortfolio?.references || []).map((ref, index) => (
                          <div key={index} className="bg-white border border-gray-100 rounded-lg p-6">
                            <div className="space-y-3">
                              <div className="flex justify-end -mt-2">
                                <IconButton
                                  size="md"
                                  variant="text"
                                  color="red"
                                  onClick={() => handleRemoveArrayItem("references", index)}
                                  aria-label="Remove reference"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </IconButton>
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Name *
                                </Typography>
                                <Input
                                  size="md"
                                  value={ref.name || ""}
                                  onChange={(e) => handleArrayFieldChange("references", index, "name", e.target.value)}
                                  placeholder="e.g. Maria Cruz"
                                  required
                                  className="!border-gray-300"
                                />
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Relationship / Position
                                </Typography>
                                <Input
                                  size="md"
                                  value={ref.relationship || ref.position || ""}
                                  onChange={(e) => handleArrayFieldChange("references", index, "relationship", e.target.value)}
                                  placeholder="e.g. Training Supervisor"
                                  className="!border-gray-300"
                                />
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Company
                                </Typography>
                                <Input
                                  size="md"
                                  value={ref.company || ""}
                                  onChange={(e) => handleArrayFieldChange("references", index, "company", e.target.value)}
                                  placeholder="e.g. Cafe Delight"
                                  className="!border-gray-300"
                                />
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Email *
                                </Typography>
                                <Input
                                  type="email"
                                  size="md"
                                  value={ref.email || ""}
                                  onChange={(e) => handleArrayFieldChange("references", index, "email", e.target.value)}
                                  placeholder="name@gmail.com"
                                  required
                                  className={`!border-gray-300 ${fieldErrors[`referenceEmail_${index}`] ? "!border-red-500" : ""}`}
                                />
                                {fieldErrors[`referenceEmail_${index}`] && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    {fieldErrors[`referenceEmail_${index}`]}
                                  </Typography>
                                )}
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Contact Number *
                                </Typography>
                                <Input
                                  type="tel"
                                  size="md"
                                  value={ref.phone || ref.contact || ""}
                                  onChange={(e) => {
                                    const newValue = e.target.value
                                    handleArrayFieldChange("references", index, "phone", newValue)
                                  }}
                                  placeholder="Contact number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={11}
                                  required
                                  className={`!border-gray-300 ${fieldErrors[`referencePhone_${index}`] ? "!border-red-500" : ""}`}
                                />
                                {fieldErrors[`referencePhone_${index}`] && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    {fieldErrors[`referencePhone_${index}`]}
                                  </Typography>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outlined"
                          size="md"
                          color={designTheme.buttonColor}
                          onClick={() => handleAddArrayItem("references", { name: "", relationship: "", company: "", email: "", phone: "" })}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <FaPlus className="w-4 h-4" />
                          Add Reference
                        </Button>
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="gradient"
                            color={designTheme.buttonColor}
                            size="md"
                            onClick={() => handleSaveSection("references")}
                            disabled={isSaving}
                            className="flex items-center gap-2"
                          >
                            <FaSave className="w-3 h-3" />
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    ) : portfolio.references && portfolio.references.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolio.references.map((ref, index) => (
                          <div key={index} className="bg-gradient-to-br from-white to-gray-50/30 border-2 border-gray-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <Typography variant="h6" className="font-bold text-gray-900 mb-2 break-words text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {ref.name}
                            </Typography>
                            {ref.position && (
                              <Typography variant="small" className="text-gray-700 font-medium mb-1 break-words text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {ref.position}
                              </Typography>
                            )}
                            {ref.company && (
                              <Typography variant="small" className={`${designTheme.textColor} mb-2 break-words font-semibold text-xs`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                {ref.company}
                              </Typography>
                            )}
                            <div className="space-y-1">
                              {ref.email && (
                                <Typography variant="small" className="text-gray-600 break-all font-medium text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                  {ref.email}
                                </Typography>
                              )}
                              {ref.contact && (
                                <Typography variant="small" className="text-gray-600 break-words font-medium text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                  {ref.contact}
                                </Typography>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No references added yet"}
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : portfolio?.designTemplate === "Tourism" ? (
          /* Tourism - Modern Centered Layout with Clean Résumé Style */
          <div className="bg-white min-h-screen" style={{ fontFamily: "'Montserrat', 'Roboto', 'Inter', sans-serif" }}>
            {/* Header Section - Clean Modern Résumé Style */}
            <div className="relative bg-white pt-16 pb-16 md:pt-20 md:pb-20 px-6 md:px-12 lg:px-16 border-b-2 border-gray-200">
              {/* Edit Button - Top Right */}
              {isGraduateView && isEditMode && (
                <div className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8">
                  <IconButton 
                    size="md" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("header")}
                    className={`${editingSections.header ? "text-gray-600 hover:bg-gray-100" : "text-red-600 hover:bg-red-50"}`}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                </div>
              )}
              <div className="max-w-7xl mx-auto">
                {/* Centered Layout */}
                <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
                  {/* Profile Photo - Centered */}
                  <div className="flex-shrink-0 pt-4 md:pt-6 lg:pt-8">
                    <div className="relative">
                      {(graduate?.profilePicture || portfolio?.avatar || isEditMode) && (
                        <>
                          <Avatar
                            src={
                              isEditMode && selectedAvatarFile
                                ? URL.createObjectURL(selectedAvatarFile)
                                : graduate?.profilePicture || portfolio?.avatar || "/placeholder.svg"
                            }
                            alt={portfolio?.fullName || "Profile"}
                            size="xxl"
                            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-none border-2 border-black shadow-lg"
                            style={{ filter: 'grayscale(100%)' }}
                            onClick={isEditMode && editingSections.header ? handleImageClick : undefined}
                          />
                          {/* Camera Icon Overlay - Only in edit mode when editing header */}
                          {isEditMode && editingSections.header && (
                            <div 
                              className="absolute rounded-full shadow-lg cursor-pointer border-2 border-white bg-white/90 hover:bg-white"
                              onClick={handleImageClick}
                              style={{ 
                                bottom: '0',
                                right: '0',
                                transform: 'translate(15%, 15%)',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <FaCamera className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileChange}
                            ref={avatarFileInputRef}
                            className="hidden"
                          />
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Name - Large Bold Red, Centered */}
                  <div className="w-full max-w-4xl mx-auto">
                    {isEditMode && editingSections.header ? (
                      <>
                        <Typography variant="small" className="text-gray-600 text-xs uppercase tracking-wide font-medium mb-2 text-center" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                          Name
                        </Typography>
                        <input
                          type="text"
                          value={editingPortfolio?.fullName || ""}
                          onChange={(e) => handleFieldChange("fullName", e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-b-2 focus:border-red-600 text-center text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-red-600 tracking-tight leading-none"
                          style={{ 
                            fontFamily: "'Open Sauce', sans-serif", 
                            fontWeight: 900, 
                            letterSpacing: "-0.02em",
                            lineHeight: "1",
                            padding: "0",
                            margin: "0"
                          }}
                        />
                      </>
                    ) : (
                      <Typography
                        variant="h1"
                        className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-red-600 tracking-tight leading-none"
                        style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 900, letterSpacing: "-0.02em" }}
                      >
                        {portfolio?.fullName || "Your Name"}
                      </Typography>
                    )}
                  </div>
                  
                  {/* Professional Title - Black Text, Centered */}
                  {(portfolio?.professionalTitle || (isEditMode && editingSections.header)) && (
                    <div className="w-full max-w-3xl mx-auto">
                      {isEditMode && editingSections.header ? (
                        <>
                          <Typography variant="small" className="text-gray-600 text-xs uppercase tracking-wide font-medium mb-2 text-center" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                            Professional Title
                          </Typography>
                          <Input
                            value={editingPortfolio?.professionalTitle || ""}
                            onChange={(e) => handleFieldChange("professionalTitle", e.target.value)}
                            className="!text-xl md:!text-2xl !text-black !font-medium !text-center !w-full !px-0 !py-0 !min-h-0 !border-transparent focus:!border-gray-400 !shadow-none"
                            placeholder="Professional Title"
                            style={{ 
                              fontFamily: "'Open Sauce', sans-serif", 
                              fontWeight: 500,
                              lineHeight: "1.5",
                              padding: "0",
                              margin: "0",
                              width: "100%"
                            }}
                          />
                        </>
                      ) : (
                        <Typography
                          variant="h5"
                          className="text-xl md:text-2xl text-black font-medium tracking-normal"
                          style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 500 }}
                        >
                          {portfolio?.professionalTitle}
                        </Typography>
                      )}
                    </div>
                  )}
                  
                  {/* Professional Summary - Black Body Text, Centered */}
                  <div className="max-w-3xl mx-auto px-4 w-full">
                    {isEditMode && editingSections.header ? (
                      <div className="w-full">
                        <Typography variant="small" className="text-gray-600 text-xs uppercase tracking-wide font-medium mb-2 text-center" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                          Professional Summary
                        </Typography>
                        <Textarea
                          value={editingPortfolio?.professionalSummary || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value.length <= 300) {
                              handleFieldChange("professionalSummary", value)
                            }
                          }}
                          className="!text-base md:!text-lg !text-black !border-transparent focus:!border-gray-300 !text-center !w-full !px-0 !py-0 !shadow-none"
                          placeholder="Professional Summary"
                          rows={4}
                          maxLength={300}
                          style={{ 
                            fontFamily: "'Open Sauce', sans-serif", 
                            lineHeight: "1.7", 
                            fontWeight: 400,
                            padding: "0",
                            margin: "0",
                            width: "100%",
                            wordWrap: "break-word",
                            overflowWrap: "break-word"
                          }}
                        />
                        <Typography variant="small" className="text-gray-500 mt-1 text-center">
                          {(editingPortfolio?.professionalSummary || "").length}/300 characters
                        </Typography>
                      </div>
                    ) : portfolio?.professionalSummary ? (
                      <Typography
                        variant="lead"
                        className="text-black leading-relaxed text-base md:text-lg break-words overflow-wrap-anywhere text-center"
                        style={{ fontFamily: "'Open Sauce', sans-serif", lineHeight: "1.7", fontWeight: 400, wordWrap: "break-word", overflowWrap: "break-word" }}
                      >
                        {portfolio.professionalSummary}
                      </Typography>
                    ) : (
                      <Typography
                        variant="lead"
                        className="text-gray-500 leading-relaxed text-base md:text-lg italic text-center break-words overflow-wrap-anywhere"
                        style={{ fontFamily: "'Open Sauce', sans-serif", lineHeight: "1.7", fontWeight: 400, wordWrap: "break-word", overflowWrap: "break-word" }}
                      >
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                  </div>
                  {isEditMode && editingSections.header && (
                    <div className="mt-6 flex justify-center">
                      <Button
                        variant="gradient"
                        color="red"
                        onClick={() => handleSaveSection("header")}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <FaSave className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Section */}
            <div className="bg-white py-12 px-6">
              <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Contact & TESDA Info - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact Information */}
                  <div className="bg-white p-6 border-l-4 border-red-600">
                    <div className="flex items-center justify-between mb-4">
                      <Typography variant="h5" className="font-bold text-red-600 text-lg uppercase tracking-wide" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                        Contact
                      </Typography>
                      {isGraduateView && isEditMode && (
                        <IconButton 
                          size="md" 
                          variant="text" 
                          onClick={() => handleSectionEditToggle("contact")}
                          className="text-red-600"
                        >
                          <FaPen className="w-4 h-4" />
                        </IconButton>
                      )}
                    </div>
                    {(portfolio?.email || portfolio?.phone || portfolio?.website || (isEditMode && editingSections.contact)) ? (
                      <div className="space-y-3">
                        {(portfolio?.email || (isEditMode && editingSections.contact)) && (
                          <div>
                            <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                              Email
                            </Typography>
                            {isEditMode && editingSections.contact ? (
                              <>
                                <Input
                                  type="email"
                                  size="md"
                                  value={editingPortfolio?.email || ""}
                                  onChange={(e) => handleFieldChange("email", e.target.value)}
                                  placeholder="Email address"
                                  className={`!border-gray-300 ${fieldErrors.email ? "!border-red-500" : ""}`}
                                />
                                {fieldErrors.email && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    {fieldErrors.email}
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <Typography variant="small" className="text-black break-all text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                {portfolio?.email}
                              </Typography>
                            )}
                          </div>
                        )}
                        {(portfolio?.phone || (isEditMode && editingSections.contact)) && (
                          <div>
                            <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                              Phone
                            </Typography>
                            {isEditMode && editingSections.contact ? (
                              <>
                                <Input
                                  type="tel"
                                  size="md"
                                  value={editingPortfolio?.phone || ""}
                                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                                  placeholder="Phone number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={11}
                                  className={`!border-gray-300 ${fieldErrors.phone ? "!border-red-500" : ""}`}
                                />
                                {fieldErrors.phone && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    {fieldErrors.phone}
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                {portfolio?.phone}
                              </Typography>
                            )}
                          </div>
                        )}
                        {(portfolio?.website || (isEditMode && editingSections.contact)) && (
                          <div>
                            <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                              Website
                            </Typography>
                            {isEditMode && editingSections.contact ? (
                              <>
                                <Input
                                  type="url"
                                  size="md"
                                  value={editingPortfolio?.website || ""}
                                  onChange={(e) => handleFieldChange("website", e.target.value)}
                                  placeholder="https://www.example.com"
                                  className={`!border-gray-300 ${fieldErrors.website ? "!border-red-500" : ""}`}
                                />
                                {fieldErrors.website && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    {fieldErrors.website}
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <Typography variant="small" className="text-black break-all text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                {portfolio?.website}
                              </Typography>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                    {isEditMode && editingSections.contact && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="gradient"
                          color="red"
                          size="md"
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

                  {/* TESDA Information */}
                  <div className="bg-white p-6 border-l-4 border-red-600">
                    <div className="flex items-center justify-between mb-4">
                      <Typography variant="h5" className="font-bold text-red-600 text-lg uppercase tracking-wide" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                        TESDA Information
                      </Typography>
                      {isGraduateView && isEditMode && (
                        <IconButton 
                          size="md" 
                          variant="text" 
                          onClick={() => handleSectionEditToggle("tesda")}
                          className="text-red-600"
                        >
                          <FaPen className="w-4 h-4" />
                        </IconButton>
                      )}
                    </div>
                    {(portfolio?.ncLevel || portfolio?.trainingCenter || portfolio?.scholarshipType || portfolio?.trainingDuration || portfolio?.tesdaRegistrationNumber || (isEditMode && editingSections.tesda)) ? (
                      <div className="space-y-3">
                        {(portfolio?.ncLevel || (isEditMode && editingSections.tesda)) && (
                          <div>
                            <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                              NC Level
                            </Typography>
                            {isEditMode && editingSections.tesda ? (
                              <>
                                <Select
                                  size="md"
                                  label="Select NC Level"
                                  value={
                                    editingPortfolio?.ncLevel && NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)
                                      ? editingPortfolio.ncLevel
                                      : editingPortfolio?.ncLevel && !NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)
                                      ? "Additional"
                                      : ""
                                  }
                                  onChange={(value) => handleFieldChange("ncLevel", value || "")}
                                  className="!border-gray-300 [&>div]:text-gray-900"
                                >
                                  {NC_LEVEL_OPTIONS.map((level) => (
                                    <Option key={level} value={level}>
                                      {level}
                                    </Option>
                                  ))}
                                </Select>
                                {((editingPortfolio?.ncLevel && !NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)) || isNcLevelAdditional) && (
                                  <div className="mt-2">
                                    <Input
                                      size="md"
                                      value={
                                        editingPortfolio?.ncLevel && !NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)
                                          ? editingPortfolio.ncLevel
                                          : ""
                                      }
                                      onChange={(e) => handleFieldChange("ncLevel", e.target.value)}
                                      placeholder="Enter custom NC Level"
                                      className="!border-gray-300"
                                    />
                                  </div>
                                )}
                              </>
                            ) : (
                              <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                {portfolio?.ncLevel}
                              </Typography>
                            )}
                          </div>
                        )}
                        {(portfolio?.trainingCenter || (isEditMode && editingSections.tesda)) && (
                          <div>
                            <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                              Training Center
                            </Typography>
                            {isEditMode && editingSections.tesda ? (
                              <Input
                                size="md"
                                value={editingPortfolio?.trainingCenter || ""}
                                onChange={(e) => handleFieldChange("trainingCenter", e.target.value)}
                                placeholder="Training Center"
                                className="!border-gray-300"
                              />
                            ) : (
                              <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                {portfolio?.trainingCenter}
                              </Typography>
                            )}
                          </div>
                        )}
                        {(portfolio?.scholarshipType || (isEditMode && editingSections.tesda)) && (
                          <div>
                            <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                              Scholarship Type
                            </Typography>
                            {isEditMode && editingSections.tesda ? (
                              <Input
                                size="md"
                                value={editingPortfolio?.scholarshipType || ""}
                                onChange={(e) => handleFieldChange("scholarshipType", e.target.value)}
                                placeholder="Scholarship Type"
                                className="!border-gray-300"
                              />
                            ) : (
                              <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                {portfolio?.scholarshipType}
                              </Typography>
                            )}
                          </div>
                        )}
                        {(portfolio?.trainingDuration || (isEditMode && editingSections.tesda)) && (
                          <div>
                            <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                              Training Duration
                            </Typography>
                            {isEditMode && editingSections.tesda ? (
                              <Input
                                size="md"
                                value={editingPortfolio?.trainingDuration || ""}
                                onChange={(e) => handleFieldChange("trainingDuration", e.target.value)}
                                placeholder="Training Duration"
                                className="!border-gray-300"
                              />
                            ) : (
                              <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                {portfolio?.trainingDuration}
                              </Typography>
                            )}
                          </div>
                        )}
                        {(portfolio?.tesdaRegistrationNumber || (isEditMode && editingSections.tesda)) && (
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <Typography variant="small" className="text-black font-medium text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                                Registration Number
                              </Typography>
                              <div className="relative group inline-flex items-center">
                                <FaInfoCircle className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-auto whitespace-normal">
                                  <div className="text-left leading-relaxed">
                                    To know your TESDA Registration Number{" "}
                                    <a 
                                      href="https://www.tesda.gov.ph/RWAC" 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-300 hover:text-blue-200 underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      click here
                                    </a>
                                  </div>
                                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                            {isEditMode && editingSections.tesda ? (
                              <>
                                <Input
                                  size="md"
                                  value={editingPortfolio?.tesdaRegistrationNumber || ""}
                                  onChange={(e) => handleFieldChange("tesdaRegistrationNumber", e.target.value)}
                                  placeholder="Registration Number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  className={`!border-gray-300 ${fieldErrors.tesdaRegistrationNumber ? "!border-red-500" : ""}`}
                                />
                                {fieldErrors.tesdaRegistrationNumber && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    {fieldErrors.tesdaRegistrationNumber}
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                {portfolio?.tesdaRegistrationNumber}
                              </Typography>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                        You haven't filled up details in this section.
                      </Typography>
                    )}
                    {isEditMode && editingSections.tesda && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="gradient"
                          color="red"
                          size="md"
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

                {/* Skills */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                      Skills
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton 
                        size="md" 
                        variant="text" 
                        onClick={() => handleSectionEditToggle("skills")}
                        className="text-red-600"
                      >
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  {((portfolio?.skills && portfolio.skills.length > 0) || (isEditMode && editingSections.skills)) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(isEditMode && editingSections.skills ? (editingPortfolio?.skills || []) : (portfolio?.skills || []))?.map((skill, index) => (
                        <div key={index} className="flex items-center gap-3 py-2 border-b border-gray-200">
                          {isEditMode && editingSections.skills ? (
                            <div className="flex-1 space-y-3">
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Skill Name *
                                </Typography>
                              <div className="flex gap-2">
                                <Input
                                  size="md"
                                  value={skill.name || ""}
                                  onChange={(e) => handleArrayFieldChange("skills", index, "name", e.target.value)}
                                    placeholder="e.g. Latte Art"
                                  required
                                  className="!border-gray-300 flex-1"
                                />
                                <IconButton
                                  size="md"
                                  variant="text"
                                  color="red"
                                  onClick={() => handleRemoveArrayItem("skills", index)}
                                >
                                  <FaTrash className="w-3 h-3" />
                                </IconButton>
                              </div>
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Skill Type
                                </Typography>
                                <Select
                                size="md"
                                  label="Select Skill Type"
                                value={skill.type || "TECHNICAL"}
                                  onChange={(value) =>
                                    handleArrayFieldChange("skills", index, "type", value || "TECHNICAL")
                                  }
                                  className="!border-gray-300 [&>div]:text-black"
                                >
                                  {VALID_SKILL_TYPES.map((type) => (
                                    <Option key={type} value={type}>
                                      {type}
                                    </Option>
                                  ))}
                                </Select>
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Proficiency Level
                                </Typography>
                                <Select
                                  size="md"
                                  label="Select Proficiency Level"
                                  value={skill.proficiencyLevel || "Beginner"}
                                  onChange={(value) =>
                                    handleArrayFieldChange("skills", index, "proficiencyLevel", value || "Beginner")
                                  }
                                  className="!border-gray-300 [&>div]:text-gray-900"
                                >
                                  {SKILL_PROFICIENCY_LEVELS.map((level) => (
                                    <Option key={level} value={level}>
                                      {level}
                                    </Option>
                                  ))}
                                </Select>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Typography variant="small" className="font-bold text-black text-base uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600, minWidth: '80px' }}>
                                {skill.type || "TECHNICAL"}
                              </Typography>
                              <Typography variant="small" className="text-black text-base" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                {skill.name}
                              </Typography>
                              {skill.proficiencyLevel && (
                                <Typography variant="small" className="text-gray-600 text-sm ml-auto" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                  {skill.proficiencyLevel}
                                </Typography>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                      {isEditMode && editingSections.skills && (
                        <div className="md:col-span-2">
                          <Button
                            variant="outlined"
                            size="md"
                            color="red"
                            onClick={() => handleAddArrayItem("skills", { name: "", type: "TECHNICAL", proficiencyLevel: "" })}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <FaPlus className="w-4 h-4" />
                            Add Skill
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-6 border-l-4 border-gray-300">
                      {isEditMode && editingSections.skills ? (
                        <div className="space-y-4">
                          <Typography variant="small" className="text-gray-500 italic font-medium text-sm mb-4" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                            No skills added yet. Click the button below to add your first skill.
                          </Typography>
                          <Button
                            variant="outlined"
                            size="md"
                            color="red"
                            onClick={() => handleAddArrayItem("skills", { name: "", type: "TECHNICAL", proficiencyLevel: "" })}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <FaPlus className="w-4 h-4" />
                            Add Skill
                          </Button>
                        </div>
                      ) : (
                        <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                          You haven't filled up details in this section.
                        </Typography>
                      )}
                    </div>
                  )}
                  {isEditMode && editingSections.skills && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="gradient"
                        color="red"
                        size="md"
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

                {/* Certificates */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                      Certificates
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton 
                        size="md" 
                        variant="text" 
                        onClick={() => handleSectionEditToggle("certificates")}
                        className="text-red-600"
                      >
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  {isEditMode && editingSections.certificates ? (
                    <>
                      {isAddingCertificate && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                          <Typography variant="h6" className="text-gray-800 font-semibold mb-4" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                            {editingCertificateId ? "Edit Certificate" : "Add New Certificate"}
                          </Typography>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Typography variant="small" className="mb-2 text-gray-700 font-medium text-xs uppercase" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                Course Name *
                              </Typography>
                              <Input
                                size="lg"
                                name="courseName"
                                value={newCertificate.courseName}
                                onChange={handleCertificateInputChange}
                                placeholder="Enter course name"
                                required
                                className="!border-gray-300 focus:!border-red-500"
                              />
                            </div>
                            <div>
                              <Typography variant="small" className="mb-2 text-gray-700 font-medium text-xs uppercase" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                Certificate Number *
                              </Typography>
                              <Input
                                size="lg"
                                name="certificateNumber"
                                value={newCertificate.certificateNumber}
                                onChange={handleCertificateInputChange}
                                placeholder="Enter certificate number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                required
                                className={`!border-gray-300 focus:!border-red-500 ${fieldErrors.certificateNumber ? "!border-red-500" : ""}`}
                              />
                              {fieldErrors.certificateNumber && (
                                <Typography variant="small" color="red" className="mt-1">
                                  {fieldErrors.certificateNumber}
                                </Typography>
                              )}
                            </div>
                          </div>
                          <div className="mt-4">
                            <Typography variant="small" className="mb-2 text-gray-700 font-medium text-xs uppercase" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                              Issue Date *
                            </Typography>
                            <Input
                              type="date"
                              size="lg"
                              name="issueDate"
                              value={newCertificate.issueDate}
                              onChange={handleCertificateInputChange}
                              onBlur={handleCertificateInputBlur}
                              max={(() => {
                                const today = new Date()
                                return today.toISOString().split('T')[0]
                              })()}
                              required
                              className="!border-gray-300 focus:!border-red-500"
                            />
                            {certificateSubmitAttempted && !newCertificate.issueDate && (
                              <Typography variant="small" color="red" className="mt-1">
                                Please fill in the issue date.
                              </Typography>
                            )}
                            {newCertificate.issueDate && (() => {
                              const today = new Date().toISOString().split('T')[0]
                              return newCertificate.issueDate > today
                            })() && (
                              <Typography variant="small" color="red" className="mt-1">
                                Issue Date cannot be a future date.
                              </Typography>
                            )}
                          </div>
                          <div className="mt-4">
                            <Typography variant="small" className="mb-2 text-gray-700 font-medium text-xs uppercase" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                              Certificate File (Optional)
                            </Typography>
                            <div className="flex items-center gap-4">
                              {newCertificate.certificateFile ? (
                                <Avatar
                                  src={URL.createObjectURL(newCertificate.certificateFile)}
                                  alt="Certificate Preview"
                                  size="lg"
                                  className="ring-2 ring-red-300"
                                />
                              ) : editingCertificateId ? (
                                <Avatar
                                  src={certificates.find((cert) => cert.id === editingCertificateId)?.certificateFilePath || "/placeholder.svg"}
                                  alt="Certificate Preview"
                                  size="lg"
                                  className="ring-2 ring-red-300"
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
                                color="red"
                                onClick={handleCertificateImageClick}
                                className="flex items-center gap-2"
                              >
                                <FaPlus className="w-4 h-4" />
                                Choose File
                              </Button>
                              <input
                                type="file"
                                id="certificateFile"
                                accept="image/*,application/pdf"
                                onChange={handleCertificateFileChange}
                                ref={certificateFileInputRef}
                                className="hidden"
                              />
                            </div>
                          </div>
                          <div className="mt-6 flex justify-end gap-2">
                            <Button
                              variant="gradient"
                              color="red"
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

                      <div className="space-y-4">
                        {!isAddingCertificate && (
                          <Button
                            variant="outlined"
                            color="red"
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {certificates.map((certificate) => (
                              <Card key={certificate.id} className="p-4 bg-white rounded-lg border-2 border-gray-300">
                                <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                  <div className="flex items-center gap-4">
                                    {(certificate.preview || certificate.certificateFilePath) && (
                                      <Avatar
                                        src={certificate.preview || certificate.certificateFilePath || "/placeholder.svg"}
                                        alt="Certificate Preview"
                                        size="lg"
                                        className="ring-2 ring-red-300"
                                      />
                                    )}
                                    <div>
                                      <Typography variant="h6" className="font-bold text-black text-base" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                        {certificate.courseName}
                                      </Typography>
                                      <Typography variant="small" className="text-gray-600 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                        Certificate #: {certificate.certificateNumber}
                                      </Typography>
                                      <Typography variant="small" className="text-gray-600 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                        Issued: {certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : "N/A"}
                                      </Typography>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="md"
                                      variant="text"
                                      color="red"
                                      onClick={() => handleEditCertificate(certificate)}
                                      className="flex items-center gap-1"
                                    >
                                      <FaPen className="w-4 h-4" /> Edit
                                    </Button>
                                    <Button
                                      size="md"
                                      variant="text"
                                      color="red"
                                      onClick={() => handleRemoveCertificate(certificate.id)}
                                      className="flex items-center gap-1"
                                    >
                                      <FaTrash className="w-4 h-4" /> Remove
                                    </Button>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                        )}

                        <div className="mt-6 flex justify-end">
                          <Button
                            variant="gradient"
                            color="red"
                            onClick={() => handleSaveSection("certificates")}
                            disabled={isSaving}
                            className="flex items-center gap-2"
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
                        </div>
                      </div>
                    </>
                  ) : ((certificates && certificates.length > 0) || portfolio?.primaryCourseType === "Automotive and Land Transportation") ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(showAllCertificates ? certificates : certificates.slice(0, INITIAL_ITEMS_LIMIT)).map((certificate, index) => (
                        <div key={index} className="pb-3 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            {(certificate.preview || certificate.certificateFilePath) && (
                              <Avatar
                                src={certificate.preview || certificate.certificateFilePath || "/placeholder.svg"}
                                alt="Certificate Preview"
                                size="md"
                                className="ring-2 ring-red-300 flex-shrink-0"
                              />
                            )}
                            <div className="flex-grow min-w-0">
                              <Typography variant="h6" className="font-bold text-black mb-1 text-base" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                {certificate.courseName}
                              </Typography>
                              {certificate.certificateNumber && (
                                <Typography variant="small" className="text-black font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                  #{certificate.certificateNumber}
                                </Typography>
                              )}
                              {certificate.issueDate && (
                                <Typography variant="small" className="text-gray-600 text-sm mt-1" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                  {new Date(certificate.issueDate).toLocaleDateString()}
                                </Typography>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {certificates.length > INITIAL_ITEMS_LIMIT && (
                        <div className="flex justify-left pt-2">
                          <Button
                            variant="text"
                            size="md"
                            onClick={() => setShowAllCertificates(!showAllCertificates)}
                            className="text-black font-medium hover:text-red-600"
                            style={{ fontFamily: "'Open Sauce', sans-serif" }}
                          >
                            {showAllCertificates ? "Show Less" : `Show All (${certificates.length})`}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-6 border-l-4 border-gray-300">
                      <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                        You haven't filled up details in this section.
                      </Typography>
                    </div>
                  )}
                </div>

                {/* Experience */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                      Experience
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton 
                        size="md" 
                        variant="text" 
                        onClick={() => handleSectionEditToggle("experience")}
                        className="text-red-600"
                      >
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  {((portfolio?.experiences && portfolio.experiences.length > 0) || (isEditMode && editingSections.experience)) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(isEditMode && editingSections.experience ? (editingPortfolio?.experiences || []) : (portfolio?.experiences || []))
                        .slice(0, isEditMode && editingSections.experience ? undefined : (showAllExperiences ? undefined : INITIAL_ITEMS_LIMIT))
                        .map((exp, index) => (
                        <div key={index} className="pb-3 border-b border-gray-200">
                          {isEditMode && editingSections.experience ? (
                            <div className="space-y-3">
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Job Title *
                                </Typography>
                              <Input
                                size="md"
                                value={exp.jobTitle || ""}
                                onChange={(e) => handleArrayFieldChange("experiences", index, "jobTitle", e.target.value)}
                                  placeholder="e.g. Barista"
                                required
                                className="!border-gray-300"
                              />
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Company *
                                </Typography>
                              <Input
                                size="md"
                                value={exp.company || ""}
                                onChange={(e) => handleArrayFieldChange("experiences", index, "company", e.target.value)}
                                  placeholder="e.g. Brewed Cafe"
                                required
                                className="!border-gray-300"
                              />
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Start Date *
                                </Typography>
                              <Input
                                  type="date"
                                size="md"
                                  value={exp.startDate || ""}
                                  onChange={(e) => handleArrayFieldChange("experiences", index, "startDate", e.target.value)}
                                  onBlur={(e) => handleArrayFieldBlur("experiences", index, "startDate", e.target.value)}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                required
                                className="!border-gray-300"
                              />
                                {exp.startDate && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return exp.startDate > today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    Start Date cannot be a future date.
                                  </Typography>
                                )}
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  End Date *
                                </Typography>
                                <Input
                                  type="date"
                                  size="md"
                                  value={exp.endDate || ""}
                                  onChange={(e) => handleArrayFieldChange("experiences", index, "endDate", e.target.value)}
                                  onBlur={(e) => handleArrayFieldBlur("experiences", index, "endDate", e.target.value)}
                                  min={exp.startDate || undefined}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                  required
                                  className="!border-gray-300"
                                />
                                {exp.startDate && exp.endDate && exp.endDate < exp.startDate && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    End Date cannot be before Start Date.
                                  </Typography>
                                )}
                                {exp.endDate && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return exp.endDate > today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    End Date cannot be a future date.
                                  </Typography>
                                )}
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Responsibilities
                                </Typography>
                                <Textarea
                                  size="md"
                                  value={exp.responsibilities || ""}
                                  onChange={(e) => handleArrayFieldChange("experiences", index, "responsibilities", e.target.value)}
                                  placeholder="Summarize major contributions"
                                  className="!border-gray-300"
                                  rows={3}
                                  maxLength={300}
                                />
                                <div className="flex justify-between items-center mt-1">
                                  <Typography variant="small" className="text-gray-500">
                                    {(exp.responsibilities || "").length}/300 characters
                                  </Typography>
                                  {(exp.responsibilities || "").length > 300 && (
                                    <Typography variant="small" color="red">
                                      Responsibilities cannot exceed 300 characters.
                                    </Typography>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <IconButton
                                  size="md"
                                  variant="text"
                                  color="red"
                                  onClick={() => handleRemoveArrayItem("experiences", index)}
                                >
                                  <FaTrash className="w-3 h-3" />
                                </IconButton>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Typography variant="h6" className="font-bold text-black mb-1 text-lg" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                {exp.jobTitle}
                              </Typography>
                              {exp.company && (
                                <Typography variant="small" className="text-black font-medium mb-1 text-base" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 500 }}>
                                  {exp.company}
                                </Typography>
                              )}
                              {(exp.startDate || exp.endDate) && (
                                <Typography variant="small" className="text-gray-600 text-sm mb-2" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                  {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : "N/A"} -{" "}
                                  {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "N/A"}
                                </Typography>
                              )}
                              {exp.responsibilities && (
                                <Typography
                                  variant="small"
                                  className="text-black leading-relaxed text-base"
                                  style={{ fontFamily: "'Open Sauce', sans-serif", lineHeight: "1.7", fontWeight: 400 }}
                                >
                                  {exp.responsibilities}
                                </Typography>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                      {isEditMode && editingSections.experience && (
                        <div className="md:col-span-2">
                          <Button
                            variant="outlined"
                            size="md"
                            color="red"
                            onClick={() => handleAddArrayItem("experiences", { jobTitle: "", company: "", startDate: "", endDate: "", responsibilities: "" })}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <FaPlus className="w-4 h-4" />
                            Add Experience
                          </Button>
                        </div>
                      )}
                      {!isEditMode && portfolio?.experiences && portfolio.experiences.length > INITIAL_ITEMS_LIMIT && (
                        <div className="flex justify-left pt-2 md:col-span-2">
                          <Button
                            variant="text"
                            size="md"
                            onClick={() => setShowAllExperiences(!showAllExperiences)}
                            className="text-black font-medium hover:text-red-600"
                            style={{ fontFamily: "'Open Sauce', sans-serif" }}
                          >
                            {showAllExperiences ? "Show Less" : `Show All (${portfolio.experiences.length})`}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-6 border-l-4 border-gray-300">
                      {isEditMode && editingSections.experience ? (
                        <div className="space-y-4">
                          <Typography variant="small" className="text-gray-500 italic font-medium text-sm mb-4" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                            {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No experience added yet"}. Click the button below to add your first experience.
                          </Typography>
                          <Button
                            variant="outlined"
                            size="md"
                            color="red"
                            onClick={() => handleAddArrayItem("experiences", { jobTitle: "", company: "", startDate: "", endDate: "", responsibilities: "" })}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <FaPlus className="w-4 h-4" />
                            Add Experience
                          </Button>
                        </div>
                      ) : (
                        <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                          You haven't filled up details in this section.
                        </Typography>
                      )}
                    </div>
                  )}
                  {isEditMode && editingSections.experience && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="gradient"
                        color="red"
                        size="md"
                        onClick={() => handleSaveSection("experience")}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <FaSave className="w-3 h-3" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                      Projects
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton 
                        size="md" 
                        variant="text" 
                        onClick={() => handleSectionEditToggle("projects")}
                        className="text-red-600"
                      >
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  {isEditMode && editingSections.projects ? (
                    <div className="space-y-4">
                      {isAddingProject && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                          <Typography variant="h6" className="text-gray-800 font-semibold mb-4" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                            {editingProjectId ? "Edit Project" : "Add New Project"}
                          </Typography>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Typography variant="small" className="mb-2 text-gray-700 font-medium text-xs uppercase" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                Project Title *
                              </Typography>
                              <Input
                                size="lg"
                                name="title"
                                value={newProject.title}
                                onChange={handleProjectInputChange}
                                placeholder="Enter project title"
                                required
                                className="!border-gray-300 focus:!border-red-500"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <Typography variant="small" className="mb-2 text-gray-700 font-medium text-xs uppercase" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                              Description (Optional)
                            </Typography>
                            <Textarea
                              size="lg"
                              name="description"
                              value={newProject.description}
                              onChange={handleProjectInputChange}
                              placeholder="Describe your project"
                              className="!border-gray-300 focus:!border-red-500"
                              rows={3}
                              maxLength={300}
                            />
                            <div className="flex justify-between items-center mt-1">
                              <Typography variant="small" className="text-gray-500">
                                {newProject.description.length}/300 characters
                              </Typography>
                              {newProject.description.length > 300 && (
                                <Typography variant="small" color="red">
                                  Description cannot exceed 300 characters.
                                </Typography>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <Typography variant="small" className="mb-2 text-gray-700 font-medium text-xs uppercase" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                Start Date *
                              </Typography>
                              <Input
                                type="date"
                                size="lg"
                                name="startDate"
                                value={newProject.startDate}
                                onChange={handleProjectInputChange}
                                onBlur={handleProjectInputBlur}
                                max={(() => {
                                  const today = new Date()
                                  return today.toISOString().split('T')[0]
                                })()}
                                required
                                className="!border-gray-300 focus:!border-red-500"
                              />
                              {projectSubmitAttempted && !newProject.startDate && (
                                <Typography variant="small" color="red" className="mt-1">
                                  Please fill in the start date.
                                </Typography>
                              )}
                              {newProject.startDate && (() => {
                                const today = new Date().toISOString().split('T')[0]
                                return newProject.startDate > today
                              })() && (
                                <Typography variant="small" color="red" className="mt-1">
                                  Start Date cannot be a future date.
                                </Typography>
                              )}
                            </div>
                            <div>
                              <Typography variant="small" className="mb-2 text-gray-700 font-medium text-xs uppercase" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                End Date *
                              </Typography>
                              <Input
                                type="date"
                                size="lg"
                                name="endDate"
                                value={newProject.endDate}
                                onChange={handleProjectInputChange}
                                onBlur={handleProjectInputBlur}
                                min={newProject.startDate || undefined}
                                max={(() => {
                                  const yesterday = new Date()
                                  yesterday.setDate(yesterday.getDate() - 1)
                                  return yesterday.toISOString().split('T')[0]
                                })()}
                                required
                                className="!border-gray-300 focus:!border-red-500"
                              />
                              {projectSubmitAttempted && !newProject.endDate && (
                                <Typography variant="small" color="red" className="mt-1">
                                  Please fill in the end date.
                                </Typography>
                              )}
                              {newProject.startDate && newProject.endDate && newProject.endDate < newProject.startDate && (
                                <Typography variant="small" color="red" className="mt-1">
                                  End Date cannot be before Start Date.
                                </Typography>
                              )}
                              {newProject.endDate && (() => {
                                const today = new Date().toISOString().split('T')[0]
                                return newProject.endDate >= today
                              })() && (
                                <Typography variant="small" color="red" className="mt-1">
                                  End Date cannot be today or a future date.
                                </Typography>
                              )}
                            </div>
                          </div>
                          <div className="mt-4">
                            <Typography variant="small" className="mb-2 text-gray-700 font-medium text-xs uppercase" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                              Project Image (Optional)
                            </Typography>
                            <div className="flex items-center gap-4">
                              {newProject.projectImageFile ? (
                                <Avatar
                                  src={URL.createObjectURL(newProject.projectImageFile)}
                                  alt="Project Preview"
                                  size="lg"
                                  className="ring-2 ring-red-300"
                                />
                              ) : editingProjectId ? (
                                <Avatar
                                  src={projects.find((proj) => proj.id === editingProjectId)?.projectImageFilePath || "/placeholder.svg"}
                                  alt="Project Preview"
                                  size="lg"
                                  className="ring-2 ring-red-300"
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
                                color="red"
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
                              color="red"
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

                      {!isAddingProject && (
                        <Button
                          variant="outlined"
                          color="red"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {projects.map((project) => (
                            <Card key={project.id} className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
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
                                    <Typography variant="h6" className="font-bold text-black mb-2 text-lg break-words" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                      {project.title || "Unnamed Project"}
                                    </Typography>
                                    {project.description && (
                                      <Typography
                                        variant="small"
                                        className="text-black mb-3 leading-relaxed text-base break-words overflow-wrap-anywhere line-clamp-3"
                                        style={{ fontFamily: "'Open Sauce', sans-serif", lineHeight: "1.6", fontWeight: 400 }}
                                      >
                                        {project.description}
                                      </Typography>
                                    )}
                                    {project.startDate && project.endDate && (
                                      <Typography variant="small" className="text-gray-600 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                      </Typography>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      size="md"
                                      variant="text"
                                      color="red"
                                      onClick={() => handleEditProject(project)}
                                      className="flex items-center gap-1"
                                    >
                                      <FaPen className="w-4 h-4" /> Edit
                                    </Button>
                                    <Button
                                      size="md"
                                      variant="text"
                                      color="red"
                                      onClick={() => handleRemoveProject(project.id)}
                                      className="flex items-center gap-1"
                                    >
                                      <FaTrash className="w-4 h-4" /> Remove
                                    </Button>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 flex justify-end">
                        <Button
                          variant="gradient"
                          color="red"
                          onClick={() => handleSaveSection("projects")}
                          disabled={isSaving}
                          className="flex items-center gap-2"
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
                      </div>
                    </div>
                  ) : ((projects && projects.length > 0) || portfolio?.primaryCourseType === "Automotive and Land Transportation") ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(showAllProjects ? projects : projects.slice(0, INITIAL_ITEMS_LIMIT)).map((project, index) => (
                          <Card key={index} className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            {project.projectImageFilePath && (
                              <div className="relative h-48 overflow-hidden">
                                <img
                                  src={project.projectImageFilePath}
                                  alt={project.title || "Project"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <CardBody className="p-5">
                              <Typography variant="h6" className="font-bold text-black mb-2 text-lg" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                {project.title || "Unnamed Project"}
                              </Typography>
                              {project.description && (
                                <Typography
                                  variant="small"
                                  className="text-black mb-3 leading-relaxed text-base line-clamp-3"
                                  style={{ fontFamily: "'Open Sauce', sans-serif", lineHeight: "1.6", fontWeight: 400 }}
                                >
                                  {project.description}
                                </Typography>
                              )}
                              {project.startDate && project.endDate && (
                                <Typography variant="small" className="text-gray-600 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                </Typography>
                              )}
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                      {projects.length > INITIAL_ITEMS_LIMIT && (
                        <div className="flex justify-left pt-2">
                          <Button
                            variant="text"
                            size="md"
                            onClick={() => setShowAllProjects(!showAllProjects)}
                            className="text-black font-medium hover:text-red-600"
                            style={{ fontFamily: "'Open Sauce', sans-serif" }}
                          >
                            {showAllProjects ? "Show Less" : `Show All (${projects.length})`}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-6 border-l-4 border-gray-300">
                      <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                        You haven't filled up details in this section.
                      </Typography>
                    </div>
                  )}
                </div>

                {/* Awards & Recognition */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                      Awards & Recognition
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton 
                        size="md" 
                        variant="text" 
                        onClick={() => handleSectionEditToggle("awards")}
                        className="text-red-600"
                      >
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  {((portfolio?.awardsRecognitions && portfolio.awardsRecognitions.length > 0) || (isEditMode && editingSections.awards)) ? (
                    <div className="space-y-3">
                      {(isEditMode && editingSections.awards ? (editingPortfolio?.awardsRecognitions || []) : (portfolio?.awardsRecognitions || []))
                        .slice(0, isEditMode && editingSections.awards ? undefined : (showAllAwards ? undefined : INITIAL_ITEMS_LIMIT))
                        .map((award, index) => (
                        <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
                          {isEditMode && editingSections.awards ? (
                            <div className="space-y-3">
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Award Title *
                                </Typography>
                              <Input
                                size="md"
                                value={award.title || ""}
                                onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "title", e.target.value)}
                                  placeholder="e.g. Employee of the Month"
                                required
                                className="!border-gray-300"
                              />
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Issuer
                                </Typography>
                              <Input
                                size="md"
                                value={award.issuer || ""}
                                onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "issuer", e.target.value)}
                                  placeholder="e.g. Cafe Royale"
                                className="!border-gray-300"
                              />
                              </div>
                              <div>
                                <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                  Date Received *
                                </Typography>
                              <Input
                                type="date"
                                size="md"
                                value={award.dateReceived || ""}
                                onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "dateReceived", e.target.value)}
                                onBlur={(e) => handleArrayFieldBlur("awardsRecognitions", index, "dateReceived", e.target.value)}
                                max={(() => {
                                  const today = new Date()
                                  return today.toISOString().split('T')[0]
                                })()}
                                required
                                className="!border-gray-300"
                              />
                                {award.dateReceived && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return award.dateReceived > today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    Date Received cannot be a future date.
                                  </Typography>
                                )}
                              </div>
                              <div className="flex justify-end">
                                <IconButton
                                  size="md"
                                  variant="text"
                                  color="red"
                                  onClick={() => handleRemoveArrayItem("awardsRecognitions", index)}
                                >
                                  <FaTrash className="w-3 h-3" />
                                </IconButton>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Typography variant="h6" className="font-bold text-black mb-1 text-base" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                {award.title}
                              </Typography>
                              {award.issuer && (
                                <Typography variant="small" className="text-black font-medium mb-1 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                  {award.issuer}
                                </Typography>
                              )}
                              {award.dateReceived && (
                                <Typography variant="small" className="text-gray-600 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                  {award.dateReceived}
                                </Typography>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                      {isEditMode && editingSections.awards && (
                        <div className="pt-2">
                          <Button
                            variant="outlined"
                            size="md"
                            color="red"
                            onClick={() => handleAddArrayItem("awardsRecognitions", { title: "", issuer: "", dateReceived: "" })}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <FaPlus className="w-4 h-4" />
                            Add Award
                          </Button>
                        </div>
                      )}
                      {!isEditMode && portfolio?.awardsRecognitions && portfolio.awardsRecognitions.length > INITIAL_ITEMS_LIMIT && (
                        <div className="flex justify-left pt-2">
                          <Button
                            variant="text"
                            size="md"
                            onClick={() => setShowAllAwards(!showAllAwards)}
                            className="text-black font-medium hover:text-red-600"
                            style={{ fontFamily: "'Open Sauce', sans-serif" }}
                          >
                            {showAllAwards ? "Show Less" : `Show All (${portfolio.awardsRecognitions.length})`}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-6 border-l-4 border-gray-300">
                      {isEditMode && editingSections.awards ? (
                        <div className="space-y-4">
                          <Typography variant="small" className="text-gray-500 italic font-medium text-sm mb-4" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                            No awards added yet. Click the button below to add your first award.
                          </Typography>
                          <Button
                            variant="outlined"
                            size="md"
                            color="red"
                            onClick={() => handleAddArrayItem("awardsRecognitions", { title: "", issuer: "", dateReceived: "" })}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <FaPlus className="w-4 h-4" />
                            Add Award
                          </Button>
                        </div>
                      ) : (
                        <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                          You haven't filled up details in this section.
                        </Typography>
                      )}
                    </div>
                  )}
                  {isEditMode && editingSections.awards && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="gradient"
                        color="red"
                        size="md"
                        onClick={() => handleSaveSection("awards")}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <FaSave className="w-3 h-3" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Education & Memberships */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Continuing Education */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                        Continuing Education
                      </Typography>
                      {isGraduateView && isEditMode && (
                        <IconButton 
                          size="md" 
                          variant="text" 
                          onClick={() => handleSectionEditToggle("education")}
                          className="text-red-600"
                        >
                          <FaPen className="w-4 h-4" />
                        </IconButton>
                      )}
                    </div>
                    {((portfolio?.continuingEducations && portfolio.continuingEducations.length > 0) || (isEditMode && editingSections.education)) ? (
                      <div className="space-y-3">
                        {(isEditMode && editingSections.education ? (editingPortfolio?.continuingEducations || []) : (portfolio?.continuingEducations || []))
                          .slice(0, isEditMode && editingSections.education ? undefined : (showAllEducation ? undefined : INITIAL_ITEMS_LIMIT))
                          .map((edu, index) => (
                          <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
                            {isEditMode && editingSections.education ? (
                              <div className="space-y-3">
                                <div>
                                  <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                    Course Name *
                                  </Typography>
                                <Input
                                  size="md"
                                  value={edu.courseName || ""}
                                  onChange={(e) => handleArrayFieldChange("continuingEducations", index, "courseName", e.target.value)}
                                    placeholder="e.g. Wine Appreciation"
                                  required
                                  className="!border-gray-300"
                                />
                                </div>
                                <div>
                                  <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                    Institution
                                  </Typography>
                                <Input
                                  size="md"
                                  value={edu.institution || ""}
                                  onChange={(e) => handleArrayFieldChange("continuingEducations", index, "institution", e.target.value)}
                                    placeholder="e.g. TESDA Training Center"
                                  className="!border-gray-300"
                                />
                                </div>
                                <div>
                                  <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                    Completion Date *
                                  </Typography>
                                <Input
                                  type="date"
                                  size="md"
                                  value={edu.completionDate || ""}
                                  onChange={(e) => handleArrayFieldChange("continuingEducations", index, "completionDate", e.target.value)}
                                  onBlur={(e) => handleArrayFieldBlur("continuingEducations", index, "completionDate", e.target.value)}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                  required
                                  className="!border-gray-300"
                                />
                                  {edu.completionDate && (() => {
                                    const today = new Date().toISOString().split('T')[0]
                                    return edu.completionDate > today
                                  })() && (
                                    <Typography variant="small" color="red" className="mt-1">
                                      Completion Date cannot be a future date.
                                    </Typography>
                                  )}
                                </div>
                                <div className="flex justify-end">
                                  <IconButton
                                    size="md"
                                    variant="text"
                                    color="red"
                                    onClick={() => handleRemoveArrayItem("continuingEducations", index)}
                                  >
                                    <FaTrash className="w-3 h-3" />
                                  </IconButton>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Typography variant="small" className="font-bold text-black mb-1 text-base" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                  {edu.courseName}
                                </Typography>
                                {edu.institution && (
                                  <Typography variant="small" className="text-black font-medium mb-1 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                    {edu.institution}
                                  </Typography>
                                )}
                                {edu.completionDate && (
                                  <Typography variant="small" className="text-gray-600 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                    {edu.completionDate}
                                  </Typography>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                        {isEditMode && editingSections.education && (
                          <div className="pt-2">
                            <Button
                              variant="outlined"
                              size="md"
                              color="red"
                              onClick={() => handleAddArrayItem("continuingEducations", { courseName: "", institution: "", completionDate: "" })}
                              className="w-full flex items-center justify-center gap-2"
                            >
                              <FaPlus className="w-4 h-4" />
                              Add Education
                            </Button>
                          </div>
                        )}
                        {!isEditMode && portfolio?.continuingEducations && portfolio.continuingEducations.length > INITIAL_ITEMS_LIMIT && (
                          <div className="flex justify-left pt-2">
                            <Button
                              variant="text"
                              size="md"
                              onClick={() => setShowAllEducation(!showAllEducation)}
                              className="text-black font-medium hover:text-red-600 text-xs"
                              style={{ fontFamily: "'Open Sauce', sans-serif" }}
                            >
                              {showAllEducation ? "Show Less" : `Show All (${portfolio.continuingEducations.length})`}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white p-6 border-l-4 border-gray-300">
                        {isEditMode && editingSections.education ? (
                          <div className="space-y-4">
                            <Typography variant="small" className="text-gray-500 italic font-medium text-sm mb-4" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                              {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No continuing education added yet"}. Click the button below to add your first education.
                            </Typography>
                            <Button
                              variant="outlined"
                              size="md"
                              color="red"
                              onClick={() => handleAddArrayItem("continuingEducations", { courseName: "", institution: "", completionDate: "" })}
                              className="w-full flex items-center justify-center gap-2"
                            >
                              <FaPlus className="w-4 h-4" />
                              Add Education
                            </Button>
                          </div>
                        ) : (
                          <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                            You haven't filled up details in this section.
                          </Typography>
                        )}
                      </div>
                    )}
                    {isEditMode && editingSections.education && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="gradient"
                          color="red"
                          size="md"
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

                  {/* Professional Memberships */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                        Professional Memberships
                      </Typography>
                      {isGraduateView && isEditMode && (
                        <IconButton 
                          size="md" 
                          variant="text" 
                          onClick={() => handleSectionEditToggle("memberships")}
                          className="text-red-600"
                        >
                          <FaPen className="w-4 h-4" />
                        </IconButton>
                      )}
                    </div>
                    {((portfolio?.professionalMemberships && portfolio.professionalMemberships.length > 0) || (isEditMode && editingSections.memberships)) ? (
                      <div className="space-y-3">
                        {(isEditMode && editingSections.memberships ? (editingPortfolio?.professionalMemberships || []) : (portfolio?.professionalMemberships || []))
                          .slice(0, isEditMode && editingSections.memberships ? undefined : (showAllMemberships ? undefined : INITIAL_ITEMS_LIMIT))
                          .map((mem, index) => (
                          <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
                            {isEditMode && editingSections.memberships ? (
                              <div className="space-y-3">
                                <div>
                                  <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                    Organization *
                                  </Typography>
                                <Input
                                  size="md"
                                  value={mem.organization || ""}
                                  onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "organization", e.target.value)}
                                    placeholder="e.g. National Barista Guild"
                                  required
                                  className="!border-gray-300"
                                />
                                </div>
                                <div>
                                  <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                    Membership Type
                                  </Typography>
                                <Input
                                  size="md"
                                  value={mem.membershipType || ""}
                                  onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "membershipType", e.target.value)}
                                    placeholder="e.g. Member / Officer"
                                  className="!border-gray-300"
                                />
                                </div>
                                <div>
                                  <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                    Start Date *
                                  </Typography>
                                <Input
                                  type="date"
                                  size="md"
                                  value={mem.startDate || ""}
                                  onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "startDate", e.target.value)}
                                  onBlur={(e) => handleArrayFieldBlur("professionalMemberships", index, "startDate", e.target.value)}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                  required
                                  className="!border-gray-300"
                                />
                                  {mem.startDate && (() => {
                                    const today = new Date().toISOString().split('T')[0]
                                    return mem.startDate > today
                                  })() && (
                                    <Typography variant="small" color="red" className="mt-1">
                                      Start Date cannot be a future date.
                                    </Typography>
                                  )}
                                </div>
                                <div className="flex justify-end">
                                  <IconButton
                                    size="md"
                                    variant="text"
                                    color="red"
                                    onClick={() => handleRemoveArrayItem("professionalMemberships", index)}
                                  >
                                    <FaTrash className="w-3 h-3" />
                                  </IconButton>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Typography variant="small" className="font-bold text-black mb-1 text-base" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                  {mem.organization}
                                </Typography>
                                {mem.membershipType && (
                                  <Typography variant="small" className="text-black font-medium mb-1 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                    {mem.membershipType}
                                  </Typography>
                                )}
                                {mem.startDate && (
                                  <Typography variant="small" className="text-gray-600 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                    Since {mem.startDate}
                                  </Typography>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                        {isEditMode && editingSections.memberships && (
                          <div className="pt-2">
                            <Button
                              variant="outlined"
                              size="md"
                              color="red"
                              onClick={() => handleAddArrayItem("professionalMemberships", { organization: "", membershipType: "", startDate: "" })}
                              className="w-full flex items-center justify-center gap-2"
                            >
                              <FaPlus className="w-4 h-4" />
                              Add Membership
                            </Button>
                          </div>
                        )}
                        {!isEditMode && portfolio?.professionalMemberships && portfolio.professionalMemberships.length > INITIAL_ITEMS_LIMIT && (
                          <div className="flex justify-left pt-2">
                            <Button
                              variant="text"
                              size="md"
                              onClick={() => setShowAllMemberships(!showAllMemberships)}
                              className="text-black font-medium hover:text-red-600 text-xs"
                              style={{ fontFamily: "'Open Sauce', sans-serif" }}
                            >
                              {showAllMemberships ? "Show Less" : `Show All (${portfolio.professionalMemberships.length})`}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white p-6 border-l-4 border-gray-300">
                        {isEditMode && editingSections.memberships ? (
                          <div className="space-y-4">
                            <Typography variant="small" className="text-gray-500 italic font-medium text-sm mb-4" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                              {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No professional memberships added yet"}. Click the button below to add your first membership.
                            </Typography>
                            <Button
                              variant="outlined"
                              size="md"
                              color="red"
                              onClick={() => handleAddArrayItem("professionalMemberships", { organization: "", membershipType: "", startDate: "" })}
                              className="w-full flex items-center justify-center gap-2"
                            >
                              <FaPlus className="w-4 h-4" />
                              Add Membership
                            </Button>
                          </div>
                        ) : (
                          <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                            You haven't filled up details in this section.
                          </Typography>
                        )}
                      </div>
                    )}
                    {isEditMode && editingSections.memberships && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="gradient"
                          color="red"
                          size="md"
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
                </div>

                {/* References */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                      References
                    </Typography>
                    {isGraduateView && isEditMode && (
                      <IconButton 
                        size="md" 
                        variant="text" 
                        onClick={() => handleSectionEditToggle("references")}
                        className="text-red-600"
                      >
                        <FaPen className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  {((portfolio?.references && portfolio.references.length > 0) || (isEditMode && editingSections.references)) ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {(isEditMode && editingSections.references ? (editingPortfolio?.references || []) : (portfolio?.references || []))
                          .slice(0, isEditMode && editingSections.references ? undefined : (showAllReferences ? undefined : INITIAL_ITEMS_LIMIT))
                          .map((ref, index) => (
                          <div key={index} className="bg-white border-l-4 border-gray-300 p-5">
                            {isEditMode && editingSections.references ? (
                              <div className="space-y-3">
                                <div>
                                  <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                    Name *
                                  </Typography>
                                <Input
                                  size="md"
                                  value={ref.name || ""}
                                  onChange={(e) => handleArrayFieldChange("references", index, "name", e.target.value)}
                                    placeholder="e.g. Juan Dela Cruz"
                                  required
                                  className="!border-gray-300"
                                />
                                </div>
                                <div>
                                  <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                    Position / Relationship
                                  </Typography>
                                <Input
                                  size="md"
                                  value={ref.position || ""}
                                  onChange={(e) => handleArrayFieldChange("references", index, "position", e.target.value)}
                                    placeholder="e.g. Training Supervisor"
                                  className="!border-gray-300"
                                />
                                </div>
                                <div>
                                  <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                    Company
                                  </Typography>
                                <Input
                                  size="md"
                                  value={ref.company || ""}
                                  onChange={(e) => handleArrayFieldChange("references", index, "company", e.target.value)}
                                    placeholder="e.g. Cafe Delight"
                                  className="!border-gray-300"
                                />
                                </div>
                                <div>
                                  <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                    Email *
                                  </Typography>
                                  <Input
                                    type="email"
                                    size="md"
                                    value={ref.email || ""}
                                    onChange={(e) => handleArrayFieldChange("references", index, "email", e.target.value)}
                                    placeholder="name@gmail.com"
                                    required
                                    className={`!border-gray-300 ${fieldErrors[`referenceEmail_${index}`] ? "!border-red-500" : ""}`}
                                  />
                                  {fieldErrors[`referenceEmail_${index}`] && (
                                    <Typography variant="small" color="red" className="mt-1">
                                      {fieldErrors[`referenceEmail_${index}`]}
                                    </Typography>
                                  )}
                                </div>
                                <div>
                                  <Typography variant="small" className="text-black font-semibold mb-1 text-xs uppercase tracking-wide">
                                    Contact Number *
                                  </Typography>
                                  <Input
                                    type="tel"
                                    size="md"
                                    value={ref.contact || ""}
                                    onChange={(e) => handleArrayFieldChange("references", index, "contact", e.target.value)}
                                    placeholder="Phone number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={11}
                                    required
                                    className={`!border-gray-300 ${fieldErrors[`referencePhone_${index}`] ? "!border-red-500" : ""}`}
                                  />
                                  {fieldErrors[`referencePhone_${index}`] && (
                                    <Typography variant="small" color="red" className="mt-1">
                                      {fieldErrors[`referencePhone_${index}`]}
                                    </Typography>
                                  )}
                                </div>
                                <div className="flex justify-end">
                                  <IconButton
                                    size="md"
                                    variant="text"
                                    color="red"
                                    onClick={() => handleRemoveArrayItem("references", index)}
                                  >
                                    <FaTrash className="w-3 h-3" />
                                  </IconButton>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Typography variant="h6" className="font-bold text-black mb-2 text-base" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                  {ref.name}
                                </Typography>
                                {ref.position && (
                                  <Typography variant="small" className="text-black font-medium mb-1 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                    {ref.position}
                                  </Typography>
                                )}
                                {ref.company && (
                                  <Typography variant="small" className="text-black mb-3 font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 500 }}>
                                    {ref.company}
                                  </Typography>
                                )}
                                <div className="space-y-1 pt-2 border-t border-gray-200">
                                  {ref.email && (
                                    <Typography variant="small" className="text-black break-all text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                      {ref.email}
                                    </Typography>
                                  )}
                                  {ref.contact && (
                                    <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                      {ref.contact}
                                    </Typography>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      {isEditMode && editingSections.references && (
                        <div className="pt-2">
                          <Button
                            variant="outlined"
                            size="md"
                            color="red"
                            onClick={() => handleAddArrayItem("references", { name: "", relationship: "", company: "", email: "", phone: "" })}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <FaPlus className="w-4 h-4" />
                            Add Reference
                          </Button>
                        </div>
                      )}
                      {!isEditMode && portfolio?.references && portfolio.references.length > INITIAL_ITEMS_LIMIT && (
                        <div className="flex justify-left pt-2">
                          <Button
                            variant="text"
                            size="md"
                            onClick={() => setShowAllReferences(!showAllReferences)}
                            className="text-black font-medium hover:text-red-600"
                            style={{ fontFamily: "'Open Sauce', sans-serif" }}
                          >
                            {showAllReferences ? "Show Less" : `Show All (${portfolio.references.length})`}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-6 border-l-4 border-gray-300">
                      {isEditMode && editingSections.references ? (
                        <div className="space-y-4">
                          <Typography variant="small" className="text-gray-500 italic font-medium text-sm mb-4" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                            {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No references added yet"}. Click the button below to add your first reference.
                          </Typography>
                          <Button
                            variant="outlined"
                            size="md"
                            color="red"
                            onClick={() => handleAddArrayItem("references", { name: "", relationship: "", company: "", email: "", phone: "" })}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <FaPlus className="w-4 h-4" />
                            Add Reference
                          </Button>
                        </div>
                      ) : (
                        <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                          You haven't filled up details in this section.
                        </Typography>
                      )}
                    </div>
                  )}
                  {isEditMode && editingSections.references && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="gradient"
                        color="red"
                        size="md"
                        onClick={() => handleSaveSection("references")}
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
            </div>
          </div>
        ) : (
          <Fragment>
            {/* Standard Header Section for other templates */}
            <div className={`${designTheme.headerBg} text-white relative overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>
        {/* Edit Button - Top Right (not affected by animation) */}
        {isGraduateView && isEditMode && (
          <div className="absolute top-4 right-4 z-10">
            <IconButton
              size="md"
              variant="text"
              className={`text-white hover:bg-white/20 ${editingSections.header ? "bg-white/10" : ""}`}
              onClick={() => handleSectionEditToggle("header")}
            >
              <FaPen className="w-4 h-4" />
            </IconButton>
          </div>
        )}
        <div className="px-6 py-8 relative">
          {/* Back Button - Visible only in public view */}
          
          <div className="flex flex-row items-center w-full gap-16">
            {/* Profile Image */}
            {(graduate?.profilePicture || portfolio?.avatar || isEditMode) && (
              <div className="relative flex-shrink-0 animate-fade-in-up mr-8">
                <div className="absolute inset-0 bg-white/20 blur-xl scale-110 animate-pulse"></div>
                <div className={`absolute inset-0 blur-2xl scale-125 animate-ping opacity-20 ${
                  designTheme.accentColor === "amber" ? "bg-amber-300/30" :
                  designTheme.accentColor === "red" ? "bg-red-300/30" :
                  designTheme.accentColor === "blue" ? "bg-blue-300/30" :
                  designTheme.accentColor === "green" ? "bg-green-300/30" :
                  designTheme.accentColor === "purple" ? "bg-purple-300/30" :
                  "bg-blue-300/30"
                }`}></div>
                <div className="relative">
                  <Avatar
                    src={
                      isEditMode && selectedAvatarFile
                        ? URL.createObjectURL(selectedAvatarFile)
                        : graduate?.profilePicture || portfolio?.avatar
                    }
                    alt={`${portfolio.fullName || "Profile"} Picture`}
                    size="xxl"
                    className={`relative shadow-2xl ${designTheme.avatarSize} backdrop-blur-sm transition-all duration-500 animate-float rounded-none border-0 ${
                      isEditMode && editingSections.header ? "cursor-pointer hover:scale-110 hover:ring-4 hover:ring-white/50" : "hover:scale-105"
                    }`}
                    onClick={isEditMode && editingSections.header ? handleImageClick : undefined}
                  />
                  {/* Camera Icon Overlay - Only in edit mode when editing header */}
                  {isEditMode && editingSections.header && (
                    <div 
                      className="absolute rounded-full shadow-lg cursor-pointer border-2 border-white bg-white/90 hover:bg-white"
                      onClick={handleImageClick}
                      style={{ 
                        bottom: '0',
                        right: '0',
                        transform: 'translate(15%, 15%)',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaCamera className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    </div>
                  )}
                </div>
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
            <div className="flex-1 min-w-0 text-left flex flex-col justify-start pt-8">
              <div className="flex items-center animate-fade-in-up animation-delay-300 gap-3 justify-start">
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
                    className={`${designTheme.titleWeight} ${designTheme.typographySize} tracking-tight animate-typing overflow-hidden whitespace-nowrap border-r-4 border-white/50 break-words`}
                  >
                    {portfolio.fullName || "Professional Portfolio"}
                  </Typography>
                )}
              </div>

              {portfolio.primaryCourseType === "Automotive and Land Transportation" ? (
                <div className="relative mt-8 animate-fade-in-up animation-delay-600 flex items-center gap-3">
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
                      {portfolio.professionalTitle ? (
                    <>
                      <Typography
                        variant="h3"
                        className="font-light text-white/90 text-2xl md:text-3xl tracking-wide break-words"
                      >
                        {portfolio.professionalTitle}
                      </Typography>
                      <div className="w-0 h-0.5 bg-white/40 mt-4 animate-expand-line"></div>
                        </>
                      ) : (
                        <Typography
                          variant="h3"
                          className="font-light text-white/60 text-2xl md:text-3xl tracking-wide break-words italic"
                        >
                          You haven't filled up details in this section.
                        </Typography>
                      )}
                    </>
                  )}
                </div>
              ) : (
                (portfolio.professionalTitle || (isEditMode && editingSections.header)) && (
                  <div className="relative mt-8 animate-fade-in-up animation-delay-600 flex items-center gap-3">
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
                )
              )}

              {portfolio.primaryCourseType === "Automotive and Land Transportation" ? (
                <div className="mt-10 animate-fade-in-up animation-delay-900 max-w-3xl overflow-hidden">
                  {isEditMode && editingSections.header ? (
                    <div>
                      <Textarea
                        value={editingPortfolio?.professionalSummary || ""}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value.length <= 300) {
                            handleFieldChange("professionalSummary", value)
                          }
                        }}
                        className="!text-xl md:!text-2xl !font-light !bg-white/20 !border-white/40 !text-white placeholder:text-white/60"
                        placeholder="Professional Summary"
                        rows={4}
                        maxLength={300}
                      />
                      <Typography variant="small" className="text-white/60 mt-1">
                        {(editingPortfolio?.professionalSummary || "").length}/300 characters
                      </Typography>
                    </div>
                  ) : (
                    portfolio.professionalSummary ? (
                    <Typography
                      variant="lead"
                      className="text-white/80 leading-relaxed text-xl md:text-2xl font-light tracking-wide break-words overflow-wrap-anywhere"
                    >
                      {portfolio.professionalSummary}
                    </Typography>
                    ) : (
                      <Typography
                        variant="lead"
                        className="text-white/60 leading-relaxed text-xl md:text-2xl font-light tracking-wide break-words overflow-wrap-anywhere italic"
                      >
                        You haven't filled up details in this section.
                      </Typography>
                    )
                  )}
                </div>
              ) : (
                (portfolio.professionalSummary || (isEditMode && editingSections.header)) && (
                  <div className="mt-10 animate-fade-in-up animation-delay-900 max-w-3xl overflow-hidden">
                    {isEditMode && editingSections.header ? (
                      <div>
                        <Textarea
                          value={editingPortfolio?.professionalSummary || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value.length <= 300) {
                              handleFieldChange("professionalSummary", value)
                            }
                          }}
                          className="!text-xl md:!text-2xl !font-light !bg-white/20 !border-white/40 !text-white placeholder:text-white/60"
                          placeholder="Professional Summary"
                          rows={4}
                          maxLength={300}
                        />
                        <Typography variant="small" className="text-white/60 mt-1">
                          {(editingPortfolio?.professionalSummary || "").length}/300 characters
                        </Typography>
                      </div>
                    ) : (
                      <Typography
                        variant="lead"
                        className="text-white/80 leading-relaxed text-xl md:text-2xl font-light tracking-wide break-words overflow-wrap-anywhere"
                      >
                        {portfolio.professionalSummary}
                      </Typography>
                    )}
                  </div>
                )
              )}
              {isEditMode && editingSections.header && (
                <div className="mt-6 flex justify-start">
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

              <div className="mt-8 flex animate-fade-in-up animation-delay-1200 justify-start">
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

      <div className="px-6 py-10">
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
                    size="md" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("contact")}
                    className={editingSections.contact ? designTheme.textColor : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              {(portfolio.primaryCourseType === "Automotive and Land Transportation" || portfolio.email || portfolio.phone || portfolio.website || isEditMode) ? (
                (portfolio.email || portfolio.phone || portfolio.website || isEditMode) ? (
              <div className="space-y-4">
                {(portfolio.email || isEditMode) && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      Email
                    </Typography>
                    {isEditMode && editingSections.contact ? (
                      <>
                        <Input
                          type="email"
                          size="md"
                          value={editingPortfolio?.email || ""}
                          onChange={(e) => handleFieldChange("email", e.target.value)}
                          placeholder="Email address"
                          className={`!border-gray-300 ${fieldErrors.email ? "!border-red-500" : ""}`}
                        />
                        {fieldErrors.email && (
                          <Typography variant="small" color="red" className="mt-1">
                            {fieldErrors.email}
                          </Typography>
                        )}
                      </>
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
                      <>
                        <Input
                          type="tel"
                          size="md"
                          value={editingPortfolio?.phone || ""}
                          onChange={(e) => handleFieldChange("phone", e.target.value)}
                          placeholder="Phone number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={11}
                          className={`!border-gray-300 ${fieldErrors.phone ? "!border-red-500" : ""}`}
                        />
                        {fieldErrors.phone && (
                          <Typography variant="small" color="red" className="mt-1">
                            {fieldErrors.phone}
                          </Typography>
                        )}
                      </>
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
                      <>
                        <Input
                          type="url"
                          size="md"
                          value={editingPortfolio?.website || ""}
                          onChange={(e) => handleFieldChange("website", e.target.value)}
                          placeholder="https://www.example.com"
                          className={`!border-gray-300 ${fieldErrors.website ? "!border-red-500" : ""}`}
                        />
                        {fieldErrors.website && (
                          <Typography variant="small" color="red" className="mt-1">
                            {fieldErrors.website}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="small" className="text-gray-800 break-all">
                        {portfolio.website}
                      </Typography>
                    )}
                  </div>
                )}
              </div>
                ) : (
                  <Typography variant="small" className="text-gray-500 italic">
                    You haven't filled up details in this section.
                  </Typography>
                )
              ) : null}
              {isEditMode && editingSections.contact && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="gradient"
                    color={designTheme.buttonColor}
                    size="md"
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
                    size="md" 
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
                        <div className="space-y-3">
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Skill Name *
                            </Typography>
                          <div className="flex gap-2">
                            <Input
                              size="md"
                              value={skill.name || ""}
                              onChange={(e) => handleArrayFieldChange("skills", index, "name", e.target.value)}
                                placeholder="e.g. Food Presentation"
                              required
                              className="!border-gray-300 flex-1"
                            />
                            <IconButton
                              size="md"
                              variant="text"
                              color="red"
                              onClick={() => handleRemoveArrayItem("skills", index)}
                            >
                              <FaTrash className="w-3 h-3" />
                            </IconButton>
                          </div>
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Skill Type
                            </Typography>
                            <Select
                              size="md"
                              label="Select Skill Type"
                              value={skill.type || "TECHNICAL"}
                              onChange={(value) =>
                                handleArrayFieldChange("skills", index, "type", value || "TECHNICAL")
                              }
                              className="!border-gray-300"
                            >
                              {VALID_SKILL_TYPES.map((type) => (
                                <Option key={type} value={type}>
                                  {type}
                                </Option>
                              ))}
                            </Select>
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Proficiency Level
                            </Typography>
                            <Select
                              size="md"
                              label="Select Proficiency Level"
                              value={skill.proficiencyLevel || "Beginner"}
                              onChange={(value) =>
                                handleArrayFieldChange("skills", index, "proficiencyLevel", value || "Beginner")
                              }
                              className="!border-gray-300 [&>div]:text-gray-900"
                            >
                              {SKILL_PROFICIENCY_LEVELS.map((level) => (
                                <Option key={level} value={level}>
                                  {level}
                                </Option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Typography variant="small" className="font-medium text-gray-800 mb-1">
                            {skill.name}
                          </Typography>
                          <div className="flex items-center space-x-2">
                            <Chip size="md" value={skill.type} color={designTheme.buttonColor} className="text-xs font-light" />
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
                      size="md"
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
                        size="md"
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
                  {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                    ? "You haven't filled up details in this section."
                    : "No skills added yet"}
                </Typography>
              )}
            </div>

            {/* TESDA Information - Always show for Automotive and Land Transportation */}
            {(portfolio.primaryCourseType === "Automotive and Land Transportation" || portfolio.ncLevel || portfolio.trainingCenter || portfolio.scholarshipType || portfolio.trainingDuration || portfolio.tesdaRegistrationNumber || isEditMode) && (
            <div className={`bg-white border ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding}`}>
              <div className="flex items-center justify-between mb-6">
                <Typography variant="h6" className={`font-light ${designTheme.textColor} text-lg`}>
                  TESDA Information
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="md" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("tesda")}
                    className={editingSections.tesda ? designTheme.textColor : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
                {(portfolio.ncLevel || portfolio.trainingCenter || portfolio.scholarshipType || portfolio.trainingDuration || portfolio.tesdaRegistrationNumber || isEditMode) ? (
              <div className="space-y-4">
                {(portfolio.ncLevel || (isEditMode && editingSections.tesda)) && (
                  <div>
                    <Typography variant="small" color="gray" className="font-medium mb-1">
                      NC Level
                    </Typography>
                    {isEditMode && editingSections.tesda ? (
                      <>
                        <Select
                          size="md"
                          label="Select NC Level"
                          value={
                            editingPortfolio?.ncLevel && NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)
                              ? editingPortfolio.ncLevel
                              : editingPortfolio?.ncLevel && !NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)
                              ? "Additional"
                              : ""
                          }
                          onChange={(value) => handleFieldChange("ncLevel", value || "")}
                          className="!border-gray-300 [&>div]:text-gray-900"
                        >
                          {NC_LEVEL_OPTIONS.map((level) => (
                            <Option key={level} value={level}>
                              {level}
                            </Option>
                          ))}
                        </Select>
                        {((editingPortfolio?.ncLevel && !NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)) || isNcLevelAdditional) && (
                          <div className="mt-2">
                            <Input
                              size="md"
                              value={
                                editingPortfolio?.ncLevel && !NC_LEVEL_OPTIONS.slice(0, -1).includes(editingPortfolio.ncLevel)
                                  ? editingPortfolio.ncLevel
                                  : ""
                              }
                              onChange={(e) => handleFieldChange("ncLevel", e.target.value)}
                              placeholder="Enter custom NC Level"
                              className="!border-gray-300"
                            />
                          </div>
                        )}
                      </>
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
                        size="md"
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
                        size="md"
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
                        size="md"
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
                    <div className="mb-1 flex items-center gap-2">
                      <Typography variant="small" color="gray" className="font-medium">
                        Registration Number
                      </Typography>
                      <div className="relative group inline-flex items-center">
                        <FaInfoCircle className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-auto whitespace-normal">
                          <div className="text-left leading-relaxed">
                            To know your TESDA Registration Number{" "}
                            <a 
                              href="https://www.tesda.gov.ph/RWAC" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-300 hover:text-blue-200 underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              click here
                            </a>
                          </div>
                          <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    {isEditMode && editingSections.tesda ? (
                      <>
                        <Input
                          size="md"
                          value={editingPortfolio?.tesdaRegistrationNumber || ""}
                          onChange={(e) => handleFieldChange("tesdaRegistrationNumber", e.target.value)}
                          placeholder="TESDA Registration Number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className={`!border-gray-300 ${fieldErrors.tesdaRegistrationNumber ? "!border-red-500" : ""}`}
                        />
                        {fieldErrors.tesdaRegistrationNumber && (
                          <Typography variant="small" color="red" className="mt-1">
                            {fieldErrors.tesdaRegistrationNumber}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="small" className="text-gray-800">
                        {portfolio.tesdaRegistrationNumber}
                      </Typography>
                    )}
                  </div>
                )}
              </div>
                ) : (
                  <Typography variant="small" className="text-gray-500 italic">
                    You haven't filled up details in this section.
                  </Typography>
                )}
              {isEditMode && editingSections.tesda && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="gradient"
                    color={designTheme.buttonColor}
                    size="md"
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
            )}
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
                    size="md" 
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
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        className={`!border-gray-300 focus:!border-blue-500 ${fieldErrors.certificateNumber ? "!border-red-500" : ""}`}
                      />
                      {fieldErrors.certificateNumber && (
                        <Typography variant="small" color="red" className="mt-1">
                          {fieldErrors.certificateNumber}
                        </Typography>
                      )}
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
                      onBlur={handleCertificateInputBlur}
                      max={(() => {
                        const today = new Date()
                        return today.toISOString().split('T')[0]
                      })()}
                      required
                      className="!border-gray-300 focus:!border-blue-500"
                    />
                    {certificateSubmitAttempted && !newCertificate.issueDate && (
                      <Typography variant="small" color="red" className="mt-1">
                        Please fill in the issue date.
                      </Typography>
                    )}
                    {newCertificate.issueDate && (() => {
                      const today = new Date().toISOString().split('T')[0]
                      return newCertificate.issueDate > today
                    })() && (
                      <Typography variant="small" color="red" className="mt-1">
                        Issue Date cannot be a future date.
                      </Typography>
                    )}
                  </div>
                  <div className="mt-4">
                    <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                      Certificate File (Optional)
                    </Typography>
                    <div className="flex items-center gap-4">
                      {newCertificate.certificateFile ? (
                        <Avatar
                          src={URL.createObjectURL(newCertificate.certificateFile)}
                          alt="Certificate Preview"
                          size="lg"
                          className={`ring-2 ${designTheme.borderColor}`}
                        />
                      ) : editingCertificateId ? (
                        <Avatar
                          src={certificates.find((cert) => cert.id === editingCertificateId)?.certificateFilePath || "/placeholder.svg"}
                          alt="Certificate Preview"
                          size="lg"
                          className={`ring-2 ${designTheme.borderColor}`}
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

              {((certificates && certificates.length > 0) || (isEditMode && editingSections.certificates) || portfolio.primaryCourseType === "Automotive and Land Transportation") ? (
                <div className="space-y-4">
                  {!isAddingCertificate && isEditMode && editingSections.certificates && (
                    <Button
                      variant="outlined"
                      color={designTheme.buttonColor}
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

                  {certificates && certificates.length > 0 ? (
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
                                  className={`ring-2 ${designTheme.borderColor}`}
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
                                  size="md"
                                  variant="text"
                                  color={designTheme.buttonColor}
                                  onClick={() => handleEditCertificate(certificate)}
                                  className="flex items-center gap-1"
                                >
                                  <FaPen className="w-4 h-4" /> Edit
                                </Button>
                                <Button
                                  size="md"
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
                                <Typography variant="small" className={designTheme.textColor}>
                                  View
                                </Typography>
                              </div>
                            ) : null}
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  ) : !isEditMode || !editingSections.certificates ? (
                    portfolio.primaryCourseType === "Automotive and Land Transportation" ? (
                      <div className="bg-white border border-gray-100 rounded-lg p-6">
                        <Typography variant="small" className="text-gray-500 italic">
                          You haven't filled up details in this section.
                        </Typography>
                      </div>
                    ) : null
                  ) : null}
                  {isEditMode && editingSections.certificates && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        variant="gradient"
                        color={designTheme.buttonColor}
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
                    {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No certificates added yet"}
                  </Typography>
                </div>
              )}
            </div>
            
            {/* Experience */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className={`font-light ${designTheme.textColor} text-2xl`}>
                  Experience
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="md" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("experience")}
                    className={editingSections.experience ? designTheme.textColor : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              {((portfolio.experiences && portfolio.experiences.length > 0) || (isEditMode && editingSections.experience) || portfolio.primaryCourseType === "Automotive and Land Transportation") ? (
                <div className="space-y-8">
                  {((isEditMode && editingSections.experience ? editingPortfolio?.experiences : portfolio.experiences) || []).length > 0 ? (
                    (isEditMode && editingSections.experience ? editingPortfolio?.experiences : portfolio.experiences)?.map((exp, index) => (
                    <div key={index} className={`border-l-2 ${designTheme.cardBorder} pl-8 pb-8`}>
                      {isEditMode && editingSections.experience ? (
                        <div className="space-y-4">
                          <div className="flex justify-end -mt-2">
                        <IconButton
                          size="md"
                          variant="text"
                          color="red"
                          onClick={() => handleRemoveArrayItem("experiences", index)}
                              aria-label="Remove experience"
                        >
                          <FaTrash className="w-4 h-4" />
                        </IconButton>
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Job Title *
                            </Typography>
                          <Input
                            size="md"
                            value={exp.jobTitle || ""}
                            onChange={(e) => handleArrayFieldChange("experiences", index, "jobTitle", e.target.value)}
                              placeholder="e.g. Sous Chef"
                            required
                            className="!border-gray-300"
                          />
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Company / Employer *
                            </Typography>
                          <Input
                            size="md"
                              value={exp.company || exp.employer || ""}
                              onChange={(e) => handleArrayFieldChange("experiences", index, "company", e.target.value)}
                              placeholder="e.g. Bistro Manila"
                            required
                            className="!border-gray-300"
                          />
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Start Date *
                            </Typography>
                            <Input
                                  type="date"
                                size="md"
                                  value={exp.startDate || ""}
                                  onChange={(e) => handleArrayFieldChange("experiences", index, "startDate", e.target.value)}
                                  onBlur={(e) => handleArrayFieldBlur("experiences", index, "startDate", e.target.value)}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                required
                                className="!border-gray-300"
                              />
                                {exp.startDate && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return exp.startDate > today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    Start Date cannot be a future date.
                                  </Typography>
                                )}
                              </div>
                              <div>
                                <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                  End Date *
                                </Typography>
                                <Input
                                  type="date"
                                  size="md"
                                  value={exp.endDate || ""}
                                  onChange={(e) => handleArrayFieldChange("experiences", index, "endDate", e.target.value)}
                                  onBlur={(e) => handleArrayFieldBlur("experiences", index, "endDate", e.target.value)}
                                  min={exp.startDate || undefined}
                                  max={(() => {
                                    const today = new Date()
                                    return today.toISOString().split('T')[0]
                                  })()}
                                  required
                                  className="!border-gray-300"
                                />
                                {exp.startDate && exp.endDate && exp.endDate < exp.startDate && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    End Date cannot be before Start Date.
                                  </Typography>
                                )}
                                {exp.endDate && (() => {
                                  const today = new Date().toISOString().split('T')[0]
                                  return exp.endDate > today
                                })() && (
                                  <Typography variant="small" color="red" className="mt-1">
                                    End Date cannot be a future date.
                                  </Typography>
                                )}
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Responsibilities / Highlights
                            </Typography>
                            <Textarea
                              size="md"
                              value={exp.responsibilities || exp.description || ""}
                              onChange={(e) =>
                                handleArrayFieldChange("experiences", index, "responsibilities", e.target.value)
                              }
                              placeholder="Summarize key contributions"
                              className="!border-gray-300"
                              rows={3}
                              maxLength={300}
                            />
                            <div className="flex justify-between items-center mt-1">
                              <Typography variant="small" className="text-gray-500">
                                {(exp.responsibilities || exp.description || "").length}/300 characters
                              </Typography>
                              {(exp.responsibilities || exp.description || "").length > 300 && (
                                <Typography variant="small" color="red">
                                  Responsibilities cannot exceed 300 characters.
                                </Typography>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Typography variant="h6" className="font-medium text-gray-800 mb-2 break-words">
                            {exp.jobTitle}
                          </Typography>
                          {exp.company && (
                            <Typography variant="small" className={`${designTheme.textColor} font-medium mb-2 break-words`}>
                              {exp.company}
                            </Typography>
                          )}
                          {(exp.startDate || exp.endDate) && (
                            <Typography variant="small" color="gray" className="mb-4">
                              {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : "N/A"} -{" "}
                              {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "N/A"}
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
                  ))
                  ) : !isEditMode || !editingSections.experience ? (
                    portfolio.primaryCourseType === "Automotive and Land Transportation" ? (
                      <div className="bg-white border border-gray-100 rounded-lg p-6">
                        <Typography variant="small" className="text-gray-500 italic">
                          You haven't filled up details in this section.
                        </Typography>
                      </div>
                    ) : null
                  ) : null}
                  {isEditMode && editingSections.experience && (
                      <Button
                        variant="outlined"
                        size="md"
                        color={designTheme.buttonColor}
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
                        color={designTheme.buttonColor}
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
                    {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No experience added yet"}
                  </Typography>
                </div>
              )}
            </div>

            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className={`font-light ${designTheme.textColor} text-2xl`}>
                  Projects
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="md" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("projects")}
                    className={editingSections.projects ? designTheme.textColor : ""}
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
                      Description (Optional)
                    </Typography>
                    <Textarea
                      size="lg"
                      name="description"
                      value={newProject.description}
                      onChange={handleProjectInputChange}
                      placeholder="Describe your project"
                      className="!border-gray-300 focus:!border-blue-500"
                      rows={3}
                      maxLength={300}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <Typography variant="small" className="text-gray-500">
                        {newProject.description.length}/300 characters
                      </Typography>
                      {newProject.description.length > 300 && (
                        <Typography variant="small" color="red">
                          Description cannot exceed 300 characters.
                        </Typography>
                      )}
                    </div>
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
                        onBlur={handleProjectInputBlur}
                        max={(() => {
                          const today = new Date()
                          return today.toISOString().split('T')[0]
                        })()}
                        required
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                      {projectSubmitAttempted && !newProject.startDate && (
                        <Typography variant="small" color="red" className="mt-1">
                          Please fill in the start date.
                        </Typography>
                      )}
                      {newProject.startDate && (() => {
                        const today = new Date().toISOString().split('T')[0]
                        return newProject.startDate > today
                      })() && (
                        <Typography variant="small" color="red" className="mt-1">
                          Start Date cannot be a future date.
                        </Typography>
                      )}
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
                        onBlur={handleProjectInputBlur}
                        min={newProject.startDate || undefined}
                        max={(() => {
                          const yesterday = new Date()
                          yesterday.setDate(yesterday.getDate() - 1)
                          return yesterday.toISOString().split('T')[0]
                        })()}
                        required
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                      {projectSubmitAttempted && !newProject.endDate && (
                        <Typography variant="small" color="red" className="mt-1">
                          Please fill in the end date.
                        </Typography>
                      )}
                      {newProject.startDate && newProject.endDate && newProject.endDate < newProject.startDate && (
                        <Typography variant="small" color="red" className="mt-1">
                          End Date cannot be before Start Date.
                        </Typography>
                      )}
                      {newProject.endDate && (() => {
                        const today = new Date().toISOString().split('T')[0]
                        return newProject.endDate >= today
                      })() && (
                        <Typography variant="small" color="red" className="mt-1">
                          End Date cannot be today or a future date.
                        </Typography>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                      Project Image (Optional)
                    </Typography>
                    <div className="flex items-center gap-4">
                      {newProject.projectImageFile ? (
                        <Avatar
                          src={URL.createObjectURL(newProject.projectImageFile)}
                          alt="Project Preview"
                          size="lg"
                          className={`ring-2 ${designTheme.borderColor}`}
                        />
                      ) : editingProjectId ? (
                        <Avatar
                          src={projects.find((proj) => proj.id === editingProjectId)?.projectImageFilePath || "/placeholder.svg"}
                          alt="Project Preview"
                          size="lg"
                          className={`ring-2 ${designTheme.borderColor}`}
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
                        color={designTheme.buttonColor}
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
                      color={designTheme.buttonColor}
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

              {((projects && projects.length > 0) || (isEditMode && editingSections.projects) || portfolio.primaryCourseType === "Automotive and Land Transportation") ? (
                <div className="space-y-4">
                  {!isAddingProject && isEditMode && editingSections.projects && (
                    <Button
                      variant="outlined"
                      color={designTheme.buttonColor}
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

                  {projects && projects.length > 0 ? (
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
                                  <Typography variant="small" className={`${designTheme.textColor} font-medium`}>
                                    {new Date(project.startDate).toLocaleDateString()} -{" "}
                                    {new Date(project.endDate).toLocaleDateString()}
                                  </Typography>
                                )}
                              </div>
                              {isEditMode && editingSections.projects && (
                                <div className="flex flex-col gap-2">
                                  <Button
                                    size="md"
                                    variant="text"
                                    color={designTheme.buttonColor}
                                    onClick={() => handleEditProject(project)}
                                    className="flex items-center gap-1"
                                  >
                                    <FaPen className="w-4 h-4" /> Edit
                                  </Button>
                                  <Button
                                    size="md"
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
                  ) : !isEditMode || !editingSections.projects ? (
                    portfolio.primaryCourseType === "Automotive and Land Transportation" ? (
                      <div className="bg-white border border-gray-100 rounded-lg p-6">
                        <Typography variant="small" className="text-gray-500 italic">
                          You haven't filled up details in this section.
                        </Typography>
                      </div>
                    ) : null
                  ) : null}
                  {isEditMode && editingSections.projects && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        variant="gradient"
                        color={designTheme.buttonColor}
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
                    {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No projects added yet"}
                  </Typography>
                </div>
              )}
            </div>

            {/* Awards & Recognition */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className={`font-light ${designTheme.textColor} text-2xl`}>
                  Awards & Recognition
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="md" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("awards")}
                    className={editingSections.awards ? designTheme.textColor : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              {((portfolio.awardsRecognitions && portfolio.awardsRecognitions.length > 0) || (isEditMode && editingSections.awards) || portfolio.primaryCourseType === "Automotive and Land Transportation") ? (
                <div className="space-y-4">
                  {((isEditMode && editingSections.awards ? editingPortfolio?.awardsRecognitions : portfolio.awardsRecognitions) || []).length > 0 ? (
                    (isEditMode && editingSections.awards ? editingPortfolio?.awardsRecognitions : portfolio.awardsRecognitions)?.map((award, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-lg p-6">
                      {isEditMode && editingSections.awards ? (
                        <div className="space-y-3">
                          <div className="flex justify-end -mt-2">
                        <IconButton
                          size="md"
                          variant="text"
                          color="red"
                          onClick={() => handleRemoveArrayItem("awardsRecognitions", index)}
                              aria-label="Remove award"
                        >
                          <FaTrash className="w-4 h-4" />
                        </IconButton>
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Award Title *
                            </Typography>
                          <Input
                            size="md"
                            value={award.title || ""}
                            onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "title", e.target.value)}
                              placeholder="e.g. Best in Pastry Arts"
                            required
                            className="!border-gray-300"
                          />
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Issuer
                            </Typography>
                          <Input
                            size="md"
                            value={award.issuer || ""}
                            onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "issuer", e.target.value)}
                              placeholder="e.g. TESDA"
                            className="!border-gray-300"
                          />
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Date Received *
                            </Typography>
                          <Input
                            type="date"
                            size="md"
                            value={award.dateReceived || ""}
                            onChange={(e) => handleArrayFieldChange("awardsRecognitions", index, "dateReceived", e.target.value)}
                            onBlur={(e) => handleArrayFieldBlur("awardsRecognitions", index, "dateReceived", e.target.value)}
                            max={(() => {
                              const today = new Date()
                              return today.toISOString().split('T')[0]
                            })()}
                            required
                            className="!border-gray-300"
                          />
                            {award.dateReceived && (() => {
                              const today = new Date().toISOString().split('T')[0]
                              return award.dateReceived > today
                            })() && (
                              <Typography variant="small" color="red" className="mt-1">
                                Date Received cannot be a future date.
                              </Typography>
                            )}
                          </div>
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
                            <Typography variant="small" className={designTheme.textColor}>
                              {award.dateReceived}
                            </Typography>
                          )}
                        </>
                      )}
                    </div>
                  ))
                  ) : !isEditMode || !editingSections.awards ? (
                    portfolio.primaryCourseType === "Automotive and Land Transportation" ? (
                      <div className="bg-white border border-gray-100 rounded-lg p-6">
                        <Typography variant="small" className="text-gray-500 italic">
                          You haven't filled up details in this section.
                        </Typography>
                      </div>
                    ) : null
                  ) : null}
                  {isEditMode && editingSections.awards && (
                    <Button
                      variant="outlined"
                      size="md"
                      color={designTheme.buttonColor}
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
                        color={designTheme.buttonColor}
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
                    {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No awards or recognition added yet"}
                  </Typography>
                </div>
              )}
            </div>

            {/* Education & Memberships */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Continuing Education */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <Typography variant="h5" className={`font-light ${designTheme.textColor}`}>
                    Continuing Education
                  </Typography>
                  {isGraduateView && isEditMode && (
                    <IconButton 
                      size="md" 
                      variant="text" 
                      onClick={() => handleSectionEditToggle("education")}
                      className={editingSections.education ? designTheme.textColor : ""}
                    >
                      <FaPen className="w-4 h-4" />
                    </IconButton>
                  )}
                </div>
                {((portfolio.continuingEducations && portfolio.continuingEducations.length > 0) || (isEditMode && editingSections.education) || portfolio.primaryCourseType === "Automotive and Land Transportation") ? (
                  <div className="space-y-4">
                    {((isEditMode && editingSections.education ? editingPortfolio?.continuingEducations : portfolio.continuingEducations) || []).length > 0 ? (
                      (isEditMode && editingSections.education ? editingPortfolio?.continuingEducations : portfolio.continuingEducations)?.map((edu, index) => (
                      <div key={index} className={`border-l-2 ${designTheme.cardBorder} pl-4 py-2`}>
                        {isEditMode && editingSections.education ? (
                          <div className="space-y-3">
                            <div className="flex justify-end -mt-2">
                          <IconButton
                            size="md"
                            variant="text"
                            color="red"
                            onClick={() => handleRemoveArrayItem("continuingEducations", index)}
                                aria-label="Remove education"
                          >
                            <FaTrash className="w-3 h-3" />
                          </IconButton>
                            </div>
                            <div>
                              <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                Course Name *
                              </Typography>
                            <Input
                              size="md"
                              value={edu.courseName || ""}
                              onChange={(e) => handleArrayFieldChange("continuingEducations", index, "courseName", e.target.value)}
                                placeholder="e.g. Advanced Baking Workshop"
                              required
                              className="!border-gray-300"
                            />
                            </div>
                            <div>
                              <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                Institution
                              </Typography>
                            <Input
                              size="md"
                              value={edu.institution || ""}
                              onChange={(e) => handleArrayFieldChange("continuingEducations", index, "institution", e.target.value)}
                                placeholder="e.g. TESDA Training Center"
                              className="!border-gray-300"
                            />
                            </div>
                            <div>
                              <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                Completion Date *
                              </Typography>
                            <Input
                              type="date"
                              size="md"
                              value={edu.completionDate || ""}
                              onChange={(e) => handleArrayFieldChange("continuingEducations", index, "completionDate", e.target.value)}
                              onBlur={(e) => handleArrayFieldBlur("continuingEducations", index, "completionDate", e.target.value)}
                              max={(() => {
                                const today = new Date()
                                return today.toISOString().split('T')[0]
                              })()}
                              required
                              className="!border-gray-300"
                            />
                              {edu.completionDate && (() => {
                                const today = new Date().toISOString().split('T')[0]
                                return edu.completionDate > today
                              })() && (
                                <Typography variant="small" color="red" className="mt-1">
                                  Completion Date cannot be a future date.
                                </Typography>
                              )}
                            </div>
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
                              <Typography variant="small" className={designTheme.textColor}>
                                {edu.completionDate}
                              </Typography>
                            )}
                          </>
                        )}
                      </div>
                    ))
                    ) : !isEditMode || !editingSections.education ? (
                      portfolio.primaryCourseType === "Automotive and Land Transportation" ? (
                        <Typography variant="small" className="text-gray-500 italic">
                          You haven't filled up details in this section.
                        </Typography>
                      ) : null
                    ) : null}
                    {isEditMode && editingSections.education && (
                      <Button
                        variant="outlined"
                        size="md"
                        color={designTheme.buttonColor}
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
                          color={designTheme.buttonColor}
                          size="md"
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
                    {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No continuing education added yet"}
                  </Typography>
                )}
              </div>

              {/* Professional Memberships */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <Typography variant="h5" className={`font-light ${designTheme.textColor}`}>
                    Professional Memberships
                  </Typography>
                  {isGraduateView && isEditMode && (
                    <IconButton 
                      size="md" 
                      variant="text" 
                      onClick={() => handleSectionEditToggle("memberships")}
                      className={editingSections.memberships ? designTheme.textColor : ""}
                    >
                      <FaPen className="w-4 h-4" />
                    </IconButton>
                  )}
                </div>
                {((portfolio.professionalMemberships && portfolio.professionalMemberships.length > 0) || (isEditMode && editingSections.memberships) || portfolio.primaryCourseType === "Automotive and Land Transportation") ? (
                  <div className="space-y-4">
                    {((isEditMode && editingSections.memberships ? editingPortfolio?.professionalMemberships : portfolio.professionalMemberships) || []).length > 0 ? (
                      (isEditMode && editingSections.memberships ? editingPortfolio?.professionalMemberships : portfolio.professionalMemberships)?.map((mem, index) => (
                      <div key={index} className={`border-l-2 ${designTheme.cardBorder} pl-4 py-2`}>
                        {isEditMode && editingSections.memberships ? (
                          <div className="space-y-3">
                            <div className="flex justify-end -mt-2">
                          <IconButton
                            size="md"
                            variant="text"
                            color="red"
                            onClick={() => handleRemoveArrayItem("professionalMemberships", index)}
                                aria-label="Remove membership"
                          >
                            <FaTrash className="w-3 h-3" />
                          </IconButton>
                            </div>
                            <div>
                              <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                Organization *
                              </Typography>
                            <Input
                              size="md"
                              value={mem.organization || ""}
                              onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "organization", e.target.value)}
                                placeholder="e.g. Philippine Chefs Association"
                              required
                              className="!border-gray-300"
                            />
                            </div>
                            <div>
                              <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                Membership Type
                              </Typography>
                            <Input
                              size="md"
                              value={mem.membershipType || ""}
                              onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "membershipType", e.target.value)}
                                placeholder="e.g. Regular Member"
                              className="!border-gray-300"
                            />
                            </div>
                            <div>
                              <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                                Start Date *
                              </Typography>
                            <Input
                              type="date"
                              size="md"
                              value={mem.startDate || ""}
                              onChange={(e) => handleArrayFieldChange("professionalMemberships", index, "startDate", e.target.value)}
                              onBlur={(e) => handleArrayFieldBlur("professionalMemberships", index, "startDate", e.target.value)}
                              max={(() => {
                                const today = new Date()
                                return today.toISOString().split('T')[0]
                              })()}
                              required
                              className="!border-gray-300"
                            />
                              {mem.startDate && (() => {
                                const today = new Date().toISOString().split('T')[0]
                                return mem.startDate > today
                              })() && (
                                <Typography variant="small" color="red" className="mt-1">
                                  Start Date cannot be a future date.
                                </Typography>
                              )}
                            </div>
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
                              <Typography variant="small" className={designTheme.textColor}>
                                Since {mem.startDate}
                              </Typography>
                            )}
                          </>
                        )}
                      </div>
                    ))
                    ) : !isEditMode || !editingSections.memberships ? (
                      portfolio.primaryCourseType === "Automotive and Land Transportation" ? (
                        <Typography variant="small" className="text-gray-500 italic">
                          You haven't filled up details in this section.
                        </Typography>
                      ) : null
                    ) : null}
                    {isEditMode && editingSections.memberships && (
                      <Button
                        variant="outlined"
                        size="md"
                        color={designTheme.buttonColor}
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
                          color={designTheme.buttonColor}
                          size="md"
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
                    {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No professional memberships added yet"}
                  </Typography>
                )}
              </div>
            </div>

            {/* References */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className={`font-light ${designTheme.textColor} text-2xl`}>
                  References
                </Typography>
                {isGraduateView && isEditMode && (
                  <IconButton 
                    size="md" 
                    variant="text" 
                    onClick={() => handleSectionEditToggle("references")}
                    className={editingSections.references ? designTheme.textColor : ""}
                  >
                    <FaPen className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
              {((portfolio.references && portfolio.references.length > 0) || (isEditMode && editingSections.references) || portfolio.primaryCourseType === "Automotive and Land Transportation") ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {((isEditMode && editingSections.references ? editingPortfolio?.references : portfolio.references) || []).length > 0 ? (
                    (isEditMode && editingSections.references ? editingPortfolio?.references : portfolio.references)?.map((ref, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-lg p-6">
                      {isEditMode && editingSections.references ? (
                        <div className="space-y-3">
                          <div className="flex justify-end -mt-2">
                        <IconButton
                          size="md"
                          variant="text"
                          color="red"
                          onClick={() => handleRemoveArrayItem("references", index)}
                              aria-label="Remove reference"
                        >
                          <FaTrash className="w-4 h-4" />
                        </IconButton>
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Name *
                            </Typography>
                          <Input
                            size="md"
                            value={ref.name || ""}
                            onChange={(e) => handleArrayFieldChange("references", index, "name", e.target.value)}
                              placeholder="e.g. Maria Cruz"
                            required
                            className="!border-gray-300"
                          />
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Relationship / Position
                            </Typography>
                          <Input
                            size="md"
                            value={ref.relationship || ref.position || ""}
                            onChange={(e) => handleArrayFieldChange("references", index, "relationship", e.target.value)}
                              placeholder="e.g. Former Training Supervisor"
                            className="!border-gray-300"
                          />
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Company
                            </Typography>
                          <Input
                            size="md"
                            value={ref.company || ""}
                            onChange={(e) => handleArrayFieldChange("references", index, "company", e.target.value)}
                              placeholder="e.g. Cafe Delight"
                            className="!border-gray-300"
                          />
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Email *
                            </Typography>
                            <Input
                              type="email"
                              size="md"
                              value={ref.email || ""}
                              onChange={(e) => handleArrayFieldChange("references", index, "email", e.target.value)}
                              placeholder="name@gmail.com"
                              required
                              className={`!border-gray-300 ${fieldErrors[`referenceEmail_${index}`] ? "!border-red-500" : ""}`}
                            />
                            {fieldErrors[`referenceEmail_${index}`] && (
                              <Typography variant="small" color="red" className="mt-1">
                                {fieldErrors[`referenceEmail_${index}`]}
                              </Typography>
                            )}
                          </div>
                          <div>
                            <Typography variant="small" className="text-gray-700 font-semibold mb-1">
                              Contact Number *
                            </Typography>
                            <Input
                              type="tel"
                              size="md"
                              value={ref.phone || ref.contact || ""}
                              onChange={(e) => {
                                const newValue = e.target.value
                                handleArrayFieldChange("references", index, "phone", newValue)
                              }}
                              placeholder="Contact number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={11}
                              required
                              className={`!border-gray-300 ${fieldErrors[`referencePhone_${index}`] ? "!border-red-500" : ""}`}
                            />
                            {fieldErrors[`referencePhone_${index}`] && (
                              <Typography variant="small" color="red" className="mt-1">
                                {fieldErrors[`referencePhone_${index}`]}
                              </Typography>
                            )}
                          </div>
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
                              <Typography variant="small" className={`${designTheme.textColor} mb-3 break-words`}>
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
                  ))
                  ) : !isEditMode || !editingSections.references ? (
                    portfolio.primaryCourseType === "Automotive and Land Transportation" ? (
                      <div className="md:col-span-2 bg-white border border-gray-100 rounded-lg p-6">
                        <Typography variant="small" className="text-gray-500 italic">
                          You haven't filled up details in this section.
                        </Typography>
                      </div>
                    ) : null
                  ) : null}
                  {isEditMode && editingSections.references && (
                    <div className="md:col-span-2">
                      <Button
                        variant="outlined"
                        size="md"
                        color={designTheme.buttonColor}
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
                        color={designTheme.buttonColor}
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
                    {portfolio.primaryCourseType === "Automotive and Land Transportation" 
                      ? "You haven't filled up details in this section."
                      : "No references added yet"}
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        </Fragment>
      )}
      </div>

      {isGraduateView && (
          <div className="mt-16 bg-white border border-gray-100 rounded-lg p-8">
            <div className="text-center mb-8">
              <Typography variant="h4" className={`${designTheme.textColor} mb-4 font-light`}>
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
              <div className={`p-6 ${designTheme.lightBg} rounded-lg mb-6`}>
                <Typography variant="h6" className={`${designTheme.textColor} mb-2 font-light`}>
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
              {!isEditMode ? (
                <Button
                  onClick={handleEditModeToggle}
                  color="blue"
                  size="lg"
                  className="font-light flex items-center gap-2"
                >
                  <FaPen className="w-4 h-4" />
                  Edit Portfolio
                </Button>
              ) : (
                <Button
                  onClick={handleEditModeToggle}
                  color="green"
                  size="lg"
                  className="font-light flex items-center gap-2"
                >
                  <FaCheckCircle className="w-4 h-4" />
                  Done Editing
                </Button>
              )}
              {!isEditMode && (
                <>
                  <Button
                    onClick={handleRegenerateToken}
                    color={designTheme.buttonColor}
                    variant="outlined"
                    size="lg"
                    className="font-light"
                  >
                    Generate New Link
                  </Button>
                  <Button 
                    onClick={handleDelete} 
                    color="red" 
                    variant="outlined" 
                    size="lg" 
                    className="font-light flex items-center gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Spinner className="w-4 h-4" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FaTrash className="w-4 h-4" />
                    Delete Portfolio
                      </>
                    )}
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
    </>
  )
}

export default ViewPortfolio
