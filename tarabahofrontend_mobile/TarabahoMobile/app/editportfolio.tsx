"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useLocalSearchParams, useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"
import TextField from "../components/ui/TextField"
import Button from "../components/ui/Button"
import { DatePicker } from "../components/ui/DatePicker"

// Environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8080"

// Utility function to handle date conversion
const parseDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date();
  try {
    return new Date(dateString);
  } catch (e) {
    return new Date();
  }
}

// Type definitions
interface Certificate {
  id: string | number
  courseName: string
  certificateNumber: string
  issueDate: string
  certificateFilePath?: string
  certificateFile?: any
  preview?: string
  portfolioId?: number
}

interface Project {
  id: string | number
  title: string
  description: string
  startDate: string
  endDate: string
  projectImageFilePath?: string
  projectImageFile?: any
  preview?: string
  portfolioId?: number
}

interface Skill {
  id?: string | number
  name: string
  type: string
  proficiencyLevel: string
}

interface Experience {
  id?: string | number
  jobTitle: string
  employer: string
  description: string
  startDate: string
  endDate: string
}

interface Award {
  id?: string | number
  title: string
  issuer: string
  dateReceived: string
}

interface Education {
  id?: string | number
  courseName: string
  institution: string
  completionDate: string
}

interface Membership {
  id?: string | number
  organization: string
  membershipType: string
  startDate: string
}

interface Reference {
  id?: string | number
  name: string
  relationship: string
  email: string
  phone: string
}

interface Portfolio {
  id?: number
  fullName: string
  professionalTitle: string
  professionalSummary: string
  designTemplate: string
  visibility: string
  avatar: string
  ncLevel: string
  trainingCenter: string
  scholarshipType: string
  trainingDuration: string
  tesdaRegistrationNumber: string
  email: string
  phone: string
  website: string
  skills: Skill[]
  experiences: Experience[]
  awardsRecognitions: Award[]
  continuingEducations: Education[]
  professionalMemberships: Membership[]
  references: Reference[]
  projectIds: number[]
}

