"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FaPlus, FaTrash, FaPen, FaChevronLeft, FaChevronRight, FaCheck } from "react-icons/fa"
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
    tesdaRegistrationNumber: "",
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
    proficiencyLevel: "",
  })
  const [newExperience, setNewExperience] = useState({
    jobTitle: "",
    company: "",
    duration: "",
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
    position: "",
    company: "",
    contact: "",
    email: "",
  })
  const [newCertificate, setNewCertificate] = useState({
    courseName: "",
    certificateNumber: "",
    issueDate: "",
    certificateFile: null,
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState(null)
  const [graduateId, setGraduateId] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const navigate = useNavigate()
  const avatarFileInputRef = useRef(null)
  const projectFileInputRef = useRef(null)
  const certificateFileInputRef = useRef(null)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"

  const validSkillTypes = ["TECHNICAL", "LANGUAGE", "DIGITAL", "SOFT", "INDUSTRY_SPECIFIC"]

  // Course type to design template mapping
  const courseTypeTemplates = {
    "Bread and Pastry Production": "bread-pastry",
    "Cookery": "cookery",
    "Housekeeping": "housekeeping",
    "Food & Beverage Services": "food-beverage",
    "Bartending and Barista": "bartending-barista"
  }

  // Get design theme for preview - unique designs for each course type
  const getDesignTheme = (template) => {
    const themes = {
      "bread-pastry": {
        // Warm amber/orange theme - Centered card-based layout
        headerBg: "bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700",
        sidebarBg: "bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700",
        headerBarBg: "bg-gray-800",
        accentColor: "amber",
        textColor: "text-amber-600",
        pageBg: "bg-amber-50",
        borderColor: "border-amber-300",
        // Unique layout: Centered card-based design
        layoutType: "centered-cards", // centered-cards, top-header, left-sidebar, right-sidebar, split-view
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
        // Bold red/pink theme - Top header with two-column content
        headerBg: "bg-gradient-to-br from-red-600 via-pink-600 to-red-700",
        sidebarBg: "bg-gradient-to-br from-red-600 via-pink-600 to-red-700",
        headerBarBg: "bg-red-700",
        accentColor: "red",
        textColor: "text-red-600",
        pageBg: "bg-red-50",
        borderColor: "border-red-300",
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
        // Professional design matching the image - Dark gray header, light gray sidebar, white content
        headerBg: "bg-gray-700", // Dark gray header
        sidebarBg: "bg-gray-200", // Light gray sidebar
        headerBarBg: "bg-gray-700", // Dark gray for header bar
        accentColor: "gray",
        textColor: "text-gray-800", // Dark gray text
        pageBg: "bg-white",
        borderColor: "border-gray-400", // Gray borders
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
        // Fresh green/teal theme - Right sidebar layout
        headerBg: "bg-gradient-to-br from-green-600 via-teal-600 to-green-700",
        sidebarBg: "bg-gradient-to-br from-green-600 via-teal-600 to-green-700",
        headerBarBg: "bg-green-700",
        accentColor: "green",
        textColor: "text-green-600",
        pageBg: "bg-green-50",
        borderColor: "border-green-300",
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
        // Clean blue theme - Split view with left sidebar
        headerBg: "bg-blue-500",
        sidebarBg: "bg-blue-500",
        headerBarBg: "bg-transparent",
        accentColor: "blue",
        textColor: "text-gray-800",
        pageBg: "bg-gray-50",
        borderColor: "border-gray-300",
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
        useSimpleHeaders: true, // Flag to use simple text headers with lines
      },
      "default": {
        // Default blue theme - Left sidebar
        headerBg: "bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900",
        sidebarBg: "bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900",
        headerBarBg: "bg-blue-800",
        accentColor: "blue",
        textColor: "text-blue-600",
        pageBg: "bg-gray-50",
        borderColor: "border-blue-300",
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


  const courseTypes = [
    "Bread and Pastry Production",
    "Cookery",
    "Housekeeping",
    "Food & Beverage Services",
    "Bartending and Barista"
  ]

  const steps = [
    { id: 0, name: "Profile Photo", required: false },
    { id: 1, name: "Basic Information", required: true },
    { id: 2, name: "TESDA Information", required: false },
    { id: 3, name: "Contact Information", required: false },
    { id: 4, name: "Projects", required: false },
    { id: 5, name: "Certificates", required: false },
    { id: 6, name: "Skills", required: false },
    { id: 7, name: "Experiences", required: false },
    { id: 8, name: "Awards & Recognitions", required: false },
    { id: 9, name: "Continuing Education", required: false },
    { id: 10, name: "Professional Memberships", required: false },
    { id: 11, name: "References", required: false },
    { id: 12, name: "Additional Information", required: true },
    { id: 13, name: "Portfolio Preview", required: false },
  ]

  const totalSteps = steps.length
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  // Check if a step can be accessed (all previous required steps must be completed)
  const canAccessStep = (stepIndex) => {
    if (stepIndex === 0) return true
    if (stepIndex === currentStep) return true
    
    // Check all previous required steps
    for (let i = 0; i < stepIndex; i++) {
      if (steps[i].required && !completedSteps.has(i)) {
        return false
      }
    }
    return true
  }

  // Check if a step is completed
  const isStepCompleted = (stepIndex) => {
    if (steps[stepIndex].required) {
      return completedSteps.has(stepIndex) || validateStep(stepIndex, false)
    }
    
    // For optional steps, check if they have any data
    switch (stepIndex) {
      case 0: // Profile Photo
        return previewAvatar !== "/placeholder.svg" || selectedAvatarFile !== null
      case 2: // TESDA Information
        return formData.ncLevel || formData.trainingCenter || formData.scholarshipType || 
               formData.trainingDuration || formData.tesdaRegistrationNumber
      case 3: // Contact Information
        return formData.email || formData.phone || formData.website
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
    setFormData((prev) => ({ ...prev, [name]: value }))
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
    if (file && !file.type.startsWith("image/")) {
      setError("Please select an image file for the avatar.")
      return
    }
    setSelectedAvatarFile(file)
    setPreviewAvatar(file ? URL.createObjectURL(file) : "/placeholder.svg")
    setError("")
  }

  const handleProjectFileChange = (e) => {
    const file = e.target.files[0]
    if (file && !file.type.startsWith("image/")) {
      setError("Please select an image file for the project.")
      return
    }
    setNewProject((prev) => ({ ...prev, projectImageFile: file }))
    setError("")
  }

  const handleCertificateFileChange = (e) => {
    const file = e.target.files[0]
    if (file && !file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Please select an image or PDF file for the certificate.")
      return
    }
    setNewCertificate((prev) => ({ ...prev, certificateFile: file }))
    setError("")
  }

  const handleSkillInputChange = (e) => {
    const { name, value } = e.target
    setNewSkill((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleExperienceInputChange = (e) => {
    const { name, value } = e.target
    setNewExperience((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleAwardInputChange = (e) => {
    const { name, value } = e.target
    setNewAward((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleEducationInputChange = (e) => {
    const { name, value } = e.target
    setNewEducation((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleMembershipInputChange = (e) => {
    const { name, value } = e.target
    setNewMembership((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleReferenceInputChange = (e) => {
    const { name, value } = e.target
    setNewReference((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target
    setNewProject((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target
    setNewCertificate((prev) => ({ ...prev, [name]: value }))
    setError("")
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
    setNewSkill({ name: "", type: "TECHNICAL", proficiencyLevel: "" })
    setIsAddingSkill(false)
    setError("")
  }

  const handleAddExperience = () => {
    if (!newExperience.jobTitle || !newExperience.company) {
      setError("Please fill in the job title and company.")
      return
    }
    setExperiences((prev) => [...prev, { ...newExperience }])
    setNewExperience({ jobTitle: "", company: "", duration: "", responsibilities: "" })
    setIsAddingExperience(false)
    setError("")
  }

  const handleAddAward = () => {
    if (!newAward.title) {
      setError("Please fill in the award title.")
      return
    }
    setAwardsRecognitions((prev) => [...prev, { ...newAward }])
    setNewAward({ title: "", issuer: "", dateReceived: "" })
    setIsAddingAward(false)
    setError("")
  }

  const handleAddEducation = () => {
    if (!newEducation.courseName) {
      setError("Please fill in the course name.")
      return
    }
    setContinuingEducations((prev) => [...prev, { ...newEducation }])
    setNewEducation({ courseName: "", institution: "", completionDate: "" })
    setIsAddingEducation(false)
    setError("")
  }

  const handleAddMembership = () => {
    if (!newMembership.organization) {
      setError("Please fill in the organization name.")
      return
    }
    setProfessionalMemberships((prev) => [...prev, { ...newMembership }])
    setNewMembership({ organization: "", membershipType: "", startDate: "" })
    setIsAddingMembership(false)
    setError("")
  }

  const handleAddProject = () => {
    if (!newProject.title) {
      setError("Please fill in the project title.")
      return
    }
    if (!newProject.projectImageFile) {
      setError("Please select a project image file.")
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
        preview: URL.createObjectURL(newProject.projectImageFile),
      },
    ])
    setNewProject({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      projectImageFile: null,
    })
    setIsAddingProject(false)
    setError("")
  }

  const handleAddReference = () => {
    if (!newReference.name) {
      setError("Please fill in the reference name.")
      return
    }
    setReferences((prev) => [...prev, { ...newReference }])
    setNewReference({ name: "", position: "", company: "", contact: "", email: "" })
    setIsAddingReference(false)
    setError("")
  }

  const handleAddCertificate = () => {
    if (!newCertificate.courseName || !newCertificate.certificateNumber || !newCertificate.issueDate) {
      setError("Please fill in all required certificate fields.")
      return
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
    ])
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
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
      certificateFile: null, // Don't carry over the file for editing
    })
    setIsAddingCertificate(true)
  }

  const handleUpdateCertificate = () => {
    if (!newCertificate.courseName || !newCertificate.certificateNumber || !newCertificate.issueDate) {
      setError("Please fill in all required certificate fields.")
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
              certificateFile: newCertificate.certificateFile,
              preview: newCertificate.certificateFile
                ? URL.createObjectURL(newCertificate.certificateFile)
                : cert.preview,
            }
          : cert,
      ),
    )
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
    })
    setEditingCertificateId(null)
    setIsAddingCertificate(false)
    setError("")
  }

  const handleRemoveCertificate = (id) => {
    setCertificates((prev) => prev.filter((cert) => cert.id !== id))
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
  const handleCertificateImageClick = () => certificateFileInputRef.current.click()

  const validateStep = (step, showError = true) => {
    switch (step) {
      case 0: // Profile Photo - optional
        return true
      case 1: // Basic Information
        if (!formData.fullName || formData.fullName.trim() === "") {
          if (showError) setError("Please fill in your full name. This field is required.")
          return false
        }
        if (!formData.professionalSummary || formData.professionalSummary.trim() === "") {
          if (showError) setError("Please fill in your professional summary. This field is required.")
          return false
        }
        if (formData.professionalSummary.length > 1000) {
          if (showError) setError("Professional summary cannot exceed 1000 characters.")
          return false
        }
        return true
      case 12: // Additional Information
        if (!formData.primaryCourseType || (typeof formData.primaryCourseType === "string" && formData.primaryCourseType.trim() === "")) {
          if (showError) setError("Please fill in your primary course type. This field is required.")
          return false
        }
        return true
      case 13: // Portfolio Preview
        return true // Preview step is optional
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
      
      setError("")
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } else {
      // Validation failed, error already set by validateStep
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setError("")
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
        setError("")
        setCurrentStep(stepIndex)
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        // Find the first incomplete required step
        for (let i = 0; i < stepIndex; i++) {
          if (steps[i].required && !completedSteps.has(i)) {
            setError(`Please complete the "${steps[i].name}" section before proceeding.`)
            setCurrentStep(i)
            window.scrollTo({ top: 0, behavior: "smooth" })
            return
          }
        }
      }
    }
  }

  // Update completed steps when form data changes
  useEffect(() => {
    // Check and update completed status for all steps when data changes
    steps.forEach((step, index) => {
      if (isStepCompleted(index)) {
        setCompletedSteps((prev) => {
          if (!prev.has(index)) {
            return new Set([...prev, index])
          }
          return prev
        })
      } else if (step.required) {
        // Remove from completed if required step is no longer valid
        setCompletedSteps((prev) => {
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
    formData.tesdaRegistrationNumber,
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
    
    setIsLoading(true)
    setError("")

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
        setError("User not logged in, token missing, or graduate ID not found. Please sign in.")
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
        if (cert.certificateFile) {
          certificateData.append("certificateFile", cert.certificateFile)
        }
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
      if (formData.professionalSummary.length > 1000) {
        setError("Professional summary cannot exceed 1000 characters.")
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
        if (proj.startDate) formDataProject.append("startDate", proj.startDate)
        if (proj.endDate) formDataProject.append("endDate", proj.endDate)
        if (proj.projectImageFile) {
          formDataProject.append("projectImageFile", proj.projectImageFile)
        }

        await axios.post(`${BACKEND_URL}/api/project`, formDataProject, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        })
      }

      console.log("Portfolio created with ID:", portfolioId)
      navigate("/graduate-homepage")
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
      setError(`Error ${err.response?.status || "Unknown"}: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
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
                    const isCompleted = completedSteps.has(index) || (step.required && validateStep(index, false))
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
                            : step.required && !isCompleted
                            ? `"${step.name}" is required and not yet completed`
                            : step.name
                        }
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          isCurrent
                            ? "bg-blue-500 text-white shadow-lg scale-105 cursor-pointer"
                            : isCompleted
                            ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                            : !isAccessible
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
                        }`}
                      >
                        {isCompleted && <FaCheck className="w-3 h-3" />}
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

        {error && (
          <Card className="mb-6 bg-red-50 border border-red-200">
            <CardBody>
              <Typography color="red" className="text-center">
                {error}
              </Typography>
            </CardBody>
          </Card>
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
                maxLength={1000} // Enforces max input length
              />
              <div className="flex justify-between items-center mt-1">
                <Typography variant="small" className="text-gray-500">
                  {formData.professionalSummary.length}/1000 characters
                </Typography>
                {formData.professionalSummary.length > 1000 && (
                  <Typography variant="small" color="red">
                    Summary cannot exceed 1000 characters.
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
                    NC Level
                  </Typography>
                  <Input
                    size="lg"
                    value={formData.ncLevel}
                    onChange={handleInputChange}
                    name="ncLevel"
                    placeholder="e.g., NC II"
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Training Center/Institution
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
                    Scholarship Type
                  </Typography>
                  <Input
                    size="lg"
                    value={formData.scholarshipType}
                    onChange={handleInputChange}
                    name="scholarshipType"
                    placeholder="e.g., Full Scholarship"
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Training Duration
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

              <div className="mt-6">
                <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                  TESDA Registration Number
                </Typography>
                <Input
                  size="lg"
                  value={formData.tesdaRegistrationNumber}
                  onChange={handleInputChange}
                  name="tesdaRegistrationNumber"
                  placeholder="Enter TESDA registration number"
                  disabled={isLoading}
                  className="!border-gray-300 focus:!border-blue-500"
                />
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
                    Email
                  </Typography>
                  <Input
                    type="email"
                    size="lg"
                    value={formData.email}
                    onChange={handleInputChange}
                    name="email"
                    placeholder="Enter your email"
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Phone
                  </Typography>
                  <Input
                    type="tel"
                    size="lg"
                    value={formData.phone}
                    onChange={handleInputChange}
                    name="phone"
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  />
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
                  placeholder="Enter your website URL"
                  disabled={isLoading}
                  className="!border-gray-300 focus:!border-blue-500"
                />
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
                    setIsAddingProject(true)
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
                        className="!border-gray-300 focus:!border-blue-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Start Date
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={newProject.startDate}
                        onChange={handleProjectInputChange}
                        name="startDate"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        End Date
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={newProject.endDate}
                        onChange={handleProjectInputChange}
                        name="endDate"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-4 mb-6">
                    <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                      Project Image *
                    </Typography>
                    <Avatar
                      src={
                        newProject.projectImageFile
                          ? URL.createObjectURL(newProject.projectImageFile)
                          : "/placeholder.svg"
                      }
                      alt="Project Preview"
                      size="xxl"
                      className="cursor-pointer ring-4 ring-blue-100 hover:ring-blue-200 transition-all duration-300 hover:scale-105"
                      onClick={handleProjectImageClick}
                    />
                    <Typography variant="small" className="text-gray-600 text-center">
                      {newProject.projectImageFile ? newProject.projectImageFile.name : "Click to upload project image"}
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
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={handleAddProject}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Add Project
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => {
                        setIsAddingProject(false)
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
                    <Card key={proj.id} className="border border-gray-200 shadow-sm">
                      <CardBody className="p-6 flex items-center gap-6">
                        <Avatar src={proj.preview} alt="Project Preview" size="xl" className="rounded-md" />
                        <div className="flex-grow">
                          <Typography variant="h6" className="text-gray-900 font-bold mb-1">
                            {proj.title}
                          </Typography>
                          {proj.description && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm mb-2">
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
                        Course Name *
                      </Typography>
                      <Input
                        size="lg"
                        value={newCertificate.courseName}
                        onChange={handleCertificateInputChange}
                        name="courseName"
                        placeholder="Enter course name"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Certificate Number *
                      </Typography>
                      <Input
                        size="lg"
                        value={newCertificate.certificateNumber}
                        onChange={handleCertificateInputChange}
                        name="certificateNumber"
                        placeholder="Enter certificate number"
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
                        name="issueDate"
                        required
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-4 mb-6">
                    <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                      Certificate File
                    </Typography>
                    <Avatar
                      src={
                        newCertificate.certificateFile
                          ? URL.createObjectURL(newCertificate.certificateFile)
                          : "/placeholder.svg"
                      }
                      alt="Certificate Preview"
                      size="xxl"
                      className="cursor-pointer ring-4 ring-blue-100 hover:ring-blue-200 transition-all duration-300 hover:scale-105"
                      onClick={handleCertificateImageClick}
                    />
                    <Typography variant="small" className="text-gray-600 text-center">
                      {newCertificate.certificateFile
                        ? newCertificate.certificateFile.name
                        : "Click to upload certificate (Image or PDF)"}
                    </Typography>
                    <Button
                      variant="gradient"
                      color="blue"
                      onClick={handleCertificateImageClick}
                      disabled={isLoading}
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

                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={editingCertificateId ? handleUpdateCertificate : handleAddCertificate}
                      disabled={isLoading}
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
                        setNewCertificate({
                          courseName: "",
                          certificateNumber: "",
                          issueDate: "",
                          certificateFile: null,
                        })
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
                  onClick={() => setIsAddingSkill(true)}
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
                        Proficiency
                      </Typography>
                      <Input
                        size="lg"
                        value={newSkill.proficiencyLevel}
                        onChange={handleSkillInputChange}
                        name="proficiencyLevel"
                        placeholder="e.g., Expert"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={handleAddSkill}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => setIsAddingSkill(false)}
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
                  onClick={() => setIsAddingExperience(true)}
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
                        Duration
                      </Typography>
                      <Input
                        size="lg"
                        value={newExperience.duration}
                        onChange={handleExperienceInputChange}
                        name="duration"
                        placeholder="e.g., Jan 2020 - Dec 2022"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
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
                      />
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={handleAddExperience}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => setIsAddingExperience(false)}
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
                            <Typography variant="h6" className="text-gray-900 font-bold">
                              {exp.jobTitle}
                            </Typography>
                            <Typography variant="paragraph" className="text-gray-700">
                              {exp.company}
                            </Typography>
                          </div>
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
                        {exp.duration && (
                          <Typography variant="small" className="text-gray-500 mb-2">
                            Duration: {exp.duration}
                          </Typography>
                        )}
                        {exp.responsibilities && (
                          <Typography variant="paragraph" className="text-gray-600 text-sm">
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
                  onClick={() => setIsAddingAward(true)}
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
                        Issuer
                      </Typography>
                      <Input
                        size="lg"
                        value={newAward.issuer}
                        onChange={handleAwardInputChange}
                        name="issuer"
                        placeholder="e.g., XYZ Organization"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Date Received
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={newAward.dateReceived}
                        onChange={handleAwardInputChange}
                        name="dateReceived"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={handleAddAward}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => setIsAddingAward(false)}
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
                  onClick={() => setIsAddingEducation(true)}
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
                        Institution
                      </Typography>
                      <Input
                        size="lg"
                        value={newEducation.institution}
                        onChange={handleEducationInputChange}
                        name="institution"
                        placeholder="e.g., TESDA Institute"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Completion Date
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={newEducation.completionDate}
                        onChange={handleEducationInputChange}
                        name="completionDate"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={handleAddEducation}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => setIsAddingEducation(false)}
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
                  onClick={() => setIsAddingMembership(true)}
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
                        Membership Type
                      </Typography>
                      <Input
                        size="lg"
                        value={newMembership.membershipType}
                        onChange={handleMembershipInputChange}
                        name="membershipType"
                        placeholder="e.g., Professional Member"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Join Date
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={newMembership.startDate}
                        onChange={handleMembershipInputChange}
                        name="startDate"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={handleAddMembership}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => setIsAddingMembership(false)}
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
                  onClick={() => setIsAddingReference(true)}
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
                        Position
                      </Typography>
                      <Input
                        size="lg"
                        value={newReference.position}
                        onChange={handleReferenceInputChange}
                        name="position"
                        placeholder="e.g., Manager"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Company
                      </Typography>
                      <Input
                        size="lg"
                        value={newReference.company}
                        onChange={handleReferenceInputChange}
                        name="company"
                        placeholder="e.g., ABC Corp"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Contact Info
                      </Typography>
                      <Input
                        size="lg"
                        value={newReference.contact}
                        onChange={handleReferenceInputChange}
                        name="contact"
                        placeholder="e.g., +1234567890"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Email
                      </Typography>
                      <Input
                        type="email"
                        size="lg"
                        value={newReference.email}
                        onChange={handleReferenceInputChange}
                        name="email"
                        placeholder="e.g., john.doe@example.com"
                        disabled={isLoading}
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="filled"
                      color="green"
                      onClick={handleAddReference}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      color="gray"
                      onClick={() => setIsAddingReference(false)}
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
                          {ref.position && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm mb-1">
                              Position: {ref.position}
                            </Typography>
                          )}
                          {ref.company && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm mb-1">
                              Company: {ref.company}
                            </Typography>
                          )}
                          {ref.contact && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm mb-1">
                              Contact: {ref.contact}
                            </Typography>
                          )}
                          {ref.email && (
                            <Typography variant="paragraph" className="text-gray-600 text-sm">
                              Email: {ref.email}
                            </Typography>
                          )}
                        </div>
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
                    Primary Course Type *
                  </Typography>
                  <Select
                    size="lg"
                    label="Select Course Type"
                    value={formData.primaryCourseType}
                    onChange={handleCourseTypeChange}
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
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  >
                    <Option value="PUBLIC">Public</Option>
                    <Option value="PRIVATE">Private</Option>
                  </Select>
                </div>
              </div>
            </CardBody>
          </Card>
          )}

          {/* Step 13: Portfolio Preview */}
          {currentStep === 13 && (
            <Card className={`backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              isStepCompleted(13)
                ? "bg-green-50/70 border-green-400"
                : "bg-white/70 border-0"
            }`}>
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-1 h-8 rounded-full transition-all duration-300 ${
                  isStepCompleted(13)
                    ? "bg-gradient-to-b from-green-500 to-green-600"
                    : "bg-gradient-to-b from-blue-500 to-purple-500"
                }`}></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Portfolio Preview
                </Typography>
              </div>

              {formData.primaryCourseType ? (
                <div className="space-y-6">
                  <Typography variant="small" className="mb-4 text-gray-700 font-medium">
                    Preview of your portfolio - This is how it will appear to viewers
                  </Typography>
                  <div className={`min-h-screen ${getDesignTheme(formData.designTemplate).pageBg} py-8 px-4`}>
                    <div className={`mx-auto bg-white shadow-2xl overflow-hidden ${
                      getDesignTheme(formData.designTemplate).layoutType === "centered-cards" ? "max-w-5xl rounded-3xl" :
                      getDesignTheme(formData.designTemplate).layoutType === "top-header" ? "max-w-6xl rounded-xl" :
                      "max-w-6xl rounded-lg"
                    }`}>
                      {(() => {
                        const designTheme = getDesignTheme(formData.designTemplate)
                        
                        // Centered Cards Layout (Bread & Pastry)
                        if (designTheme.layoutType === "centered-cards") {
                          return (
                            <div className="p-8">
                              {/* Header Section - Centered */}
                              <div className={`${designTheme.headerFlexDirection} ${designTheme.headerTextAlign} mb-12`}>
                                {(previewAvatar && previewAvatar !== "/placeholder.svg") && (
                                  <div className={`${designTheme.avatarPosition}`}>
                                    <Avatar
                                      src={previewAvatar}
                                      alt={formData.fullName || "Profile"}
                                      size="xxl"
                                      className={`${designTheme.avatarSize} rounded-full border-4 border-amber-300 shadow-xl`}
                                    />
                                  </div>
                                )}
                                <div>
                                  <Typography variant="h1" className={`${designTheme.typographySize} ${designTheme.titleWeight} ${designTheme.textColor} mb-2`}>
                                    {formData.fullName || "Your Name"}
                                  </Typography>
                                  {formData.professionalTitle && (
                                    <Typography variant="h6" className={`${designTheme.textColor} text-xl font-medium`}>
                                      {formData.professionalTitle}
                                    </Typography>
                                  )}
                                </div>
                              </div>

                              {/* Contact & Info Cards */}
                              <div className={`grid ${designTheme.contentGrid} gap-6 mb-8`}>
                                {/* Contact Card */}
                                <div className={`${designTheme.cardStyle} ${designTheme.cardPadding} ${designTheme.sectionHeaderStyle}`}>
                                  <Typography variant="h6" className="text-white font-bold text-sm uppercase mb-4">
                                    CONTACT
                                  </Typography>
                                  <div className={`${designTheme.sectionContentStyle} space-y-3`}>
                                    {formData.phone && (
                                      <Typography variant="small" className="text-gray-700">📞 {formData.phone}</Typography>
                                    )}
                                    {formData.email && (
                                      <Typography variant="small" className="text-gray-700 break-all">✉️ {formData.email}</Typography>
                                    )}
                                    {(formData.preferredWorkLocation || formData.website) && (
                                      <Typography variant="small" className="text-gray-700">📍 {formData.preferredWorkLocation || formData.website}</Typography>
                                    )}
                                    {!formData.phone && !formData.email && !formData.preferredWorkLocation && !formData.website && (
                                      <Typography variant="small" className="text-gray-500 italic">No contact information</Typography>
                                    )}
                                  </div>
                                </div>

                                {/* Education Card */}
                                {(formData.trainingCenter || formData.ncLevel) && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding} ${designTheme.sectionHeaderStyle}`}>
                                    <Typography variant="h6" className="text-white font-bold text-sm uppercase mb-4">
                                      EDUCATION
                                    </Typography>
                                    <div className={`${designTheme.sectionContentStyle} space-y-2`}>
                                      {formData.trainingCenter && (
                                        <Typography variant="small" className="text-gray-700 font-medium">{formData.trainingCenter}</Typography>
                                      )}
                                      {formData.ncLevel && (
                                        <Typography variant="small" className="text-gray-600">{formData.ncLevel}</Typography>
                                      )}
                                      {formData.scholarshipType && (
                                        <Typography variant="small" className="text-gray-500 text-xs">{formData.scholarshipType}</Typography>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Skills Card */}
                                <div className={`${designTheme.cardStyle} ${designTheme.cardPadding} ${designTheme.sectionHeaderStyle}`}>
                                  <Typography variant="h6" className="text-white font-bold text-sm uppercase mb-4">
                                    SKILLS
                                  </Typography>
                                  <div className={`${designTheme.sectionContentStyle}`}>
                                    {skills.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, index) => (
                                          <Chip key={index} value={skill.name} className={`bg-amber-100 text-amber-700`} />
                                        ))}
                                      </div>
                                    ) : (
                                      <Typography variant="small" className="text-gray-500 italic">You haven't filled up details in this section.</Typography>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Main Content Sections */}
                              <div className={`${designTheme.sectionSpacing}`}>
                                {/* Professional Summary */}
                                {formData.professionalSummary && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        PROFESSIONAL SUMMARY
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <Typography variant="small" className="text-gray-700 leading-relaxed">
                                        {formData.professionalSummary}
                                      </Typography>
                                    </div>
                                  </div>
                                )}

                                {/* Work Experience */}
                                <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                  <div className={designTheme.sectionHeaderStyle}>
                                    <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                      WORK EXPERIENCE
                                    </Typography>
                                  </div>
                                  <div className={designTheme.sectionContentStyle}>
                                    {experiences.length > 0 ? (
                                      <div className="space-y-4">
                                        {experiences.map((exp, index) => (
                                          <div key={index} className="border-l-4 border-amber-400 pl-4">
                                            <Typography variant="h6" className="text-gray-800 font-semibold">
                                              {exp.jobTitle || "Position"}
                                            </Typography>
                                            <Typography variant="small" className="text-gray-600">
                                              {exp.company || "Company"} {exp.duration && ` • ${exp.duration}`}
                                            </Typography>
                                            {exp.responsibilities && (
                                              <Typography variant="small" className="text-gray-700 mt-2">
                                                {exp.responsibilities}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <Typography variant="small" className="text-gray-500 italic">You haven't filled up details in this section.</Typography>
                                    )}
                                  </div>
                                </div>

                                {/* Certificates */}
                                {certificates.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        CERTIFICATES
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {certificates.map((certificate, index) => (
                                          <div key={index} className="border-2 border-amber-200 rounded-lg p-4 bg-amber-50">
                                            <Typography variant="small" className="text-gray-800 font-medium">
                                              {certificate.courseName}
                                            </Typography>
                                            {certificate.certificateNumber && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                #{certificate.certificateNumber}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Projects */}
                                {projects.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        PROJECTS
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="space-y-4">
                                        {projects.map((project, index) => (
                                          <div key={index} className="border-l-4 border-amber-400 pl-4">
                                            <Typography variant="small" className="text-gray-800 font-semibold">
                                              {project.title}
                                            </Typography>
                                            {project.description && (
                                              <Typography variant="small" className="text-gray-600 text-xs mt-1">
                                                {project.description}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Awards */}
                                {awardsRecognitions.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        AWARDS & RECOGNITION
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="space-y-3">
                                        {awardsRecognitions.map((award, index) => (
                                          <div key={index}>
                                            <Typography variant="small" className="text-gray-800 font-medium">
                                              {award.title}
                                            </Typography>
                                            {award.issuer && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                {award.issuer}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Continuing Education */}
                                {continuingEducations.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        CONTINUING EDUCATION
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="space-y-3">
                                        {continuingEducations.map((edu, index) => (
                                          <div key={index}>
                                            <Typography variant="small" className="text-gray-800 font-medium">
                                              {edu.courseName}
                                            </Typography>
                                            {edu.institution && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                {edu.institution}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Professional Memberships */}
                                {professionalMemberships.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        PROFESSIONAL MEMBERSHIPS
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="space-y-3">
                                        {professionalMemberships.map((mem, index) => (
                                          <div key={index}>
                                            <Typography variant="small" className="text-gray-800 font-medium">
                                              {mem.organization}
                                            </Typography>
                                            {mem.membershipType && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                {mem.membershipType}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* References */}
                                {references.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        REFERENCES
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {references.map((ref, index) => (
                                          <div key={index} className="border-2 border-amber-200 rounded-lg p-3 bg-amber-50">
                                            <Typography variant="small" className="text-gray-800 font-medium">
                                              {ref.name}
                                            </Typography>
                                            {ref.position && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                {ref.position}
                                              </Typography>
                                            )}
                                            {ref.company && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                {ref.company}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        
                        // Top Header Layout (Cookery)
                        if (designTheme.layoutType === "top-header") {
                          return (
                            <div>
                              {/* Top Header Section */}
                              <div className={`${designTheme.headerBg} text-white p-12 ${designTheme.headerFlexDirection} ${designTheme.headerTextAlign}`}>
                                {(previewAvatar && previewAvatar !== "/placeholder.svg") && (
                                  <div className={`${designTheme.avatarPosition}`}>
                                    <Avatar
                                      src={previewAvatar}
                                      alt={formData.fullName || "Profile"}
                                      size="xxl"
                                      className={`${designTheme.avatarSize} rounded-full border-4 border-white shadow-2xl`}
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <Typography variant="h1" className={`${designTheme.typographySize} ${designTheme.titleWeight} text-white mb-2`}>
                                    {formData.fullName || "Your Name"}
                                  </Typography>
                                  {formData.professionalTitle && (
                                    <Typography variant="h6" className="text-white/90 text-2xl font-medium">
                                      {formData.professionalTitle}
                                    </Typography>
                                  )}
                                </div>
                              </div>

                              {/* Two Column Content */}
                              <div className="p-8">
                                <div className={`grid ${designTheme.contentGrid} gap-8`}>
                                  {/* Left Column */}
                                  <div className="space-y-6">
                                    {/* Contact */}
                                    <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                      <div className={designTheme.sectionHeaderStyle}>
                                        <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                          CONTACT
                                        </Typography>
                                      </div>
                                      <div className={designTheme.sectionContentStyle}>
                                        {formData.phone && (
                                          <Typography variant="small" className="text-gray-700 mb-2">📞 {formData.phone}</Typography>
                                        )}
                                        {formData.email && (
                                          <Typography variant="small" className="text-gray-700 mb-2 break-all">✉️ {formData.email}</Typography>
                                        )}
                                        {(formData.preferredWorkLocation || formData.website) && (
                                          <Typography variant="small" className="text-gray-700">📍 {formData.preferredWorkLocation || formData.website}</Typography>
                                        )}
                                        {!formData.phone && !formData.email && !formData.preferredWorkLocation && !formData.website && (
                                          <Typography variant="small" className="text-gray-500 italic">No contact information</Typography>
                                        )}
                                      </div>
                                    </div>

                                    {/* Education */}
                                    {(formData.trainingCenter || formData.ncLevel) && (
                                      <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                        <div className={designTheme.sectionHeaderStyle}>
                                          <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                            EDUCATION
                                          </Typography>
                                        </div>
                                        <div className={designTheme.sectionContentStyle}>
                                          {formData.trainingCenter && (
                                            <Typography variant="small" className="text-gray-700 font-medium">{formData.trainingCenter}</Typography>
                                          )}
                                          {formData.ncLevel && (
                                            <Typography variant="small" className="text-gray-600">{formData.ncLevel}</Typography>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Skills */}
                                    <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                      <div className={designTheme.sectionHeaderStyle}>
                                        <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                          SKILLS
                                        </Typography>
                                      </div>
                                      <div className={designTheme.sectionContentStyle}>
                                        {skills.length > 0 ? (
                                          <ul className="space-y-2 list-disc list-inside">
                                            {skills.map((skill, index) => (
                                              <li key={index}>
                                                <Typography variant="small" className="text-gray-700">{skill.name}</Typography>
                                              </li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <Typography variant="small" className="text-gray-500 italic">You haven't filled up details in this section.</Typography>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Column */}
                                  <div className="space-y-6">
                                    {/* Professional Summary */}
                                    {formData.professionalSummary && (
                                      <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                        <div className={designTheme.sectionHeaderStyle}>
                                          <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                            PROFESSIONAL SUMMARY
                                          </Typography>
                                        </div>
                                        <div className={designTheme.sectionContentStyle}>
                                          <Typography variant="small" className="text-gray-700 leading-relaxed">
                                            {formData.professionalSummary}
                                          </Typography>
                                        </div>
                                      </div>
                                    )}

                                    {/* Work Experience */}
                                    <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                      <div className={designTheme.sectionHeaderStyle}>
                                        <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                          WORK EXPERIENCE
                                        </Typography>
                                      </div>
                                      <div className={designTheme.sectionContentStyle}>
                                        {experiences.length > 0 ? (
                                          <div className="space-y-4">
                                            {experiences.map((exp, index) => (
                                              <div key={index} className="border-l-4 border-red-500 pl-4">
                                                <Typography variant="h6" className="text-gray-800 font-semibold">
                                                  {exp.jobTitle || "Position"}
                                                </Typography>
                                                <Typography variant="small" className="text-gray-600">
                                                  {exp.company || "Company"} {exp.duration && ` • ${exp.duration}`}
                                                </Typography>
                                                {exp.responsibilities && (
                                                  <Typography variant="small" className="text-gray-700 mt-2">
                                                    {exp.responsibilities}
                                                  </Typography>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <Typography variant="small" className="text-gray-500 italic">You haven't filled up details in this section.</Typography>
                                        )}
                                      </div>
                                    </div>

                                    {/* Certificates */}
                                    {certificates.length > 0 && (
                                      <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                        <div className={designTheme.sectionHeaderStyle}>
                                          <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                            CERTIFICATES
                                          </Typography>
                                        </div>
                                        <div className={designTheme.sectionContentStyle}>
                                          <div className="grid grid-cols-1 gap-4">
                                            {certificates.map((certificate, index) => (
                                              <div key={index} className="border-l-4 border-red-500 pl-4">
                                                <Typography variant="small" className="text-gray-800 font-medium">
                                                  {certificate.courseName}
                                                </Typography>
                                                {certificate.certificateNumber && (
                                                  <Typography variant="small" className="text-gray-600 text-xs">
                                                    #{certificate.certificateNumber}
                                                  </Typography>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Projects */}
                                    {projects.length > 0 && (
                                      <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                        <div className={designTheme.sectionHeaderStyle}>
                                          <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                            PROJECTS
                                          </Typography>
                                        </div>
                                        <div className={designTheme.sectionContentStyle}>
                                          <div className="space-y-4">
                                            {projects.map((project, index) => (
                                              <div key={index} className="border-l-4 border-red-500 pl-4">
                                                <Typography variant="small" className="text-gray-800 font-semibold">
                                                  {project.title}
                                                </Typography>
                                                {project.description && (
                                                  <Typography variant="small" className="text-gray-600 text-xs mt-1">
                                                    {project.description}
                                                  </Typography>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Awards */}
                                    {awardsRecognitions.length > 0 && (
                                      <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                        <div className={designTheme.sectionHeaderStyle}>
                                          <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                            AWARDS & RECOGNITION
                                          </Typography>
                                        </div>
                                        <div className={designTheme.sectionContentStyle}>
                                          <div className="space-y-3">
                                            {awardsRecognitions.map((award, index) => (
                                              <div key={index}>
                                                <Typography variant="small" className="text-gray-800 font-medium">
                                                  {award.title}
                                                </Typography>
                                                {award.issuer && (
                                                  <Typography variant="small" className="text-gray-600 text-xs">
                                                    {award.issuer}
                                                  </Typography>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        
                        // Right Sidebar Layout (Food & Beverage)
                        if (designTheme.layoutType === "right-sidebar") {
                          return (
                            <div className="flex flex-col lg:flex-row-reverse">
                              {/* Right Sidebar */}
                              <div className={`${designTheme.sidebarBg} text-white w-full lg:w-80 flex-shrink-0 p-8`}>
                                {(previewAvatar && previewAvatar !== "/placeholder.svg") && (
                                  <div className="flex justify-center mb-8">
                                    <Avatar
                                      src={previewAvatar}
                                      alt={formData.fullName || "Profile"}
                                      size="xxl"
                                      className={`${designTheme.avatarSize} rounded-full border-4 border-white shadow-lg`}
                                    />
                                  </div>
                                )}
                                <div className="space-y-6">
                                  {/* Contact */}
                                  <div className="border-t border-white/30 pt-6">
                                    <Typography variant="h6" className="text-white font-bold text-sm uppercase mb-4">
                                      CONTACT
                                    </Typography>
                                    <div className="space-y-3">
                                      {formData.phone && (
                                        <Typography variant="small" className="text-white/90 text-sm">📞 {formData.phone}</Typography>
                                      )}
                                      {formData.email && (
                                        <Typography variant="small" className="text-white/90 text-sm break-all">✉️ {formData.email}</Typography>
                                      )}
                                      {(formData.preferredWorkLocation || formData.website) && (
                                        <Typography variant="small" className="text-white/90 text-sm">📍 {formData.preferredWorkLocation || formData.website}</Typography>
                                      )}
                                      {!formData.phone && !formData.email && !formData.preferredWorkLocation && !formData.website && (
                                        <Typography variant="small" className="text-white/70 italic text-xs">No contact information</Typography>
                                      )}
                                    </div>
                                  </div>
                                  {/* Education */}
                                  {(formData.trainingCenter || formData.ncLevel) && (
                                    <div className="border-t border-white/30 pt-6">
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase mb-4">
                                        EDUCATION
                                      </Typography>
                                      <div className="space-y-2">
                                        {formData.trainingCenter && (
                                          <Typography variant="small" className="text-white/90 text-sm">{formData.trainingCenter}</Typography>
                                        )}
                                        {formData.ncLevel && (
                                          <Typography variant="small" className="text-white/90 text-sm">{formData.ncLevel}</Typography>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {/* Skills */}
                                  <div className="border-t border-white/30 pt-6">
                                    <Typography variant="h6" className="text-white font-bold text-sm uppercase mb-4">
                                      SKILLS
                                    </Typography>
                                    {skills.length > 0 ? (
                                      <ul className="space-y-2 list-disc list-inside">
                                        {skills.map((skill, index) => (
                                          <li key={index}>
                                            <Typography variant="small" className="text-white/90 text-sm">{skill.name}</Typography>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <Typography variant="small" className="text-white/70 italic text-xs">You haven't filled up details in this section.</Typography>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Left Main Content */}
                              <div className="flex-1 bg-white p-8">
                                <div className={`${designTheme.headerBarBg} text-white p-6 mb-6 rounded-t-2xl`}>
                                  <Typography variant="h1" className={`${designTheme.typographySize} ${designTheme.titleWeight} text-white mb-2`}>
                                    {formData.fullName || "Your Name"}
                                  </Typography>
                                  {formData.professionalTitle && (
                                    <Typography variant="h6" className="text-white/90 text-lg font-normal">
                                      {formData.professionalTitle}
                                    </Typography>
                                  )}
                                </div>

                                {/* Sections with gradient headers */}
                                {formData.professionalSummary && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding} mb-6`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        PROFESSIONAL SUMMARY
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <Typography variant="small" className="text-gray-700 leading-relaxed">
                                        {formData.professionalSummary}
                                      </Typography>
                                    </div>
                                  </div>
                                )}

                                <div className={`${designTheme.cardStyle} ${designTheme.cardPadding} mb-6`}>
                                  <div className={designTheme.sectionHeaderStyle}>
                                    <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                      WORK EXPERIENCE
                                    </Typography>
                                  </div>
                                  <div className={designTheme.sectionContentStyle}>
                                    {experiences.length > 0 ? (
                                      <div className="space-y-4">
                                        {experiences.map((exp, index) => (
                                          <div key={index} className="border-l-4 border-green-500 pl-4">
                                            <Typography variant="h6" className="text-gray-800 font-semibold">
                                              {exp.jobTitle || "Position"}
                                            </Typography>
                                            <Typography variant="small" className="text-gray-600">
                                              {exp.company || "Company"} {exp.duration && ` • ${exp.duration}`}
                                            </Typography>
                                            {exp.responsibilities && (
                                              <Typography variant="small" className="text-gray-700 mt-2">
                                                {exp.responsibilities}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <Typography variant="small" className="text-gray-500 italic">You haven't filled up details in this section.</Typography>
                                    )}
                                  </div>
                                </div>

                                {certificates.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding} mb-6`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        CERTIFICATES
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {certificates.map((certificate, index) => (
                                          <div key={index} className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                                            <Typography variant="small" className="text-gray-800 font-medium">
                                              {certificate.courseName}
                                            </Typography>
                                            {certificate.certificateNumber && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                #{certificate.certificateNumber}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {projects.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding} mb-6`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        PROJECTS
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="space-y-4">
                                        {projects.map((project, index) => (
                                          <div key={index} className="border-l-4 border-green-500 pl-4">
                                            <Typography variant="small" className="text-gray-800 font-semibold">
                                              {project.title}
                                            </Typography>
                                            {project.description && (
                                              <Typography variant="small" className="text-gray-600 text-xs mt-1">
                                                {project.description}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {awardsRecognitions.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding} mb-6`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        AWARDS & RECOGNITION
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="space-y-3">
                                        {awardsRecognitions.map((award, index) => (
                                          <div key={index}>
                                            <Typography variant="small" className="text-gray-800 font-medium">
                                              {award.title}
                                            </Typography>
                                            {award.issuer && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                {award.issuer}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {continuingEducations.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding} mb-6`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        CONTINUING EDUCATION
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="space-y-3">
                                        {continuingEducations.map((edu, index) => (
                                          <div key={index}>
                                            <Typography variant="small" className="text-gray-800 font-medium">
                                              {edu.courseName}
                                            </Typography>
                                            {edu.institution && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                {edu.institution}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {professionalMemberships.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding} mb-6`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        PROFESSIONAL MEMBERSHIPS
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="space-y-3">
                                        {professionalMemberships.map((mem, index) => (
                                          <div key={index}>
                                            <Typography variant="small" className="text-gray-800 font-medium">
                                              {mem.organization}
                                            </Typography>
                                            {mem.membershipType && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                {mem.membershipType}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {references.length > 0 && (
                                  <div className={`${designTheme.cardStyle} ${designTheme.cardPadding}`}>
                                    <div className={designTheme.sectionHeaderStyle}>
                                      <Typography variant="h6" className="text-white font-bold text-sm uppercase">
                                        REFERENCES
                                      </Typography>
                                    </div>
                                    <div className={designTheme.sectionContentStyle}>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {references.map((ref, index) => (
                                          <div key={index} className="border-2 border-green-200 rounded-lg p-3 bg-green-50">
                                            <Typography variant="small" className="text-gray-800 font-medium">
                                              {ref.name}
                                            </Typography>
                                            {ref.position && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                {ref.position}
                                              </Typography>
                                            )}
                                            {ref.company && (
                                              <Typography variant="small" className="text-gray-600 text-xs">
                                                {ref.company}
                                              </Typography>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        
                        // Housekeeping Layout: Top header + Left sidebar + Right content
                        if (designTheme.layoutType === "housekeeping-layout") {
                          return (
                            <div>
                              {/* Top Header - Full Width Dark Gray */}
                              <div className={`${designTheme.headerBg} text-white p-8 ${designTheme.headerFlexDirection} ${designTheme.headerTextAlign}`}>
                                <Typography variant="h1" className={`${designTheme.typographySize} ${designTheme.titleWeight} text-white uppercase tracking-wide mb-2`}>
                                  {formData.fullName || "Your Name"}
                                </Typography>
                                {formData.professionalTitle && (
                                  <Typography variant="h6" className="text-white text-lg font-normal uppercase tracking-wide">
                                    {formData.professionalTitle}
                                  </Typography>
                                )}
                              </div>

                              {/* Main Content: Left Sidebar + Right Content */}
                              <div className="flex flex-col lg:flex-row">
                                {/* Left Sidebar - Light Gray Background */}
                                <div className={`${designTheme.sidebarBg} w-full lg:w-80 flex-shrink-0 p-8 border-r border-gray-400`}>
                                  {/* Contact Section */}
                                  <div className="mb-6">
                                    <Typography variant="h6" className={`${designTheme.sidebarTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                      CONTACT
                                    </Typography>
                                    <div className="space-y-3 mt-3">
                                      {formData.phone && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-700">📞</span>
                                          <Typography variant="small" className={`${designTheme.sidebarTextColor} text-sm`}>
                                            {formData.phone}
                                          </Typography>
                                        </div>
                                      )}
                                      {formData.email && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-700">✉️</span>
                                          <Typography variant="small" className={`${designTheme.sidebarTextColor} text-sm break-all`}>
                                            {formData.email}
                                          </Typography>
                                        </div>
                                      )}
                                      {(formData.preferredWorkLocation || formData.website) && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-700">📍</span>
                                          <Typography variant="small" className={`${designTheme.sidebarTextColor} text-sm`}>
                                            {formData.preferredWorkLocation || formData.website}
                                          </Typography>
                                        </div>
                                      )}
                                      {!formData.phone && !formData.email && !formData.preferredWorkLocation && !formData.website && (
                                        <Typography variant="small" className={`${designTheme.sidebarTextColor} italic text-xs`}>
                                          No contact information
                                        </Typography>
                                      )}
                                    </div>
                                  </div>

                                  {/* Education Section */}
                                  {(formData.trainingCenter || formData.ncLevel) && (
                                    <div className="mb-6">
                                      <Typography variant="h6" className={`${designTheme.sidebarTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                        EDUCATION
                                      </Typography>
                                      <div className="space-y-2 mt-3">
                                        {formData.trainingCenter && (
                                          <Typography variant="small" className={`${designTheme.sidebarTextColor} text-sm font-semibold`}>
                                            {formData.trainingCenter}
                                          </Typography>
                                        )}
                                        {formData.ncLevel && (
                                          <Typography variant="small" className={`${designTheme.sidebarTextColor} text-sm`}>
                                            • {formData.ncLevel}
                                          </Typography>
                                        )}
                                        {formData.scholarshipType && (
                                          <Typography variant="small" className={`${designTheme.sidebarTextColor} text-sm`}>
                                            • {formData.scholarshipType}
                                          </Typography>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Skills Section */}
                                  <div className="mb-6">
                                    <Typography variant="h6" className={`${designTheme.sidebarTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                      SKILLS
                                    </Typography>
                                    <div className="mt-3">
                                      {skills.length > 0 ? (
                                        <ul className="space-y-1 list-disc list-inside">
                                          {skills.map((skill, index) => (
                                            <li key={index}>
                                              <Typography variant="small" className={`${designTheme.sidebarTextColor} text-sm`}>
                                                {skill.name}
                                              </Typography>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <Typography variant="small" className={`${designTheme.sidebarTextColor} italic text-xs`}>
                                          You haven't filled up details in this section.
                                        </Typography>
                                      )}
                                    </div>
                                  </div>

                                  {/* TESDA Information */}
                                  {(formData.trainingDuration || formData.tesdaRegistrationNumber) && (
                                    <div>
                                      <Typography variant="h6" className={`${designTheme.sidebarTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                        TESDA
                                      </Typography>
                                      <div className="space-y-2 mt-3">
                                        {formData.trainingDuration && (
                                          <Typography variant="small" className={`${designTheme.sidebarTextColor} text-sm`}>
                                            • Duration: {formData.trainingDuration}
                                          </Typography>
                                        )}
                                        {formData.tesdaRegistrationNumber && (
                                          <Typography variant="small" className={`${designTheme.sidebarTextColor} text-sm`}>
                                            • Reg. #: {formData.tesdaRegistrationNumber}
                                          </Typography>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Right Main Content - White Background */}
                                <div className="flex-1 bg-white p-8">
                                  {/* Professional Summary */}
                                  {formData.professionalSummary && (
                                    <div className="mb-8">
                                      <Typography variant="h6" className={`${designTheme.mainTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                        PROFESSIONAL SUMMARY
                                      </Typography>
                                      <div className="mt-3">
                                        <Typography variant="small" className={`${designTheme.mainTextColor} leading-relaxed`}>
                                          {formData.professionalSummary}
                                        </Typography>
                                      </div>
                                    </div>
                                  )}

                                  {/* Work Experience */}
                                  <div className="mb-8">
                                    <Typography variant="h6" className={`${designTheme.mainTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                      WORK EXPERIENCE
                                    </Typography>
                                    <div className="mt-3">
                                      {experiences.length > 0 ? (
                                        <div className="space-y-6">
                                          {experiences.map((exp, index) => (
                                            <div key={index} className="mb-4">
                                              <div className="flex justify-between items-start mb-2">
                                                <div>
                                                  <Typography variant="small" className={`${designTheme.mainTextColor} font-semibold`}>
                                                    {exp.company || "Company"}
                                                  </Typography>
                                                  <Typography variant="small" className={`${designTheme.mainTextColor}`}>
                                                    {exp.jobTitle || "Position"}
                                                  </Typography>
                                                </div>
                                                {exp.duration && (
                                                  <Typography variant="small" className={`${designTheme.mainTextColor} text-right`}>
                                                    {exp.duration}
                                                  </Typography>
                                                )}
                                              </div>
                                              {exp.responsibilities && (
                                                <ul className="list-disc list-inside mt-2">
                                                  <li>
                                                    <Typography variant="small" className={`${designTheme.mainTextColor}`}>
                                                      {exp.responsibilities}
                                                    </Typography>
                                                  </li>
                                                </ul>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <Typography variant="small" className={`${designTheme.mainTextColor} italic`}>
                                          You haven't filled up details in this section.
                                        </Typography>
                                      )}
                                    </div>
                                  </div>

                                  {/* Certificates */}
                                  {certificates.length > 0 && (
                                    <div className="mb-8">
                                      <Typography variant="h6" className={`${designTheme.mainTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                        CERTIFICATES
                                      </Typography>
                                      <div className="mt-3">
                                        <div className="space-y-3">
                                          {certificates.map((certificate, index) => (
                                            <div key={index}>
                                              <Typography variant="small" className={`${designTheme.mainTextColor} font-medium`}>
                                                {certificate.courseName}
                                              </Typography>
                                              {certificate.certificateNumber && (
                                                <Typography variant="small" className={`${designTheme.mainTextColor} text-xs`}>
                                                  #{certificate.certificateNumber}
                                                </Typography>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Projects */}
                                  {projects.length > 0 && (
                                    <div className="mb-8">
                                      <Typography variant="h6" className={`${designTheme.mainTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                        PROJECTS
                                      </Typography>
                                      <div className="mt-3">
                                        <div className="space-y-4">
                                          {projects.map((project, index) => (
                                            <div key={index}>
                                              <Typography variant="small" className={`${designTheme.mainTextColor} font-semibold`}>
                                                {project.title}
                                              </Typography>
                                              {project.description && (
                                                <Typography variant="small" className={`${designTheme.mainTextColor} text-xs mt-1`}>
                                                  {project.description}
                                                </Typography>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Awards */}
                                  {awardsRecognitions.length > 0 && (
                                    <div className="mb-8">
                                      <Typography variant="h6" className={`${designTheme.mainTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                        AWARDS & RECOGNITION
                                      </Typography>
                                      <div className="mt-3">
                                        <div className="space-y-3">
                                          {awardsRecognitions.map((award, index) => (
                                            <div key={index}>
                                              <Typography variant="small" className={`${designTheme.mainTextColor} font-medium`}>
                                                {award.title}
                                              </Typography>
                                              {award.issuer && (
                                                <Typography variant="small" className={`${designTheme.mainTextColor} text-xs`}>
                                                  {award.issuer}
                                                </Typography>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Continuing Education */}
                                  {continuingEducations.length > 0 && (
                                    <div className="mb-8">
                                      <Typography variant="h6" className={`${designTheme.mainTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                        CONTINUING EDUCATION
                                      </Typography>
                                      <div className="mt-3">
                                        <div className="space-y-3">
                                          {continuingEducations.map((edu, index) => (
                                            <div key={index}>
                                              <Typography variant="small" className={`${designTheme.mainTextColor} font-medium`}>
                                                {edu.courseName}
                                              </Typography>
                                              {edu.institution && (
                                                <Typography variant="small" className={`${designTheme.mainTextColor} text-xs`}>
                                                  {edu.institution}
                                                </Typography>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Professional Memberships */}
                                  {professionalMemberships.length > 0 && (
                                    <div className="mb-8">
                                      <Typography variant="h6" className={`${designTheme.mainTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                        PROFESSIONAL MEMBERSHIPS
                                      </Typography>
                                      <div className="mt-3">
                                        <div className="space-y-3">
                                          {professionalMemberships.map((mem, index) => (
                                            <div key={index}>
                                              <Typography variant="small" className={`${designTheme.mainTextColor} font-medium`}>
                                                {mem.organization}
                                              </Typography>
                                              {mem.membershipType && (
                                                <Typography variant="small" className={`${designTheme.mainTextColor} text-xs`}>
                                                  {mem.membershipType}
                                                </Typography>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* References */}
                                  {references.length > 0 && (
                                    <div>
                                      <Typography variant="h6" className={`${designTheme.mainTextColor} font-bold text-sm uppercase mb-2 pb-2 border-b border-gray-600`}>
                                        REFERENCES
                                      </Typography>
                                      <div className="mt-3">
                                        <div className="space-y-3">
                                          {references.map((ref, index) => (
                                            <div key={index}>
                                              <Typography variant="small" className={`${designTheme.mainTextColor} font-medium`}>
                                                {ref.name}
                                              </Typography>
                                              {ref.position && (
                                                <Typography variant="small" className={`${designTheme.mainTextColor} text-xs`}>
                                                  {ref.position}
                                                </Typography>
                                              )}
                                              {ref.company && (
                                                <Typography variant="small" className={`${designTheme.mainTextColor} text-xs`}>
                                                  {ref.company}
                                                </Typography>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        }
                        
                        // Default: Left Sidebar Layout (Bartending, Default)
                        return (
                          <div className="flex flex-col lg:flex-row">
                            {/* Left Sidebar - Dark Background */}
                            <div className={`${designTheme.sidebarBg} text-white w-full lg:w-80 flex-shrink-0 p-8`}>
                              {/* Profile Picture */}
                              {(previewAvatar && previewAvatar !== "/placeholder.svg") && (
                                <div className="flex justify-center mb-8">
                                  <Avatar
                                    src={previewAvatar}
                                    alt={formData.fullName || "Profile"}
                                    size="xxl"
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                                  />
                                </div>
                              )}

                              {/* Contact Section */}
                              <div className="mb-6">
                                <div className="border-t border-white/30 pt-6">
                                  <Typography variant="h6" className="text-white font-bold text-sm uppercase mb-4">
                                    CONTACT
                                  </Typography>
                                  <div className="space-y-3">
                                    {formData.phone ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">📞</span>
                                        <Typography variant="small" className="text-white/90 text-sm">
                                          {formData.phone}
                                        </Typography>
                                      </div>
                                    ) : (
                                      <Typography variant="small" className="text-white/70 italic text-xs">
                                        No phone number
                                      </Typography>
                                    )}
                                    {formData.email ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">✉️</span>
                                        <Typography variant="small" className="text-white/90 text-sm break-all">
                                          {formData.email}
                                        </Typography>
                                      </div>
                                    ) : (
                                      <Typography variant="small" className="text-white/70 italic text-xs">
                                        No email address
                                      </Typography>
                                    )}
                                    {(formData.preferredWorkLocation || formData.website) && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">📍</span>
                                        <Typography variant="small" className="text-white/90 text-sm">
                                          {formData.preferredWorkLocation || formData.website}
                                        </Typography>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Education Section */}
                              {(formData.trainingCenter || formData.ncLevel) && (
                                <div className="mb-6">
                                  <div className="border-t border-white/30 pt-6">
                                    <Typography variant="h6" className="text-white font-bold text-sm uppercase mb-4">
                                      EDUCATION
                                    </Typography>
                                    <div className="space-y-2">
                                      {formData.trainingCenter && (
                                        <Typography variant="small" className="text-white/90 text-sm">
                                          {formData.trainingCenter}
                                        </Typography>
                                      )}
                                      {formData.ncLevel && (
                                        <Typography variant="small" className="text-white/90 text-sm">
                                          {formData.ncLevel}
                                        </Typography>
                                      )}
                                      {formData.scholarshipType && (
                                        <Typography variant="small" className="text-white/70 text-xs">
                                          {formData.scholarshipType}
                                        </Typography>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Skills Section */}
                              <div className="mb-6">
                                <div className="border-t border-white/30 pt-6">
                                  <Typography variant="h6" className="text-white font-bold text-sm uppercase mb-4">
                                    SKILLS
                                  </Typography>
                                  {skills.length > 0 ? (
                                    <ul className="space-y-2 list-disc list-inside">
                                      {skills.map((skill, index) => (
                                        <li key={index}>
                                          <Typography variant="small" className="text-white/90 text-sm">
                                            {skill.name}
                                          </Typography>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <Typography variant="small" className="text-white/70 italic text-xs">
                                      You haven't filled up details in this section.
                                    </Typography>
                                  )}
                                </div>
                              </div>

                              {/* TESDA Information */}
                              {(formData.trainingDuration || formData.tesdaRegistrationNumber) && (
                                <div>
                                  <div className="border-t border-white/30 pt-6">
                                    <Typography variant="h6" className="text-white font-bold text-sm uppercase mb-4">
                                      TESDA
                                    </Typography>
                                    <div className="space-y-2">
                                      {formData.trainingDuration && (
                                        <Typography variant="small" className="text-white/90 text-sm">
                                          Duration: {formData.trainingDuration}
                                        </Typography>
                                      )}
                                      {formData.tesdaRegistrationNumber && (
                                        <Typography variant="small" className="text-white/90 text-sm">
                                          Reg. #: {formData.tesdaRegistrationNumber}
                                        </Typography>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right Main Content - White Background */}
                            <div className="flex-1 bg-white p-8">
                              {/* Name and Title Header Bar */}
                              {formData.designTemplate === "bartending-barista" ? (
                                <div className="mb-6">
                                  <div className="flex justify-between items-center mb-4">
                                    <Typography variant="h1" className="text-gray-800 text-3xl font-bold">
                                      {formData.fullName || "Your Name"}
                                    </Typography>
                                  </div>
                                  {formData.professionalTitle && (
                                    <Typography variant="h6" className="text-gray-600 text-lg font-normal">
                                      {formData.professionalTitle}
                                    </Typography>
                                  )}
                                </div>
                              ) : (
                                <div className={`${designTheme.headerBarBg} text-white p-6 mb-6`}>
                                  <Typography variant="h1" className="text-white text-3xl font-bold mb-2">
                                    {formData.fullName || "Your Name"}
                                  </Typography>
                                  {formData.professionalTitle && (
                                    <Typography variant="h6" className="text-white/90 text-lg font-normal">
                                      {formData.professionalTitle}
                                    </Typography>
                                  )}
                                </div>
                              )}

                              {/* Professional Summary */}
                              {formData.professionalSummary && (
                                <div className="mb-8">
                                  {formData.designTemplate === "bartending-barista" ? (
                                    <>
                                      <Typography variant="h6" className="text-gray-800 font-bold text-sm uppercase mb-2">
                                        PROFESSIONAL SUMMARY
                                      </Typography>
                                      <div className="border-t border-gray-300 mb-4"></div>
                                      <Typography variant="small" className="text-gray-700 leading-relaxed">
                                        {formData.professionalSummary}
                                      </Typography>
                                    </>
                                  ) : (
                                    <>
                                      <Typography variant="h6" className={`${designTheme.headerBarBg} text-white font-bold text-sm uppercase mb-0 py-3 px-4`}>
                                        PROFESSIONAL SUMMARY
                                      </Typography>
                                      <div className="border-t-2 border-gray-300 pt-4 bg-white">
                                        <Typography variant="small" className="text-gray-700 leading-relaxed">
                                          {formData.professionalSummary}
                                        </Typography>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}

                              {/* Work Experience */}
                              <div className="mb-8">
                                {formData.designTemplate === "bartending-barista" ? (
                                  <>
                                    <Typography variant="h6" className="text-gray-800 font-bold text-sm uppercase mb-2">
                                      CAREER HISTORY
                                    </Typography>
                                    <div className="border-t border-gray-300 mb-4"></div>
                                  </>
                                ) : (
                                  <Typography variant="h6" className={`${designTheme.headerBarBg} text-white font-bold text-sm uppercase mb-0 py-3 px-4`}>
                                    WORK EXPERIENCE
                                  </Typography>
                                )}
                                <div className={formData.designTemplate === "bartending-barista" ? "bg-white" : "border-t-2 border-gray-300 pt-4 bg-white"}>
                                  {experiences.length > 0 ? (
                                    <div className="space-y-6">
                                      {experiences.map((exp, index) => (
                                        <div key={index} className="mb-4">
                                          <div className="flex justify-between items-start mb-2">
                                            <div>
                                              <Typography variant="h6" className="text-gray-800 font-semibold">
                                                {exp.jobTitle || "Position"}
                                              </Typography>
                                              <Typography variant="small" className="text-gray-600">
                                                {exp.company || "Company"}
                                              </Typography>
                                            </div>
                                            {exp.duration && (
                                              <Typography variant="small" className="text-gray-500 text-right">
                                                {exp.duration}
                                              </Typography>
                                            )}
                                          </div>
                                          {exp.responsibilities && (
                                            <ul className="list-disc list-inside mt-2">
                                              <li>
                                                <Typography variant="small" className="text-gray-700">
                                                  {exp.responsibilities}
                                                </Typography>
                                              </li>
                                            </ul>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <Typography variant="small" className="text-gray-500 italic">
                                      You haven't filled up details in this section.
                                    </Typography>
                                  )}
                                </div>
                              </div>

                              {/* Certificates */}
                              {certificates.length > 0 && (
                                <div className="mb-8">
                                  {formData.designTemplate === "bartending-barista" ? (
                                    <>
                                      <Typography variant="h6" className="text-gray-800 font-bold text-sm uppercase mb-2">
                                        CERTIFICATES
                                      </Typography>
                                      <div className="border-t border-gray-300 mb-4"></div>
                                    </>
                                  ) : (
                                    <Typography variant="h6" className={`${designTheme.headerBarBg} text-white font-bold text-sm uppercase mb-0 py-3 px-4`}>
                                      CERTIFICATES
                                    </Typography>
                                  )}
                                  <div className={formData.designTemplate === "bartending-barista" ? "bg-white" : "border-t-2 border-gray-300 pt-4 bg-white"}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {certificates.map((certificate, index) => (
                                        <div key={index} className="border border-gray-200 rounded p-4">
                                          <Typography variant="small" className="text-gray-800 font-medium">
                                            {certificate.courseName}
                                          </Typography>
                                          {certificate.certificateNumber && (
                                            <Typography variant="small" className="text-gray-600 text-xs">
                                              #{certificate.certificateNumber}
                                            </Typography>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Projects */}
                              {projects.length > 0 && (
                                <div className="mb-8">
                                  {formData.designTemplate === "bartending-barista" ? (
                                    <>
                                      <Typography variant="h6" className="text-gray-800 font-bold text-sm uppercase mb-2">
                                        PROJECTS
                                      </Typography>
                                      <div className="border-t border-gray-300 mb-4"></div>
                                    </>
                                  ) : (
                                    <Typography variant="h6" className={`${designTheme.headerBarBg} text-white font-bold text-sm uppercase mb-0 py-3 px-4`}>
                                      PROJECTS
                                    </Typography>
                                  )}
                                  <div className={formData.designTemplate === "bartending-barista" ? "bg-white" : "border-t-2 border-gray-300 pt-4 bg-white"}>
                                    <div className="space-y-4">
                                      {projects.map((project, index) => (
                                        <div key={index} className="border-l-4 border-gray-300 pl-4">
                                          <Typography variant="small" className="text-gray-800 font-semibold">
                                            {project.title}
                                          </Typography>
                                          {project.description && (
                                            <Typography variant="small" className="text-gray-600 text-xs mt-1">
                                              {project.description}
                                            </Typography>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Awards & Recognition */}
                              {awardsRecognitions.length > 0 && (
                                <div className="mb-8">
                                  {formData.designTemplate === "bartending-barista" ? (
                                    <>
                                      <Typography variant="h6" className="text-gray-800 font-bold text-sm uppercase mb-2">
                                        AWARDS & RECOGNITION
                                      </Typography>
                                      <div className="border-t border-gray-300 mb-4"></div>
                                    </>
                                  ) : (
                                    <Typography variant="h6" className={`${designTheme.headerBarBg} text-white font-bold text-sm uppercase mb-0 py-3 px-4`}>
                                      AWARDS & RECOGNITION
                                    </Typography>
                                  )}
                                  <div className={formData.designTemplate === "bartending-barista" ? "bg-white" : "border-t-2 border-gray-300 pt-4 bg-white"}>
                                    <div className="space-y-3">
                                      {awardsRecognitions.map((award, index) => (
                                        <div key={index}>
                                          <Typography variant="small" className="text-gray-800 font-medium">
                                            {award.title}
                                          </Typography>
                                          {award.issuer && (
                                            <Typography variant="small" className="text-gray-600 text-xs">
                                              {award.issuer}
                                            </Typography>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Continuing Education */}
                              {continuingEducations.length > 0 && (
                                <div className="mb-8">
                                  {formData.designTemplate === "bartending-barista" ? (
                                    <>
                                      <Typography variant="h6" className="text-gray-800 font-bold text-sm uppercase mb-2">
                                        CONTINUING EDUCATION
                                      </Typography>
                                      <div className="border-t border-gray-300 mb-4"></div>
                                    </>
                                  ) : (
                                    <Typography variant="h6" className={`${designTheme.headerBarBg} text-white font-bold text-sm uppercase mb-0 py-3 px-4`}>
                                      CONTINUING EDUCATION
                                    </Typography>
                                  )}
                                  <div className={formData.designTemplate === "bartending-barista" ? "bg-white" : "border-t-2 border-gray-300 pt-4 bg-white"}>
                                    <div className="space-y-3">
                                      {continuingEducations.map((edu, index) => (
                                        <div key={index}>
                                          <Typography variant="small" className="text-gray-800 font-medium">
                                            {edu.courseName}
                                          </Typography>
                                          {edu.institution && (
                                            <Typography variant="small" className="text-gray-600 text-xs">
                                              {edu.institution}
                                            </Typography>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Professional Memberships */}
                              {professionalMemberships.length > 0 && (
                                <div className="mb-8">
                                  {formData.designTemplate === "bartending-barista" ? (
                                    <>
                                      <Typography variant="h6" className="text-gray-800 font-bold text-sm uppercase mb-2">
                                        PROFESSIONAL MEMBERSHIPS
                                      </Typography>
                                      <div className="border-t border-gray-300 mb-4"></div>
                                    </>
                                  ) : (
                                    <Typography variant="h6" className={`${designTheme.headerBarBg} text-white font-bold text-sm uppercase mb-0 py-3 px-4`}>
                                      PROFESSIONAL MEMBERSHIPS
                                    </Typography>
                                  )}
                                  <div className={formData.designTemplate === "bartending-barista" ? "bg-white" : "border-t-2 border-gray-300 pt-4 bg-white"}>
                                    <div className="space-y-3">
                                      {professionalMemberships.map((mem, index) => (
                                        <div key={index}>
                                          <Typography variant="small" className="text-gray-800 font-medium">
                                            {mem.organization}
                                          </Typography>
                                          {mem.membershipType && (
                                            <Typography variant="small" className="text-gray-600 text-xs">
                                              {mem.membershipType}
                                            </Typography>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* References */}
                              {references.length > 0 && (
                                <div>
                                  {formData.designTemplate === "bartending-barista" ? (
                                    <>
                                      <Typography variant="h6" className="text-gray-800 font-bold text-sm uppercase mb-2">
                                        REFERENCES
                                      </Typography>
                                      <div className="border-t border-gray-300 mb-4"></div>
                                    </>
                                  ) : (
                                    <Typography variant="h6" className={`${designTheme.headerBarBg} text-white font-bold text-sm uppercase mb-0 py-3 px-4`}>
                                      REFERENCES
                                    </Typography>
                                  )}
                                  <div className={formData.designTemplate === "bartending-barista" ? "bg-white" : "border-t-2 border-gray-300 pt-4 bg-white"}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {references.map((ref, index) => (
                                        <div key={index} className="border border-gray-200 rounded p-3">
                                          <Typography variant="small" className="text-gray-800 font-medium">
                                            {ref.name}
                                          </Typography>
                                          {ref.position && (
                                            <Typography variant="small" className="text-gray-600 text-xs">
                                              {ref.position}
                                            </Typography>
                                          )}
                                          {ref.company && (
                                            <Typography variant="small" className="text-gray-600 text-xs">
                                              {ref.company}
                                            </Typography>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Typography variant="h6" className="text-gray-500 mb-2">
                    No Course Type Selected
                  </Typography>
                  <Typography variant="small" className="text-gray-400">
                    Please go back to "Additional Information" step and select a course type to see the preview.
                  </Typography>
                </div>
              )}
            </CardBody>
          </Card>
          )}

          {/* Navigation Buttons */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl">
            <CardBody className="p-6">
              <div className="flex justify-between items-center gap-4">
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
                        : currentStep === 12 ? "View portfolio preview" : "Continue to next step"
                    }
                  >
                    {currentStep === 12 ? "View Preview" : "Next"}
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
