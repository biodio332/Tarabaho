"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FaPlus, FaTrash, FaPen } from "react-icons/fa"
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
  const navigate = useNavigate()
  const avatarFileInputRef = useRef(null)
  const projectFileInputRef = useRef(null)
  const certificateFileInputRef = useRef(null)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"

  const validSkillTypes = ["TECHNICAL", "LANGUAGE", "DIGITAL", "SOFT", "INDUSTRY_SPECIFIC"]

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

  const handleSubmit = async (e) => {
    e.preventDefault()
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
        <div className="text-center mb-12 animate-fade-in-up">
          <Typography
            variant="h1"
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            Create Your Portfolio
          </Typography>
          <Typography variant="lead" className="text-gray-600 max-w-2xl mx-auto">
            Build a professional portfolio that showcases your skills, experience, and achievements
          </Typography>
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
          {/* File Uploads Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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

          {/* Basic Information Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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
                />
              </div>
            </CardBody>
          </Card>

          {/* TESDA Information Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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

          {/* Contact Information Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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

          {/* Projects Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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

          {/* Certificates Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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

          {/* Skills Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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

          {/* Experiences Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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

          {/* Awards & Recognitions Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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

          {/* Continuing Education Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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

          {/* Professional Memberships Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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

          {/* References Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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

          {/* Additional Form Fields */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Additional Information
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Primary Course Type *
                  </Typography>
                  <Input
                    size="lg"
                    value={formData.primaryCourseType}
                    onChange={handleInputChange}
                    name="primaryCourseType"
                    placeholder="e.g., Computer Science"
                    required
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Design Template
                  </Typography>
                  <Select
                    size="lg"
                    label="Select Template"
                    value={formData.designTemplate}
                    onChange={(val) => setFormData((prev) => ({ ...prev, designTemplate: val }))}
                    disabled={isLoading}
                    className="!border-gray-300 focus:!border-blue-500"
                  >
                    <Option value="default">Default</Option>
                    <Option value="modern">Modern</Option>
                    <Option value="classic">Classic</Option>
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

          {/* Submit Button */}
          <div className="text-center pt-8">
            <Button
              type="submit"
              size="lg"
              variant="gradient"
              color="blue"
              disabled={isLoading}
              className="px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Spinner className="h-5 w-5" />
                  Creating Portfolio...
                </div>
              ) : (
                "Create Portfolio"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PortfolioCreation