// Edit Portfolio Component
export default function EditPortfolioScreen() {
  const router = useRouter()
  const { graduateId, portfolioId } = useLocalSearchParams<{ graduateId: string, portfolioId: string }>()
  
  // States
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<any>(null)
  const [previewAvatar, setPreviewAvatar] = useState("")
  
  // State for tracking modified items
  const [modifiedCertificates, setModifiedCertificates] = useState(new Set())
  const [modifiedProjects, setModifiedProjects] = useState(new Set())
  
  // States for adding/editing certificates and projects
  const [isAddingCertificate, setIsAddingCertificate] = useState(false)
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingCertificateId, setEditingCertificateId] = useState<string | number | null>(null)
  const [editingProjectId, setEditingProjectId] = useState<string | number | null>(null)
  
  // New certificate and project states
  const [newCertificate, setNewCertificate] = useState<{
    courseName: string
    certificateNumber: string
    issueDate: string
    certificateFile: any
  }>({
    courseName: "",
    certificateNumber: "",
    issueDate: "",
    certificateFile: null,
  })
  
  const [newProject, setNewProject] = useState<{
    title: string
    description: string
    startDate: string
    endDate: string
    projectImageFile: any
  }>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    projectImageFile: null,
  })
  
  // Initial portfolio state
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
  
  // Fetch portfolio data on component mount
  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true)
      setError("")
      
      try {
        // Get authentication token
        let token = await AsyncStorage.getItem("authToken")
        
        if (!token) {
          const tokenRes = await fetch(`${BACKEND_URL}/api/graduate/get-token`, {
            credentials: "include",
          })
          const tokenJson = await tokenRes.json()
          token = tokenJson?.token
          
          if (token) {
            await AsyncStorage.setItem("authToken", token)
          }
        }
        
        if (!token) {
          throw new Error("Authentication token is missing. Please sign in again.")
        }
        
        setAuthToken(token)
        
        // Fetch portfolio data
        console.log("Fetching portfolio for graduate ID:", graduateId)
        const portfolioResponse = await fetch(
          `${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        )
        
        if (!portfolioResponse.ok) {
          const data = await portfolioResponse.json().catch(() => ({}))
          throw new Error(data.message || data.error || "Failed to load portfolio")
        }
        
        const fetchedPortfolio = await portfolioResponse.json()
        
        // Set portfolio state with fetched data
        setPortfolio({
          ...initialPortfolioState,
          ...fetchedPortfolio,
          professionalSummary: fetchedPortfolio.professionalSummary || "",
          email: fetchedPortfolio.email || "",
          phone: fetchedPortfolio.phone || "",
          website: fetchedPortfolio.website || "",
          avatar: fetchedPortfolio.avatar || "",
          skills:
            fetchedPortfolio.skills?.map((skill: any) => ({
              ...skill,
              name: skill.name || "",
              type: skill.type || "TECHNICAL",
              proficiencyLevel: skill.proficiencyLevel || "",
            })) || [],
          experiences:
            fetchedPortfolio.experiences?.map((exp: any) => ({
              ...exp,
              jobTitle: exp.jobTitle || "",
              employer: exp.employer || "",
              description: exp.description || "",
              startDate: exp.startDate || "",
              endDate: exp.endDate || "",
            })) || [],
          awardsRecognitions:
            fetchedPortfolio.awardsRecognitions?.map((award: any) => ({
              ...award,
              title: award.title || "",
              issuer: award.issuer || "",
              dateReceived: award.dateReceived || "",
            })) || [],
          continuingEducations:
            fetchedPortfolio.continuingEducations?.map((edu: any) => ({
              ...edu,
              courseName: edu.courseName || "",
              institution: edu.institution || "",
              completionDate: edu.completionDate || "",
            })) || [],
          professionalMemberships:
            fetchedPortfolio.professionalMemberships?.map((mem: any) => ({
              ...mem,
              organization: mem.organization || "",
              membershipType: mem.membershipType || "",
              startDate: mem.startDate || "",
            })) || [],
          references:
            fetchedPortfolio.references?.map((ref: any) => ({
              ...ref,
              name: ref.name || "",
              relationship: ref.relationship || "",
              email: ref.email || "",
              phone: ref.phone || "",
            })) || [],
          projectIds: fetchedPortfolio.projectIds || [],
        })
        
        setPreviewAvatar(fetchedPortfolio.avatar || "")
        
        // Fetch certificates
        console.log("Fetching certificates for graduate ID:", graduateId)
        const certificateResponse = await fetch(
          `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        )
        
        if (certificateResponse.ok) {
          const certData = await certificateResponse.json()
          setCertificates(
            certData.map((cert: any) => ({
              id: cert.id,
              courseName: cert.courseName || "",
              certificateNumber: cert.certificateNumber || "",
              issueDate: cert.issueDate || "",
              certificateFilePath: cert.certificateFilePath || null,
              preview: cert.certificateFilePath || "",
              portfolioId: cert.portfolioId || fetchedPortfolio.id,
            }))
          )
        }
        
        // Fetch projects
        if (fetchedPortfolio.id) {
          console.log("Fetching projects for portfolio ID:", fetchedPortfolio.id)
          const projectsResponse = await fetch(
            `${BACKEND_URL}/api/project/portfolio/${fetchedPortfolio.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            }
          )
          
          if (projectsResponse.ok) {
            const projData = await projectsResponse.json()
            setProjects(
              projData.map((proj: any) => ({
                id: proj.id,
                title: proj.title || "",
                description: proj.description || "",
                startDate: proj.startDate || "",
                endDate: proj.endDate || "",
                projectImageFilePath: proj.projectImageFilePath || null,
                preview: proj.projectImageFilePath || "",
              }))
            )
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch portfolio or certificates:", err)
        let errorMessage = err.message || "Failed to load portfolio"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPortfolio()
  }, [graduateId])

  // Handle Portfolio Changes
  const handlePortfolioChange = (name: string, value: string) => {
    setPortfolio((prev) => prev ? { ...prev, [name]: value } : null)
    setError("")
  }
  
  // Handle Array Changes (Skills, Experiences, etc.)
  const handleArrayChange = (arrayName: string, index: number, field: string, value: string) => {
    setPortfolio((prev) => {
      if (!prev) return null
      const updatedArray = [...prev[arrayName as keyof Portfolio] as any[]]
      updatedArray[index] = { ...updatedArray[index], [field]: value }
      return { ...prev, [arrayName]: updatedArray }
    })
  }
  
  // Add new item to arrays (Skills, Experiences, etc.)
  const addArrayItem = (arrayName: string, newItem: any) => {
    setPortfolio((prev) => {
      if (!prev) return null
      const currentArray = prev[arrayName as keyof Portfolio] as any[] || []
      return {
        ...prev,
        [arrayName]: [
          ...currentArray,
          { ...newItem, id: `new-${Date.now()}-${Math.random()}` }
        ],
      }
    })
  }
  
  // Remove item from arrays (Skills, Experiences, etc.)
  const removeArrayItem = (arrayName: string, index: number) => {
    setPortfolio((prev) => {
      if (!prev) return null
      const updatedArray = (prev[arrayName as keyof Portfolio] as any[]).filter((_, i) => i !== index)
      return { ...prev, [arrayName]: updatedArray }
    })
  }
  
  // Image Picker Functions
  const pickImage = async (type: 'avatar' | 'certificate' | 'project') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0]
        
        if (type === 'avatar') {
          setSelectedAvatarFile(selectedImage)
          setPreviewAvatar(selectedImage.uri)
        } else if (type === 'certificate') {
          setNewCertificate((prev) => ({ ...prev, certificateFile: selectedImage }))
        } else if (type === 'project') {
          setNewProject((prev) => ({ ...prev, projectImageFile: selectedImage }))
        }
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to pick image')
    }
  }
  
  // Certificate Functions
  const handleCertificateInputChange = (name: string, value: string) => {
    setNewCertificate((prev) => ({ ...prev, [name]: value }))
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
      preview: newCertificate.certificateFile ? newCertificate.certificateFile.uri : "",
      portfolioId: portfolio?.id,
    }
    
    setCertificates((prev) => [...prev, newCert])
    setModifiedCertificates((prev) => new Set([...prev, newCert.id]))
    
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
  
  const handleEditCertificate = (certificate: Certificate) => {
    setEditingCertificateId(certificate.id)
    setNewCertificate({
      courseName: certificate.courseName || "",
      certificateNumber: certificate.certificateNumber || "",
      issueDate: certificate.issueDate || "",
      certificateFile: null,
    })
    setIsAddingCertificate(true)
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
                ? newCertificate.certificateFile.uri
                : cert.preview,
            }
          : cert,
      ),
    )
    
    setModifiedCertificates((prev) => new Set([...prev, editingCertificateId as string | number]))
    
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
  
  const handleRemoveCertificate = (id: string | number) => {
    setCertificates((prev) => prev.filter((cert) => cert.id !== id))
    setModifiedCertificates((prev) => new Set([...prev, id]))
  }
  
  // Project Functions
  const handleProjectInputChange = (name: string, value: string) => {
    setNewProject((prev) => ({ ...prev, [name]: value }))
    setError("")
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
      preview: newProject.projectImageFile ? newProject.projectImageFile.uri : "",
      portfolioId: portfolio?.id,
    }
    
    setProjects((prev) => [...prev, newProj])
    setModifiedProjects((prev) => new Set([...prev, newProj.id]))
    
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
  
  const handleEditProject = (project: Project) => {
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
              preview: newProject.projectImageFile ? newProject.projectImageFile.uri : proj.preview,
            }
          : proj,
      ),
    )
    
    setModifiedProjects((prev) => new Set([...prev, editingProjectId as string | number]))
    
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
  
  const handleRemoveProject = (id: string | number) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id))
    setModifiedProjects((prev) => new Set([...prev, id]))
  }
  
  // Submit Form Function
  const handleSubmit = async () => {
    setError("")
    setSuccess("")
    setSubmitting(true)
    
    if (!portfolio || !authToken) {
      setError("Missing portfolio data or authentication.")
      setSubmitting(false)
      return
    }
    
    try {
      // Upload avatar if selected
      let avatarUrl = portfolio.avatar || ""
      if (selectedAvatarFile) {
        const formDataAvatar = new FormData()
        formDataAvatar.append("file", {
          uri: selectedAvatarFile.uri,
          type: selectedAvatarFile.type || 'image/jpeg',
          name: 'profile_photo.jpg'
        } as any)
        
        const uploadResponse = await fetch(
          `${BACKEND_URL}/api/graduate/${graduateId}/upload-picture`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${authToken}`
            },
            body: formDataAvatar
          }
        )
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload avatar image")
        }
        
        const uploadResult = await uploadResponse.json()
        avatarUrl = uploadResult.profilePicture
      }
      
      // Process certificates
      const certificateIds = []
      const existingCertificateIds = new Set(
        (await fetch(
          `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
            credentials: "include",
          }
        ).then(res => res.json())).map((cert: any) => cert.id)
      )
      
      for (const cert of certificates) {
        if (!modifiedCertificates.has(cert.id)) {
          if (typeof cert.id === "string" && cert.id.includes("new-")) {
            // Skip as it's a new cert that hasn't been modified
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
        
        if (cert.certificateFile) {
          certificateData.append("certificateFile", {
            uri: cert.certificateFile.uri,
            type: cert.certificateFile.type || 'image/jpeg',
            name: 'certificate.jpg'
          } as any)
        }
        
        // Create or update certificate
        if (typeof cert.id === "string" && cert.id.includes("new-")) {
          const certResponse = await fetch(
            `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${authToken}`
              },
              body: certificateData
            }
          )
          
          if (!certResponse.ok) {
            throw new Error("Failed to create certificate")
          }
          
          const certResult = await certResponse.json()
          certificateIds.push(certResult.id)
        } else {
          const certResponse = await fetch(
            `${BACKEND_URL}/api/certificate/${cert.id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${authToken}`
              },
              body: certificateData
            }
          )
          
          if (!certResponse.ok) {
            throw new Error(`Failed to update certificate ${cert.id}`)
          }
          
          certificateIds.push(cert.id)
        }
      }
      
      // Delete certificates that were removed
      const certificatesToDelete = Array.from(existingCertificateIds).filter(
        (id) => !certificates.some((cert) => cert.id === id) && modifiedCertificates.has(id)
      )
      
      for (const certId of certificatesToDelete) {
        await fetch(
          `${BACKEND_URL}/api/certificate/${certId}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` },
            credentials: "include",
          }
        )
      }
      
      // Process projects
      const projectIds = []
      const existingProjectIds = new Set(
        (await fetch(
          `${BACKEND_URL}/api/project/portfolio/${portfolio.id}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
            credentials: "include",
          }
        ).then(res => res.json())).map((proj: any) => proj.id)
      )
      
      for (const proj of projects) {
        if (!modifiedProjects.has(proj.id)) {
          if (typeof proj.id === "string" && proj.id.includes("new-")) {
            // Skip as it's a new project that hasn't been modified
          } else if (existingProjectIds.has(proj.id)) {
            projectIds.push(proj.id)
            continue
          }
        }
        
        const projectData = new FormData()
        projectData.append("portfolioId", portfolio.id!.toString())
        projectData.append("title", proj.title || "")
        projectData.append("description", proj.description || "")
        
        if (proj.startDate) projectData.append("startDate", proj.startDate)
        if (proj.endDate) projectData.append("endDate", proj.endDate)
        
        if (proj.projectImageFile) {
          projectData.append("projectImageFile", {
            uri: proj.projectImageFile.uri,
            type: proj.projectImageFile.type || 'image/jpeg',
            name: 'project.jpg'
          } as any)
        }
        
        // Create or update project
        if (typeof proj.id === "string" && proj.id.includes("new-")) {
          const projResponse = await fetch(
            `${BACKEND_URL}/api/project`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${authToken}`
              },
              body: projectData
            }
          )
          
          if (!projResponse.ok) {
            throw new Error("Failed to create project")
          }
          
          const projResult = await projResponse.json()
          projectIds.push(projResult.id)
        } else {
          const projResponse = await fetch(
            `${BACKEND_URL}/api/project/${proj.id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${authToken}`
              },
              body: projectData
            }
          )
          
          if (!projResponse.ok) {
            throw new Error(`Failed to update project ${proj.id}`)
          }
          
          projectIds.push(proj.id)
        }
      }
      
      // Delete projects that were removed
      const projectsToDelete = Array.from(existingProjectIds).filter(
        (id) => !projects.some((proj) => proj.id === id) && modifiedProjects.has(id)
      )
      
      for (const projId of projectsToDelete) {
        await fetch(
          `${BACKEND_URL}/api/project/${projId}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` },
            credentials: "include",
          }
        )
      }
      
      // Reset tracking sets
      setModifiedCertificates(new Set())
      setModifiedProjects(new Set())
      
      // Update portfolio
      const payload = {
        graduateId: parseInt(graduateId),
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
      
      const portfolioResponse = await fetch(
        `${BACKEND_URL}/api/portfolio/${portfolio.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(payload)
        }
      )
      
      if (!portfolioResponse.ok) {
        throw new Error("Failed to update portfolio")
      }
      
      setSuccess("Portfolio updated successfully!")
      
      // Navigate back to portfolio view
      setTimeout(() => {
        router.push("/portfolio")
      }, 1500)
      
    } catch (err: any) {
      console.error("Error updating portfolio:", err)
      setError(err.message || "Failed to update portfolio")
    } finally {
      setSubmitting(false)
    }
  }

  // Get insets for notch and other safe area values
  const insets = useSafeAreaInsets()
  
  // Rendering Helpers
  const renderHeader = () => (
    <View className="absolute top-0 left-0 right-0 z-10">
      <View style={{ paddingTop: insets.top }} className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="rounded-full p-2 bg-gray-100"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">Edit Portfolio</Text>
          <View className="w-10"></View>
        </View>
      </View>
    </View>
  )

  const renderLoadingState = () => (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
      <Text className="text-gray-600 font-medium text-base">Loading portfolio data...</Text>
    </SafeAreaView>
  )

  const renderErrorState = () => (
    <SafeAreaView className="flex-1 justify-center items-center p-6 bg-white">
      <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
        <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
      </View>
      <Text className="text-red-500 text-center font-medium mb-6">{error}</Text>
      <Button 
        title="Return to Portfolio" 
        onPress={() => router.replace("/portfolio")} 
        variant="primary" 
        style={{ minWidth: 200 }}
      />
    </SafeAreaView>
  )

  const renderProfileSection = () => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
          <Ionicons name="image-outline" size={18} color="#2563EB" />
        </View>
        <Text className="text-lg font-bold text-gray-800">Profile Photo</Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => pickImage('avatar')} 
        className="items-center justify-center bg-gray-50 p-6 rounded-lg"
      >
        {previewAvatar ? (
          <View className="rounded-full border-4 border-white shadow-md mb-3">
            <Image 
              source={{ uri: previewAvatar }} 
              className="w-28 h-28 rounded-full"
            />
          </View>
        ) : (
          <View className="w-28 h-28 rounded-full bg-gray-200 items-center justify-center mb-3 border-4 border-white shadow-md">
            <Ionicons name="person-outline" size={40} color="#9CA3AF" />
          </View>
        )}
        <View className="flex-row items-center bg-blue-100 px-4 py-2 rounded-full">
          <Ionicons name="camera" size={16} color="#2563EB" />
          <Text className="text-blue-600 font-medium ml-2">Change Photo</Text>
        </View>
      </TouchableOpacity>
    </View>
  )

  const renderBasicInfoSection = () => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
          <Ionicons name="person-outline" size={18} color="#2563EB" />
        </View>
        <Text className="text-lg font-bold text-gray-800">Basic Information</Text>
      </View>
      
      <TextField
        label="Full Name"
        value={portfolio?.fullName || ""}
        onChangeText={(text) => handlePortfolioChange("fullName", text)}
        placeholder="Enter your full name"
        size="medium"
      />
      
      <TextField
        label="Professional Title"
        value={portfolio?.professionalTitle || ""}
        onChangeText={(text) => handlePortfolioChange("professionalTitle", text)}
        placeholder="Enter your professional title"
        size="medium"
      />
      
      <TextField
        label="Professional Summary"
        value={portfolio?.professionalSummary || ""}
        onChangeText={(text) => handlePortfolioChange("professionalSummary", text)}
        placeholder="Brief summary of your professional background"
        multiline
        numberOfLines={4}
        size="medium"
      />
    </View>
  )

  const renderContactInfoSection = () => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
          <Ionicons name="call-outline" size={18} color="#2563EB" />
        </View>
        <Text className="text-lg font-bold text-gray-800">Contact Information</Text>
      </View>
      
      <TextField
        label="Email"
        value={portfolio?.email || ""}
        onChangeText={(text) => handlePortfolioChange("email", text)}
        placeholder="Enter your email"
        keyboardType="email-address"
        size="medium"
      />
      
      <TextField
        label="Phone"
        value={portfolio?.phone || ""}
        onChangeText={(text) => handlePortfolioChange("phone", text)}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        size="medium"
      />
      
      <TextField
        label="Website"
        value={portfolio?.website || ""}
        onChangeText={(text) => handlePortfolioChange("website", text)}
        placeholder="Enter your website URL"
        keyboardType="url"
        size="medium"
      />
    </View>
  )

  const renderTESDAInfoSection = () => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
          <Ionicons name="school-outline" size={18} color="#2563EB" />
        </View>
        <Text className="text-lg font-bold text-gray-800">TESDA Information</Text>
      </View>
      
      <TextField
        label="NC Level"
        value={portfolio?.ncLevel || ""}
        onChangeText={(text) => handlePortfolioChange("ncLevel", text)}
        placeholder="e.g., NC II"
        size="medium"
      />
      
      <TextField
        label="Training Center/Institution"
        value={portfolio?.trainingCenter || ""}
        onChangeText={(text) => handlePortfolioChange("trainingCenter", text)}
        placeholder="Enter training center name"
        size="medium"
      />
      
      <TextField
        label="Scholarship Type"
        value={portfolio?.scholarshipType || ""}
        onChangeText={(text) => handlePortfolioChange("scholarshipType", text)}
        placeholder="Enter scholarship type"
        size="medium"
      />
      
      <TextField
        label="Training Duration"
        value={portfolio?.trainingDuration || ""}
        onChangeText={(text) => handlePortfolioChange("trainingDuration", text)}
        placeholder="Enter training duration"
        size="medium"
      />
      
      <TextField
        label="TESDA Registration Number"
        value={portfolio?.tesdaRegistrationNumber || ""}
        onChangeText={(text) => handlePortfolioChange("tesdaRegistrationNumber", text)}
        placeholder="Enter TESDA registration number"
        size="medium"
      />
    </View>
  )

  const renderSkillsSection = () => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
          <Ionicons name="hammer-outline" size={18} color="#2563EB" />
        </View>
        <Text className="text-lg font-bold text-gray-800">Skills</Text>
      </View>
      
      {portfolio?.skills.map((skill, index) => (
        <View key={`skill-${index}`} className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200/70">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-gray-700">Skill {index + 1}</Text>
            <TouchableOpacity
              onPress={() => removeArrayItem("skills", index)}
              className="bg-red-100 rounded-full p-1.5"
            >
              <Ionicons name="close" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <TextField
            label="Skill Name"
            value={skill.name}
            onChangeText={(text) => handleArrayChange("skills", index, "name", text)}
            placeholder="Enter skill name"
            size="medium"
          />
          
          <View className="mb-4">
            <Text className="mb-2 text-gray-700 font-medium">Skill Type</Text>
            <View className="bg-white border border-gray-300 rounded-lg p-2">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['TECHNICAL', 'LANGUAGE', 'DIGITAL', 'SOFT', 'INDUSTRY_SPECIFIC'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => handleArrayChange("skills", index, "type", type)}
                    className={`px-4 py-2 mx-1 rounded-full ${
                      skill.type === type ? 'bg-blue-500' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`${
                        skill.type === type ? 'text-white' : 'text-gray-700'
                      } font-medium`}
                    >
                      {type.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          
          <View className="mb-2">
            <Text className="mb-2 text-gray-700 font-medium">Proficiency Level</Text>
            <View className="flex-row justify-between">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => handleArrayChange("skills", index, "proficiencyLevel", level)}
                  className={`flex-1 py-2.5 mx-1 rounded-lg items-center justify-center ${
                    skill.proficiencyLevel === level 
                      ? level === 'Beginner' 
                        ? 'bg-blue-300 border border-blue-400' 
                        : level === 'Intermediate' 
                          ? 'bg-blue-500 border border-blue-600' 
                          : 'bg-blue-700 border border-blue-800'
                      : 'bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      skill.proficiencyLevel === level ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ))}
      
      <TouchableOpacity
        onPress={() => addArrayItem("skills", { name: "", type: "TECHNICAL", proficiencyLevel: "" })}
        className="flex-row items-center justify-center bg-blue-50 rounded-lg py-3 mt-2 border border-blue-200"
      >
        <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
        <Text className="text-blue-600 font-medium ml-2">Add Skill</Text>
      </TouchableOpacity>
    </View>
  )

  const renderExperiencesSection = () => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-4">Experiences</Text>
      
      {portfolio?.experiences.map((exp, index) => (
        <View key={`exp-${index}`} className="bg-gray-50 rounded-lg p-4 mb-3">
          <TextField
            label="Job Title"
            value={exp.jobTitle}
            onChangeText={(text) => handleArrayChange("experiences", index, "jobTitle", text)}
            placeholder="Enter job title"
            size="medium"
          />
          
          <TextField
            label="Employer"
            value={exp.employer}
            onChangeText={(text) => handleArrayChange("experiences", index, "employer", text)}
            placeholder="Enter employer name"
            size="medium"
          />
          
          <TextField
            label="Description"
            value={exp.description || ""}
            onChangeText={(text) => handleArrayChange("experiences", index, "description", text)}
            placeholder="Describe your responsibilities and achievements"
            multiline
            numberOfLines={3}
            size="medium"
          />
          
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' }}>Start Date</Text>
            <DatePicker
              value={exp.startDate ? new Date(exp.startDate) : new Date()}
              onChange={(date) => handleArrayChange("experiences", index, "startDate", date.toISOString().split('T')[0])}
              minimumDate={new Date(1950, 0, 1)}
              maximumDate={new Date()}
            />
          </View>
          
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' }}>End Date</Text>
            <DatePicker
              value={exp.endDate ? new Date(exp.endDate) : new Date()}
              onChange={(date) => handleArrayChange("experiences", index, "endDate", date.toISOString().split('T')[0])}
              minimumDate={new Date(1950, 0, 1)}
              placeholder="Leave blank for current position"
            />
          </View>
          
          <Button
            title="Remove Experience"
            onPress={() => removeArrayItem("experiences", index)}
            variant="danger"
            style={{ marginTop: 10 }}
          />
        </View>
      ))}
      
      <Button
        title="Add Experience"
        onPress={() =>
          addArrayItem("experiences", {
            jobTitle: "",
            employer: "",
            description: "",
            startDate: "",
            endDate: "",
          })
        }
        variant="outline"
        style={{ marginTop: 10 }}
      />
    </View>
  )

  const renderProjectsSection = () => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-4">Projects</Text>
      
      {/* Project Form (Add/Edit) */}
      {isAddingProject && (
        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <Text className="text-base font-semibold mb-3">
            {editingProjectId ? "Edit Project" : "Add New Project"}
          </Text>
          
          <TextField
            label="Project Title"
            value={newProject.title}
            onChangeText={(text) => handleProjectInputChange("title", text)}
            placeholder="Enter project title"
            size="medium"
          />
          
          <TextField
            label="Description"
            value={newProject.description}
            onChangeText={(text) => handleProjectInputChange("description", text)}
            placeholder="Describe your project"
            multiline
            numberOfLines={3}
            size="medium"
          />
          
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' }}>Start Date</Text>
            <DatePicker
              value={newProject.startDate ? new Date(newProject.startDate) : new Date()}
              onChange={(date) => handleProjectInputChange("startDate", date.toISOString().split('T')[0])}
              minimumDate={new Date(2000, 0, 1)}
              maximumDate={new Date(2030, 11, 31)}
            />
          </View>
          
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' }}>End Date</Text>
            <DatePicker
              value={newProject.endDate ? new Date(newProject.endDate) : new Date()}
              onChange={(date) => handleProjectInputChange("endDate", date.toISOString().split('T')[0])}
              minimumDate={new Date(2000, 0, 1)}
              maximumDate={new Date(2030, 11, 31)}
            />
          </View>
          
          <Text className="mb-2 text-gray-700 font-medium">
            Project Image {editingProjectId ? "(Optional)" : "*"}
          </Text>
          
          <TouchableOpacity
            onPress={() => pickImage('project')}
            className="flex-row items-center bg-gray-100 p-4 rounded-lg mb-4"
          >
            {newProject.projectImageFile ? (
              <View className="flex-row items-center">
                <Image
                  source={{ uri: newProject.projectImageFile.uri }}
                  className="w-16 h-16 rounded-md mr-3"
                />
                <Text className="text-blue-600">Change Image</Text>
              </View>
            ) : editingProjectId && projects.find((p) => p.id === editingProjectId)?.preview ? (
              <View className="flex-row items-center">
                <Image
                  source={{ uri: projects.find((p) => p.id === editingProjectId)?.preview }}
                  className="w-16 h-16 rounded-md mr-3"
                />
                <Text className="text-blue-600">Change Image</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-gray-200 rounded-md items-center justify-center mr-3">
                  <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                </View>
                <Text className="text-blue-600">Select Image</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <View className="flex-row justify-end mt-4" style={{ gap: 8 }}>
            <Button
              title="Cancel"
              onPress={() => {
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
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title={editingProjectId ? "Update" : "Add"}
              onPress={editingProjectId ? handleUpdateProject : handleAddProject}
              variant="primary"
              style={{ flex: 1 }}
              disabled={!isProjectFormValid()}
            />
          </View>
        </View>
      )}
      
      {/* Project List */}
      {projects.length === 0 && !isAddingProject && (
        <View className="bg-gray-50 rounded-lg p-8 mb-4 items-center">
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mb-3">
            <Ionicons name="briefcase-outline" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-gray-500 text-center font-medium mb-2">No projects added yet</Text>
          <Text className="text-gray-400 text-center text-sm">Add your projects to showcase your work</Text>
        </View>
      )}
      
      {projects.map((project, index) => (
        <View key={`project-${index}`} className="bg-gray-50 rounded-lg p-4 mb-3">
          <View className="flex-row items-center">
            {project.preview ? (
              <Image source={{ uri: project.preview }} className="w-16 h-16 rounded-md" />
            ) : (
              <View className="w-16 h-16 bg-gray-200 rounded-md items-center justify-center">
                <Ionicons name="image-outline" size={24} color="#9CA3AF" />
              </View>
            )}
            
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-gray-800">{project.title}</Text>
              <Text numberOfLines={1} className="text-sm text-gray-500">
                {project.startDate} - {project.endDate}
              </Text>
            </View>
          </View>
          
          <View className="flex-row justify-end mt-3" style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleEditProject(project)}
              className="px-4 py-2 bg-blue-100 rounded-lg"
            >
              <Text className="text-blue-700 text-sm font-medium">Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleRemoveProject(project.id)}
              className="px-4 py-2 bg-red-100 rounded-lg"
            >
              <Text className="text-red-700 text-sm font-medium">Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
      {!isAddingProject && (
        <Button
          title="Add Project"
          onPress={() => {
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
          variant="outline"
          style={{ marginTop: 10 }}
        />
      )}
    </View>
  )

  const renderCertificatesSection = () => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-4">Certificates</Text>
      
      {/* Certificate Form (Add/Edit) */}
      {isAddingCertificate && (
        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <Text className="text-base font-semibold mb-3">
            {editingCertificateId ? "Edit Certificate" : "Add New Certificate"}
          </Text>
          
          <TextField
            label="Course Name"
            value={newCertificate.courseName}
            onChangeText={(text) => handleCertificateInputChange("courseName", text)}
            placeholder="Enter course name"
            size="medium"
          />
          
          <TextField
            label="Certificate Number"
            value={newCertificate.certificateNumber}
            onChangeText={(text) => handleCertificateInputChange("certificateNumber", text)}
            placeholder="Enter certificate number"
            size="medium"
          />
          
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' }}>Issue Date</Text>
            <DatePicker
              value={newCertificate.issueDate ? new Date(newCertificate.issueDate) : new Date()}
              onChange={(date) => handleCertificateInputChange("issueDate", date.toISOString().split('T')[0])}
              minimumDate={new Date(1950, 0, 1)}
              maximumDate={new Date()}
            />
          </View>
          
          <Text className="mb-2 text-gray-700 font-medium">
            Certificate Image {editingCertificateId ? "(Optional)" : "*"}
          </Text>
          
          <TouchableOpacity
            onPress={() => pickImage('certificate')}
            className="flex-row items-center bg-gray-100 p-4 rounded-lg mb-4"
          >
            {newCertificate.certificateFile ? (
              <View className="flex-row items-center">
                <Image
                  source={{ uri: newCertificate.certificateFile.uri }}
                  className="w-16 h-16 rounded-md mr-3"
                />
                <Text className="text-blue-600">Change Image</Text>
              </View>
            ) : editingCertificateId && certificates.find((c) => c.id === editingCertificateId)?.preview ? (
              <View className="flex-row items-center">
                <Image
                  source={{ uri: certificates.find((c) => c.id === editingCertificateId)?.preview }}
                  className="w-16 h-16 rounded-md mr-3"
                />
                <Text className="text-blue-600">Change Image</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-gray-200 rounded-md items-center justify-center mr-3">
                  <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                </View>
                <Text className="text-blue-600">Select Image</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <View className="flex-row justify-end mt-4" style={{ gap: 8 }}>
            <Button
              title="Cancel"
              onPress={() => {
                setIsAddingCertificate(false)
                setEditingCertificateId(null)
                setNewCertificate({
                  courseName: "",
                  certificateNumber: "",
                  issueDate: "",
                  certificateFile: null,
                })
              }}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title={editingCertificateId ? "Update" : "Add"}
              onPress={editingCertificateId ? handleUpdateCertificate : handleAddCertificate}
              variant="primary"
              style={{ flex: 1 }}
              disabled={!isCertificateFormValid()}
            />
          </View>
        </View>
      )}
      
      {/* Certificate List */}
      {certificates.length === 0 && !isAddingCertificate && (
        <View className="bg-gray-50 rounded-lg p-8 mb-4 items-center">
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mb-3">
            <Ionicons name="document-outline" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-gray-500 text-center font-medium mb-2">No certificates added yet</Text>
          <Text className="text-gray-400 text-center text-sm">Add your certificates to showcase your qualifications</Text>
        </View>
      )}
      
      {certificates.map((certificate, index) => (
        <View key={`certificate-${index}`} className="bg-gray-50 rounded-lg p-4 mb-3">
          <View className="flex-row items-center">
            {certificate.preview ? (
              <Image source={{ uri: certificate.preview }} className="w-16 h-16 rounded-md" />
            ) : (
              <View className="w-16 h-16 bg-gray-200 rounded-md items-center justify-center">
                <Ionicons name="document-outline" size={24} color="#9CA3AF" />
              </View>
            )}
            
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-gray-800">{certificate.courseName}</Text>
              <Text className="text-sm text-gray-500">#{certificate.certificateNumber}</Text>
              <Text className="text-sm text-gray-500">{certificate.issueDate}</Text>
            </View>
          </View>
          
          <View className="flex-row justify-end mt-3" style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleEditCertificate(certificate)}
              className="px-4 py-2 bg-blue-100 rounded-lg"
            >
              <Text className="text-blue-700 text-sm font-medium">Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleRemoveCertificate(certificate.id)}
              className="px-4 py-2 bg-red-100 rounded-lg"
            >
              <Text className="text-red-700 text-sm font-medium">Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
      {!isAddingCertificate && (
        <Button
          title="Add Certificate"
          onPress={() => {
            setIsAddingCertificate(true)
            setEditingCertificateId(null)
            setNewCertificate({
              courseName: "",
              certificateNumber: "",
              issueDate: "",
              certificateFile: null,
            })
          }}
          variant="outline"
          style={{ marginTop: 10 }}
        />
      )}
    </View>
  )

  const renderReferencesSection = () => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
          <Ionicons name="people-outline" size={18} color="#2563EB" />
        </View>
        <Text className="text-lg font-bold text-gray-800">Professional References</Text>
      </View>
      
      {portfolio?.references.map((reference, index) => (
        <View key={`ref-${index}`} className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200/70">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-gray-700">Reference {index + 1}</Text>
            <TouchableOpacity
              onPress={() => removeArrayItem("references", index)}
              className="bg-red-100 rounded-full p-1.5"
            >
              <Ionicons name="close" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <TextField
            label="Name"
            value={reference.name}
            onChangeText={(text) => handleArrayChange("references", index, "name", text)}
            placeholder="Enter reference name"
            size="medium"
          />
          
          <TextField
            label="Relationship"
            value={reference.relationship || ""}
            onChangeText={(text) => handleArrayChange("references", index, "relationship", text)}
            placeholder="E.g., Former Manager, Mentor, Colleague"
            size="medium"
          />
          
          <TextField
            label="Email"
            value={reference.email || ""}
            onChangeText={(text) => handleArrayChange("references", index, "email", text)}
            placeholder="Enter reference email"
            keyboardType="email-address"
            size="medium"
          />
          
          <TextField
            label="Phone"
            value={reference.phone || ""}
            onChangeText={(text) => handleArrayChange("references", index, "phone", text)}
            placeholder="Enter reference phone number"
            keyboardType="phone-pad"
            size="medium"
          />
        </View>
      ))}
      
      <TouchableOpacity
        onPress={() => addArrayItem("references", { name: "", relationship: "", email: "", phone: "" })}
        className="flex-row items-center justify-center bg-blue-50 rounded-lg py-3 mt-2 border border-blue-200"
      >
        <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
        <Text className="text-blue-600 font-medium ml-2">Add Reference</Text>
      </TouchableOpacity>
    </View>
  )

  const renderPortfolioSettingsSection = () => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-4">Portfolio Settings</Text>
      
      <View className="mb-4">
        <Text className="mb-2 text-gray-700 font-medium">Visibility</Text>
        <View className="bg-white border border-gray-300 rounded-lg p-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['PUBLIC', 'PRIVATE'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => handlePortfolioChange("visibility", type)}
                className={`px-4 py-2 mx-1 rounded-full ${
                  portfolio?.visibility === type ? 'bg-blue-500' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`${
                    portfolio?.visibility === type ? 'text-white' : 'text-gray-700'
                  } font-medium`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <TextField
        label="Design Template"
        value={portfolio?.designTemplate || ""}
        onChangeText={(text) => handlePortfolioChange("designTemplate", text)}
        placeholder="Enter design template name"
        size="medium"
      />
    </View>
  )

  // Main render
  if (loading) {
    return renderLoadingState()
  }

  if (error && !portfolio) {
    return renderErrorState()
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          className="flex-1 bg-white" 
          contentContainerStyle={{ 
            paddingBottom: insets.bottom + 20,
            paddingTop: insets.top + 10,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
        >
          <View className="px-4 bg-white" style={{ minHeight: '100%' }}>
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mb-4 flex-row items-center pt-2"
            >
              <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2">
                <Ionicons name="chevron-back" size={18} color="#2563EB" />
              </View>
              <Text className="text-blue-600 font-medium">Back to Portfolio</Text>
            </TouchableOpacity>
            
            {error && (
              <View className="bg-red-50 p-4 rounded-lg mb-4 border border-red-200">
                <Text className="text-red-600">{error}</Text>
              </View>
            )}
            
            {success && (
              <View className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
                <Text className="text-green-600">{success}</Text>
              </View>
            )}
            
            {renderProfileSection()}
            {renderBasicInfoSection()}
            {renderContactInfoSection()}
            {renderSkillsSection()}
            {renderTESDAInfoSection()}
            {renderExperiencesSection()}
            {renderProjectsSection()}
            {renderCertificatesSection()}
            {renderReferencesSection()}
            {renderPortfolioSettingsSection()}
            
            {/* Submit Buttons */}
            <View className="flex-row justify-between mt-6 mb-4" style={{ gap: 12 }}>
              <Button
                title="Cancel"
                onPress={() => router.back()}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <Button
                title={submitting ? "Saving..." : "Save Changes"}
                onPress={handleSubmit}
                variant="primary"
                style={{ flex: 1 }}
                disabled={submitting}
                loading={submitting}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  // Additional styles if needed
})
