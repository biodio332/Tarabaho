  "use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FaPlus, FaTrash, FaPen, FaChevronLeft, FaChevronRight, FaCheck, FaInfoCircle, FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa"
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
  Avatar,
  Select,
  Option,
  Spinner,
  Progress,
  Chip,
} from "@material-tailwind/react"

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
    email: "",
    phone: "",
    website: "",
    portfolioCategory: "",
    preferredWorkLocation: "",
    workScheduleAvailability: "",
    salaryExpectations: "",
  })
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null)
  const [previewAvatar, setPreviewAvatar] = useState("/placeholder.svg")
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [experiences, setExperiences] = useState([])
  const [awardsRecognitions, setAwardsRecognitions] = useState([])
  const [continuingEducations, setContinuingEducations] = useState([])
  const [professionalMemberships, setProfessionalMemberships] = useState([])
  const [references, setReferences] = useState([])
  const [certificates, setCertificates] = useState([])
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [isAddingExperience, setIsAddingExperience] = useState(false)
  const [isAddingAward, setIsAddingAward] = useState(false)
  const [isAddingEducation, setIsAddingEducation] = useState(false)
  const [isAddingMembership, setIsAddingMembership] = useState(false)
  const [isAddingReference, setIsAddingReference] = useState(false)
  const [isAddingCertificate, setIsAddingCertificate] = useState(false)
  const [editingCertificateId, setEditingCertificateId] = useState(null)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [projectSubmitAttempted, setProjectSubmitAttempted] = useState(false)
  const [experienceSubmitAttempted, setExperienceSubmitAttempted] = useState(false)
  const [awardSubmitAttempted, setAwardSubmitAttempted] = useState(false)
  const [educationSubmitAttempted, setEducationSubmitAttempted] = useState(false)
  const [membershipSubmitAttempted, setMembershipSubmitAttempted] = useState(false)
  const [editingSkillIndex, setEditingSkillIndex] = useState(null)
  const [editingExperienceIndex, setEditingExperienceIndex] = useState(null)
  const [editingAwardIndex, setEditingAwardIndex] = useState(null)
  const [editingEducationIndex, setEditingEducationIndex] = useState(null)
  const [editingMembershipIndex, setEditingMembershipIndex] = useState(null)
  const [editingReferenceIndex, setEditingReferenceIndex] = useState(null)
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    projectImageFile: null,
  })
  const [newSkill, setNewSkill] = useState({
    name: "",
    type: "TECHNICAL",
    proficiencyLevel: "Beginner",
  })
  const [newExperience, setNewExperience] = useState({
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
    responsibilities: "",
  })
  const [newAward, setNewAward] = useState({
    title: "",
    issuer: "",
    dateReceived: "",
  })
  const [newEducation, setNewEducation] = useState({
    courseName: "",
    institution: "",
    completionDate: "",
  })
  const [newMembership, setNewMembership] = useState({
    organization: "",
    membershipType: "",
    startDate: "",
  })
  const [newReference, setNewReference] = useState({
    name: "",
    relationship: "",
    phone: "",
    company: "",
    email: "",
  })
  const [newCertificate, setNewCertificate] = useState({
    courseName: "",
    certificateNumber: "",
    issueDate: "",
  })
  const [isNcLevelOtherSelected, setIsNcLevelOtherSelected] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [avatarFileSizeError, setAvatarFileSizeError] = useState("")
  const [projectFileSizeError, setProjectFileSizeError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState(null)
  const [graduateId, setGraduateId] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [errorSteps, setErrorSteps] = useState(new Set())
  const [notification, setNotification] = useState({
    show: false,
    type: "success", // "success" or "error"
    title: "",
    message: "",
  })
  const navigate = useNavigate()
  const avatarFileInputRef = useRef(null)
  const projectFileInputRef = useRef(null)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"
  
  // State for managing "Show More" functionality and collapsible sections
  const [showAllCertificates, setShowAllCertificates] = useState(false)
  const [showAllExperiences, setShowAllExperiences] = useState(false)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [showAllAwards, setShowAllAwards] = useState(false)
  const [showAllEducation, setShowAllEducation] = useState(false)
  const [showAllMemberships, setShowAllMemberships] = useState(false)
  const [showAllReferences, setShowAllReferences] = useState(false)
  
  // Items to show initially (before "Show More")
  const INITIAL_ITEMS_LIMIT = 6

  const validSkillTypes = ["TECHNICAL", "LANGUAGE", "DIGITAL", "SOFT", "INDUSTRY_SPECIFIC"]

  // Course type to design template mapping (using course type names directly)
  const courseTypeTemplates = {
    "Template 1": "Template 1",
    "Template 2": "Template 2",
    "Template 3": "Template 3"
  }

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
      case "email":
        if (trimmedValue) {
          if (!isValidEmail(trimmedValue) || !trimmedValue.toLowerCase().endsWith("@gmail.com")) {
            message = "Please provide a valid Gmail address."
          }
        }
        break
      case "phone":
        if (trimmedValue) {
          if (trimmedValue.length !== 10) {
            message = "Phone number must be exactly 10 digits."
          }
        }
        break
      case "website":
        if (trimmedValue && !isValidWebsiteUrl(trimmedValue)) {
          message = "Website must be a valid https URL (e.g., https://www.example.com)."
        }
        break
      case "referencePhone":
        if (trimmedValue) {
          if (trimmedValue.length !== 10) {
            message = "Reference phone number must be exactly 10 digits."
          }
        }
        break
      case "referenceEmail":
        if (trimmedValue && !isValidEmail(trimmedValue)) {
          message = "Please provide a valid email address."
        }
        break
      default:
        break
    }

    updateFieldError(fieldName, message)
    return !message
  }

  const NC_LEVEL_OPTIONS = ["NC I", "NC II", "NC III", "NC IV"]
  const ncLevelSelectValue = isNcLevelOtherSelected ? "OTHER" : formData.ncLevel || ""

  useEffect(() => {
    if (formData.ncLevel && !NC_LEVEL_OPTIONS.includes(formData.ncLevel)) {
      setIsNcLevelOtherSelected(true)
    }
  }, [formData.ncLevel])

  // Helper function to format phone number with +63 prefix
  const formatPhoneNumber = (phone) => {
    if (!phone) return ""
    // Remove any existing +63 prefix and non-digits
    const digitsOnly = phone.replace(/^\+63/, "").replace(/\D/g, "")
    // Return with +63 prefix
    return `+63${digitsOnly}`
  }

  // Get design theme for preview (matching ViewPortfolio.jsx)
  const getDesignTheme = (template) => {
    const themes = {
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
      "Template 2": {
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
      "Template 1": {
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
      "Template 3": {
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

  // Get layout properties for preview
  const getPreviewLayout = (template) => {
    const layouts = {
      "cookery": {
        headerLayout: "flex-row items-center text-left",
        avatarSize: "w-20 h-20",
        cardStyle: "rounded-xl border-2",
        cardPadding: "p-5",
      },
      "Template 2": {
        headerLayout: "flex-row items-center text-left",
        avatarSize: "w-20 h-20",
        cardStyle: "rounded-lg",
        cardPadding: "p-5",
      },
      "Template 1": {
        headerLayout: "flex-row-reverse items-center text-right",
        avatarSize: "w-16 h-16",
        cardStyle: "rounded-3xl",
        cardPadding: "p-6",
      },
      "Template 3": {
        headerLayout: "flex-col items-center text-center",
        avatarSize: "w-14 h-14",
        cardStyle: "rounded-full border-4",
        cardPadding: "p-6",
      },
      "default": {
        headerLayout: "flex-row items-center text-left",
        avatarSize: "w-20 h-20",
        cardStyle: "rounded-lg",
        cardPadding: "p-5",
      },
    }
    return layouts[template] || layouts["default"]
  }

  const courseTypes = [
    "Template 1",
    "Template 2",
    "Template 3"
  ]

  const SKILL_PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"]
  const selectMenuProps = { 
    className: "!z-[99999]",
    style: { zIndex: 99999 }
  }
  const selectContainerProps = { 
    className: "relative !z-[99999]",
    style: { zIndex: 99999 }
  }

  // Helper function to check if course type should always show sections
  const shouldAlwaysShowSections = (courseType) => {
    return courseType === "Template 2"
  }

  const steps = [
    { id: 0, name: "Profile Photo", required: true },
    { id: 1, name: "Basic Information", required: true },
    { id: 2, name: "TESDA Information", required: true },
    { id: 3, name: "Contact Information", required: true },
    { id: 4, name: "Projects", required: false },
    { id: 5, name: "Certificates", required: false },
    { id: 6, name: "Skills", required: false },
    { id: 7, name: "Experiences", required: false },
    { id: 8, name: "Awards & Recognitions", required: false },
    { id: 9, name: "Continuing Education", required: false },
    { id: 10, name: "Professional Memberships", required: false },
    { id: 11, name: "References", required: false },
    { id: 12, name: "Additional Information", required: true },
  ]

  const totalSteps = steps.length
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  // Check if a step can be accessed (all previous required steps must be completed)
  const canAccessStep = (stepIndex) => {
    if (stepIndex === 0) return true
    if (stepIndex === currentStep) return true
    
    // Check all previous required steps
    for (let i = 0; i < stepIndex; i++) {
      if (steps[i].required && !isStepCompleted(i)) {
        return false
      }
    }
    return true
  }

  // Check if a step has validation errors
  const hasStepErrors = (stepIndex) => {
    switch (stepIndex) {
      case 1: // Basic Information
        return false // Errors are shown inline
      case 3: // Contact Information
        return !!(fieldErrors.email || fieldErrors.phone || fieldErrors.website)
      default:
        return false
    }
  }

  // Check if a step is completed (based on actual field values, not just state)
  const isStepCompleted = (stepIndex) => {
    if (steps[stepIndex].required) {
      // For required steps, check actual field values
      switch (stepIndex) {
        case 1: // Basic Information
          return !!(formData.fullName?.trim() && formData.professionalSummary?.trim() && formData.professionalSummary.length <= 300)
        case 12: // Additional Information
          return !!formData.primaryCourseType
        default:
          return validateStep(stepIndex, false)
      }
    }
    
    // For optional steps, check if they have any data
    switch (stepIndex) {
      case 0: // Profile Photo
        return previewAvatar !== "/placeholder.svg" || selectedAvatarFile !== null
      case 2: // TESDA Information
        return !!(formData.ncLevel || formData.trainingCenter || formData.scholarshipType || 
               formData.trainingDuration)
      case 3: // Contact Information
        return !!(formData.email?.trim() && formData.phone?.trim() && !fieldErrors.email && !fieldErrors.phone)
      case 4: // Projects
        return projects.length > 0
      case 5: // Certificates
        return certificates.length > 0
      case 6: // Skills
        return skills.length > 0
      case 7: // Experiences
        return experiences.length > 0
      case 8: // Awards
        return awardsRecognitions.length > 0
      case 9: // Education
        return continuingEducations.length > 0
      case 10: // Memberships
        return professionalMemberships.length > 0
      case 11: // References
        return references.length > 0
      default:
        return false
    }
  }

  useEffect(() => {
    const fetchTokenAndProfileData = async () => {
      try {
        const username = localStorage.getItem("username")
        if (!username) {
          setError("User not logged in. Please sign in.")
          navigate("/signin")
          return
        }

        const tokenResponse = await axios.get(`${BACKEND_URL}/api/graduate/get-token`, {
          withCredentials: true,
        })
        const fetchedToken = tokenResponse.data.token
        if (!fetchedToken) {
          setError("Authentication token missing. Please sign in again.")
          navigate("/signin")
          return
        }
        setToken(fetchedToken)

        const graduateResponse = await axios.get(`${BACKEND_URL}/api/graduate/username/${username}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${fetchedToken}` },
        })
        setGraduateId(graduateResponse.data.id)
        if (graduateResponse.data.profilePicture) {
          setPreviewAvatar(graduateResponse.data.profilePicture)
          setFormData((prev) => ({ ...prev, avatar: graduateResponse.data.profilePicture }))
        }
      } catch (err) {
        setError("Failed to load profile data. Please try again.")
        if (err.response?.status === 401) navigate("/signin")
      }
    }
    fetchTokenAndProfileData()
  }, [BACKEND_URL, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let processedValue = value
    
    // For phone number, only allow digits and limit to 10 digits
    if (name === "phone") {
      processedValue = value.replace(/\D/g, "").slice(0, 10)
    }
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }))
    if (["email", "phone", "website"].includes(name)) {
      validateField(name, processedValue)
    }
    setError("")
  }

  const handleCourseTypeChange = (courseType) => {
    const template = courseTypeTemplates[courseType] || "default"
    setFormData((prev) => ({
      ...prev,
      primaryCourseType: courseType,
      designTemplate: template
    }))
    setError("")
  }

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0]
    // Store previous state before processing new file
    const previousFile = selectedAvatarFile
    const previousPreview = previewAvatar
    
    // Reset input value so same file can be selected again
    if (e.target) {
      e.target.value = ""
    }
    
    if (file && !file.type.startsWith("image/")) {
      setError("Please select an image file for the avatar.")
      setAvatarFileSizeError("")
      return
    }
    // Check file size (5MB = 5242880 bytes)
    const maxFileSize = 5 * 1024 * 1024 // 5MB
    if (file && file.size > maxFileSize) {
      setAvatarFileSizeError("Image size exceeds the maximum allowed size of 5MB.")
      // Restore previous image instead of clearing
      setSelectedAvatarFile(previousFile)
      setPreviewAvatar(previousPreview)
      setError("")
      // Clear error message after 1.5 seconds
      setTimeout(() => {
        setAvatarFileSizeError("")
      }, 5000)
      return
    }
    setAvatarFileSizeError("")
    setSelectedAvatarFile(file)
    setPreviewAvatar(file ? URL.createObjectURL(file) : "/placeholder.svg")
    setError("")
  }

  const handleProjectFileChange = (e) => {
    const file = e.target.files[0]
    // Store previous state before processing new file
    const previousFile = newProject.projectImageFile
    
    // Reset input value so same file can be selected again
    if (e.target) {
      e.target.value = ""
    }
    
    if (file && !file.type.startsWith("image/")) {
      setError("Please select an image file for the project.")
      setProjectFileSizeError("")
      return
    }
    // Check file size (5MB = 5242880 bytes)
    const maxFileSize = 5 * 1024 * 1024 // 5MB
    if (file && file.size > maxFileSize) {
      setProjectFileSizeError("Image size exceeds the maximum allowed size of 5MB.")
      // Restore previous image instead of clearing
      setNewProject((prev) => ({ ...prev, projectImageFile: previousFile }))
      setError("")
      // Clear error message after 1.5 seconds
      setTimeout(() => {
        setProjectFileSizeError("")
      }, 5000)
      return
    }
    setProjectFileSizeError("")
    setNewProject((prev) => ({ ...prev, projectImageFile: file }))
    setError("")
  }

  const handleSkillInputChange = (e) => {
    const { name, value } = e.target
    setNewSkill((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleExperienceInputChange = (e) => {
    const { name, value } = e.target
    
    // Clear error state when user interacts with date fields to prevent showing errors at top
    if (name === "startDate" || name === "endDate") {
      setError("")
    }
    
    // Validate year is exactly 4 digits for date fields
    if ((name === "startDate" || name === "endDate") && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewExperience((prev) => {
          const updated = { ...prev, [name]: correctedValue }
          return updated
        })
        return
      }
    }
    
    setNewExperience((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleExperienceInputBlur = (e) => {
    const { name, value } = e.target
    
    // Validate and correct date on blur for date fields
    if ((name === "startDate" || name === "endDate") && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewExperience((prev) => {
          const updated = { ...prev, [name]: correctedValue }
          return updated
        })
      }
    }
  }

  const handleAwardInputChange = (e) => {
    const { name, value } = e.target
    
    // Clear error state when user interacts with dateReceived field to prevent showing errors at top
    if (name === "dateReceived") {
      setError("")
    }
    
    // Validate year is exactly 4 digits for dateReceived field
    if (name === "dateReceived" && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewAward((prev) => ({ ...prev, [name]: correctedValue }))
        return
      }
    }
    
    setNewAward((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleAwardInputBlur = (e) => {
    const { name, value } = e.target
    
    // Validate and correct date on blur for dateReceived field
    if (name === "dateReceived" && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewAward((prev) => {
          const updated = { ...prev, [name]: correctedValue }
          return updated
        })
      }
    }
  }

  const handleEducationInputChange = (e) => {
    const { name, value } = e.target
    
    // Clear error state when user interacts with completionDate field to prevent showing errors at top
    if (name === "completionDate") {
      setError("")
    }
    
    // Validate year is exactly 4 digits for completionDate field
    if (name === "completionDate" && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewEducation((prev) => ({ ...prev, [name]: correctedValue }))
        return
      }
    }
    
    setNewEducation((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleEducationInputBlur = (e) => {
    const { name, value } = e.target
    
    // Validate and correct date on blur for completionDate field
    if (name === "completionDate" && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewEducation((prev) => {
          const updated = { ...prev, [name]: correctedValue }
          return updated
        })
      }
    }
  }

  const handleMembershipInputChange = (e) => {
    const { name, value } = e.target
    
    // Clear error state when user interacts with startDate field to prevent showing errors at top
    if (name === "startDate") {
      setError("")
    }
    
    // Validate year is exactly 4 digits for startDate field
    if (name === "startDate" && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewMembership((prev) => ({ ...prev, [name]: correctedValue }))
        return
      }
    }
    
    setNewMembership((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleMembershipInputBlur = (e) => {
    const { name, value } = e.target
    
    // Validate and correct date on blur for startDate field
    if (name === "startDate" && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewMembership((prev) => {
          const updated = { ...prev, [name]: correctedValue }
          return updated
        })
      }
    }
  }

  const handleReferenceInputChange = (e) => {
    const { name, value } = e.target
    let processedValue = value
    
    // For phone number, only allow digits and limit to 10 digits
    if (name === "phone") {
      processedValue = value.replace(/\D/g, "").slice(0, 10)
    }
    
    setNewReference((prev) => ({ ...prev, [name]: processedValue }))
    if (name === "phone") {
      validateField("referencePhone", processedValue)
    }
    if (name === "email") {
      validateField("referenceEmail", value)
    }
    setError("")
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

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target
    
    // Clear error state when user interacts with date fields to prevent showing errors at top
    if (name === "startDate" || name === "endDate") {
      setError("")
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
    
    setNewProject((prev) => {
      const updated = { ...prev, [name]: value }
      return updated
    })
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

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target
    
    // Validate year is exactly 4 digits for issueDate field
    if (name === "issueDate" && value) {
      const correctedValue = validateAndCorrectDate(value)
      if (correctedValue !== value) {
        setNewCertificate((prev) => ({ ...prev, [name]: correctedValue }))
        return
      }
    }
    
    setNewCertificate((prev) => ({ ...prev, [name]: value }))
    setError("")
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

  const handleAddSkill = () => {
    if (!newSkill.name || newSkill.name.trim() === "") {
      setError("Please fill in the skill name.")
      return
    }
    if (!validSkillTypes.includes(newSkill.type)) {
      setError(`Please select a valid skill type: ${validSkillTypes.join(", ")}`)
      return
    }
    setSkills((prev) => [...prev, { ...newSkill }])
    setNewSkill({ name: "", type: "TECHNICAL", proficiencyLevel: "Beginner" })
    setEditingSkillIndex(null)
    setIsAddingSkill(false)
    setError("")
  }

  const handleAddExperience = () => {
    setExperienceSubmitAttempted(true) // Mark that user has attempted to submit
    if (!newExperience.jobTitle || !newExperience.company) {
      setError("Please fill in the job title and company.")
      return
    }
    // Validate start date is filled - return early if invalid (inline error messages will show)
    if (!newExperience.startDate) {
      return
    }
    // Validate end date is filled - return early if invalid (inline error messages will show)
    if (!newExperience.endDate) {
      return
    }
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    // Validate start date is not in the future - return early if invalid (inline error messages will show)
    if (newExperience.startDate && newExperience.startDate > today) {
      return
    }
    // Validate end date is not in the future - return early if invalid (inline error messages will show)
    if (newExperience.endDate && newExperience.endDate > today) {
      return
    }
    // Validate date range - return early if invalid (inline error messages will show)
    if (newExperience.startDate && newExperience.endDate && newExperience.endDate < newExperience.startDate) {
      return
    }
    setExperiences((prev) => [...prev, { ...newExperience }])
    setNewExperience({ jobTitle: "", company: "", startDate: "", endDate: "", responsibilities: "" })
    setEditingExperienceIndex(null)
    setIsAddingExperience(false)
    setExperienceSubmitAttempted(false) // Reset submission attempt flag on success
    setError("")
  }

  const handleAddAward = () => {
    setAwardSubmitAttempted(true) // Mark that user has attempted to submit
    if (!newAward.title) {
      setError("Please fill in the award title.")
      return
    }
    if (!newAward.issuer) {
      setError("Please fill in the issuer.")
      return
    }
    // Validate dateReceived is filled - return early if invalid (inline error messages will show)
    if (!newAward.dateReceived) {
      return
    }
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    // Validate dateReceived is not in the future - return early if invalid (inline error messages will show)
    if (newAward.dateReceived && newAward.dateReceived > today) {
      return
    }
    setAwardsRecognitions((prev) => [...prev, { ...newAward }])
    setNewAward({ title: "", issuer: "", dateReceived: "" })
    setEditingAwardIndex(null)
    setIsAddingAward(false)
    setAwardSubmitAttempted(false) // Reset submission attempt flag on success
    setError("")
  }

  const handleAddEducation = () => {
    setEducationSubmitAttempted(true) // Mark that user has attempted to submit
    if (!newEducation.courseName) {
      setError("Please fill in the course name.")
      return
    }
    if (!newEducation.institution) {
      setError("Please fill in the institution.")
      return
    }
    // Validate completionDate is filled - return early if invalid (inline error messages will show)
    if (!newEducation.completionDate) {
      return
    }
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    // Validate completionDate is not in the future - return early if invalid (inline error messages will show)
    if (newEducation.completionDate && newEducation.completionDate > today) {
      return
    }
    setContinuingEducations((prev) => [...prev, { ...newEducation }])
    setNewEducation({ courseName: "", institution: "", completionDate: "" })
    setEditingEducationIndex(null)
    setIsAddingEducation(false)
    setEducationSubmitAttempted(false) // Reset submission attempt flag on success
    setError("")
  }

  const handleAddMembership = () => {
    setMembershipSubmitAttempted(true) // Mark that user has attempted to submit
    if (!newMembership.organization) {
      setError("Please fill in the organization name.")
      return
    }
    if (!newMembership.membershipType) {
      setError("Please fill in the membership type.")
      return
    }
    // Validate startDate is filled - return early if invalid (inline error messages will show)
    if (!newMembership.startDate) {
      return
    }
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    // Validate startDate is not in the future - return early if invalid (inline error messages will show)
    if (newMembership.startDate && newMembership.startDate > today) {
      return
    }
    setProfessionalMemberships((prev) => [...prev, { ...newMembership }])
    setNewMembership({ organization: "", membershipType: "", startDate: "" })
    setEditingMembershipIndex(null)
    setIsAddingMembership(false)
    setMembershipSubmitAttempted(false) // Reset submission attempt flag on success
    setError("")
  }

  const handleAddProject = () => {
    setProjectSubmitAttempted(true) // Mark that user has attempted to submit
    if (!newProject.title) {
      setError("Please fill in the project title.")
      return
    }
    if (newProject.description && newProject.description.length > 300) {
      setError("Project description cannot exceed 300 characters.")
      return
    }
    // Validate start date is filled - return early if invalid (inline error messages will show)
    if (!newProject.startDate) {
      return
    }
    // Validate end date is filled - return early if invalid (inline error messages will show)
    if (!newProject.endDate) {
      return
    }
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    // Validate start date is not in the future - return early if invalid (inline error messages will show)
    if (newProject.startDate && newProject.startDate > today) {
      return
    }
    // Validate date range - return early if invalid (inline error messages will show)
    if (newProject.startDate && newProject.endDate && newProject.endDate < newProject.startDate) {
      return
    }
    // Validate end date is not today or future - return early if invalid (inline error messages will show)
    if (newProject.endDate && newProject.endDate >= today) {
      return
    }
    setProjects((prev) => [
      ...prev,
      {
        id: Date.now(), // Temporary ID for frontend
        title: newProject.title,
        description: newProject.description,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        projectImageFile: newProject.projectImageFile,
        preview: newProject.projectImageFile ? URL.createObjectURL(newProject.projectImageFile) : null,
      },
    ])
    setNewProject({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      projectImageFile: null,
    })
    setEditingProjectId(null)
    setIsAddingProject(false)
    setProjectSubmitAttempted(false) // Reset submission attempt flag on success
    setProjectFileSizeError("")
    setError("")
  }

  const handleAddReference = () => {
    if (!newReference.name?.trim()) {
      setError("Please fill in the reference name.")
      return
    }
    if (!newReference.relationship?.trim()) {
      setError("Please fill in the reference relationship/position.")
      return
    }
    if (!newReference.company?.trim()) {
      setError("Please fill in the reference company.")
      return
    }
    const phoneValid = validateField("referencePhone", newReference.phone)
    const emailValid = validateField("referenceEmail", newReference.email)
    if (!newReference.phone?.trim() || !newReference.email?.trim() || !phoneValid || !emailValid) {
      setError("Please provide valid reference contact details.")
      return
    }
    const referenceToAdd = {
      ...newReference,
      position: newReference.relationship,
      contact: newReference.phone,
    }
    setReferences((prev) => [...prev, referenceToAdd])
    setNewReference({ name: "", relationship: "", phone: "", company: "", email: "" })
    setEditingReferenceIndex(null)
    setIsAddingReference(false)
    updateFieldError("referencePhone", "")
    updateFieldError("referenceEmail", "")
    setError("")
  }

  const handleAddCertificate = () => {
    if (!newCertificate.courseName || !newCertificate.certificateNumber || !newCertificate.issueDate) {
      setError("Please fill in all required certificate fields.")
      return
    }
    // Validate issue date is not in the future - return early if invalid (inline error messages will show)
    const today = new Date().toISOString().split('T')[0]
    if (newCertificate.issueDate && newCertificate.issueDate > today) {
      return
    }
    setCertificates((prev) => [
      ...prev,
      {
        id: Date.now(), // Temporary ID for frontend
        courseName: newCertificate.courseName,
        certificateNumber: newCertificate.certificateNumber,
        issueDate: newCertificate.issueDate,
      },
    ])
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
    })
    setIsAddingCertificate(false)
    setError("")
  }

  const handleEditCertificate = (certificate) => {
    setEditingCertificateId(certificate.id)
    setNewCertificate({
      courseName: certificate.courseName,
      certificateNumber: certificate.certificateNumber,
      issueDate: certificate.issueDate,
    })
    setIsAddingCertificate(true)
  }

  const handleUpdateCertificate = () => {
    if (!newCertificate.courseName || !newCertificate.certificateNumber || !newCertificate.issueDate) {
      setError("Please fill in all required certificate fields.")
      return
    }
    // Validate issue date is not in the future - return early if invalid (inline error messages will show)
    const today = new Date().toISOString().split('T')[0]
    if (newCertificate.issueDate && newCertificate.issueDate > today) {
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
            }
          : cert,
      ),
    )
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
    })
    setEditingCertificateId(null)
    setIsAddingCertificate(false)
    setError("")
  }

  const handleRemoveCertificate = (id) => {
    setCertificates((prev) => prev.filter((cert) => cert.id !== id))
  }

  const handleEditProject = (project) => {
    setError("") // Clear any existing errors when editing a project
    setProjectSubmitAttempted(false) // Reset submission attempt flag
    setProjectFileSizeError("") // Clear file size error when editing
    setEditingProjectId(project.id)
    setNewProject({
      title: project.title,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      projectImageFile: null, // Don't carry over the file for editing
    })
    setIsAddingProject(true)
  }

  const handleUpdateProject = () => {
    setProjectSubmitAttempted(true) // Mark that user has attempted to submit
    if (!newProject.title) {
      setError("Please fill in the project title.")
      return
    }
    if (newProject.description && newProject.description.length > 300) {
      setError("Project description cannot exceed 300 characters.")
      return
    }
    // Validate start date is filled - return early if invalid (inline error messages will show)
    if (!newProject.startDate) {
      return
    }
    // Validate end date is filled - return early if invalid (inline error messages will show)
    if (!newProject.endDate) {
      return
    }
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    // Validate start date is not in the future - return early if invalid (inline error messages will show)
    if (newProject.startDate && newProject.startDate > today) {
      return
    }
    // Validate date range - return early if invalid (inline error messages will show)
    if (newProject.startDate && newProject.endDate && newProject.endDate < newProject.startDate) {
      return
    }
    // Validate end date is not today or future - return early if invalid (inline error messages will show)
    if (newProject.endDate && newProject.endDate >= today) {
      return
    }
    // Image file is optional when editing - can keep existing image
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === editingProjectId
          ? {
              ...proj,
              title: newProject.title,
              description: newProject.description,
              startDate: newProject.startDate,
              endDate: newProject.endDate,
              projectImageFile: newProject.projectImageFile,
              preview: newProject.projectImageFile
                ? URL.createObjectURL(newProject.projectImageFile)
                : proj.preview,
            }
          : proj,
      ),
    )
    setNewProject({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      projectImageFile: null,
    })
    setEditingProjectId(null)
    setIsAddingProject(false)
    setProjectSubmitAttempted(false) // Reset submission attempt flag on success
    setProjectFileSizeError("")
    setError("")
  }

  const handleEditSkill = (skill, index) => {
    setEditingSkillIndex(index)
    setNewSkill({
      name: skill.name,
      type: skill.type,
      proficiencyLevel: skill.proficiencyLevel || "Beginner",
    })
    setIsAddingSkill(true)
  }

  const handleUpdateSkill = () => {
    if (!newSkill.name || newSkill.name.trim() === "") {
      setError("Please fill in the skill name.")
      return
    }
    if (!validSkillTypes.includes(newSkill.type)) {
      setError(`Please select a valid skill type: ${validSkillTypes.join(", ")}`)
      return
    }
    setSkills((prev) =>
      prev.map((skill, index) =>
        index === editingSkillIndex ? { ...newSkill } : skill,
      ),
    )
    setNewSkill({ name: "", type: "TECHNICAL", proficiencyLevel: "Beginner" })
    setEditingSkillIndex(null)
    setIsAddingSkill(false)
    setError("")
  }

  const handleEditExperience = (experience, index) => {
    setExperienceSubmitAttempted(false) // Reset submission attempt flag when editing
    setEditingExperienceIndex(index)
    setNewExperience({
      jobTitle: experience.jobTitle,
      company: experience.company,
      startDate: experience.startDate,
      endDate: experience.endDate,
      responsibilities: experience.responsibilities,
    })
    setIsAddingExperience(true)
  }

  const handleUpdateExperience = () => {
    setExperienceSubmitAttempted(true) // Mark that user has attempted to submit
    if (!newExperience.jobTitle || !newExperience.company) {
      setError("Please fill in the job title and company.")
      return
    }
    // Validate start date is filled - return early if invalid (inline error messages will show)
    if (!newExperience.startDate) {
      return
    }
    // Validate end date is filled - return early if invalid (inline error messages will show)
    if (!newExperience.endDate) {
      return
    }
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    // Validate start date is not in the future - return early if invalid (inline error messages will show)
    if (newExperience.startDate && newExperience.startDate > today) {
      return
    }
    // Validate end date is not in the future - return early if invalid (inline error messages will show)
    if (newExperience.endDate && newExperience.endDate > today) {
      return
    }
    // Validate date range - return early if invalid (inline error messages will show)
    if (newExperience.startDate && newExperience.endDate && newExperience.endDate < newExperience.startDate) {
      return
    }
    setExperiences((prev) =>
      prev.map((exp, index) =>
        index === editingExperienceIndex ? { ...newExperience } : exp,
      ),
    )
    setNewExperience({ jobTitle: "", company: "", startDate: "", endDate: "", responsibilities: "" })
    setEditingExperienceIndex(null)
    setIsAddingExperience(false)
    setExperienceSubmitAttempted(false) // Reset submission attempt flag on success
    setError("")
  }

  const handleEditAward = (award, index) => {
    setAwardSubmitAttempted(false) // Reset submission attempt flag when editing
    setEditingAwardIndex(index)
    setNewAward({
      title: award.title,
      issuer: award.issuer,
      dateReceived: award.dateReceived,
    })
    setIsAddingAward(true)
  }

  const handleUpdateAward = () => {
    setAwardSubmitAttempted(true) // Mark that user has attempted to submit
    if (!newAward.title) {
      setError("Please fill in the award title.")
      return
    }
    if (!newAward.issuer) {
      setError("Please fill in the issuer.")
      return
    }
    // Validate dateReceived is filled - return early if invalid (inline error messages will show)
    if (!newAward.dateReceived) {
      return
    }
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    // Validate dateReceived is not in the future - return early if invalid (inline error messages will show)
    if (newAward.dateReceived && newAward.dateReceived > today) {
      return
    }
    setAwardsRecognitions((prev) =>
      prev.map((award, index) =>
        index === editingAwardIndex ? { ...newAward } : award,
      ),
    )
    setNewAward({ title: "", issuer: "", dateReceived: "" })
    setEditingAwardIndex(null)
    setIsAddingAward(false)
    setAwardSubmitAttempted(false) // Reset submission attempt flag on success
    setError("")
  }

  const handleEditEducation = (education, index) => {
    setEducationSubmitAttempted(false) // Reset submission attempt flag when editing
    setEditingEducationIndex(index)
    setNewEducation({
      courseName: education.courseName,
      institution: education.institution,
      completionDate: education.completionDate,
    })
    setIsAddingEducation(true)
  }

  const handleUpdateEducation = () => {
    setEducationSubmitAttempted(true) // Mark that user has attempted to submit
    if (!newEducation.courseName) {
      setError("Please fill in the course name.")
      return
    }
    // Validate completionDate is filled - return early if invalid (inline error messages will show)
    if (!newEducation.completionDate) {
      return
    }
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    // Validate completionDate is not in the future - return early if invalid (inline error messages will show)
    if (newEducation.completionDate && newEducation.completionDate > today) {
      return
    }
    setContinuingEducations((prev) =>
      prev.map((edu, index) =>
        index === editingEducationIndex ? { ...newEducation } : edu,
      ),
    )
    setNewEducation({ courseName: "", institution: "", completionDate: "" })
    setEditingEducationIndex(null)
    setIsAddingEducation(false)
    setEducationSubmitAttempted(false) // Reset submission attempt flag on success
    setError("")
  }

  const handleEditMembership = (membership, index) => {
    setMembershipSubmitAttempted(false) // Reset submission attempt flag when editing
    setEditingMembershipIndex(index)
    setNewMembership({
      organization: membership.organization,
      membershipType: membership.membershipType,
      startDate: membership.startDate,
    })
    setIsAddingMembership(true)
  }

  const handleUpdateMembership = () => {
    setMembershipSubmitAttempted(true) // Mark that user has attempted to submit
    if (!newMembership.organization) {
      setError("Please fill in the organization name.")
      return
    }
    if (!newMembership.membershipType) {
      setError("Please fill in the membership type.")
      return
    }
    // Validate startDate is filled - return early if invalid (inline error messages will show)
    if (!newMembership.startDate) {
      return
    }
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    // Validate startDate is not in the future - return early if invalid (inline error messages will show)
    if (newMembership.startDate && newMembership.startDate > today) {
      return
    }
    setProfessionalMemberships((prev) =>
      prev.map((mem, index) =>
        index === editingMembershipIndex ? { ...newMembership } : mem,
      ),
    )
    setNewMembership({ organization: "", membershipType: "", startDate: "" })
    setEditingMembershipIndex(null)
    setIsAddingMembership(false)
    setMembershipSubmitAttempted(false) // Reset submission attempt flag on success
    setError("")
  }

  const handleEditReference = (reference, index) => {
    setEditingReferenceIndex(index)
    setNewReference({
      name: reference.name,
      relationship: reference.relationship || reference.position,
      phone: reference.phone || reference.contact,
      company: reference.company,
      email: reference.email,
    })
    setIsAddingReference(true)
  }

  const handleUpdateReference = () => {
    if (!newReference.name) {
      setError("Please fill in the reference name.")
      return
    }
    if (!newReference.relationship?.trim()) {
      setError("Please fill in the reference relationship/position.")
      return
    }
    if (!newReference.company?.trim()) {
      setError("Please fill in the reference company.")
      return
    }
    const phoneValid = validateField("referencePhone", newReference.phone)
    const emailValid = validateField("referenceEmail", newReference.email)
    if (!newReference.phone?.trim() || !newReference.email?.trim() || !phoneValid || !emailValid) {
      setError("Please provide valid reference contact details.")
      return
    }
    const referenceToUpdate = {
      ...newReference,
      position: newReference.relationship,
      contact: newReference.phone,
    }
    setReferences((prev) =>
      prev.map((ref, index) =>
        index === editingReferenceIndex ? referenceToUpdate : ref,
      ),
    )
    setNewReference({ name: "", relationship: "", phone: "", company: "", email: "" })
    setEditingReferenceIndex(null)
    setIsAddingReference(false)
    updateFieldError("referencePhone", "")
    updateFieldError("referenceEmail", "")
    setError("")
  }

  const handleRemoveSkill = (index) => {
    setSkills((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExperience = (index) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveAward = (index) => {
    setAwardsRecognitions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveEducation = (index) => {
    setContinuingEducations((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveMembership = (index) => {
    setProfessionalMemberships((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveProject = (id) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id))
  }

  const handleRemoveReference = (index) => {
    setReferences((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImageClick = () => avatarFileInputRef.current.click()
  const handleProjectImageClick = () => projectFileInputRef.current.click()

  // Helper function to show notifications
  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    })
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 4000)
  }

  // Helper functions to check if required fields are filled
  const isProjectFormValid = () => {
    const today = new Date().toISOString().split('T')[0]
    return (
      newProject.title?.trim() &&
      newProject.startDate &&
      newProject.endDate &&
      newProject.startDate <= today &&
      newProject.endDate < today &&
      newProject.endDate >= newProject.startDate
    )
  }

  const isCertificateFormValid = () => {
    const today = new Date().toISOString().split('T')[0]
    return (
      newCertificate.courseName?.trim() &&
      newCertificate.certificateNumber?.trim() &&
      newCertificate.issueDate &&
      newCertificate.issueDate <= today
    )
  }

  const isSkillFormValid = () => {
    return newSkill.name?.trim() && validSkillTypes.includes(newSkill.type)
  }

  const isAwardFormValid = () => {
    const today = new Date().toISOString().split('T')[0]
    return (
      newAward.title?.trim() &&
      newAward.issuer?.trim() &&
      newAward.dateReceived &&
      newAward.dateReceived <= today
    )
  }

  const isEducationFormValid = () => {
    const today = new Date().toISOString().split('T')[0]
    return (
      newEducation.courseName?.trim() &&
      newEducation.institution?.trim() &&
      newEducation.completionDate &&
      newEducation.completionDate <= today
    )
  }

  const isMembershipFormValid = () => {
    const today = new Date().toISOString().split('T')[0]
    return (
      newMembership.organization?.trim() &&
      newMembership.membershipType?.trim() &&
      newMembership.startDate &&
      newMembership.startDate <= today
    )
  }

  const isReferenceFormValid = () => {
    return (
      newReference.name?.trim() &&
      newReference.relationship?.trim() &&
      newReference.company?.trim() &&
      newReference.phone?.trim() &&
      newReference.email?.trim() &&
      !fieldErrors.referencePhone &&
      !fieldErrors.referenceEmail
    )
  }

  const isExperienceFormValid = () => {
    const today = new Date().toISOString().split('T')[0]
    return (
      newExperience.jobTitle?.trim() &&
      newExperience.company?.trim() &&
      newExperience.startDate &&
      newExperience.endDate &&
      newExperience.startDate <= today &&
      newExperience.endDate <= today &&
      newExperience.endDate >= newExperience.startDate
    )
  }

  // Auto-cancel all add forms when switching steps
  useEffect(() => {
    // Reset all add forms when step changes
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
    
    setIsAddingCertificate(false)
    setEditingCertificateId(null)
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
    })
    
    setIsAddingSkill(false)
    setEditingSkillIndex(null)
    setNewSkill({ name: "", type: "TECHNICAL", proficiencyLevel: "Beginner" })
    
    setIsAddingExperience(false)
    setEditingExperienceIndex(null)
    setExperienceSubmitAttempted(false)
    setNewExperience({ jobTitle: "", company: "", startDate: "", endDate: "", responsibilities: "" })
    
    setIsAddingAward(false)
    setEditingAwardIndex(null)
    setAwardSubmitAttempted(false)
    setNewAward({ title: "", issuer: "", dateReceived: "" })
    
    setIsAddingEducation(false)
    setEditingEducationIndex(null)
    setEducationSubmitAttempted(false)
    setNewEducation({ courseName: "", institution: "", completionDate: "" })
    
    setIsAddingMembership(false)
    setEditingMembershipIndex(null)
    setMembershipSubmitAttempted(false)
    setNewMembership({ organization: "", membershipType: "", startDate: "" })
    
    setIsAddingReference(false)
    setEditingReferenceIndex(null)
    setNewReference({ name: "", relationship: "", phone: "", company: "", email: "" })
    updateFieldError("referencePhone", "")
    updateFieldError("referenceEmail", "")
  }, [currentStep])

  const validateStep = (step, showError = true) => {
    switch (step) {
      case 0: // Profile Photo - required
        if (!previewAvatar || previewAvatar === "/placeholder.svg") {
          if (showError) {
            showNotification("error", "Validation Error", "Please upload a profile photo before proceeding.")
          }
          return false
        }
        return true
      case 1: // Basic Information
        if (!formData.fullName || formData.fullName.trim() === "") {
          if (showError) showNotification("error", "Validation Error", "Please fill in your full name. This field is required.")
          return false
        }
        if (!formData.professionalSummary || formData.professionalSummary.trim() === "") {
          if (showError) showNotification("error", "Validation Error", "Please fill in your professional summary. This field is required.")
          return false
        }
        if (formData.professionalSummary.length > 300) {
          if (showError) showNotification("error", "Validation Error", "Professional summary cannot exceed 300 characters.")
          return false
        }
        return true
      case 2: // TESDA Information
        if (!formData.ncLevel || formData.ncLevel.trim() === "") {
          if (showError) showNotification("error", "Validation Error", "Please select your NC Level. This field is required.")
          return false
        }
        if (!formData.trainingCenter || formData.trainingCenter.trim() === "") {
          if (showError) showNotification("error", "Validation Error", "Please fill in the Training Center/Institution. This field is required.")
          return false
        }
        if (!formData.scholarshipType || formData.scholarshipType.trim() === "") {
          if (showError) showNotification("error", "Validation Error", "Please select your Scholarship Type. This field is required.")
          return false
        }
        if (!formData.trainingDuration || formData.trainingDuration.trim() === "") {
          if (showError) showNotification("error", "Validation Error", "Please fill in the Training Duration. This field is required.")
          return false
        }
        return true
      case 3: // Contact Information
        if (!formData.email || formData.email.trim() === "") {
          if (showError) showNotification("error", "Validation Error", "Email is required.")
          return false
        }
        if (!formData.phone || formData.phone.trim() === "") {
          if (showError) showNotification("error", "Validation Error", "Phone number is required.")
          return false
        }
        if (formData.email && fieldErrors.email) {
          if (showError) showNotification("error", "Validation Error", fieldErrors.email)
          return false
        }
        if (formData.phone && fieldErrors.phone) {
          if (showError) showNotification("error", "Validation Error", fieldErrors.phone)
          return false
        }
        if (formData.website && fieldErrors.website) {
          if (showError) showNotification("error", "Validation Error", fieldErrors.website)
          return false
        }
        return true
      case 12: // Additional Information
        if (!formData.primaryCourseType || (typeof formData.primaryCourseType === "string" && formData.primaryCourseType.trim() === "")) {
          if (showError) showNotification("error", "Validation Error", "Please fill in your primary course type. This field is required.")
          return false
        }
        return true
      default:
        return true // Other steps are optional
    }
  }

  const markStepAsCompleted = (stepIndex) => {
    if (steps[stepIndex].required && validateStep(stepIndex, false)) {
      setCompletedSteps((prev) => new Set([...prev, stepIndex]))
    }
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      // Mark current step as completed if it's a required step
      markStepAsCompleted(currentStep)
      
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } else {
      // Validation failed, error already shown by validateStep via notification
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleStepClick = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      // Allow clicking on current step or completed steps
      if (stepIndex === currentStep) {
        return
      }
      
      // Check if we can access this step (all previous required steps completed)
      if (canAccessStep(stepIndex)) {
        setCurrentStep(stepIndex)
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        // Find the first incomplete required step
        for (let i = 0; i < stepIndex; i++) {
          if (steps[i].required && !isStepCompleted(i)) {
            showNotification("error", "Step Required", `Please complete the "${steps[i].name}" section before proceeding.`)
            setCurrentStep(i)
            window.scrollTo({ top: 0, behavior: "smooth" })
            return
          }
        }
      }
    }
  }

  // Update completed steps and error steps when form data changes
  useEffect(() => {
    // Check and update completed status and errors for all steps when data changes
    steps.forEach((step, index) => {
      const completed = isStepCompleted(index)
      const hasErrors = hasStepErrors(index)
      
      // Update completed steps
      if (completed) {
        setCompletedSteps((prev) => {
          if (!prev.has(index)) {
            return new Set([...prev, index])
          }
          return prev
        })
      } else {
        // Remove from completed if step is no longer valid (even for optional steps)
        setCompletedSteps((prev) => {
          if (prev.has(index)) {
            const newSet = new Set(prev)
            newSet.delete(index)
            return newSet
          }
          return prev
        })
      }
      
      // Update error steps
      if (hasErrors) {
        setErrorSteps((prev) => {
          if (!prev.has(index)) {
            return new Set([...prev, index])
          }
          return prev
        })
      } else {
        setErrorSteps((prev) => {
          if (prev.has(index)) {
            const newSet = new Set(prev)
            newSet.delete(index)
            return newSet
          }
          return prev
        })
      }
    })
  }, [
    formData.fullName,
    formData.professionalSummary,
    formData.primaryCourseType,
    formData.ncLevel,
    formData.trainingCenter,
    formData.scholarshipType,
    formData.trainingDuration,
    formData.email,
    formData.phone,
    formData.website,
    previewAvatar,
    selectedAvatarFile,
    projects,
    certificates,
    skills,
    experiences,
    awardsRecognitions,
    continuingEducations,
    professionalMemberships,
    references,
    fieldErrors,
    currentStep,
  ])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Only submit if we're on the last step (Preview step)
    if (currentStep !== totalSteps - 1) {
      // If not on last step, just go to next step
      handleNextStep()
      return
    }
    
    if (Object.keys(fieldErrors).length > 0) {
      showNotification("error", "Validation Error", "Please resolve all validation errors before submitting your portfolio.")
      return
    }

    setIsLoading(true)

    const validatedSkills = skills.map((skill) => {
      if (!skill.name || skill.name.trim() === "") {
        throw new Error("Skill name is required.")
      }
      if (!validSkillTypes.includes(skill.type)) {
        throw new Error(`Invalid skill type for ${skill.name}. Must be one of: ${validSkillTypes.join(", ")}`)
      }
      return {
        name: skill.name,
        type: skill.type,
        proficiencyLevel: skill.proficiencyLevel || null,
      }
    })

    try {
      const username = localStorage.getItem("username")
      if (!username || !token || !graduateId) {
        showNotification("error", "Authentication Error", "User not logged in, token missing, or graduate ID not found. Please sign in.")
        navigate("/signin")
        setIsLoading(false)
        return
      }

      let avatarUrl = formData.avatar || ""
      if (selectedAvatarFile) {
        const formDataAvatar = new FormData()
        formDataAvatar.append("file", selectedAvatarFile)
        const uploadResponse = await axios.post(
          `${BACKEND_URL}/api/graduate/${graduateId}/upload-picture`,
          formDataAvatar,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          },
        )
        avatarUrl = uploadResponse.data.profilePicture
      }

      const certificateIds = []
      for (const cert of certificates) {
        const certificateData = new FormData()
        certificateData.append("courseName", cert.courseName)
        certificateData.append("certificateNumber", cert.certificateNumber)
        certificateData.append("issueDate", cert.issueDate)
        const certResponse = await axios.post(
          `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
          certificateData,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          },
        )
        certificateIds.push(certResponse.data.id)
      }

            // Validate professional summary length
      if (formData.professionalSummary.length > 300) {
        showNotification("error", "Validation Error", "Professional summary cannot exceed 300 characters.")
        setIsLoading(false)
        return
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
        email: formData.email || null,
        phone: formData.phone ? (formData.phone.startsWith("+63") ? formData.phone : `+63${formData.phone}`) : null,
        website: formData.website || null,
        portfolioCategory: formData.portfolioCategory || null,
        preferredWorkLocation: formData.preferredWorkLocation || null,
        workScheduleAvailability: formData.workScheduleAvailability || null,
        salaryExpectations: formData.salaryExpectations || null,
        skills: validatedSkills,
        experiences: experiences.map((exp) => ({
          jobTitle: exp.jobTitle,
          employer: exp.company,
          startDate: exp.startDate || null,
          endDate: exp.endDate || null,
          description: exp.responsibilities || null,
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
        references: references.map((ref) => {
          const phoneValue = ref.phone || ref.contact || null
          const formattedPhone = phoneValue ? (phoneValue.startsWith("+63") ? phoneValue : `+63${phoneValue}`) : null
          return {
            name: ref.name,
            relationship: ref.relationship || ref.position || null,
            position: ref.relationship || ref.position || null,
            company: ref.company || null,
            phone: formattedPhone,
            contact: formattedPhone,
            email: ref.email || null,
          }
        }),
        certificateIds: certificateIds,
      }

      console.log("Sending portfolio payload:", JSON.stringify(payload, null, 2))

      const portfolioResponse = await axios.post(`${BACKEND_URL}/api/portfolio`, payload, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })
      const portfolioId = portfolioResponse.data.id
      localStorage.setItem("portfolioId", portfolioId)

      // Create projects after portfolio is created
      for (const proj of projects) {
        const formDataProject = new FormData()
        formDataProject.append("portfolioId", portfolioId)
        formDataProject.append("title", proj.title)
        formDataProject.append("description", proj.description || "")
        if (proj.startDate && proj.startDate.trim() !== "") {
          // Convert date string (YYYY-MM-DD) to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
          const startDateStr = proj.startDate.includes("T") ? proj.startDate : `${proj.startDate}T00:00:00`
          formDataProject.append("startDate", startDateStr)
        }
        if (proj.endDate && proj.endDate.trim() !== "") {
          // Convert date string (YYYY-MM-DD) to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
          const endDateStr = proj.endDate.includes("T") ? proj.endDate : `${proj.endDate}T00:00:00`
          formDataProject.append("endDate", endDateStr)
        }
        if (proj.projectImageFile) {
          formDataProject.append("projectImageFile", proj.projectImageFile)
        }

        await axios.post(`${BACKEND_URL}/api/project`, formDataProject, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        })
      }

      console.log("Portfolio created with ID:", portfolioId)
      showNotification("success", "Portfolio Created", "Your portfolio has been created successfully!")
      // Navigate after a short delay to show the notification
      setTimeout(() => {
        navigate("/graduate-homepage")
      }, 2000)
    } catch (err) {
      let errorMessage = "Failed to create portfolio"
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = `Bad Request: ${err.response.data || "Invalid data provided"}`
          console.error("Response data:", err.response.data)
        } else if (err.response.status === 401) {
          errorMessage = "Unauthorized: Please sign in again."
          navigate("/signin")
        } else if (err.response.status === 403) {
          errorMessage = "Forbidden: You are not authorized to perform this action."
        } else if (err.response.status === 409) {
          errorMessage = "Portfolio already exists for this graduate."
        } else {
          errorMessage = err.response.data || err.response.statusText || "Failed to create portfolio"
        }
      } else {
        errorMessage = `Network error: ${err.message}`
      }
      showNotification("error", "Error", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Global style to ensure dropdowns appear above navigation */}
      <style>{`
        .material-tailwind-select-menu {
          z-index: 99999 !important;
        }
        [data-popper-placement] {
          z-index: 99999 !important;
        }
        .material-tailwind-select-menu > div {
          z-index: 99999 !important;
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
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
      `}</style>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Floating dots pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="floating-dots"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Typography
            variant="h1"
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            Create Your Portfolio
          </Typography>
          <Typography variant="lead" className="text-gray-600 max-w-2xl mx-auto mb-6">
            Build a professional portfolio that showcases your skills, experience, and achievements
          </Typography>
          
          {/* Progress Bar - Hidden on Preview Step */}
          {currentStep !== 13 && (
            <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl mb-6">
              <CardBody className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="small" className="text-gray-700 font-medium">
                      Step {currentStep + 1} of {totalSteps}
                    </Typography>
                    <Typography variant="small" className="text-gray-700 font-medium">
                      {Math.round(progressPercentage)}% Complete
                    </Typography>
                  </div>
                  <Progress value={progressPercentage} color="blue" className="h-2" />
                </div>
                
                {/* Step Indicators */}
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {steps.map((step, index) => {
                    const isAccessible = canAccessStep(index)
                    const isCompleted = isStepCompleted(index)
                    const hasErrors = errorSteps.has(index)
                    const isCurrent = index === currentStep
                    
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => handleStepClick(index)}
                        disabled={isLoading || !isAccessible}
                        title={
                          !isAccessible
                            ? `Complete required steps before accessing "${step.name}"`
                            : hasErrors
                            ? `"${step.name}" has validation errors`
                            : step.required && !isCompleted
                            ? `"${step.name}" is required and not yet completed`
                            : step.name
                        }
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          isCurrent
                            ? hasErrors
                              ? "bg-red-500 text-white shadow-lg scale-105 cursor-pointer"
                              : "bg-blue-500 text-white shadow-lg scale-105 cursor-pointer"
                            : hasErrors
                            ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                            : isCompleted
                            ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                            : !isAccessible
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
                        }`}
                      >
                        {isCompleted && !hasErrors && <FaCheck className="w-3 h-3" />}
                        {hasErrors && <FaExclamationCircle className="w-3 h-3" />}
                        <span>{step.name}</span>
                        {step.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 0: Profile Photo */}
          {currentStep === 0 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(0)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                  isStepCompleted(0)
                    ? "bg-gradient-to-b from-green-500 to-green-600"
                    : "bg-gradient-to-b from-blue-500 to-purple-500"
                }`}></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Profile Photo
                </Typography>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Avatar
                  src={previewAvatar}
                  alt="Profile Preview"
                  size="xxl"
                  className="cursor-pointer ring-4 ring-blue-100 hover:ring-blue-200 transition-all duration-300 hover:scale-105"
                  onClick={handleImageClick}
                />
                <Typography variant="small" className="text-gray-600 text-center">
                  Click the image or button to upload a profile picture
                </Typography>
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={handleImageClick}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Choose Image
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  ref={avatarFileInputRef}
                  className="hidden"
                />
                {avatarFileSizeError && (
                  <Typography variant="small" color="red" className="mt-2 text-center">
                    {avatarFileSizeError}
                  </Typography>
                )}
              </div>
            </CardBody>
          </Card>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(1)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                  isStepCompleted(1)
                    ? "bg-gradient-to-b from-green-500 to-green-600"
                    : "bg-gradient-to-b from-blue-500 to-purple-500"
                }`}></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Basic Information
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Full Name *
                  </Typography>
                  <Input
                    size="lg"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    name="fullName"
                    placeholder="Enter your full name"
                    required
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Professional Title
                  </Typography>
                  <Input
                    size="lg"
                    value={formData.professionalTitle}
                    onChange={handleInputChange}
                    name="professionalTitle"
                    placeholder="Enter your professional title"
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
              <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                Professional Summary *
              </Typography>
              <Textarea
                size="lg"
                value={formData.professionalSummary}
                onChange={handleInputChange}
                name="professionalSummary"
                placeholder="Brief summary of your professional background"
                required
                disabled={isLoading}
                className="!border-gray-300 focus:!border-blue-500"
                rows={4}
                maxLength={300} // Enforces max input length
              />
              <div className="flex justify-between items-center mt-1">
                <Typography variant="small" className="text-gray-500">
                  {formData.professionalSummary.length}/300 characters
                </Typography>
                {formData.professionalSummary.length > 300 && (
                  <Typography variant="small" color="red">
                    Summary cannot exceed 300 characters.
                  </Typography>
                )}
              </div>
            </div>
            </CardBody>
          </Card>
          )}

          {/* Step 2: TESDA Information */}
          {currentStep === 2 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(2)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                  isStepCompleted(2)
                    ? "bg-gradient-to-b from-green-500 to-green-600"
                    : "bg-gradient-to-b from-blue-500 to-purple-500"
                }`}></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  TESDA Information
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    NC Level *
                  </Typography>
                  <select
                    value={ncLevelSelectValue}
                    onChange={(e) => {
                      const selected = e.target.value
                      if (selected === "OTHER") {
                        setIsNcLevelOtherSelected(true)
                        setFormData((prev) => ({
                          ...prev,
                          ncLevel: prev.ncLevel && !NC_LEVEL_OPTIONS.includes(prev.ncLevel) ? prev.ncLevel : "",
                        }))
                        return
                      }
                      setIsNcLevelOtherSelected(false)
                      setFormData((prev) => ({ ...prev, ncLevel: selected || "" }))
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 bg-white transition-colors"
                  >
                    <option value="">Select NC Level</option>
                    {NC_LEVEL_OPTIONS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                    <option value="OTHER">Other (type manually)</option>
                  </select>
                  {isNcLevelOtherSelected && (
                    <div className="mt-3">
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Custom NC Level
                      </Typography>
                      <Input
                        size="lg"
                        value={formData.ncLevel}
                        onChange={handleInputChange}
                        name="ncLevel"
                        placeholder="Enter NC level"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Training Center/Institution *
                  </Typography>
                  <Input
                    size="lg"
                    value={formData.trainingCenter}
                    onChange={handleInputChange}
                    name="trainingCenter"
                    placeholder="Enter training center or institution"
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Scholarship Type *
                  </Typography>
                  <Select
                    size="lg"
                    value={formData.scholarshipType || ""}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        scholarshipType: value || "",
                      }))
                    }
                    name="scholarshipType"
                    label="Select scholarship type"
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500 bg-white"
                  >
                    <Option value="GOVERNMENT_SCHOLAR">Government Scholar</Option>
                    <Option value="INSTITUTIONAL_SCHOLAR">Institutional Scholar</Option>
                    <Option value="NON_SCHOLAR">Non Scholar</Option>
                  </Select>
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Training Duration *
                  </Typography>
                  <Input
                    size="lg"
                    value={formData.trainingDuration}
                    onChange={handleInputChange}
                    name="trainingDuration"
                    placeholder="e.g., January 2023 - June 2023"
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>
              </div>

            </CardBody>
          </Card>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(3)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                  isStepCompleted(3)
                    ? "bg-gradient-to-b from-green-500 to-green-600"
                    : "bg-gradient-to-b from-blue-500 to-purple-500"
                }`}></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Contact Information
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Email *
                  </Typography>
                  <Input
                    type="email"
                    size="lg"
                    value={formData.email}
                    onChange={handleInputChange}
                    name="email"
                    placeholder="Enter your email"
                    disabled={isLoading}
                    required
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                {fieldErrors.email && (
                  <Typography variant="small" color="red" className="mt-1">
                    {fieldErrors.email}
                  </Typography>
                )}
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Phone *
                  </Typography>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-700 font-medium">+63</span>
                    </div>
                    <Input
                      type="tel"
                      size="lg"
                      value={formData.phone}
                      onChange={handleInputChange}
                      name="phone"
                      placeholder="1234567890"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      disabled={isLoading}
                      required
                      className="!border-gray-300 focus:!border-blue-500 pl-12"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <Typography variant="small" color="red" className="mt-1">
                      {fieldErrors.phone}
                    </Typography>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                  Website
                </Typography>
                <Input
                  type="url"
                  size="lg"
                  value={formData.website}
                  onChange={handleInputChange}
                  name="website"
                  placeholder="https://www.example.com"
                  disabled={isLoading}
                  className="!border-gray-300 focus:!border-blue-500"
                />
                {fieldErrors.website && (
                  <Typography variant="small" color="red" className="mt-1">
                    {fieldErrors.website}
                  </Typography>
                )}
              </div>
            </CardBody>
          </Card>
          )}

          {/* Step 4: Projects */}
          {currentStep === 4 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(4)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                    isStepCompleted(4)
                      ? "bg-gradient-to-b from-green-500 to-green-600"
                      : "bg-gradient-to-b from-blue-500 to-purple-500"
                  }`}></div>
                  <Typography variant="h4" className="text-gray-800 font-semibold">
                    Projects
                  </Typography>
                </div>
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={() => {
                    setError("") // Clear any existing errors when opening the form
                    setProjectSubmitAttempted(false) // Reset submission attempt flag
                    setIsAddingProject(true)
                    setEditingProjectId(null)
                    setNewProject({
                      title: "",
                      description: "",
                      startDate: "",
                      endDate: "",
                      projectImageFile: null,
                    })
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Project
                </Button>
              </div>
              {isAddingProject && (
                <div className="project-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Project Title *
                      </Typography>
                      <Input
                        size="lg"
                        value={newProject.title}
                        onChange={handleProjectInputChange}
                        name="title"
                        placeholder="Enter project title"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Description
                      </Typography>
                      <Textarea
                        size="lg"
                        value={newProject.description}
                        onChange={handleProjectInputChange}
                        name="description"
                        placeholder="Describe your project"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500 whitespace-pre-wrap break-words"
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
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Start Date *
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={newProject.startDate}
                        onChange={handleProjectInputChange}
                        onBlur={handleProjectInputBlur}
                        name="startDate"
                        max={(() => {
                          const today = new Date()
                          return today.toISOString().split('T')[0]
                        })()}
                        required
                        disabled={isLoading}
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
                        value={newProject.endDate}
                        onChange={handleProjectInputChange}
                        onBlur={handleProjectInputBlur}
                        name="endDate"
                        min={newProject.startDate || undefined}
                        max={(() => {
                          const yesterday = new Date()
                          yesterday.setDate(yesterday.getDate() - 1)
                          return yesterday.toISOString().split('T')[0]
                        })()}
                        required
                        disabled={isLoading}
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

                  <div className="flex flex-col items-center space-y-4 mb-6">
                    <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                      Project Image (Optional)
                    </Typography>
                    <Avatar
                      src={
                        newProject.projectImageFile
                          ? URL.createObjectURL(newProject.projectImageFile)
                          : editingProjectId && projects.find(p => p.id === editingProjectId)?.preview
                          ? projects.find(p => p.id === editingProjectId).preview
                          : "/placeholder.svg"
                      }
                      alt="Project Preview"
                      size="xxl"
                      className="cursor-pointer ring-4 ring-blue-100 hover:ring-blue-200 transition-all duration-300 hover:scale-105"
                      onClick={handleProjectImageClick}
                    />
                    <Typography variant="small" className="text-gray-600 text-center">
                      {newProject.projectImageFile 
                        ? newProject.projectImageFile.name 
                        : editingProjectId && projects.find(p => p.id === editingProjectId)?.preview
                        ? "Click to change image (or leave unchanged)"
                        : "Click to upload project image (optional)"}
                    </Typography>
                    <Button
                      variant="gradient"
                      color="blue"
                      onClick={handleProjectImageClick}
                      disabled={isLoading}
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
                    {projectFileSizeError && (
                      <Typography variant="small" color="red" className="mt-2 text-center">
                        {projectFileSizeError}
                      </Typography>
                    )}
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={editingProjectId ? handleUpdateProject : handleAddProject}
                      disabled={isLoading || (!editingProjectId && !isProjectFormValid())}
                      className="flex items-center gap-2"
                    >
                      {editingProjectId ? "Update" : "Add"} Project
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => {
                        setIsAddingProject(false)
                        setEditingProjectId(null)
                        setProjectSubmitAttempted(false) // Reset submission attempt flag on cancel
                        setProjectFileSizeError("")
                        setNewProject({
                          title: "",
                          description: "",
                          startDate: "",
                          endDate: "",
                          projectImageFile: null,
                        })
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {projects.length > 0 && (
                <div className="project-list mt-8 space-y-4">
                  <Typography variant="h5" className="text-gray-800 font-semibold">
                    Added Projects
                  </Typography>
                  {projects.map((proj) => (
                    <Card key={proj.id} className="border border-gray-200 shadow-sm break-words">
                      <CardBody className="p-6 flex flex-col gap-6 md:flex-row md:items-center">
                        <Avatar src={proj.preview || "/placeholder.svg"} alt="Project Preview" size="xl" className="rounded-md flex-shrink-0" />
                        <div className="flex-grow min-w-0">
                          <Typography variant="h6" className="text-gray-900 font-bold mb-1 break-words">
                            {proj.title}
                          </Typography>
                          {proj.description && (
                          <Typography variant="paragraph" className="text-gray-600 text-sm mb-2 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                              {proj.description}
                            </Typography>
                          )}
                          {(proj.startDate || proj.endDate) && (
                            <Typography variant="small" className="text-gray-500">
                              {proj.startDate ? new Date(proj.startDate).toLocaleDateString() : "N/A"} -{" "}
                              {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : "N/A"}
                            </Typography>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="text"
                            color="blue"
                            size="sm"
                            onClick={() => handleEditProject(proj)}
                            disabled={isLoading}
                            className="hover:bg-blue-100 focus:bg-blue-100"
                          >
                            <FaPen className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="text"
                            color="red"
                            size="sm"
                            onClick={() => handleRemoveProject(proj.id)}
                            disabled={isLoading}
                            className="hover:bg-red-100 focus:bg-red-100"
                          >
                            <FaTrash className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          )}

          {/* Step 5: Certificates */}
          {currentStep === 5 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(5)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                    isStepCompleted(5)
                      ? "bg-gradient-to-b from-green-500 to-green-600"
                      : "bg-gradient-to-b from-blue-500 to-purple-500"
                  }`}></div>
                  <Typography variant="h4" className="text-gray-800 font-semibold">
                    Certificates
                  </Typography>
                </div>
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={() => {
                    setIsAddingCertificate(true)
                    setEditingCertificateId(null)
                    setNewCertificate({
                      courseName: "",
                      certificateNumber: "",
                      issueDate: "",
                      certificateFile: null,
                    })
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Certificate
                </Button>
              </div>
              {isAddingCertificate && (
                <div className="certificate-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Certificate Name *
                      </Typography>
                      <Input
                        size="lg"
                        value={newCertificate.courseName}
                        onChange={handleCertificateInputChange}
                        name="courseName"
                        placeholder="Enter certificate name"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Issuing Organization *
                      </Typography>
                      <Input
                        size="lg"
                        value={newCertificate.certificateNumber}
                        onChange={handleCertificateInputChange}
                        name="certificateNumber"
                        placeholder="Enter issuing organization"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Issue Date *
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={newCertificate.issueDate}
                        onChange={handleCertificateInputChange}
                        onBlur={handleCertificateInputBlur}
                        name="issueDate"
                        max={(() => {
                          const today = new Date()
                          return today.toISOString().split('T')[0]
                        })()}
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                      {newCertificate.issueDate && (() => {
                        const today = new Date().toISOString().split('T')[0]
                        return newCertificate.issueDate > today
                      })() && (
                        <Typography variant="small" color="red" className="mt-1">
                          Issue Date cannot be a future date.
                        </Typography>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={editingCertificateId ? handleUpdateCertificate : handleAddCertificate}
                      disabled={isLoading || (!editingCertificateId && !isCertificateFormValid())}
                      className="flex items-center gap-2"
                    >
                      {editingCertificateId ? "Update" : "Add"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => {
                        setIsAddingCertificate(false)
                        setEditingCertificateId(null)
                        setCertificateFileSizeError("")
                        setNewCertificate({
                          courseName: "",
                          certificateNumber: "",
                          issueDate: "",
                          certificateFile: null,
                        })
                        updateFieldError("certificateNumber", "")
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {certificates.length > 0 && (
                <div className="certificate-list mt-8 space-y-4">
                  <Typography variant="h5" className="text-gray-800 font-semibold">
                    Added Certificates
                  </Typography>
                  {certificates.map((cert) => (
                    <Card key={cert.id} className="border border-gray-200 shadow-sm">
                      <CardBody className="p-6 flex flex-col md:flex-row items-center gap-6">
                        {cert.preview && (
                          <Avatar src={cert.preview} alt="Certificate Preview" size="xl" className="rounded-md" />
                        )}
                        <div className="flex-grow">
                          <Typography variant="h6" className="text-gray-900 font-bold mb-1">
                            {cert.courseName}
                          </Typography>
                          <Typography variant="paragraph" className="text-gray-600 text-sm mb-1">
                            Certificate Number: {cert.certificateNumber}
                          </Typography>
                          <Typography variant="paragraph" className="text-gray-600 text-sm">
                            Issue Date: {cert.issueDate}
                          </Typography>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="text"
                            color="blue"
                            size="sm"
                            onClick={() => handleEditCertificate(cert)}
                            disabled={isLoading}
                            className="hover:bg-blue-100 focus:bg-blue-100"
                          >
                            <FaPen className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="text"
                            color="red"
                            size="sm"
                            onClick={() => handleRemoveCertificate(cert.id)}
                            disabled={isLoading}
                            className="hover:bg-red-100 focus:bg-red-100"
                          >
                            <FaTrash className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          )}

          {/* Step 6: Skills */}
          {currentStep === 6 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(6)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                    isStepCompleted(6)
                      ? "bg-gradient-to-b from-green-500 to-green-600"
                      : "bg-gradient-to-b from-blue-500 to-purple-500"
                  }`}></div>
                  <Typography variant="h4" className="text-gray-800 font-semibold">
                    Skills
                  </Typography>
                </div>
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={() => {
                    setIsAddingSkill(true)
                    setEditingSkillIndex(null)
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Skill
                </Button>
              </div>
              {isAddingSkill && (
                <div className="skill-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Skill Name *
                      </Typography>
                      <Input
                        size="lg"
                        value={newSkill.name}
                        onChange={handleSkillInputChange}
                        name="name"
                        placeholder="e.g., Welding"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Skill Type *
                      </Typography>
                      <Select
                        size="lg"
                        label="Select Skill Type"
                        value={newSkill.type}
                        onChange={(val) => setNewSkill((prev) => ({ ...prev, type: val }))}
                        menuProps={selectMenuProps}
                        containerProps={selectContainerProps}
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      >
                        {validSkillTypes.map((type) => (
                          <Option key={type} value={type}>
                            {type}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Proficiency Level
                      </Typography>
                      <Select
                        size="lg"
                        label="Select Proficiency Level"
                        value={newSkill.proficiencyLevel || "Beginner"}
                        onChange={(val) =>
                          setNewSkill((prev) => ({ ...prev, proficiencyLevel: val || "Beginner" }))
                        }
                        menuProps={selectMenuProps}
                        containerProps={selectContainerProps}
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      >
                        {SKILL_PROFICIENCY_LEVELS.map((level) => (
                          <Option key={level} value={level}>
                            {level}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={editingSkillIndex !== null ? handleUpdateSkill : handleAddSkill}
                      disabled={isLoading || (editingSkillIndex === null && !isSkillFormValid())}
                      className="flex items-center gap-2"
                    >
                      {editingSkillIndex !== null ? "Update" : "Add"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => {
                        setIsAddingSkill(false)
                        setEditingSkillIndex(null)
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {skills.length > 0 && (
                <div className="skill-list mt-8 space-y-4">
                  <Typography variant="h5" className="text-gray-800 font-semibold">
                    Added Skills
                  </Typography>
                  {skills.map((skill, index) => (
                    <Card key={index} className="border border-gray-200 shadow-sm">
                      <CardBody className="p-6 flex items-center justify-between">
                        <div>
                          <Typography variant="h6" className="text-gray-900 font-bold mb-1">
                            {skill.name}
                          </Typography>
                          <Typography variant="paragraph" className="text-gray-600 text-sm mb-1">
                            Type: {skill.type}
                          </Typography>
                          {skill.proficiencyLevel && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm">
                              Proficiency: {skill.proficiencyLevel}
                            </Typography>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="text"
                            color="blue"
                            size="sm"
                            onClick={() => handleEditSkill(skill, index)}
                            disabled={isLoading}
                            className="hover:bg-blue-100 focus:bg-blue-100"
                          >
                            <FaPen className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="text"
                            color="red"
                            size="sm"
                            onClick={() => handleRemoveSkill(index)}
                            disabled={isLoading}
                            className="hover:bg-red-100 focus:bg-red-100"
                          >
                            <FaTrash className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          )}

          {/* Step 7: Experiences */}
          {currentStep === 7 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(7)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                    isStepCompleted(7)
                      ? "bg-gradient-to-b from-green-500 to-green-600"
                      : "bg-gradient-to-b from-blue-500 to-purple-500"
                  }`}></div>
                  <Typography variant="h4" className="text-gray-800 font-semibold">
                    Experiences
                  </Typography>
                </div>
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={() => {
                    setExperienceSubmitAttempted(false) // Reset submission attempt flag when opening the form
                    setIsAddingExperience(true)
                    setEditingExperienceIndex(null)
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Experience
                </Button>
              </div>
              {isAddingExperience && (
                <div className="experience-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Job Title *
                      </Typography>
                      <Input
                        size="lg"
                        value={newExperience.jobTitle}
                        onChange={handleExperienceInputChange}
                        name="jobTitle"
                        placeholder="e.g., Software Engineer"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Company *
                      </Typography>
                      <Input
                        size="lg"
                        value={newExperience.company}
                        onChange={handleExperienceInputChange}
                        name="company"
                        placeholder="e.g., ABC Corp"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Start Date *
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={newExperience.startDate}
                        onChange={handleExperienceInputChange}
                        onBlur={handleExperienceInputBlur}
                        name="startDate"
                        max={(() => {
                          const today = new Date()
                          return today.toISOString().split('T')[0]
                        })()}
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                      {experienceSubmitAttempted && !newExperience.startDate && (
                        <Typography variant="small" color="red" className="mt-1">
                          Please fill in the start date.
                        </Typography>
                      )}
                      {newExperience.startDate && (() => {
                        const today = new Date().toISOString().split('T')[0]
                        return newExperience.startDate > today
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
                        value={newExperience.endDate}
                        onChange={handleExperienceInputChange}
                        onBlur={handleExperienceInputBlur}
                        name="endDate"
                        min={newExperience.startDate || undefined}
                        max={(() => {
                          const today = new Date()
                          return today.toISOString().split('T')[0]
                        })()}
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                      {experienceSubmitAttempted && !newExperience.endDate && (
                        <Typography variant="small" color="red" className="mt-1">
                          Please fill in the end date.
                        </Typography>
                      )}
                      {newExperience.startDate && newExperience.endDate && newExperience.endDate < newExperience.startDate && (
                        <Typography variant="small" color="red" className="mt-1">
                          End Date cannot be before Start Date.
                        </Typography>
                      )}
                      {newExperience.endDate && (() => {
                        const today = new Date().toISOString().split('T')[0]
                        return newExperience.endDate > today
                      })() && (
                        <Typography variant="small" color="red" className="mt-1">
                          End Date cannot be a future date.
                        </Typography>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Responsibilities
                      </Typography>
                      <Textarea
                        size="lg"
                        value={newExperience.responsibilities}
                        onChange={handleExperienceInputChange}
                        name="responsibilities"
                        placeholder="Describe your responsibilities"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                        rows={3}
                        maxLength={300}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <Typography variant="small" className="text-gray-500">
                          {newExperience.responsibilities.length}/300 characters
                        </Typography>
                        {newExperience.responsibilities.length > 300 && (
                          <Typography variant="small" color="red">
                            Responsibilities cannot exceed 300 characters.
                          </Typography>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={editingExperienceIndex !== null ? handleUpdateExperience : handleAddExperience}
                      disabled={isLoading || (editingExperienceIndex === null && !isExperienceFormValid())}
                      className="flex items-center gap-2"
                    >
                      {editingExperienceIndex !== null ? "Update" : "Add"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => {
                        setIsAddingExperience(false)
                        setEditingExperienceIndex(null)
                        setExperienceSubmitAttempted(false) // Reset submission attempt flag on cancel
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {experiences.length > 0 && (
                <div className="experience-list mt-8 space-y-4">
                  <Typography variant="h5" className="text-gray-800 font-semibold">
                    Added Experiences
                  </Typography>
                  {experiences.map((exp, index) => (
                    <Card key={index} className="border border-gray-200 shadow-sm">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <Typography variant="h6" className="text-gray-900 font-bold break-words">
                              {exp.jobTitle}
                            </Typography>
                            <Typography variant="paragraph" className="text-gray-700 break-words">
                              {exp.company}
                            </Typography>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="text"
                              color="blue"
                              size="sm"
                              onClick={() => handleEditExperience(exp, index)}
                              disabled={isLoading}
                              className="hover:bg-blue-100 focus:bg-blue-100"
                            >
                              <FaPen className="w-5 h-5" />
                            </Button>
                            <Button
                              variant="text"
                              color="red"
                              size="sm"
                              onClick={() => handleRemoveExperience(index)}
                              disabled={isLoading}
                              className="hover:bg-red-100 focus:bg-red-100"
                            >
                              <FaTrash className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                        {(exp.startDate || exp.endDate) && (
                          <Typography variant="small" className="text-gray-500 mb-2">
                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : "N/A"} -{" "}
                            {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "N/A"}
                          </Typography>
                        )}
                        {exp.responsibilities && (
                          <Typography variant="paragraph" className="text-gray-600 text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                            {exp.responsibilities}
                          </Typography>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          )}

          {/* Step 8: Awards & Recognitions */}
          {currentStep === 8 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(8)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                    isStepCompleted(8)
                      ? "bg-gradient-to-b from-green-500 to-green-600"
                      : "bg-gradient-to-b from-blue-500 to-purple-500"
                  }`}></div>
                  <Typography variant="h4" className="text-gray-800 font-semibold">
                    Awards & Recognitions
                  </Typography>
                </div>
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={() => {
                    setAwardSubmitAttempted(false) // Reset submission attempt flag when opening the form
                    setIsAddingAward(true)
                    setEditingAwardIndex(null)
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Award
                </Button>
              </div>
              {isAddingAward && (
                <div className="award-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Award Title *
                      </Typography>
                      <Input
                        size="lg"
                        value={newAward.title}
                        onChange={handleAwardInputChange}
                        name="title"
                        placeholder="e.g., Best Employee"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Issuer *
                      </Typography>
                      <Input
                        size="lg"
                        value={newAward.issuer}
                        onChange={handleAwardInputChange}
                        name="issuer"
                        placeholder="e.g., XYZ Organization"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Date Received *
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={newAward.dateReceived}
                        onChange={handleAwardInputChange}
                        onBlur={handleAwardInputBlur}
                        name="dateReceived"
                        max={(() => {
                          const today = new Date()
                          return today.toISOString().split('T')[0]
                        })()}
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                      {awardSubmitAttempted && !newAward.dateReceived && (
                        <Typography variant="small" color="red" className="mt-1">
                          Please fill in the date received.
                        </Typography>
                      )}
                      {newAward.dateReceived && (() => {
                        const today = new Date().toISOString().split('T')[0]
                        return newAward.dateReceived > today
                      })() && (
                        <Typography variant="small" color="red" className="mt-1">
                          Date Received cannot be a future date.
                        </Typography>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={editingAwardIndex !== null ? handleUpdateAward : handleAddAward}
                      disabled={isLoading || (editingAwardIndex === null && !isAwardFormValid())}
                      className="flex items-center gap-2"
                    >
                      {editingAwardIndex !== null ? "Update" : "Add"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => {
                        setIsAddingAward(false)
                        setEditingAwardIndex(null)
                        setAwardSubmitAttempted(false) // Reset submission attempt flag on cancel
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {awardsRecognitions.length > 0 && (
                <div className="award-list mt-8 space-y-4">
                  <Typography variant="h5" className="text-gray-800 font-semibold">
                    Added Awards
                  </Typography>
                  {awardsRecognitions.map((award, index) => (
                    <Card key={index} className="border border-gray-200 shadow-sm">
                      <CardBody className="p-6 flex items-center justify-between">
                        <div>
                          <Typography variant="h6" className="text-gray-900 font-bold mb-1">
                            {award.title}
                          </Typography>
                          {award.issuer && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm mb-1">
                              Issuer: {award.issuer}
                            </Typography>
                          )}
                          {award.dateReceived && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm">
                              Issued: {award.dateReceived}
                            </Typography>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="text"
                            color="blue"
                            size="sm"
                            onClick={() => handleEditAward(award, index)}
                            disabled={isLoading}
                            className="hover:bg-blue-100 focus:bg-blue-100"
                          >
                            <FaPen className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="text"
                            color="red"
                            size="sm"
                            onClick={() => handleRemoveAward(index)}
                            disabled={isLoading}
                            className="hover:bg-red-100 focus:bg-red-100"
                          >
                            <FaTrash className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          )}

          {/* Step 9: Continuing Education */}
          {currentStep === 9 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(9)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                    isStepCompleted(9)
                      ? "bg-gradient-to-b from-green-500 to-green-600"
                      : "bg-gradient-to-b from-blue-500 to-purple-500"
                  }`}></div>
                  <Typography variant="h4" className="text-gray-800 font-semibold">
                    Continuing Education
                  </Typography>
                </div>
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={() => {
                    setEducationSubmitAttempted(false) // Reset submission attempt flag when opening the form
                    setIsAddingEducation(true)
                    setEditingEducationIndex(null)
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Education
                </Button>
              </div>
              {isAddingEducation && (
                <div className="education-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Course Name *
                      </Typography>
                      <Input
                        size="lg"
                        value={newEducation.courseName}
                        onChange={handleEducationInputChange}
                        name="courseName"
                        placeholder="e.g., Advanced Welding"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Institution *
                      </Typography>
                      <Input
                        size="lg"
                        value={newEducation.institution}
                        onChange={handleEducationInputChange}
                        name="institution"
                        placeholder="e.g., TESDA Institute"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                      {educationSubmitAttempted && !newEducation.institution && (
                        <Typography variant="small" color="red" className="mt-1">
                          Please fill in the institution.
                        </Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Completion Date *
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={newEducation.completionDate}
                        onChange={handleEducationInputChange}
                        onBlur={handleEducationInputBlur}
                        name="completionDate"
                        max={(() => {
                          const today = new Date()
                          return today.toISOString().split('T')[0]
                        })()}
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                      {educationSubmitAttempted && !newEducation.completionDate && (
                        <Typography variant="small" color="red" className="mt-1">
                          Please fill in the completion date.
                        </Typography>
                      )}
                      {newEducation.completionDate && (() => {
                        const today = new Date().toISOString().split('T')[0]
                        return newEducation.completionDate > today
                      })() && (
                        <Typography variant="small" color="red" className="mt-1">
                          Completion Date cannot be a future date.
                        </Typography>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={editingEducationIndex !== null ? handleUpdateEducation : handleAddEducation}
                      disabled={isLoading || (editingEducationIndex === null && !isEducationFormValid())}
                      className="flex items-center gap-2"
                    >
                      {editingEducationIndex !== null ? "Update" : "Add"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => {
                        setIsAddingEducation(false)
                        setEditingEducationIndex(null)
                        setEducationSubmitAttempted(false) // Reset submission attempt flag on cancel
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {continuingEducations.length > 0 && (
                <div className="education-list mt-8 space-y-4">
                  <Typography variant="h5" className="text-gray-800 font-semibold">
                    Added Education
                  </Typography>
                  {continuingEducations.map((edu, index) => (
                    <Card key={index} className="border border-gray-200 shadow-sm">
                      <CardBody className="p-6 flex items-center justify-between">
                        <div>
                          <Typography variant="h6" className="text-gray-900 font-bold mb-1">
                            {edu.courseName}
                          </Typography>
                          {edu.institution && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm mb-1">
                              Institution: {edu.institution}
                            </Typography>
                          )}
                          {edu.completionDate && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm">
                              Completed: {edu.completionDate}
                            </Typography>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="text"
                            color="blue"
                            size="sm"
                            onClick={() => handleEditEducation(edu, index)}
                            disabled={isLoading}
                            className="hover:bg-blue-100 focus:bg-blue-100"
                          >
                            <FaPen className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="text"
                            color="red"
                            size="sm"
                            onClick={() => handleRemoveEducation(index)}
                            disabled={isLoading}
                            className="hover:bg-red-100 focus:bg-red-100"
                          >
                            <FaTrash className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          )}

          {/* Step 10: Professional Memberships */}
          {currentStep === 10 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(10)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                    isStepCompleted(10)
                      ? "bg-gradient-to-b from-green-500 to-green-600"
                      : "bg-gradient-to-b from-blue-500 to-purple-500"
                  }`}></div>
                  <Typography variant="h4" className="text-gray-800 font-semibold">
                    Professional Memberships
                  </Typography>
                </div>
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={() => {
                    setMembershipSubmitAttempted(false) // Reset submission attempt flag when opening the form
                    setIsAddingMembership(true)
                    setEditingMembershipIndex(null)
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Membership
                </Button>
              </div>
              {isAddingMembership && (
                <div className="membership-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Organization *
                      </Typography>
                      <Input
                        size="lg"
                        value={newMembership.organization}
                        onChange={handleMembershipInputChange}
                        name="organization"
                        placeholder="e.g., IEEE"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Membership Type *
                      </Typography>
                      <Input
                        size="lg"
                        value={newMembership.membershipType}
                        onChange={handleMembershipInputChange}
                        name="membershipType"
                        placeholder="e.g., Professional Member"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Join Date *
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={newMembership.startDate}
                        onChange={handleMembershipInputChange}
                        onBlur={handleMembershipInputBlur}
                        name="startDate"
                        max={(() => {
                          const today = new Date()
                          return today.toISOString().split('T')[0]
                        })()}
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                      {membershipSubmitAttempted && !newMembership.startDate && (
                        <Typography variant="small" color="red" className="mt-1">
                          Please fill in the join date.
                        </Typography>
                      )}
                      {newMembership.startDate && (() => {
                        const today = new Date().toISOString().split('T')[0]
                        return newMembership.startDate > today
                      })() && (
                        <Typography variant="small" color="red" className="mt-1">
                          Join Date cannot be a future date.
                        </Typography>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={editingMembershipIndex !== null ? handleUpdateMembership : handleAddMembership}
                      disabled={isLoading || (editingMembershipIndex === null && !isMembershipFormValid())}
                      className="flex items-center gap-2"
                    >
                      {editingMembershipIndex !== null ? "Update" : "Add"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => {
                        setIsAddingMembership(false)
                        setEditingMembershipIndex(null)
                        setMembershipSubmitAttempted(false) // Reset submission attempt flag on cancel
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {professionalMemberships.length > 0 && (
                <div className="membership-list mt-8 space-y-4">
                  <Typography variant="h5" className="text-gray-800 font-semibold">
                    Added Memberships
                  </Typography>
                  {professionalMemberships.map((mem, index) => (
                    <Card key={index} className="border border-gray-200 shadow-sm">
                      <CardBody className="p-6 flex items-center justify-between">
                        <div>
                          <Typography variant="h6" className="text-gray-900 font-bold mb-1">
                            {mem.organization}
                          </Typography>
                          {mem.membershipType && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm mb-1">
                              Type: {mem.membershipType}
                            </Typography>
                          )}
                          {mem.startDate && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm">
                              Joined: {mem.startDate}
                            </Typography>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="text"
                            color="blue"
                            size="sm"
                            onClick={() => handleEditMembership(mem, index)}
                            disabled={isLoading}
                            className="hover:bg-blue-100 focus:bg-blue-100"
                          >
                            <FaPen className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="text"
                            color="red"
                            size="sm"
                            onClick={() => handleRemoveMembership(index)}
                            disabled={isLoading}
                            className="hover:bg-red-100 focus:bg-red-100"
                          >
                            <FaTrash className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          )}

          {/* Step 11: References */}
          {currentStep === 11 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(11)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                    isStepCompleted(11)
                      ? "bg-gradient-to-b from-green-500 to-green-600"
                      : "bg-gradient-to-b from-blue-500 to-purple-500"
                  }`}></div>
                  <Typography variant="h4" className="text-gray-800 font-semibold">
                    References
                  </Typography>
                </div>
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={() => {
                    setIsAddingReference(true)
                    setEditingReferenceIndex(null)
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Reference
                </Button>
              </div>
              {isAddingReference && (
                <div className="reference-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Name *
                      </Typography>
                      <Input
                        size="lg"
                        value={newReference.name}
                        onChange={handleReferenceInputChange}
                        name="name"
                        placeholder="e.g., John Doe"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Relationship / Position *
                      </Typography>
                      <Input
                        size="lg"
                        value={newReference.relationship}
                        onChange={handleReferenceInputChange}
                        name="relationship"
                        placeholder="e.g., Former Supervisor"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Company *
                      </Typography>
                      <Input
                        size="lg"
                        value={newReference.company}
                        onChange={handleReferenceInputChange}
                        name="company"
                        placeholder="e.g., ABC Corp"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Phone *
                      </Typography>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-700 font-medium">+63</span>
                        </div>
                        <Input
                          type="tel"
                          size="lg"
                          value={newReference.phone}
                          onChange={handleReferenceInputChange}
                          name="phone"
                          placeholder="1234567890"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          required
                          disabled={isLoading}
                          className="!border-gray-300 focus:!border-blue-500 pl-12"
                        />
                      </div>
                      {fieldErrors.referencePhone && (
                        <Typography variant="small" color="red" className="mt-1">
                          {fieldErrors.referencePhone}
                        </Typography>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Email *
                      </Typography>
                      <Input
                        type="email"
                        size="lg"
                        value={newReference.email}
                        onChange={handleReferenceInputChange}
                        name="email"
                        placeholder="e.g., john.doe@example.com"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                      {fieldErrors.referenceEmail && (
                        <Typography variant="small" color="red" className="mt-1">
                          {fieldErrors.referenceEmail}
                        </Typography>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={editingReferenceIndex !== null ? handleUpdateReference : handleAddReference}
                      disabled={isLoading || (editingReferenceIndex === null && !isReferenceFormValid())}
                      className="flex items-center gap-2"
                    >
                      {editingReferenceIndex !== null ? "Update" : "Add"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => {
                        setIsAddingReference(false)
                        setEditingReferenceIndex(null)
                        setNewReference({ name: "", relationship: "", phone: "", company: "", email: "" })
                        updateFieldError("referencePhone", "")
                        updateFieldError("referenceEmail", "")
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {references.length > 0 && (
                <div className="reference-list mt-8 space-y-4">
                  <Typography variant="h5" className="text-gray-800 font-semibold">
                    Added References
                  </Typography>
                  {references.map((ref, index) => (
                    <Card key={index} className="border border-gray-200 shadow-sm">
                      <CardBody className="p-6 flex items-center justify-between">
                        <div>
                          <Typography variant="h6" className="text-gray-900 font-bold mb-1">
                            {ref.name}
                          </Typography>
                          {(ref.relationship || ref.position) && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm mb-1">
                              Relationship: {ref.relationship || ref.position}
                            </Typography>
                          )}
                          {ref.company && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm mb-1">
                              Company: {ref.company}
                            </Typography>
                          )}
                          {(ref.phone || ref.contact) && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm mb-1">
                              Phone: {formatPhoneNumber(ref.phone || ref.contact)}
                            </Typography>
                          )}
                          {ref.email && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm">
                              Email: {ref.email}
                            </Typography>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="text"
                            color="blue"
                            size="sm"
                            onClick={() => handleEditReference(ref, index)}
                            disabled={isLoading}
                            className="hover:bg-blue-100 focus:bg-blue-100"
                          >
                            <FaPen className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="text"
                            color="red"
                            size="sm"
                            onClick={() => handleRemoveReference(index)}
                            disabled={isLoading}
                            className="hover:bg-red-100 focus:bg-red-100"
                          >
                            <FaTrash className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          )}

          {/* Step 12: Additional Information */}
          {currentStep === 12 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(12)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                  isStepCompleted(12)
                    ? "bg-gradient-to-b from-green-500 to-green-600"
                    : "bg-gradient-to-b from-blue-500 to-purple-500"
                }`}></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Additional Information
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Template Selection *
                  </Typography>
                  <Select
                    size="lg"
                    label="Select Course Type"
                    value={formData.primaryCourseType}
                    onChange={handleCourseTypeChange}
                    menuProps={selectMenuProps}
                    containerProps={selectContainerProps}
                    required
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  >
                    {courseTypes.map((courseType) => (
                      <Option key={courseType} value={courseType}>
                        {courseType}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Visibility
                  </Typography>
                  <Select
                    size="lg"
                    label="Select Visibility"
                    value={formData.visibility}
                    onChange={(val) => setFormData((prev) => ({ ...prev, visibility: val }))}
                    menuProps={selectMenuProps}
                    containerProps={selectContainerProps}
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  >
                    <Option value="PUBLIC">Public</Option>
                    <Option value="PRIVATE">Private</Option>
                  </Select>
                </div>
              </div>

              {/* Portfolio Preview Section */}
              {formData.primaryCourseType ? (
                <div className="mt-8 space-y-6">
                  <Typography variant="small" className="mb-4 text-gray-900 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Preview of your portfolio - This is how it will appear to viewers
                  </Typography>
                  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-8 px-4">
                    <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
                      {(() => {
                        const designTheme = getDesignTheme(formData.designTemplate)
                        return (
                          <>
                            {formData.designTemplate === "Template 1" ? (
                              /* Template 1 - Custom Layout */
                              <div className="px-6 py-8 bg-gradient-to-br from-gray-50 via-gray-100 via-gray-200 to-gray-100" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                  {/* Left Sidebar - Profile Image, Contact, Skills, TESDA */}
                                  <div className="lg:col-span-1 space-y-6">
                                    {/* Profile Image Container */}
                                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 flex justify-center items-center border-2 border-gray-300 shadow-md">
                                      <Avatar
                                        src={previewAvatar || "/placeholder.svg"}
                                        alt={formData.fullName || "Profile"}
                                        size="xxl"
                                        className="w-48 h-48 shadow-xl ring-4 ring-gray-300"
                                      />
                                    </div>
                                    
                                    {/* Contact Information */}
                                    <div className={`bg-white border-2 ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding} shadow-md`}>
                                      <Typography variant="h6" className={`font-bold ${designTheme.textColor} text-xl mb-5`} style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.01em" }}>
                                        Contact
                                      </Typography>
                                      {(formData.email || formData.phone || formData.website) ? (
                                        <div className="space-y-3">
                                          {formData.email && (
                                            <div>
                                              <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                Email
                                              </Typography>
                                              <Typography variant="small" className="text-gray-900 break-all font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {formData.email}
                                              </Typography>
                                            </div>
                                          )}
                                          {formData.phone && (
                                            <div>
                                              <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                Phone
                                              </Typography>
                                              <Typography variant="small" className="text-gray-900 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {formatPhoneNumber(formData.phone)}
                                              </Typography>
                                            </div>
                                          )}
                                          {formData.website && (
                                            <div>
                                              <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                Website
                                              </Typography>
                                              <Typography variant="small" className="text-gray-900 break-all font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {formData.website}
                                              </Typography>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                          You haven't filled up details in this section.
                                        </Typography>
                                      )}
                                    </div>

                                    {/* Skills */}
                                    <div className={`bg-white border-2 ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding} shadow-md`}>
                                      <Typography variant="h6" className={`font-bold ${designTheme.textColor} text-xl mb-5`} style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.01em" }}>
                                        Skills
                                      </Typography>
                                      {skills.length > 0 ? (
                                        <div className="space-y-3">
                                          {skills.map((skill, index) => (
                                            <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
                                              <Typography variant="small" className="font-bold text-gray-900 mb-1 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {skill.name}
                                              </Typography>
                                              <div className="flex items-center space-x-2">
                                                <Chip size="sm" value={skill.type || "TECHNICAL"} color={designTheme.buttonColor} className="text-xs font-semibold" />
                                                {skill.proficiencyLevel && (
                                                  <Typography variant="small" className="text-gray-600 text-xs font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {skill.proficiencyLevel}
                                                  </Typography>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                          You haven't filled up details in this section.
                                        </Typography>
                                      )}
                                    </div>

                                    {/* TESDA Information */}
                                    <div className={`bg-white border-2 ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding} shadow-md`}>
                                      <Typography variant="h6" className={`font-bold ${designTheme.textColor} text-xl mb-5`} style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.01em" }}>
                                        TESDA Information
                                      </Typography>
                                      {(formData.ncLevel || formData.trainingCenter || formData.scholarshipType || formData.trainingDuration) ? (
                                        <div className="space-y-3">
                                          {formData.ncLevel && (
                                            <div>
                                              <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                NC Level
                                              </Typography>
                                              <Typography variant="small" className="text-gray-900 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {formData.ncLevel}
                                              </Typography>
                                            </div>
                                          )}
                                          {formData.trainingCenter && (
                                            <div>
                                              <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                Training Center
                                              </Typography>
                                              <Typography variant="small" className="text-gray-900 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {formData.trainingCenter}
                                              </Typography>
                                            </div>
                                          )}
                                          {formData.scholarshipType && (
                                            <div>
                                              <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                Scholarship Type
                                              </Typography>
                                              <Typography variant="small" className="text-gray-900 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {formData.scholarshipType}
                                              </Typography>
                                            </div>
                                          )}
                                          {formData.trainingDuration && (
                                            <div>
                                              <Typography variant="small" className="text-gray-700 font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                Training Duration
                                              </Typography>
                                              <Typography variant="small" className="text-gray-900 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {formData.trainingDuration}
                                              </Typography>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                          You haven't filled up details in this section.
                                        </Typography>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right Side - Name and Main Content */}
                                  <div className="lg:col-span-2 space-y-6">
                                    {/* Name Container */}
                                    <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg p-8 bg-gradient-to-br from-white to-gray-50/30">
                                      <Typography
                                        variant="h1"
                                        className={`${designTheme.titleWeight} ${designTheme.typographySize} tracking-tight text-gray-900 break-words`}
                                        style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.02em" }}
                                      >
                                        {formData.fullName || "Your Name"}
                                      </Typography>
                                      {formData.professionalTitle && (
                                        <Typography
                                          variant="h6"
                                          className="text-gray-700 font-semibold mt-3 text-lg"
                                          style={{ fontFamily: "'Inter', sans-serif" }}
                                        >
                                          {formData.professionalTitle}
                                        </Typography>
                                      )}
                                      {formData.professionalSummary && (
                                        <Typography
                                          variant="lead"
                                          className="text-gray-800 leading-relaxed mt-5 break-words overflow-wrap-anywhere text-base"
                                          style={{ fontFamily: "'Inter', sans-serif", lineHeight: "1.75" }}
                                        >
                                          {formData.professionalSummary}
                                        </Typography>
                                      )}
                                    </div>

                                    {/* Main Content Container */}
                                    <div className={`bg-white border-2 ${designTheme.cardBorder} rounded-xl shadow-lg p-10 space-y-10`}>
                                  

                                      {/* Certificates */}
                                      <div>
                                       
                                    <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-2xl md:text-3xl mb-6`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                                      Certificates
                                    </Typography>
                                    {certificates.length > 0 ? (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {(showAllCertificates ? certificates : certificates.slice(0, INITIAL_ITEMS_LIMIT)).map((certificate, index) => (
                                            <Card key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-shadow duration-300">
                                              <CardBody className="flex flex-col items-start gap-3">
                                                <div className="flex items-center gap-3 w-full">
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
                                                        {new Date(certificate.issueDate).toLocaleDateString()}
                                                      </Typography>
                                                    )}
                                                  </div>
                                                </div>
                                              </CardBody>
                                            </Card>
                                          ))}
                                        </div>
                                        {certificates.length > INITIAL_ITEMS_LIMIT && (
                                          <div className="flex justify-center pt-2">
                                            <Button
                                              variant="text"
                                              size="sm"
                                              onClick={() => setShowAllCertificates(!showAllCertificates)}
                                              className={`${designTheme.textColor} font-semibold`}
                                            >
                                              {showAllCertificates ? "Show Less" : `Show All (${certificates.length})`}
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                          You haven't filled up details in this section.
                                        </Typography>
                                      </div>
                                    )}
                                      </div>

                                      {/* Experience */}
                                      <div>
                                        <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-2xl md:text-3xl mb-6`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                                          Experience
                                        </Typography>
                                    {experiences.length > 0 ? (
                                      <div className="space-y-6">
                                        {(showAllExperiences ? experiences : experiences.slice(0, INITIAL_ITEMS_LIMIT)).map((exp, index) => (
                                          <div key={index} className={`border-l-4 border-gray-600 pl-6 pb-6 relative bg-gradient-to-r from-gray-50/50 to-transparent rounded-r-lg p-5`}>
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
                                                className="text-gray-800 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere text-xs"
                                                style={{ fontFamily: "'Inter', sans-serif", lineHeight: "1.6" }}
                                              >
                                                {exp.responsibilities}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                        {experiences.length > INITIAL_ITEMS_LIMIT && (
                                          <div className="flex justify-center pt-2">
                                            <Button
                                              variant="text"
                                              size="sm"
                                              onClick={() => setShowAllExperiences(!showAllExperiences)}
                                              className={`${designTheme.textColor} font-semibold`}
                                            >
                                              {showAllExperiences ? "Show Less" : `Show All (${experiences.length})`}
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                          You haven't filled up details in this section.
                                        </Typography>
                                      </div>
                                    )}
                                  </div>

                                      {/* Projects */}
                                      <div>
                                        <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-2xl md:text-3xl mb-6`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                                          Projects
                                        </Typography>
                                    {projects.length > 0 ? (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                          {(showAllProjects ? projects : projects.slice(0, INITIAL_ITEMS_LIMIT)).map((project, index) => (
                                            <Card key={index} className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] break-words">
                                              {project.projectImageFile && (
                                                <div className="relative h-40 overflow-hidden">
                                                  <img
                                                    src={URL.createObjectURL(project.projectImageFile)}
                                                    alt={project.title || "Project"}
                                                    className="w-full h-full object-cover"
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
                                                    className="text-gray-700 mb-3 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere text-xs"
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
                                        {projects.length > INITIAL_ITEMS_LIMIT && (
                                          <div className="flex justify-center pt-2">
                                            <Button
                                              variant="text"
                                              size="sm"
                                              onClick={() => setShowAllProjects(!showAllProjects)}
                                              className={`${designTheme.textColor} font-semibold`}
                                            >
                                              {showAllProjects ? "Show Less" : `Show All (${projects.length})`}
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                          You haven't filled up details in this section.
                                        </Typography>
                                      </div>
                                    )}
                                  </div>

                                      {/* Awards & Recognition */}
                                      <div>
                                        <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-2xl md:text-3xl mb-6`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                                          Awards & Recognition
                                        </Typography>
                                    {awardsRecognitions.length > 0 ? (
                                      <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {(showAllAwards ? awardsRecognitions : awardsRecognitions.slice(0, INITIAL_ITEMS_LIMIT)).map((award, index) => (
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
                                        {awardsRecognitions.length > INITIAL_ITEMS_LIMIT && (
                                          <div className="flex justify-center pt-2">
                                            <Button
                                              variant="text"
                                              size="sm"
                                              onClick={() => setShowAllAwards(!showAllAwards)}
                                              className={`${designTheme.textColor} font-semibold`}
                                            >
                                              {showAllAwards ? "Show Less" : `Show All (${awardsRecognitions.length})`}
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                          You haven't filled up details in this section.
                                        </Typography>
                                      </div>
                                    )}
                                  </div>

                                  {/* Education & Memberships */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                      {/* Continuing Education */}
                                      <div>
                                        <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-xl md:text-2xl mb-5`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                                          Continuing Education
                                        </Typography>
                                      {continuingEducations.length > 0 ? (
                                        <div className="space-y-3">
                                          {(showAllEducation ? continuingEducations : continuingEducations.slice(0, INITIAL_ITEMS_LIMIT)).map((edu, index) => (
                                            <div key={index} className={`border-l-4 border-gray-600 pl-4 py-2 bg-gradient-to-r from-gray-50/50 to-transparent rounded-r-lg`}>
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
                                          {continuingEducations.length > INITIAL_ITEMS_LIMIT && (
                                            <div className="flex justify-center pt-2">
                                              <Button
                                                variant="text"
                                                size="sm"
                                                onClick={() => setShowAllEducation(!showAllEducation)}
                                                className={`${designTheme.textColor} font-semibold text-xs`}
                                              >
                                                {showAllEducation ? "Show Less" : `Show All (${continuingEducations.length})`}
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                          You haven't filled up details in this section.
                                        </Typography>
                                      )}
                                    </div>

                                      {/* Professional Memberships */}
                                      <div>
                                        <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-xl md:text-2xl mb-5`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                                          Professional Memberships
                                        </Typography>
                                      {professionalMemberships.length > 0 ? (
                                        <div className="space-y-3">
                                          {(showAllMemberships ? professionalMemberships : professionalMemberships.slice(0, INITIAL_ITEMS_LIMIT)).map((mem, index) => (
                                            <div key={index} className={`border-l-4 border-gray-600 pl-4 py-2 bg-gradient-to-r from-gray-50/50 to-transparent rounded-r-lg`}>
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
                                          {professionalMemberships.length > INITIAL_ITEMS_LIMIT && (
                                            <div className="flex justify-center pt-2">
                                              <Button
                                                variant="text"
                                                size="sm"
                                                onClick={() => setShowAllMemberships(!showAllMemberships)}
                                                className={`${designTheme.textColor} font-semibold text-xs`}
                                              >
                                                {showAllMemberships ? "Show Less" : `Show All (${professionalMemberships.length})`}
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                          You haven't filled up details in this section.
                                        </Typography>
                                      )}
                                    </div>
                                  </div>

                                      {/* References */}
                                      <div>
                                        <Typography variant="h4" className={`font-bold ${designTheme.textColor} text-2xl md:text-3xl mb-6`} style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: "-0.01em" }}>
                                          References
                                        </Typography>
                                    {references.length > 0 ? (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {(showAllReferences ? references : references.slice(0, INITIAL_ITEMS_LIMIT)).map((ref, index) => (
                                            <div key={index} className="bg-gradient-to-br from-white to-gray-50/30 border-2 border-gray-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                                              <Typography variant="h6" className="font-bold text-gray-900 mb-2 break-words text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {ref.name}
                                              </Typography>
                                              {(ref.relationship || ref.position) && (
                                                <Typography variant="small" className="text-gray-700 font-medium mb-1 break-words text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                  {ref.relationship || ref.position}
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
                                                {(ref.phone || ref.contact) && (
                                                  <Typography variant="small" className="text-gray-600 break-words font-medium text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {formatPhoneNumber(ref.phone || ref.contact)}
                                                  </Typography>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        {references.length > INITIAL_ITEMS_LIMIT && (
                                          <div className="flex justify-center pt-2">
                                            <Button
                                              variant="text"
                                              size="sm"
                                              onClick={() => setShowAllReferences(!showAllReferences)}
                                              className={`${designTheme.textColor} font-semibold`}
                                            >
                                              {showAllReferences ? "Show Less" : `Show All (${references.length})`}
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                      ) : (
                                        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                                          <Typography variant="small" className="text-gray-700 italic font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            You haven't filled up details in this section.
                                          </Typography>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              </div>
                            ) : formData.designTemplate === "Template 3" ? (
                              /* Template 3 - Modern Centered Layout with Grayscale Theme */
                              <div className="bg-white min-h-screen" style={{ fontFamily: "'Montserrat', 'Roboto', 'Inter', sans-serif" }}>
                                {/* Header Section - Clean Modern RÃ©sumÃ© Style */}
                                <div className="relative bg-white pt-16 pb-16 md:pt-20 md:pb-20 px-6 md:px-12 lg:px-16 border-b-2 border-gray-200">
                                  <div className="max-w-7xl mx-auto">
                                    {/* Centered Layout */}
                                    <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
                                      {/* Profile Photo - Centered */}
                                      <div className="flex-shrink-0 pt-4 md:pt-6 lg:pt-8">
                                        <div className="relative">
                                          <Avatar
                                            src={previewAvatar || "/placeholder.svg"}
                                            alt={formData.fullName || "Profile"}
                                            size="xxl"
                                            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-none border-2 border-black shadow-lg"
                                            style={{ filter: 'grayscale(100%)' }}
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Name - Large Bold Red, Centered */}
                                      <div>
                                        <Typography
                                          variant="h1"
                                          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-red-600 tracking-tight leading-none"
                                          style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 900, letterSpacing: "-0.02em" }}
                                        >
                                          {formData.fullName || "Your Name"}
                                        </Typography>
                                      </div>
                                      
                                      {/* Professional Title - Black Text, Centered */}
                                      {formData.professionalTitle && (
                                        <div>
                                          <Typography
                                            variant="h5"
                                            className="text-xl md:text-2xl text-black font-medium tracking-normal"
                                            style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 500 }}
                                          >
                                            {formData.professionalTitle}
                                          </Typography>
                                        </div>
                                      )}
                                      
                                      {/* Professional Summary - Black Body Text, Centered */}
                                      <div className="max-w-3xl mx-auto px-4">
                                        {formData.professionalSummary ? (
                                          <Typography
                                            variant="lead"
                                            className="text-black leading-relaxed text-base md:text-lg break-words overflow-wrap-anywhere text-center"
                                            style={{ fontFamily: "'Open Sauce', sans-serif", lineHeight: "1.7", fontWeight: 400, wordWrap: "break-word", overflowWrap: "break-word" }}
                                          >
                                            {formData.professionalSummary}
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
                                        <Typography variant="h5" className="font-bold text-red-600 text-lg uppercase tracking-wide mb-4" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                                          Contact
                                        </Typography>
                                        {(formData.email || formData.phone || formData.website) ? (
                                          <div className="space-y-3">
                                            {formData.email && (
                                              <div>
                                                <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                                                  Email
                                                </Typography>
                                                <Typography variant="small" className="text-black break-all text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                                  {formData.email}
                                                </Typography>
                                              </div>
                                            )}
                                            {formData.phone && (
                                              <div>
                                                <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                                                  Phone
                                                </Typography>
                                                <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                                  {formatPhoneNumber(formData.phone)}
                                                </Typography>
                                              </div>
                                            )}
                                            {formData.website && (
                                              <div>
                                                <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                                                  Website
                                                </Typography>
                                                <Typography variant="small" className="text-black break-all text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                                  {formData.website}
                                                </Typography>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                            You haven't filled up details in this section.
                                          </Typography>
                                        )}
                                      </div>

                                      {/* TESDA Information */}
                                      <div className="bg-white p-6 border-l-4 border-red-600">
                                        <Typography variant="h5" className="font-bold text-red-600 text-lg uppercase tracking-wide mb-4" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                                          TESDA Information
                                        </Typography>
                                        {(formData.ncLevel || formData.trainingCenter || formData.scholarshipType || formData.trainingDuration) ? (
                                          <div className="space-y-3">
                                            {formData.ncLevel && (
                                              <div>
                                                <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                                                  NC Level
                                                </Typography>
                                                <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                                  {formData.ncLevel}
                                                </Typography>
                                              </div>
                                            )}
                                            {formData.trainingCenter && (
                                              <div>
                                                <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                                                  Training Center
                                                </Typography>
                                                <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                                  {formData.trainingCenter}
                                                </Typography>
                                              </div>
                                            )}
                                            {formData.scholarshipType && (
                                              <div>
                                                <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                                                  Scholarship Type
                                                </Typography>
                                                <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                                  {formData.scholarshipType}
                                                </Typography>
                                              </div>
                                            )}
                                            {formData.trainingDuration && (
                                              <div>
                                                <Typography variant="small" className="text-black font-medium mb-1 text-sm uppercase" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 600 }}>
                                                  Training Duration
                                                </Typography>
                                                <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                                  {formData.trainingDuration}
                                                </Typography>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                            You haven't filled up details in this section.
                                          </Typography>
                                        )}
                                      </div>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                      <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide mb-6 text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                                        Skills
                                      </Typography>
                                      {skills.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {skills.map((skill, index) => (
                                            <div key={index} className="flex items-center gap-3 py-2 border-b border-gray-200">
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
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="bg-white p-6 border-l-4 border-gray-300">
                                          <Typography variant="small" className="text-gray-500 italic font-medium text-sm" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                            You haven't filled up details in this section.
                                          </Typography>
                                        </div>
                                      )}
                                    </div>

                                    {/* Certificates */}
                                    <div>
                                      <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide mb-6 text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                                        Certificates
                                      </Typography>
                                      {certificates.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {(showAllCertificates ? certificates : certificates.slice(0, INITIAL_ITEMS_LIMIT)).map((certificate, index) => (
                                            <div key={index} className="pb-3 border-b border-gray-200">
                                              <div className="flex items-center gap-3">
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
                                                size="sm"
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
                                      <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide mb-6 text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                                        Experience
                                      </Typography>
                                      {experiences.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {(showAllExperiences ? experiences : experiences.slice(0, INITIAL_ITEMS_LIMIT)).map((exp, index) => (
                                            <div key={index} className="pb-3 border-b border-gray-200">
                                              <Typography variant="h6" className="font-bold text-black mb-1 text-lg break-words" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                                {exp.jobTitle}
                                              </Typography>
                                              {exp.company && (
                                                <Typography variant="small" className="text-black font-medium mb-1 text-base break-words" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 500 }}>
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
                                                  className="text-black leading-relaxed text-base whitespace-pre-wrap break-words overflow-wrap-anywhere"
                                                  style={{ fontFamily: "'Open Sauce', sans-serif", lineHeight: "1.7", fontWeight: 400 }}
                                                >
                                                  {exp.responsibilities}
                                                </Typography>
                                              )}
                                            </div>
                                          ))}
                                          {experiences.length > INITIAL_ITEMS_LIMIT && (
                                            <div className="flex justify-left pt-2">
                                              <Button
                                                variant="text"
                                                size="sm"
                                                onClick={() => setShowAllExperiences(!showAllExperiences)}
                                                className="text-black font-medium hover:text-red-600"
                                                style={{ fontFamily: "'Open Sauce', sans-serif" }}
                                              >
                                                {showAllExperiences ? "Show Less" : `Show All (${experiences.length})`}
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="bg-white p-6 border-l-4 border-gray-300">
                                          <Typography variant="small" className="text-gray-500 italic font-medium" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                            You haven't filled up details in this section.
                                          </Typography>
                                        </div>
                                      )}
                                    </div>

                                    {/* Projects */}
                                    <div>
                                      <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide mb-6 text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                                        Projects
                                      </Typography>
                                      {projects.length > 0 ? (
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {(showAllProjects ? projects : projects.slice(0, INITIAL_ITEMS_LIMIT)).map((project, index) => (
                                              <Card key={index} className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 break-words">
                                                {project.projectImageFile && (
                                                  <div className="relative h-48 overflow-hidden">
                                                    <img
                                                      src={URL.createObjectURL(project.projectImageFile)}
                                                      alt={project.title || "Project"}
                                                      className="w-full h-full object-cover"
                                                    />
                                                  </div>
                                                )}
                                                <CardBody className="p-5">
                                                  <Typography variant="h6" className="font-bold text-black mb-2 text-lg break-words" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                                    {project.title || "Unnamed Project"}
                                                  </Typography>
                                                  {project.description && (
                                                    <Typography
                                                      variant="small"
                                                      className="text-black mb-3 leading-relaxed text-base whitespace-pre-wrap break-words overflow-wrap-anywhere"
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
                                                size="sm"
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
                                      <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide mb-6 text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                                        Awards & Recognition
                                      </Typography>
                                      {awardsRecognitions.length > 0 ? (
                                        <div className="space-y-3">
                                          {(showAllAwards ? awardsRecognitions : awardsRecognitions.slice(0, INITIAL_ITEMS_LIMIT)).map((award, index) => (
                                            <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
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
                                            </div>
                                          ))}
                                          {awardsRecognitions.length > INITIAL_ITEMS_LIMIT && (
                                            <div className="flex justify-left pt-2">
                                              <Button
                                                variant="text"
                                                size="sm"
                                                onClick={() => setShowAllAwards(!showAllAwards)}
                                                className="text-black font-medium hover:text-red-600"
                                                style={{ fontFamily: "'Open Sauce', sans-serif" }}
                                              >
                                                {showAllAwards ? "Show Less" : `Show All (${awardsRecognitions.length})`}
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

                                    {/* Education & Memberships */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                      {/* Continuing Education */}
                                      <div>
                                        <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide mb-5 text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                                          Continuing Education
                                        </Typography>
                                        {continuingEducations.length > 0 ? (
                                          <div className="space-y-3">
                                            {(showAllEducation ? continuingEducations : continuingEducations.slice(0, INITIAL_ITEMS_LIMIT)).map((edu, index) => (
                                              <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
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
                                              </div>
                                            ))}
                                            {continuingEducations.length > INITIAL_ITEMS_LIMIT && (
                                              <div className="flex justify-left pt-2">
                                                <Button
                                                  variant="text"
                                                  size="sm"
                                                  onClick={() => setShowAllEducation(!showAllEducation)}
                                                  className="text-black font-medium hover:text-red-600 text-xs"
                                                  style={{ fontFamily: "'Open Sauce', sans-serif" }}
                                                >
                                                  {showAllEducation ? "Show Less" : `Show All (${continuingEducations.length})`}
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

                                      {/* Professional Memberships */}
                                      <div>
                                        <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide mb-5 text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                                          Professional Memberships
                                        </Typography>
                                        {professionalMemberships.length > 0 ? (
                                          <div className="space-y-3">
                                            {(showAllMemberships ? professionalMemberships : professionalMemberships.slice(0, INITIAL_ITEMS_LIMIT)).map((mem, index) => (
                                              <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
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
                                              </div>
                                            ))}
                                            {professionalMemberships.length > INITIAL_ITEMS_LIMIT && (
                                              <div className="flex justify-left pt-2">
                                                <Button
                                                  variant="text"
                                                  size="sm"
                                                  onClick={() => setShowAllMemberships(!showAllMemberships)}
                                                  className="text-black font-medium hover:text-red-600 text-xs"
                                                  style={{ fontFamily: "'Open Sauce', sans-serif" }}
                                                >
                                                  {showAllMemberships ? "Show Less" : `Show All (${professionalMemberships.length})`}
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="bg-white p-6 border-l-4 border-gray-300">
                                            <Typography variant="small" className="text-gray-500 italic font-medium" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                              You haven't filled up details in this section.
                                            </Typography>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* References */}
                                    <div>
                                      <Typography variant="h4" className="font-bold text-red-600 text-xl uppercase tracking-wide mb-6 text-left" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                                        References
                                      </Typography>
                                      {references.length > 0 ? (
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {(showAllReferences ? references : references.slice(0, INITIAL_ITEMS_LIMIT)).map((ref, index) => (
                                              <div key={index} className="bg-white border-l-4 border-gray-300 p-5">
                                                <Typography variant="h6" className="font-bold text-black mb-2 text-base" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                                  {ref.name}
                                                </Typography>
                                                {(ref.relationship || ref.position) && (
                                                  <Typography variant="small" className="text-black font-medium mb-1 text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                                    {ref.relationship || ref.position}
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
                                                  {(ref.phone || ref.contact) && (
                                                    <Typography variant="small" className="text-black text-sm" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 400 }}>
                                                      {formatPhoneNumber(ref.phone || ref.contact)}
                                                    </Typography>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                          {references.length > INITIAL_ITEMS_LIMIT && (
                                            <div className="flex justify-left pt-2">
                                              <Button
                                                variant="text"
                                                size="sm"
                                                onClick={() => setShowAllReferences(!showAllReferences)}
                                                className="text-black font-medium hover:text-red-600"
                                                style={{ fontFamily: "'Open Sauce', sans-serif" }}
                                              >
                                                {showAllReferences ? "Show Less" : `Show All (${references.length})`}
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="bg-white p-6 border-l-4 border-gray-300">
                                          <Typography variant="small" className="text-gray-500 italic font-medium" style={{ fontFamily: "'Open Sauce', sans-serif" }}>
                                            You haven't filled up details in this section.
                                          </Typography>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Standard Header Section for other templates */}
                                <div className={`${designTheme.headerBg} text-white relative overflow-hidden`}>
                                  <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                                  <div className="px-6 py-8 relative">
                                    <div className="flex flex-row items-center w-full gap-16">
                                      {(previewAvatar && previewAvatar !== "/placeholder.svg") && (
                                        <div className="relative flex-shrink-0 mr-8">
                                          <Avatar
                                            src={previewAvatar}
                                            alt={formData.fullName || "Profile"}
                                            size="xxl"
                                            className={`relative shadow-2xl ${designTheme.avatarSize} backdrop-blur-sm rounded-none border-0`}
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0 text-left flex flex-col justify-start pt-8">
                                        <div className="flex items-center gap-3 justify-start">
                                          <Typography
                                            variant="h1"
                                            className={`${designTheme.titleWeight} ${designTheme.typographySize} tracking-tight text-white break-words`}
                                          >
                                            {formData.fullName || "Your Name"}
                                          </Typography>
                                        </div>
                                        {formData.professionalTitle && (
                                          <div className="relative mt-8 flex items-center gap-3">
                                            <Typography
                                              variant="h3"
                                              className="font-light text-white/90 text-2xl md:text-3xl tracking-wide break-words"
                                            >
                                              {formData.professionalTitle}
                                            </Typography>
                                            <div className="w-0 h-0.5 bg-white/40 mt-4"></div>
                                          </div>
                                        )}
                                        {formData.professionalSummary && (
                                          <div className="mt-10 max-w-3xl overflow-hidden">
                                            <Typography
                                              variant="lead"
                                              className="text-white/80 leading-relaxed text-xl md:text-2xl font-light tracking-wide break-words overflow-wrap-anywhere"
                                            >
                                              {formData.professionalSummary}
                                            </Typography>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0">
                                    <svg viewBox="0 0 1200 120" className="w-full h-12 fill-white">
                                      <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"></path>
                                    </svg>
                                  </div>
                                </div>
                                <div className="px-6 py-16">
                                  <div className={`grid ${designTheme.contentGrid} gap-12`}>
                                    <div className={`${
                                      designTheme.contentGrid.includes("lg:grid-cols-4") ? "lg:col-span-1" : 
                                      designTheme.contentGrid.includes("lg:grid-cols-3") ? "lg:col-span-1" : 
                                      designTheme.contentGrid.includes("lg:grid-cols-2") ? "lg:col-span-1" : 
                                      ""
                                    }`}>
                                      <div className={`bg-white border ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding} mb-6`}>
                                        <Typography variant="h6" className={`font-light ${designTheme.textColor} text-lg mb-6`}>
                                          Contact
                                        </Typography>
                                        {(formData.email || formData.phone || formData.website) ? (
                                          <div className="space-y-4">
                                            {formData.email && (
                                              <div>
                                                <Typography variant="small" color="gray" className="font-medium mb-1">
                                                  Email
                                                </Typography>
                                                <Typography variant="small" className="text-gray-800 break-all">
                                                  {formData.email}
                                                </Typography>
                                              </div>
                                            )}
                                            {formData.phone && (
                                              <div>
                                                <Typography variant="small" color="gray" className="font-medium mb-1">
                                                  Phone
                                                </Typography>
                                                <Typography variant="small" className="text-gray-800">
                                                  {formatPhoneNumber(formData.phone)}
                                                </Typography>
                                              </div>
                                            )}
                                            {formData.website && (
                                              <div>
                                                <Typography variant="small" color="gray" className="font-medium mb-1">
                                                  Website
                                                </Typography>
                                                <Typography variant="small" className="text-gray-800 break-all">
                                                  {formData.website}
                                                </Typography>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <Typography variant="small" className="text-gray-500 italic">
                                            You haven't filled up details in this section.
                                          </Typography>
                                        )}
                                      </div>

                                      {/* Skills */}
                                      <div className={`bg-white border ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding} mb-6`}>
                                        <Typography variant="h6" className={`font-light ${designTheme.textColor} text-lg mb-6`}>
                                          Skills
                                        </Typography>
                                        {(skills.length > 0 || shouldAlwaysShowSections(formData.primaryCourseType)) ? (
                                          skills.length > 0 ? (
                                            <div className="space-y-3">
                                              {skills.map((skill, index) => (
                                                <div key={index} className="pb-3 border-b border-gray-50 last:border-b-0">
                                                  <Typography variant="small" className="font-medium text-gray-800 mb-1">
                                                    {skill.name}
                                                  </Typography>
                                                  <div className="flex items-center space-x-2">
                                                    <Chip size="md" value={skill.type || "TECHNICAL"} color={designTheme.buttonColor} className="text-xs font-light" />
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
                                              {shouldAlwaysShowSections(formData.primaryCourseType) 
                                                ? "You haven't filled up details in this section."
                                                : "No skills added yet"}
                                            </Typography>
                                          )
                                        ) : (
                                          <Typography variant="small" className="text-gray-500 italic">
                                            No skills added yet
                                          </Typography>
                                        )}
                                      </div>

                                      {/* TESDA Information - Always show for Template 2 */}
                                      {(shouldAlwaysShowSections(formData.primaryCourseType) || formData.ncLevel || formData.trainingCenter || formData.scholarshipType || formData.trainingDuration) && (
                                        <div className={`bg-white border ${designTheme.cardBorder} ${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                          <Typography variant="h6" className={`font-light ${designTheme.textColor} text-lg mb-6`}>
                                            TESDA Information
                                          </Typography>
                                          {(formData.ncLevel || formData.trainingCenter || formData.scholarshipType || formData.trainingDuration) ? (
                                            <div className="space-y-4">
                                              {formData.ncLevel && (
                                                <div>
                                                  <Typography variant="small" color="gray" className="font-medium mb-1">
                                                    NC Level
                                                  </Typography>
                                                  <Typography variant="small" className="text-gray-800">
                                                    {formData.ncLevel}
                                                  </Typography>
                                                </div>
                                              )}
                                              {formData.trainingCenter && (
                                                <div>
                                                  <Typography variant="small" color="gray" className="font-medium mb-1">
                                                    Training Center
                                                  </Typography>
                                                  <Typography variant="small" className="text-gray-800">
                                                    {formData.trainingCenter}
                                                  </Typography>
                                                </div>
                                              )}
                                              {formData.scholarshipType && (
                                                <div>
                                                  <Typography variant="small" color="gray" className="font-medium mb-1">
                                                    Scholarship Type
                                                  </Typography>
                                                  <Typography variant="small" className="text-gray-800">
                                                    {formData.scholarshipType}
                                                  </Typography>
                                                </div>
                                              )}
                                              {formData.trainingDuration && (
                                                <div>
                                                  <Typography variant="small" color="gray" className="font-medium mb-1">
                                                    Training Duration
                                                  </Typography>
                                                  <Typography variant="small" className="text-gray-800">
                                                    {formData.trainingDuration}
                                                  </Typography>
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <Typography variant="small" className="text-gray-500 italic">
                                              You haven't filled up details in this section.
                                            </Typography>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Main Content Area */}
                                    <div className={`${
                                      designTheme.contentGrid.includes("lg:grid-cols-4") ? "lg:col-span-3" : 
                                      designTheme.contentGrid.includes("lg:grid-cols-3") ? "lg:col-span-2" : 
                                      designTheme.contentGrid.includes("lg:grid-cols-2") ? "lg:col-span-1" : 
                                      ""
                                    }`}>
                                      {/* Certificates */}
                                      <div>
                                        <Typography variant="h4" className={`font-light ${designTheme.textColor} ${designTheme.typographySize.includes("text-4xl") ? "text-xl md:text-2xl" : designTheme.typographySize.includes("text-3xl") ? "text-lg md:text-xl" : "text-2xl"} mb-8`}>
                                          Certificates
                                        </Typography>
                                        {(certificates.length > 0 || shouldAlwaysShowSections(formData.primaryCourseType)) ? (
                                          certificates.length > 0 ? (
                                            <div className="space-y-4">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {(showAllCertificates ? certificates : certificates.slice(0, INITIAL_ITEMS_LIMIT)).map((certificate, index) => (
                                                  <Card key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                      <div className="flex items-center gap-4">
                                                        {certificate.certificateFile && (
                                                          <Avatar
                                                            src={URL.createObjectURL(certificate.certificateFile)}
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
                                                    </CardBody>
                                                  </Card>
                                                ))}
                                              </div>
                                              {certificates.length > INITIAL_ITEMS_LIMIT && (
                                                <div className="flex justify-center pt-2">
                                                  <Button
                                                    variant="text"
                                                    size="sm"
                                                    onClick={() => setShowAllCertificates(!showAllCertificates)}
                                                    className={`${designTheme.textColor} font-semibold`}
                                                  >
                                                    {showAllCertificates ? "Show Less" : `Show All (${certificates.length})`}
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="bg-white border border-gray-100 rounded-lg p-6">
                                              <Typography variant="small" className="text-gray-500 italic">
                                                You haven't filled up details in this section.
                                              </Typography>
                                            </div>
                                          )
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
                                        <Typography variant="h4" className={`font-light ${designTheme.textColor} text-2xl mb-8`}>
                                          Experience
                                        </Typography>
                                        {(experiences.length > 0 || shouldAlwaysShowSections(formData.primaryCourseType)) ? (
                                          experiences.length > 0 ? (
                                            <div className="space-y-8">
                                              {(showAllExperiences ? experiences : experiences.slice(0, INITIAL_ITEMS_LIMIT)).map((exp, index) => (
                                                <div key={index} className={`border-l-2 ${designTheme.cardBorder} pl-8 pb-8`}>
                                                  <Typography variant="h6" className="font-medium mb-2 break-words">
                                                    {exp.jobTitle}
                                                  </Typography>
                                                  {exp.company && (
                                                    <Typography variant="small" className={`${designTheme.textColor} mb-2 break-words`}>
                                                      {exp.company}
                                                    </Typography>
                                                  )}
                                                  {(exp.startDate || exp.endDate) && (
                                                    <Typography variant="small" color="gray" className="mb-2">
                                                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : "N/A"} -{" "}
                                                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "N/A"}
                                                    </Typography>
                                                  )}
                                                  {exp.responsibilities && (
                                                    <Typography variant="small" className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
                                                      {exp.responsibilities}
                                                    </Typography>
                                                  )}
                                                </div>
                                              ))}
                                              {experiences.length > INITIAL_ITEMS_LIMIT && (
                                                <div className="flex justify-center pt-2">
                                                  <Button
                                                    variant="text"
                                                    size="sm"
                                                    onClick={() => setShowAllExperiences(!showAllExperiences)}
                                                    className={`${designTheme.textColor} font-semibold`}
                                                  >
                                                    {showAllExperiences ? "Show Less" : `Show All (${experiences.length})`}
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="bg-white border border-gray-100 rounded-lg p-6">
                                              <Typography variant="small" className="text-gray-500 italic">
                                                You haven't filled up details in this section.
                                              </Typography>
                                            </div>
                                          )
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
                                        <Typography variant="h4" className={`font-light ${designTheme.textColor} text-2xl mb-8`}>
                                          Projects
                                        </Typography>
                                        {(projects.length > 0 || shouldAlwaysShowSections(formData.primaryCourseType)) ? (
                                          projects.length > 0 ? (
                                            <div className="space-y-4">
                                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {(showAllProjects ? projects : projects.slice(0, INITIAL_ITEMS_LIMIT)).map((project, index) => (
                                                  <Card key={index} className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 break-words">
                                                    {project.projectImageFile && (
                                                      <div className="relative h-48 overflow-hidden">
                                                        <img
                                                          src={URL.createObjectURL(project.projectImageFile)}
                                                          alt={project.title || "Project"}
                                                          className="w-full h-full object-cover"
                                                        />
                                                      </div>
                                                    )}
                                                    <CardBody className="p-5">
                                                      <Typography variant="h6" className="font-bold text-black mb-2 text-lg break-words" style={{ fontFamily: "'Open Sauce', sans-serif", fontWeight: 700 }}>
                                                        {project.title || "Unnamed Project"}
                                                      </Typography>
                                                      {project.description && (
                                                        <Typography
                                                          variant="small"
                                                          className="text-black mb-3 leading-relaxed text-base whitespace-pre-wrap break-words overflow-wrap-anywhere"
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
                                                <div className="flex justify-center pt-2">
                                                  <Button
                                                    variant="text"
                                                    size="sm"
                                                    onClick={() => setShowAllProjects(!showAllProjects)}
                                                    className={`${designTheme.textColor} font-semibold`}
                                                  >
                                                    {showAllProjects ? "Show Less" : `Show All (${projects.length})`}
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="bg-white border border-gray-100 rounded-lg p-6">
                                              <Typography variant="small" className="text-gray-500 italic">
                                                You haven't filled up details in this section.
                                              </Typography>
                                            </div>
                                          )
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
                                        <Typography variant="h4" className={`font-light ${designTheme.textColor} text-2xl mb-8`}>
                                          Awards & Recognition
                                        </Typography>
                                        {(awardsRecognitions.length > 0 || shouldAlwaysShowSections(formData.primaryCourseType)) ? (
                                          awardsRecognitions.length > 0 ? (
                                            <div className="space-y-4">
                                              {awardsRecognitions.map((award, index) => (
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
                                                    <Typography variant="small" className={designTheme.textColor}>
                                                      {award.dateReceived}
                                                    </Typography>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="bg-white border border-gray-100 rounded-lg p-6">
                                              <Typography variant="small" className="text-gray-500 italic">
                                                You haven't filled up details in this section.
                                              </Typography>
                                            </div>
                                          )
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
                                          <Typography variant="h5" className={`font-light ${designTheme.textColor} mb-6`}>
                                            Continuing Education
                                          </Typography>
                                          {(continuingEducations.length > 0 || shouldAlwaysShowSections(formData.primaryCourseType)) ? (
                                            continuingEducations.length > 0 ? (
                                              <div className="space-y-4">
                                                {continuingEducations.map((edu, index) => (
                                                  <div key={index} className={`border-l-2 ${designTheme.cardBorder} pl-4 py-2`}>
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
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <Typography variant="small" className="text-gray-500 italic">
                                                You haven't filled up details in this section.
                                              </Typography>
                                            )
                                          ) : (
                                            <Typography variant="small" className="text-gray-500 italic">
                                              No continuing education added yet
                                            </Typography>
                                          )}
                                        </div>

                                        {/* Professional Memberships */}
                                        <div>
                                          <Typography variant="h5" className={`font-light ${designTheme.textColor} mb-6`}>
                                            Professional Memberships
                                          </Typography>
                                          {(professionalMemberships.length > 0 || shouldAlwaysShowSections(formData.primaryCourseType)) ? (
                                            professionalMemberships.length > 0 ? (
                                              <div className="space-y-4">
                                                {professionalMemberships.map((mem, index) => (
                                                  <div key={index} className={`border-l-2 ${designTheme.cardBorder} pl-4 py-2`}>
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
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <Typography variant="small" className="text-gray-500 italic">
                                                You haven't filled up details in this section.
                                              </Typography>
                                            )
                                          ) : (
                                            <Typography variant="small" className="text-gray-500 italic">
                                              No professional memberships added yet
                                            </Typography>
                                          )}
                                        </div>
                                      </div>

                                      {/* References */}
                                      <div>
                                        <Typography variant="h4" className={`font-light ${designTheme.textColor} text-2xl mb-8`}>
                                          References
                                        </Typography>
                                        {(references.length > 0 || shouldAlwaysShowSections(formData.primaryCourseType)) ? (
                                          references.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                              {references.map((ref, index) => (
                                                <div key={index} className="bg-white border border-gray-100 rounded-lg p-6">
                                                  <Typography variant="h6" className="font-medium mb-2 break-words">
                                                    {ref.name}
                                                  </Typography>
                                                  {(ref.relationship || ref.position) && (
                                                    <Typography variant="small" color="gray" className="mb-1 break-words">
                                                      {ref.relationship || ref.position}
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
                                                    {(ref.phone || ref.contact) && (
                                                      <Typography variant="small" color="gray" className="break-words">
                                                        {formatPhoneNumber(ref.phone || ref.contact)}
                                                      </Typography>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="bg-white border border-gray-100 rounded-lg p-6">
                                              <Typography variant="small" className="text-gray-500 italic">
                                                You haven't filled up details in this section.
                                              </Typography>
                                            </div>
                                          )
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
                                </div>
                              </>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 text-center py-12">
                  <Typography variant="h6" className="text-gray-500 mb-2">
                    No Course Type Selected
                  </Typography>
                  <Typography variant="small" className="text-gray-400">
                    Please select a course type above to see the preview.
                  </Typography>
                </div>
              )}
            </CardBody>
          </Card>
          )}

          {/* Navigation Buttons */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl">
            <CardBody className="p-6 px-4">
              <div className="flex justify-between items-center gap-4 max-w-7xl mx-auto">
                <Button
                  type="button"
                  variant="outlined"
                  color="gray"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0 || isLoading}
                  className="flex items-center gap-2"
                >
                  <FaChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep === totalSteps - 1 ? (
                  <Button
                    type="submit"
                    size="lg"
                    variant="gradient"
                    color="blue"
                    disabled={isLoading || !validateStep(currentStep, false)}
                    className="flex items-center gap-2 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={(e) => {
                      if (!validateStep(currentStep)) {
                        e.preventDefault()
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                    }}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <Spinner className="h-5 w-5" />
                        Creating Portfolio...
                      </div>
                    ) : (
                      <>
                        <FaCheck className="w-5 h-5" />
                        Create Portfolio
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="gradient"
                    color="blue"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleNextStep()
                    }}
                    disabled={isLoading || !validateStep(currentStep, false)}
                    className="flex items-center gap-2 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      steps[currentStep].required && !validateStep(currentStep, false)
                        ? "Please complete all required fields before proceeding"
                        : "Continue to next step"
                    }
                  >
                    Next
                    <FaChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default PortfolioCreation
