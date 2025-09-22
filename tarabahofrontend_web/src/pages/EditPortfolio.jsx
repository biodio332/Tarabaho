"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { FaPen, FaTrash, FaPlus } from "react-icons/fa"
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

const EditPortfolio = () => {
  const { graduateId } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const [projects, setProjects] = useState([])
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null)
  const [previewAvatar, setPreviewAvatar] = useState("/placeholder.svg")
  const [certificates, setCertificates] = useState([])
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"
  const navigate = useNavigate()
  const avatarFileInputRef = useRef(null)
  const certificateFileInputRef = useRef(null)
  const projectFileInputRef = useRef(null)

  const initialPortfolioState = {
    fullName: "",
    professionalSummary: "",
    professionalTitle: "",
    designTemplate: "",
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
    skills: [],
    experiences: [],
    awardsRecognitions: [],
    continuingEducations: [],
    professionalMemberships: [],
    references: [],
    projectIds: [],
  }

  useEffect(() => {
    const fetchPortfolio = async () => {
      setIsLoading(true)
      try {
        console.log("Fetching portfolio for graduate ID:", graduateId)
        const portfolioResponse = await axios.get(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
          withCredentials: true,
        })
        console.log("Portfolio response:", portfolioResponse.data)
        const fetchedPortfolio = portfolioResponse.data
        setPortfolio({
          ...initialPortfolioState,
          ...fetchedPortfolio,
          professionalSummary: fetchedPortfolio.professionalSummary || "",
          email: fetchedPortfolio.email || "",
          phone: fetchedPortfolio.phone || "",
          website: fetchedPortfolio.website || "",
          avatar: fetchedPortfolio.avatar || "",
          skills:
            fetchedPortfolio.skills?.map((skill) => ({
              ...skill,
              name: skill.name || "",
              type: skill.type || "TECHNICAL",
              proficiencyLevel: skill.proficiencyLevel || "",
            })) || [],
          experiences:
            fetchedPortfolio.experiences?.map((exp) => ({
              ...exp,
              jobTitle: exp.jobTitle || "",
              employer: exp.employer || "",
              description: exp.description || "",
              startDate: exp.startDate || "",
              endDate: exp.endDate || "",
            })) || [],
          awardsRecognitions:
            fetchedPortfolio.awardsRecognitions?.map((award) => ({
              ...award,
              title: award.title || "",
              issuer: award.issuer || "",
              dateReceived: award.dateReceived || "",
            })) || [],
          continuingEducations:
            fetchedPortfolio.continuingEducations?.map((edu) => ({
              ...edu,
              courseName: edu.courseName || "",
              institution: edu.institution || "",
              completionDate: edu.completionDate || "",
            })) || [],
          professionalMemberships:
            fetchedPortfolio.professionalMemberships?.map((mem) => ({
              ...mem,
              organization: mem.organization || "",
              membershipType: mem.membershipType || "",
              startDate: mem.startDate || "",
            })) || [],
          references:
            fetchedPortfolio.references?.map((ref) => ({
              ...ref,
              name: ref.name || "",
              relationship: ref.relationship || "",
              email: ref.email || "",
              phone: ref.phone || "",
            })) || [],
          projectIds: fetchedPortfolio.projectIds || [],
        })
        setPreviewAvatar(fetchedPortfolio.avatar || "/placeholder.svg")

        console.log("Fetching certificates for graduate ID:", graduateId)
        const certificateResponse = await axios.get(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
          withCredentials: true,
        })
        console.log("Certificates response:", certificateResponse.data)
        setCertificates(
          certificateResponse.data.map((cert) => ({
            id: cert.id,
            courseName: cert.courseName || "",
            certificateNumber: cert.certificateNumber || "",
            issueDate: cert.issueDate || "",
            certificateFilePath: cert.certificateFilePath || null,
            preview: cert.certificateFilePath || "/placeholder.svg",
            portfolioId: cert.portfolioId || fetchedPortfolio.id,
          })),
        )

        if (fetchedPortfolio.id) {
          console.log("Fetching projects for portfolio ID:", fetchedPortfolio.id)
          const projectsResponse = await axios.get(`${BACKEND_URL}/api/project/portfolio/${fetchedPortfolio.id}`, {
            withCredentials: true,
          })
          console.log("Projects response:", projectsResponse.data)
          setProjects(
            projectsResponse.data.map((proj) => ({
              id: proj.id,
              title: proj.title || "",
              description: proj.description || "",
              startDate: proj.startDate || "",
              endDate: proj.endDate || "",
              projectImageFilePath: proj.projectImageFilePath || null,
              preview: proj.projectImageFilePath || "/placeholder.svg",
            })),
          )
        }
      } catch (err) {
        console.error("Failed to fetch portfolio or certificates:", err)
        let errorMessage =
          err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load portfolio"
        if (err.response?.status === 401) {
          errorMessage = "Session expired. Please sign in again."
          console.error("Unauthorized: Redirecting to /signin")
          navigate("/signin")
        } else if (err.response?.status === 404) {
          errorMessage = "Portfolio or certificates not found for this graduate."
        }
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortfolio()
  }, [graduateId, navigate])

  const handlePortfolioChange = (e) => {
    const { name, value } = e.target
    setPortfolio((prev) => ({ ...prev, [name]: value }))
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

  const handleCertificateFileChange = (e) => {
    const file = e.target.files[0]
    if (file && !file.type.startsWith("image/")) {
      setError("Please select an image file for the certificate.")
      return
    }
    setNewCertificate((prev) => ({ ...prev, certificateFile: file }))
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

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target
    setNewCertificate((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target
    setNewProject((prev) => ({ ...prev, [name]: value }))
    setError("")
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
      setError("Please fill in all required certificate fields, including the certificate file.")
      return
    }
    const newCert = {
      id: `new-${Date.now()}`,
      courseName: newCertificate.courseName,
      certificateNumber: newCertificate.certificateNumber,
      issueDate: newCertificate.issueDate,
      certificateFile: newCertificate.certificateFile,
      preview: newCertificate.certificateFile ? URL.createObjectURL(newCertificate.certificateFile) : "/placeholder.svg",
      portfolioId: portfolio.id,
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
    setError("")
  }

  const handleAddProject = () => {
    if (!isProjectFormValid()) {
      setError("Please fill in all required project fields, including the project image.")
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
      portfolioId: portfolio.id,
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
    setError("")
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
              certificateFile: newCertificate.certificateFile || cert.certificateFile,
              preview: newCertificate.certificateFile
                ? URL.createObjectURL(newCertificate.certificateFile)
                : cert.preview,
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
    setError("")
  }

  const handleUpdateProject = () => {
    if (!isProjectFormValid()) {
      setError("Please fill in all required project fields.")
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
              preview: newProject.projectImageFile ? URL.createObjectURL(newProject.projectImageFile) : proj.preview,
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
    setError("")
  }

  const handleRemoveCertificate = (id) => {
    setCertificates((prev) => prev.filter((cert) => cert.id !== id))
    setModifiedCertificates((prev) => new Set(prev).add(id))
  }

  const handleRemoveProject = (id) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id))
    setModifiedProjects((prev) => new Set(prev).add(id))
  }

  const handleArrayChange = (arrayName, index, field, value) => {
    setPortfolio((prev) => {
      const updatedArray = [...prev[arrayName]]
      updatedArray[index] = { ...updatedArray[index], [field]: value }
      return { ...prev, [arrayName]: updatedArray }
    })
  }

  const addArrayItem = (arrayName, newItem) => {
    setPortfolio((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...newItem, id: `new-${Date.now()}-${Math.random()}` }],
    }))
  }

  const removeArrayItem = (arrayName, index) => {
    setPortfolio((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }))
  }

  const handleImageClick = () => avatarFileInputRef.current.click()
  const handleCertificateImageClick = () => certificateFileInputRef.current.click()
  const handleProjectImageClick = () => projectFileInputRef.current.click()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    const requiredFieldsCheck = [
      ...portfolio.skills.map((skill) => skill.name && skill.proficiencyLevel),
      ...portfolio.experiences.map((exp) => exp.jobTitle && exp.employer && exp.description && exp.startDate && exp.endDate),
      ...portfolio.awardsRecognitions.map((award) => award.title && award.issuer && award.dateReceived),
      ...portfolio.continuingEducations.map((edu) => edu.courseName && edu.institution && edu.completionDate),
      ...portfolio.professionalMemberships.map((mem) => mem.organization && mem.membershipType && mem.startDate),
    ].every((field) => field)

    if (!requiredFieldsCheck) {
      setError(
        "Please fill out all required fields in Basic Information, Skills, TESDA Information, Experiences, Projects, Certificates, Awards & Recognitions, Continuing Education, and Professional Memberships.",
      )
      setIsSubmitting(false)
      return
    }

    try {
      console.log("Submitting portfolio update:", portfolio)
      let avatarUrl = portfolio.avatar || ""
      if (selectedAvatarFile) {
        const formDataAvatar = new FormData()
        formDataAvatar.append("file", selectedAvatarFile)
        console.log("Uploading avatar with FormData:")
        for (const [key, value] of formDataAvatar.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`)
        }
        const uploadResponse = await axios.post(
          `${BACKEND_URL}/api/graduate/${graduateId}/upload-picture`,
          formDataAvatar,
          { withCredentials: true },
        )
        avatarUrl = uploadResponse.data.profilePicture
        console.log("Avatar uploaded:", avatarUrl)
      }

      const certificateIds = []
      const existingCertificateIds = new Set(
        (
          await axios.get(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
            withCredentials: true,
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

        console.log("Certificate FormData entries for ID:", cert.id)
        for (const [key, value] of certificateData.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`)
        }

        if (typeof cert.id === "string" && cert.id.includes("new-")) {
          console.log("Creating new certificate for graduate ID:", graduateId)
          try {
            const certResponse = await axios.post(
              `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
              certificateData,
              { withCredentials: true },
            )
            console.log("Certificate created:", certResponse.data)
            certificateIds.push(certResponse.data.id)
          } catch (err) {
            console.error("Failed to create certificate:", err)
            if (err.response?.status === 401) {
              setError("Session expired. Please sign in again.")
              navigate("/signin")
              return
            } else if (err.response?.status === 415) {
              setError("Unsupported media type. Please check certificate data format.")
              return
            } else if (err.response?.status === 400) {
              setError(`Failed to create certificate: ${err.response?.data?.message || "Invalid data"}`)
              return
            }
            throw err
          }
        } else {
          console.log("Updating certificate with ID:", cert.id)
          try {
            const certResponse = await axios.put(`${BACKEND_URL}/api/certificate/${cert.id}`, certificateData, {
              withCredentials: true,
            })
            console.log("Certificate updated:", certResponse.data)
            certificateIds.push(cert.id)
          } catch (err) {
            console.error("Failed to update certificate ID:", cert.id, err)
            if (err.response?.status === 401) {
              setError("Session expired. Please sign in again.")
              navigate("/signin")
              return
            } else if (err.response?.status === 415) {
              setError("Unsupported media type. Please check certificate data format.")
              return
            } else if (err.response?.status === 400) {
              setError(`Failed to update certificate: ${err.response?.data?.message || "Invalid data"}`)
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
        })
      }

      const projectIds = []
      const existingProjectIds = new Set(
        (
          await axios.get(`${BACKEND_URL}/api/project/portfolio/${portfolio.id}`, {
            withCredentials: true,
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
        projectData.append("portfolioId", portfolio.id.toString())
        projectData.append("title", proj.title || "")
        projectData.append("description", proj.description || "")
        if (proj.startDate) projectData.append("startDate", proj.startDate)
        if (proj.endDate) projectData.append("endDate", proj.endDate)
        if (proj.projectImageFile instanceof File) {
          projectData.append("projectImageFile", proj.projectImageFile)
        }

        console.log("Project FormData entries for ID:", proj.id)
        for (const [key, value] of projectData.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`)
        }

        if (typeof proj.id === "string" && proj.id.includes("new-")) {
          console.log("Creating new project for portfolio ID:", portfolio.id)
          try {
            const projResponse = await axios.post(`${BACKEND_URL}/api/project`, projectData, { withCredentials: true })
            console.log("Project created:", projResponse.data)
            projectIds.push(projResponse.data.id)
          } catch (err) {
            console.error("Failed to create project:", err)
            if (err.response?.status === 401) {
              setError("Session expired. Please sign in again.")
              navigate("/signin")
              return
            } else if (err.response?.status === 415) {
              setError("Unsupported media type. Please check project data format.")
              return
            } else if (err.response?.status === 400) {
              setError(`Failed to create project: ${err.response?.data?.message || "Invalid data"}`)
              return
            }
            throw err
          }
        } else {
          console.log("Updating project with ID:", proj.id)
          try {
            const projResponse = await axios.put(`${BACKEND_URL}/api/project/${proj.id}`, projectData, {
              withCredentials: true,
            })
            console.log("Project updated:", projResponse.data)
            projectIds.push(proj.id)
          } catch (err) {
            console.error("Failed to update project ID:", proj.id, err)
            if (err.response?.status === 401) {
              setError("Session expired. Please sign in again.")
              navigate("/signin")
              return
            } else if (err.response?.status === 415) {
              setError("Unsupported media type. Please check project data format.")
              return
            } else if (err.response?.status === 400) {
              setError(`Failed to update project: ${err.response?.data?.message || "Invalid data"}`)
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
        })
      }

      setModifiedCertificates(new Set())
      setModifiedProjects(new Set())

      const payload = {
        graduateId,
        ...portfolio,
        avatar: avatarUrl || null,
        certificateIds,
        projectIds,
        skills: portfolio.skills.map((skill) => ({
          id: typeof skill.id === "string" && skill.id.includes("new-") ? null : skill.id,
          name: skill.name,
          type: skill.type,
          proficiencyLevel: skill.proficiencyLevel || null,
        })),
        experiences: portfolio.experiences.map((exp) => ({
          id: typeof exp.id === "string" && exp.id.includes("new-") ? null : exp.id,
          jobTitle: exp.jobTitle,
          employer: exp.employer,
          description: exp.description || null,
          startDate: exp.startDate ? exp.startDate : null,
          endDate: exp.endDate ? exp.endDate : null,
        })),
        awardsRecognitions: portfolio.awardsRecognitions.map((award) => ({
          id: typeof award.id === "string" && award.id.includes("new-") ? null : award.id,
          title: award.title,
          issuer: award.issuer || null,
          dateReceived: award.dateReceived ? award.dateReceived : null,
        })),
        continuingEducations: portfolio.continuingEducations.map((edu) => ({
          id: typeof edu.id === "string" && edu.id.includes("new-") ? null : edu.id,
          courseName: edu.courseName,
          institution: edu.institution || null,
          completionDate: edu.completionDate ? edu.completionDate : null,
        })),
        professionalMemberships: portfolio.professionalMemberships.map((mem) => ({
          id: typeof mem.id === "string" && mem.id.includes("new-") ? null : mem.id,
          organization: mem.organization,
          membershipType: mem.membershipType || null,
          startDate: mem.startDate ? mem.startDate : null,
        })),
        references: portfolio.references.map((ref) => ({
          id: typeof ref.id === "string" && ref.id.includes("new-") ? null : ref.id,
          name: ref.name,
          relationship: ref.relationship || null,
          email: ref.email || null,
          phone: ref.phone || null,
        })),
      }

      console.log("Updating portfolio with payload:", payload)
      await axios.put(`${BACKEND_URL}/api/portfolio/${portfolio.id}`, payload, { withCredentials: true })
      console.log("Portfolio updated successfully")
      setSuccess("Portfolio updated successfully!")
      navigate(`/portfolio/${graduateId}`)
    } catch (err) {
      console.error("Failed to update portfolio:", err)
      let errorMessage =
        err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update portfolio"
      if (err.response?.status === 401) {
        errorMessage = "Session expired. Please sign in again."
        navigate("/signin")
      } else if (err.response?.status === 404) {
        errorMessage = "Portfolio or certificates not found or update failed."
      } else if (err.response?.status === 400) {
        errorMessage = `Bad Request: ${err.response?.data?.message || "Invalid data provided."}`
      } else if (err.response?.status === 415) {
        errorMessage = "Unsupported media type. Please check data format."
      }
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <Typography variant="h6" className="text-gray-600">
            Loading Portfolio...
          </Typography>
        </div>
      </div>
    )
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-red-50 border border-red-200">
          <CardBody className="text-center">
            <Typography color="red" variant="h6">
              {error}
            </Typography>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardBody className="text-center">
            <Typography variant="h6" className="text-gray-600">
              No portfolio found or access denied.
            </Typography>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="absolute inset-0 opacity-30">
        <div className="floating-dots"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <Typography
            variant="h1"
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            Edit Your Portfolio
          </Typography>
          <Typography variant="lead" className="text-gray-600 max-w-2xl mx-auto">
            Update your professional portfolio to showcase your latest skills and achievements
          </Typography>
        </div>

        {success && (
          <Card className="mb-6 bg-green-50 border border-green-200">
            <CardBody>
              <Typography color="green" className="text-center">
                {success}
              </Typography>
            </CardBody>
          </Card>
        )}

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
                <Button variant="gradient" color="blue" onClick={handleImageClick} className="flex items-center gap-2">
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
                    name="fullName"
                    value={portfolio.fullName}
                    onChange={handlePortfolioChange}
                    placeholder="Enter your full name"
                    required
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Professional Title
                  </Typography>
                  <Input
                    size="lg"
                    name="professionalTitle"
                    value={portfolio.professionalTitle}
                    onChange={handlePortfolioChange}
                    placeholder="Enter your professional title"
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                  Professional Summary
                </Typography>
                <Textarea
                  size="lg"
                  name="professionalSummary"
                  value={portfolio.professionalSummary || ""}
                  onChange={handlePortfolioChange}
                  placeholder="Brief summary of your professional background"
                  className="!border-gray-300 focus:!border-blue-500"
                  rows={4}
                />
              </div>
            </CardBody>
          </Card>

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
                    size="lg"
                    type="email"
                    name="email"
                    value={portfolio.email || ""}
                    onChange={handlePortfolioChange}
                    placeholder="Enter your email"
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Phone
                  </Typography>
                  <Input
                    size="lg"
                    name="phone"
                    value={portfolio.phone || ""}
                    onChange={handlePortfolioChange}
                    placeholder="Enter your phone number"
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Website
                  </Typography>
                  <Input
                    size="lg"
                    name="website"
                    value={portfolio.website || ""}
                    onChange={handlePortfolioChange}
                    placeholder="Enter your website URL"
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Skills
                </Typography>
              </div>

              <div className="space-y-4">
                {portfolio.skills?.map((skill, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Skill Name *
                        </Typography>
                        <Input
                          size="lg"
                          value={skill.name}
                          onChange={(e) => handleArrayChange("skills", index, "name", e.target.value)}
                          placeholder="Enter skill name"
                          required
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                      <div>
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Type
                        </Typography>
                        <Select
                          size="lg"
                          value={skill.type}
                          onChange={(val) => handleArrayChange("skills", index, "type", val)}
                          className="!border-gray-300 focus:!border-blue-500"
                        >
                          <Option value="TECHNICAL">Technical</Option>
                          <Option value="LANGUAGE">Language</Option>
                          <Option value="DIGITAL">Digital</Option>
                          <Option value="SOFT">Soft</Option>
                          <Option value="INDUSTRY_SPECIFIC">Industry Specific</Option>
                        </Select>
                      </div>
                      <div>
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Proficiency Level *
                        </Typography>
                        <Input
                          size="lg"
                          value={skill.proficiencyLevel}
                          onChange={(e) => handleArrayChange("skills", index, "proficiencyLevel", e.target.value)}
                          placeholder="e.g., Beginner, Intermediate, Advanced"
                          required
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="text"
                        color="red"
                        onClick={() => removeArrayItem("skills", index)}
                        className="flex items-center gap-2"
                      >
                        <FaTrash className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outlined"
                  color="blue"
                  onClick={() => addArrayItem("skills", { name: "", type: "TECHNICAL", proficiencyLevel: "" })}
                  className="flex items-center gap-2 w-full"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Skill
                </Button>
              </div>
            </CardBody>
          </Card>

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
                    NC Level *
                  </Typography>
                  <Input
                    size="lg"
                    name="ncLevel"
                    value={portfolio.ncLevel}
                    onChange={handlePortfolioChange}
                    placeholder="e.g., NC II"
                    required
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Training Center/Institution *
                  </Typography>
                  <Input
                    size="lg"
                    name="trainingCenter"
                    value={portfolio.trainingCenter}
                    onChange={handlePortfolioChange}
                    placeholder="Enter training center name"
                    required
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Scholarship Type *
                  </Typography>
                  <Input
                    size="lg"
                    name="scholarshipType"
                    value={portfolio.scholarshipType}
                    onChange={handlePortfolioChange}
                    placeholder="Enter scholarship type"
                    required
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Training Duration *
                  </Typography>
                  <Input
                    size="lg"
                    name="trainingDuration"
                    value={portfolio.trainingDuration}
                    onChange={handlePortfolioChange}
                    placeholder="Enter training duration"
                    required
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    TESDA Registration Number *
                  </Typography>
                  <Input
                    size="lg"
                    name="tesdaRegistrationNumber"
                    value={portfolio.tesdaRegistrationNumber}
                    onChange={handlePortfolioChange}
                    placeholder="Enter TESDA registration number"
                    required
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Experiences
                </Typography>
              </div>

              <div className="space-y-4">
                {portfolio.experiences.map((exp, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Job Title *
                        </Typography>
                        <Input
                          size="lg"
                          value={exp.jobTitle}
                          onChange={(e) => handleArrayChange("experiences", index, "jobTitle", e.target.value)}
                          placeholder="Enter job title"
                          required
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                      <div>
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Employer *
                        </Typography>
                        <Input
                          size="lg"
                          value={exp.employer}
                          onChange={(e) => handleArrayChange("experiences", index, "employer", e.target.value)}
                          placeholder="Enter employer name"
                          required
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Description *
                      </Typography>
                      <Textarea
                        size="lg"
                        value={exp.description || ""}
                        onChange={(e) => handleArrayChange("experiences", index, "description", e.target.value)}
                        placeholder="Describe your responsibilities and achievements"
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
                          value={exp.startDate ? exp.startDate : ""}
                          onChange={(e) => handleArrayChange("experiences", index, "startDate", e.target.value)}
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
                          value={exp.endDate ? exp.endDate : ""}
                          onChange={(e) => handleArrayChange("experiences", index, "endDate", e.target.value)}
                          required
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="text"
                        color="red"
                        onClick={() => removeArrayItem("experiences", index)}
                        className="flex items-center gap-2"
                      >
                        <FaTrash className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outlined"
                  color="blue"
                  onClick={() =>
                    addArrayItem("experiences", {
                      jobTitle: "",
                      employer: "",
                      description: "",
                      startDate: "",
                      endDate: "",
                    })
                  }
                  className="flex items-center gap-2 w-full"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Experience
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Projects
                </Typography>
              </div>

              <div className="space-y-4">
                {isAddingProject && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                            src={projects.find((proj) => proj.id === editingProjectId)?.preview || "/placeholder.svg"}
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

                {!isAddingProject && (
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

                {projects.length > 0 && (
                  <div className="space-y-4">
                    {projects.map((proj) => (
                      <Card key={proj.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {proj.preview && (
                              <Avatar
                                src={proj.preview}
                                alt="Project Preview"
                                size="lg"
                                className="ring-2 ring-blue-200"
                              />
                            )}
                            <div>
                              <Typography variant="h6" className="text-gray-800 font-semibold">
                                {proj.title}
                              </Typography>
                              {proj.description && (
                                <Typography variant="small" className="text-gray-600 line-clamp-2">
                                  {proj.description}
                                </Typography>
                              )}
                              {(proj.startDate || proj.endDate) && (
                                <Typography variant="small" className="text-gray-600">
                                  {proj.startDate ? new Date(proj.startDate).toLocaleDateString() : "N/A"} -{" "}
                                  {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : "Present"}
                                </Typography>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="text"
                              color="blue"
                              onClick={() => handleEditProject(proj)}
                              className="flex items-center gap-1"
                            >
                              <FaPen className="w-4 h-4" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="text"
                              color="red"
                              onClick={() => handleRemoveProject(proj.id)}
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
              </div>
            </CardBody>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Certificates
                </Typography>
              </div>

              <div className="space-y-4">
                {isAddingCertificate && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                            src={certificates.find((cert) => cert.id === editingCertificateId)?.preview || "/placeholder.svg"}
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
                          color="blue"
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
                        color="blue"
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

                {!isAddingCertificate && (
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

                {certificates.length > 0 && (
                  <div className="space-y-4">
                    {certificates.map((cert) => (
                      <Card key={cert.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {cert.preview && (
                              <Avatar
                                src={cert.preview}
                                alt="Certificate Preview"
                                size="lg"
                                className="ring-2 ring-blue-200"
                              />
                            )}
                            <div>
                              <Typography variant="h6" className="text-gray-800 font-semibold">
                                {cert.courseName}
                              </Typography>
                              <Typography variant="small" className="text-gray-600">
                                Certificate #: {cert.certificateNumber}
                              </Typography>
                              <Typography variant="small" className="text-gray-600">
                                Issued: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "N/A"}
                              </Typography>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="text"
                              color="blue"
                              onClick={() => handleEditCertificate(cert)}
                              className="flex items-center gap-1"
                            >
                              <FaPen className="w-4 h-4" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="text"
                              color="red"
                              onClick={() => handleRemoveCertificate(cert.id)}
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
              </div>
            </CardBody>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Awards & Recognitions
                </Typography>
              </div>

              <div className="space-y-4">
                {portfolio.awardsRecognitions.map((award, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Award Title *
                        </Typography>
                        <Input
                          size="lg"
                          value={award.title}
                          onChange={(e) => handleArrayChange("awardsRecognitions", index, "title", e.target.value)}
                          placeholder="Enter award title"
                          required
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                      <div>
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Issuer *
                        </Typography>
                        <Input
                          size="lg"
                          value={award.issuer}
                          onChange={(e) => handleArrayChange("awardsRecognitions", index, "issuer", e.target.value)}
                          placeholder="Enter the awarding body"
                          required
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                        Date Received *
                      </Typography>
                      <Input
                        type="date"
                        size="lg"
                        value={award.dateReceived ? award.dateReceived : ""}
                        onChange={(e) => handleArrayChange("awardsRecognitions", index, "dateReceived", e.target.value)}
                        required
                        className="!border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="text"
                        color="red"
                        onClick={() => removeArrayItem("awardsRecognitions", index)}
                        className="flex items-center gap-2"
                      >
                        <FaTrash className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outlined"
                  color="blue"
                  onClick={() => addArrayItem("awardsRecognitions", { title: "", issuer: "", dateReceived: "" })}
                  className="flex items-center gap-2 w-full"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Award
                </Button>
              </div>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardBody className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <Typography variant="h4" className="text-gray-800 font-semibold">
                    Continuing Education
                  </Typography>
                </div>

                <div className="space-y-4">
                  {portfolio.continuingEducations.map((edu, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                            Course Name *
                          </Typography>
                          <Input
                            size="lg"
                            value={edu.courseName}
                            onChange={(e) =>
                              handleArrayChange("continuingEducations", index, "courseName", e.target.value)
                            }
                            placeholder="Enter course name"
                            required
                            className="!border-gray-300 focus:!border-blue-500"
                          />
                        </div>
                        <div>
                          <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                            Institution *
                          </Typography>
                          <Input
                            size="lg"
                            value={edu.institution}
                            onChange={(e) =>
                              handleArrayChange("continuingEducations", index, "institution", e.target.value)
                            }
                            placeholder="Enter institution name"
                            required
                            className="!border-gray-300 focus:!border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Completion Date *
                        </Typography>
                        <Input
                          type="date"
                          size="lg"
                          value={edu.completionDate ? edu.completionDate : ""}
                          onChange={(e) =>
                            handleArrayChange("continuingEducations", index, "completionDate", e.target.value)
                          }
                          required
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="text"
                          color="red"
                          onClick={() => removeArrayItem("continuingEducations", index)}
                          className="flex items-center gap-2"
                        >
                          <FaTrash className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outlined"
                    color="blue"
                    onClick={() =>
                      addArrayItem("continuingEducations", {
                        courseName: "",
                        institution: "",
                        completionDate: "",
                      })
                    }
                    className="flex items-center gap-2 w-full"
                  >
                    <FaPlus className="w-4 h-4" />
                    Add Education
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardBody className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <Typography variant="h4" className="text-gray-800 font-semibold">
                    Professional Memberships
                  </Typography>
                </div>

                <div className="space-y-4">
                  {portfolio.professionalMemberships.map((mem, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                            Organization *
                          </Typography>
                          <Input
                            size="lg"
                            value={mem.organization}
                            onChange={(e) =>
                              handleArrayChange("professionalMemberships", index, "organization", e.target.value)
                            }
                            placeholder="Enter organization name"
                            required
                            className="!border-gray-300 focus:!border-blue-500"
                          />
                        </div>
                        <div>
                          <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                            Membership Type *
                          </Typography>
                          <Input
                            size="lg"
                            value={mem.membershipType}
                            onChange={(e) =>
                              handleArrayChange("professionalMemberships", index, "membershipType", e.target.value)
                            }
                            placeholder="e.g., Member, Fellow"
                            required
                            className="!border-gray-300 focus:!border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Start Date *
                        </Typography>
                        <Input
                          type="date"
                          size="lg"
                          value={mem.startDate ? mem.startDate : ""}
                          onChange={(e) =>
                            handleArrayChange("professionalMemberships", index, "startDate", e.target.value)
                          }
                          required
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="text"
                          color="red"
                          onClick={() => removeArrayItem("professionalMemberships", index)}
                          className="flex items-center gap-2"
                        >
                          <FaTrash className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outlined"
                    color="blue"
                    onClick={() =>
                      addArrayItem("professionalMemberships", {
                        organization: "",
                        membershipType: "",
                        startDate: "",
                      })
                    }
                    className="flex items-center gap-2 w-full"
                  >
                    <FaPlus className="w-4 h-4" />
                    Add Membership
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  References
                </Typography>
              </div>

              <div className="space-y-4">
                {portfolio.references.map((ref, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Name *
                        </Typography>
                        <Input
                          size="lg"
                          value={ref.name}
                          onChange={(e) => handleArrayChange("references", index, "name", e.target.value)}
                          placeholder="Enter reference name"
                          required
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                      <div>
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Relationship
                        </Typography>
                        <Input
                          size="lg"
                          value={ref.relationship || ""}
                          onChange={(e) => handleArrayChange("references", index, "relationship", e.target.value)}
                          placeholder="e.g., Manager, Colleague"
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                      <div>
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Email
                        </Typography>
                        <Input
                          type="email"
                          size="lg"
                          value={ref.email || ""}
                          onChange={(e) => handleArrayChange("references", index, "email", e.target.value)}
                          placeholder="Enter email address"
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                      <div>
                        <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                          Phone
                        </Typography>
                        <Input
                                                    size="lg"
                          value={ref.phone || ""}
                          onChange={(e) => handleArrayChange("references", index, "phone", e.target.value)}
                          placeholder="Enter phone number"
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="text"
                        color="red"
                        onClick={() => removeArrayItem("references", index)}
                        className="flex items-center gap-2"
                      >
                        <FaTrash className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outlined"
                  color="blue"
                  onClick={() => addArrayItem("references", { name: "", relationship: "", email: "", phone: "" })}
                  className="flex items-center gap-2 w-full"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Reference
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Portfolio Settings Section */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <Typography variant="h4" className="text-gray-800 font-semibold">
                  Portfolio Settings
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Visibility *
                  </Typography>
                  <Select
                    size="lg"
                    name="visibility"
                    value={portfolio.visibility}
                    onChange={(val) => handlePortfolioChange({ target: { name: "visibility", value: val } })}
                    className="!border-gray-300 focus:!border-blue-500"
                  >
                    <Option value="PUBLIC">Public</Option>
                    <Option value="PRIVATE">Private</Option>
                  </Select>
                </div>
                <div>
                  <Typography variant="small" className="mb-2 text-gray-700 font-medium">
                    Design Template
                  </Typography>
                  <Input
                    size="lg"
                    name="designTemplate"
                    value={portfolio.designTemplate || ""}
                    onChange={handlePortfolioChange}
                    placeholder="Enter design template name"
                    className="!border-gray-300 focus:!border-blue-500"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              size="lg"
              variant="outlined"
              color="gray"
              className="px-12 py-4 text-lg font-semibold"
              onClick={() => navigate(`/portfolio/${graduateId}`)}
            >
              Back to View
            </Button>
            <Button
              type="submit"
              variant="gradient"
              color="blue"
              size="lg"
              className="px-8 py-3 text-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPortfolio