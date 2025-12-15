import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  TextInput,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { API_CONFIG } from "@/config";

const BACKEND_URL = API_CONFIG.BACKEND_URL;
const { width } = Dimensions.get('window');

// NC Level options (from web implementation)
const NC_LEVEL_OPTIONS = ["NC I", "NC II", "NC III", "NC IV", "NC V", "NC VI"];

// Scholarship type options
const SCHOLARSHIP_TYPE_OPTIONS = ["Scholarship", "Non-Scholar", "None"];

// Utility function to handle date conversion
const parseDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date();
  try {
    return new Date(dateString);
  } catch (e) {
    return new Date();
  }
};

const validSkillTypes = ["TECHNICAL", "LANGUAGE", "DIGITAL", "SOFT", "INDUSTRY_SPECIFIC"];

// Steps configuration
const steps = [
  { id: 0, name: "Profile Photo", required: false, icon: "person" },
  { id: 1, name: "Basic Information", required: true, icon: "document-text" },
  { id: 2, name: "TESDA Information", required: false, icon: "school" },
  { id: 3, name: "Contact Information", required: false, icon: "call" },
  { id: 4, name: "Projects", required: false, icon: "folder" },
  { id: 5, name: "Certificates", required: false, icon: "medal" },
  { id: 6, name: "Skills", required: false, icon: "build" },
  { id: 7, name: "Experiences", required: false, icon: "briefcase" },
  { id: 8, name: "Awards & Recognitions", required: false, icon: "trophy" },
  { id: 9, name: "Continuing Education", required: false, icon: "library" },
  { id: 10, name: "Professional Memberships", required: false, icon: "people" },
  { id: 11, name: "References", required: false, icon: "chatbubbles" },
  { id: 12, name: "Additional Information", required: true, icon: "information-circle" },
];

export default function CreatePortfolio() {
  const router = useRouter();
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
  });
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<any>(null);
  const [previewAvatar, setPreviewAvatar] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [awardsRecognitions, setAwardsRecognitions] = useState<any[]>([]);
  const [continuingEducations, setContinuingEducations] = useState<any[]>([]);
  const [professionalMemberships, setProfessionalMemberships] = useState<any[]>([]);
  const [references, setReferences] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  
  // Modal state for adding new items
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingCertificate, setIsAddingCertificate] = useState(false);
  const [isAddingAward, setIsAddingAward] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [isAddingMembership, setIsAddingMembership] = useState(false);
  const [isAddingReference, setIsAddingReference] = useState(false);
  
  // New item state
  const [newSkill, setNewSkill] = useState({
    name: "",
    type: "TECHNICAL",
    proficiencyLevel: "",
  });
  
  const [newExperience, setNewExperience] = useState({
    jobTitle: "",
    company: "",
    duration: "",
    responsibilities: "",
  });
  
  const [newProject, setNewProject] = useState<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    projectImageFile: any;
    preview: string;
  }>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    projectImageFile: null,
    preview: "",
  });
  
  const [newCertificate, setNewCertificate] = useState<{
    courseName: string;
    certificateNumber: string;
    issueDate: string;
    certificateFile: any;
    preview: string;
  }>({
    courseName: "",
    certificateNumber: "",
    issueDate: "",
    certificateFile: null,
    preview: "",
  });

  const [newAward, setNewAward] = useState({
    title: "",
    issuer: "",
    dateReceived: "",
  });

  const [newEducation, setNewEducation] = useState({
    courseName: "",
    institution: "",
    completionDate: "",
  });

  const [newMembership, setNewMembership] = useState({
    organization: "",
    membershipType: "",
    startDate: "",
  });

  const [newReference, setNewReference] = useState({
    name: "",
    position: "",
    company: "",
    contact: "",
    email: "",
  });
  
  // Other state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [graduateId, setGraduateId] = useState<string | null>(null);
  const [editingCertificateId, setEditingCertificateId] = useState<number | null>(null);
  
  // Multi-step state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  
  const totalSteps = steps.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  
  // Step validation function
  const validateStep = (step: number, showError = true) => {
    switch (step) {
      case 0: // Profile Photo - optional
        return true;
      case 1: // Basic Information
        if (!formData.fullName || formData.fullName.trim() === "") {
          if (showError) setError("Please fill in your full name. This field is required.");
          return false;
        }
        if (!formData.professionalSummary || formData.professionalSummary.trim() === "") {
          if (showError) setError("Please fill in your professional summary. This field is required.");
          return false;
        }
        if (formData.professionalSummary.length > 1000) {
          if (showError) setError("Professional summary cannot exceed 1000 characters.");
          return false;
        }
        return true;
      case 12: // Additional Information
        if (!formData.primaryCourseType || formData.primaryCourseType.trim() === "") {
          if (showError) setError("Please fill in your primary course type. This field is required.");
          return false;
        }
        return true;
      default:
        return true; // Other steps are optional
    }
  };

  // Check if a step is completed
  const isStepCompleted = (stepIndex: number) => {
    if (steps[stepIndex].required) {
      return completedSteps.has(stepIndex) || validateStep(stepIndex, false);
    }
    
    // For optional steps, check if they have any data
    switch (stepIndex) {
      case 0: // Profile Photo
        return previewAvatar !== "" || selectedAvatarFile !== null;
      case 2: // TESDA Information
        return !!(formData.ncLevel || formData.trainingCenter || formData.scholarshipType || 
               formData.trainingDuration || formData.tesdaRegistrationNumber);
      case 3: // Contact Information
        return !!(formData.email || formData.phone || formData.website);
      case 4: // Projects
        return projects.length > 0;
      case 5: // Certificates
        return certificates.length > 0;
      case 6: // Skills
        return skills.length > 0;
      case 7: // Experiences
        return experiences.length > 0;
      case 8: // Awards
        return awardsRecognitions.length > 0;
      case 9: // Education
        return continuingEducations.length > 0;
      case 10: // Memberships
        return professionalMemberships.length > 0;
      case 11: // References
        return references.length > 0;
      default:
        return false;
    }
  };

  // Check if a step can be accessed
  const canAccessStep = (stepIndex: number) => {
    if (stepIndex === 0) return true;
    if (stepIndex === currentStep) return true;
    
    // Check all previous required steps
    for (let i = 0; i < stepIndex; i++) {
      if (steps[i].required && !completedSteps.has(i)) {
        return false;
      }
    }
    return true;
  };

  // Mark step as completed if it's a required step
  const markStepAsCompleted = (stepIndex: number) => {
    if (steps[stepIndex].required && validateStep(stepIndex, false)) {
      setCompletedSteps((prev) => new Set([...prev, stepIndex]));
    }
  };

  // Navigation functions
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      markStepAsCompleted(currentStep);
      setError("");
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setError("");
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      if (stepIndex === currentStep) {
        return;
      }
      
      if (canAccessStep(stepIndex)) {
        setError("");
        setCurrentStep(stepIndex);
      } else {
        // Find the first incomplete required step
        for (let i = 0; i < stepIndex; i++) {
          if (steps[i].required && !completedSteps.has(i)) {
            setError(`Please complete the "${steps[i].name}" section before proceeding.`);
            setCurrentStep(i);
            return;
          }
        }
      }
    }
  };

  // Update completed steps when form data changes
  useEffect(() => {
    steps.forEach((step, index) => {
      if (isStepCompleted(index)) {
        setCompletedSteps((prev) => {
          if (!prev.has(index)) {
            return new Set([...prev, index]);
          }
          return prev;
        });
      } else if (step.required) {
        setCompletedSteps((prev) => {
          if (prev.has(index)) {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
          }
          return prev;
        });
      }
    });
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
  ]);

  // Fetch token and graduate data on component mount
  useEffect(() => {
    const fetchTokenAndProfileData = async () => {
      try {
        const username = await AsyncStorage.getItem("username");
        if (!username) {
          setError("User not logged in. Please sign in.");
          router.push("/logingraduate");
          return;
        }

        const storedToken = await AsyncStorage.getItem("authToken");
        if (!storedToken) {
          setError("Authentication token missing. Please sign in again.");
          router.push("/logingraduate");
          return;
        }
        setToken(storedToken);

        const graduateResponse = await fetch(`${BACKEND_URL}/api/graduate/username/${username}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (!graduateResponse.ok) {
          throw new Error("Failed to fetch graduate profile");
        }

        const graduateData = await graduateResponse.json();
        setGraduateId(graduateData.id);
        
        if (graduateData.profilePicture) {
          setPreviewAvatar(graduateData.profilePicture);
          setFormData((prev) => ({ ...prev, avatar: graduateData.profilePicture }));
        }
      } catch (err) {
        setError("Failed to load profile data. Please try again.");
        if (err instanceof Response && err.status === 401) router.push("/logingraduate");
      }
    };
    
    fetchTokenAndProfileData();
  }, [router]);

  // Handle input change for form data
  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Handle avatar selection
  const handleAvatarSelect = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please grant permission to access your photos");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedAvatarFile({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: result.assets[0].uri.split('/').pop() || 'avatar.jpg',
        });
        setPreviewAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Handle project image selection
  const handleProjectImageSelect = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please grant permission to access your photos");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const file = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: result.assets[0].uri.split('/').pop() || 'project.jpg',
        };
        
        setNewProject((prev) => ({ 
          ...prev, 
          projectImageFile: file,
          preview: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };
  
  // Handle certificate file selection
  const handleCertificateFileSelect = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please grant permission to access your photos");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const file = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: result.assets[0].uri.split('/').pop() || 'certificate.jpg',
        };
        
        setNewCertificate((prev) => ({ 
          ...prev, 
          certificateFile: file,
          preview: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };
  
  // Handle adding a skill
  const handleAddSkill = () => {
    if (!newSkill.name || newSkill.name.trim() === "") {
      setError("Please fill in the skill name.");
      return;
    }
    
    if (!validSkillTypes.includes(newSkill.type)) {
      setError(`Please select a valid skill type: ${validSkillTypes.join(", ")}`);
      return;
    }
    
    setSkills((prev) => [...prev, { ...newSkill }]);
    setNewSkill({ name: "", type: "TECHNICAL", proficiencyLevel: "" });
    setIsAddingSkill(false);
    setError("");
  };
  
  // Handle adding an experience
  const handleAddExperience = () => {
    if (!newExperience.jobTitle || !newExperience.company) {
      setError("Please fill in the job title and company.");
      return;
    }
    
    setExperiences((prev) => [...prev, { ...newExperience }]);
    setNewExperience({ jobTitle: "", company: "", duration: "", responsibilities: "" });
    setIsAddingExperience(false);
    setError("");
  };
  
  // Handle adding a project
  const handleAddProject = () => {
    if (!newProject.title) {
      setError("Please fill in the project title.");
      return;
    }
    
    if (!newProject.projectImageFile) {
      setError("Please select a project image.");
      return;
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
        preview: newProject.preview,
      },
    ]);
    
    setNewProject({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      projectImageFile: null,
      preview: "",
    });
    
    setIsAddingProject(false);
    setError("");
  };
  
  // Handle adding a certificate
  const handleAddCertificate = () => {
    // Trim whitespace from inputs
    const courseName = newCertificate.courseName?.trim();
    const certificateNumber = newCertificate.certificateNumber?.trim();
    const issueDate = newCertificate.issueDate?.trim();
    
    if (!courseName || !certificateNumber || !issueDate) {
      setError("Please fill in all required certificate fields (Course Name, Certificate Number, and Issue Date).");
      return;
    }
    
    setCertificates((prev) => [
      ...prev,
      {
        id: Date.now(), // Temporary ID for frontend
        courseName: courseName,
        certificateNumber: certificateNumber,
        issueDate: issueDate,
        certificateFile: newCertificate.certificateFile,
        preview: newCertificate.preview,
      },
    ]);
    
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
      preview: "",
    });
    
    setIsAddingCertificate(false);
    setError("");
  };

  // Handle adding an award
  const handleAddAward = () => {
    if (!newAward.title) {
      setError("Please fill in the award title.");
      return;
    }
    
    setAwardsRecognitions((prev) => [...prev, { ...newAward }]);
    setNewAward({ title: "", issuer: "", dateReceived: "" });
    setIsAddingAward(false);
    setError("");
  };

  // Handle adding education
  const handleAddEducation = () => {
    if (!newEducation.courseName) {
      setError("Please fill in the course name.");
      return;
    }
    
    setContinuingEducations((prev) => [...prev, { ...newEducation }]);
    setNewEducation({ courseName: "", institution: "", completionDate: "" });
    setIsAddingEducation(false);
    setError("");
  };

  // Handle adding membership
  const handleAddMembership = () => {
    if (!newMembership.organization) {
      setError("Please fill in the organization name.");
      return;
    }
    
    setProfessionalMemberships((prev) => [...prev, { ...newMembership }]);
    setNewMembership({ organization: "", membershipType: "", startDate: "" });
    setIsAddingMembership(false);
    setError("");
  };

  // Handle adding reference
  const handleAddReference = () => {
    if (!newReference.name) {
      setError("Please fill in the reference name.");
      return;
    }
    
    setReferences((prev) => [...prev, { ...newReference }]);
    setNewReference({ name: "", position: "", company: "", contact: "", email: "" });
    setIsAddingReference(false);
    setError("");
  };
  
  // Handle edit certificate
  const handleEditCertificate = (certificate: any) => {
    setEditingCertificateId(certificate.id);
    setNewCertificate({
      courseName: certificate.courseName,
      certificateNumber: certificate.certificateNumber,
      issueDate: certificate.issueDate,
      certificateFile: null,
      preview: certificate.preview || "",
    });
    setIsAddingCertificate(true);
  };

  // Handle update certificate
  const handleUpdateCertificate = () => {
    // Trim whitespace from inputs
    const courseName = newCertificate.courseName?.trim();
    const certificateNumber = newCertificate.certificateNumber?.trim();
    const issueDate = newCertificate.issueDate?.trim();
    
    if (!courseName || !certificateNumber || !issueDate) {
      setError("Please fill in all required certificate fields (Course Name, Certificate Number, and Issue Date).");
      return;
    }
    
    setCertificates((prev) =>
      prev.map((cert) =>
        cert.id === editingCertificateId
          ? {
              ...cert,
              courseName: courseName,
              certificateNumber: certificateNumber,
              issueDate: issueDate,
              certificateFile: newCertificate.certificateFile || cert.certificateFile,
              preview: newCertificate.preview || cert.preview,
            }
          : cert
      )
    );
    
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
      preview: "",
    });
    
    setEditingCertificateId(null);
    setIsAddingCertificate(false);
    setError("");
  };

  // Remove functions for all entities
  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveProject = (id: number) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
  };

  const handleRemoveCertificate = (id: number) => {
    setCertificates((prev) => prev.filter((cert) => cert.id !== id));
  };

  const handleRemoveAward = (index: number) => {
    setAwardsRecognitions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveEducation = (index: number) => {
    setContinuingEducations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveMembership = (index: number) => {
    setProfessionalMemberships((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveReference = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit portfolio
  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const validatedSkills = skills.map((skill) => {
        if (!skill.name || skill.name.trim() === "") {
          throw new Error("Skill name is required.");
        }
        
        if (!validSkillTypes.includes(skill.type)) {
          throw new Error(`Invalid skill type for ${skill.name}. Must be one of: ${validSkillTypes.join(", ")}`);
        }
        
        return {
          name: skill.name,
          type: skill.type,
          proficiencyLevel: skill.proficiencyLevel || null,
        };
      });

      const username = await AsyncStorage.getItem("username");
      if (!username || !token || !graduateId) {
        setError("User not logged in, token missing, or graduate ID not found. Please sign in.");
        router.push("/logingraduate");
        setLoading(false);
        return;
      }

      // Upload avatar if selected
      let avatarUrl = formData.avatar || "";
      if (selectedAvatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append("file", selectedAvatarFile);
        
        const uploadResponse = await fetch(
          `${BACKEND_URL}/api/graduate/${graduateId}/upload-profile-picture`,
          {
            method: "POST",
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            body: formDataAvatar,
          }
        );
        
        if (!uploadResponse.ok) {
          let errorMsg = "Failed to upload profile picture";
          try {
            const errorData = await uploadResponse.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) {
            const errorText = await uploadResponse.text().catch(() => uploadResponse.statusText);
            errorMsg = errorText || errorMsg;
          }
          throw new Error(errorMsg);
        }
        
        const avatarData = await uploadResponse.json();
        avatarUrl = avatarData.profilePicture;
      }

      // Upload certificates
      const certificateIds = [];
      for (const cert of certificates) {
        const certificateData = new FormData();
        certificateData.append("courseName", cert.courseName);
        certificateData.append("certificateNumber", cert.certificateNumber);
        certificateData.append("issueDate", cert.issueDate);
        
        if (cert.certificateFile) {
          certificateData.append("certificateFile", cert.certificateFile);
        }
        
        const certResponse = await fetch(
          `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
          {
            method: "POST",
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            body: certificateData,
          }
        );
        
        if (!certResponse.ok) {
          let errorMsg = "Failed to upload certificate";
          try {
            const errorData = await certResponse.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) {
            const errorText = await certResponse.text().catch(() => certResponse.statusText);
            errorMsg = errorText || errorMsg;
          }
          throw new Error(errorMsg);
        }
        
        const certData = await certResponse.json();
        certificateIds.push(certData.id);
      }

      // Create portfolio
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
        phone: formData.phone ? `+63${formData.phone}` : null,
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
          const phoneValue = ref.phone || ref.contact || null;
          const formattedPhone = phoneValue ? `+63${phoneValue}` : null;
          return {
            name: ref.name,
            relationship: ref.relationship || ref.position || null,
            position: ref.relationship || ref.position || null,
            company: ref.company || null,
            phone: formattedPhone,
            contact: formattedPhone,
            email: ref.email || null,
          };
        }),
        certificateIds: certificateIds,
      };

      console.log("Sending portfolio payload:", JSON.stringify(payload, null, 2));

      const portfolioResponse = await fetch(`${BACKEND_URL}/api/portfolio`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      if (!portfolioResponse.ok) {
        let errorMessage = "Failed to create portfolio";
        try {
          const errorData = await portfolioResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, try to get it as text
          try {
            const errorText = await portfolioResponse.text();
            errorMessage = errorText || `Error ${portfolioResponse.status}: ${portfolioResponse.statusText}`;
          } catch (textError) {
            errorMessage = `Error ${portfolioResponse.status}: ${portfolioResponse.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      const portfolioData = await portfolioResponse.json();
      const portfolioId = portfolioData.id;
      
      await AsyncStorage.setItem("portfolioId", portfolioId.toString());

      // Create projects after portfolio is created
      for (const proj of projects) {
        const formDataProject = new FormData();
        formDataProject.append("portfolioId", portfolioId);
        formDataProject.append("title", proj.title);
        formDataProject.append("description", proj.description || "");
        
        if (proj.startDate) formDataProject.append("startDate", proj.startDate);
        if (proj.endDate) formDataProject.append("endDate", proj.endDate);
        
        if (proj.projectImageFile) {
          formDataProject.append("projectImageFile", proj.projectImageFile);
        }

        await fetch(`${BACKEND_URL}/api/project`, {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          body: formDataProject,
        });
      }

      console.log("Portfolio created with ID:", portfolioId);
      Alert.alert(
        "Success",
        "Portfolio created successfully!",
        [{ text: "OK", onPress: () => router.push("/graduatehomepage") }]
      );
    } catch (err: any) {
      let errorMessage = "Failed to create portfolio";
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = `Bad Request: ${err.response.data || "Invalid data provided"}`;
        } else if (err.response.status === 401) {
          errorMessage = "Unauthorized: Please sign in again.";
          router.push("/logingraduate");
        } else if (err.response.status === 403) {
          errorMessage = "Forbidden: You are not authorized to perform this action.";
        } else if (err.response.status === 409) {
          errorMessage = "Portfolio already exists for this graduate.";
        } else {
          errorMessage = err.response.data || err.response.statusText || "Failed to create portfolio";
        }
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  


  // Helper component for skill type picker
  const SkillTypePicker = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => (
    <View className="border border-gray-300 rounded-lg p-3 my-2">
      <Text className="text-sm font-medium mb-2 text-gray-700">Select Skill Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {validSkillTypes.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => onChange(type)}
            className={`mr-2 px-4 py-2 rounded-full ${
              type === value ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-sm ${
                type === value ? "text-white font-semibold" : "text-gray-700"
              }`}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Helper component for visibility picker
  const VisibilityPicker = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => (
    <View className="border border-gray-300 rounded-lg p-3 my-2">
      <Text className="text-sm font-medium mb-2 text-gray-700">Portfolio Visibility</Text>
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => onChange("PUBLIC")}
          className={`mr-2 px-4 py-2 flex-1 items-center rounded-full ${
            value === "PUBLIC" ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          <Text
            className={`text-sm ${
              value === "PUBLIC" ? "text-white font-semibold" : "text-gray-700"
            }`}
          >
            Public
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChange("PRIVATE")}
          className={`px-4 py-2 flex-1 items-center rounded-full ${
            value === "PRIVATE" ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          <Text
            className={`text-sm ${
              value === "PRIVATE" ? "text-white font-semibold" : "text-gray-700"
            }`}
          >
            Private
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Helper component for NC Level picker
  const NCLevelPicker = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => (
    <View className="border border-gray-300 rounded-lg p-3 my-2">
      <Text className="text-sm font-medium mb-2 text-gray-700">Select NC Level</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {NC_LEVEL_OPTIONS.map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => onChange(level)}
            className={`mr-2 px-4 py-2 rounded-full ${
              level === value ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-sm ${
                level === value ? "text-white font-semibold" : "text-gray-700"
              }`}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Helper component for Scholarship Type picker
  const ScholarshipTypePicker = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => (
    <View className="border border-gray-300 rounded-lg p-3 my-2">
      <Text className="text-sm font-medium mb-2 text-gray-700">Select Scholarship Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {SCHOLARSHIP_TYPE_OPTIONS.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => onChange(type)}
            className={`mr-2 px-4 py-2 rounded-full ${
              type === value ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-sm ${
                type === value ? "text-white font-semibold" : "text-gray-700"
              }`}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView 
      className="flex-1 bg-gray-50" 
      style={{ backgroundColor: '#3b82f6' }}
      edges={['top']}
    >
      <StatusBar backgroundColor="#3b82f6" barStyle="light-content" />
      
      {/* Header */}
      <View className="bg-blue-500 pb-6 pt-4 relative">
        {/* Back button */}
        <View className="absolute left-4 top-4 z-20">
          <TouchableOpacity
            onPress={() => router.push('/graduatehomepage')}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md active:opacity-90 border border-gray-200"
          >
            <Ionicons name="chevron-back" size={22} color="#1D4ED8" />
          </TouchableOpacity>
        </View>
        
        {/* Title and Progress */}
        <View className="w-full items-center px-4 mt-10">
          <Text className="text-white text-2xl font-bold text-center">Create Portfolio</Text>
          <Text className="text-blue-100 text-center mt-2 px-4">
            Step {currentStep + 1} of {totalSteps}: {steps[currentStep].name}
          </Text>
          
          {/* Progress Bar */}
          <View className="w-full bg-blue-400 rounded-full h-2 mt-4">
            <View 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          <Text className="text-blue-100 text-sm mt-2">
            {Math.round(progressPercentage)}% Complete
          </Text>
        </View>
      </View>

      {/* Step Indicators - Horizontal scrollable */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {steps.map((step, index) => {
              const isAccessible = canAccessStep(index);
              const isCompleted = completedSteps.has(index) || (step.required && validateStep(index, false));
              const isCurrent = index === currentStep;
              
              return (
                <TouchableOpacity
                  key={step.id}
                  onPress={() => handleStepClick(index)}
                  disabled={loading || !isAccessible}
                  className={`flex-row items-center px-4 py-3 rounded-full border ${
                    isCurrent
                      ? "bg-blue-500 border-blue-500"
                      : isCompleted
                      ? "bg-green-500 border-green-500"
                      : !isAccessible
                      ? "bg-gray-100 border-gray-200"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Ionicons 
                    name={isCompleted ? "checkmark-circle" : step.icon as any} 
                    size={16} 
                    color={
                      isCurrent || isCompleted
                        ? "white"
                        : !isAccessible
                        ? "#9CA3AF"
                        : "#6B7280"
                    } 
                  />
                  <Text 
                    className={`ml-1 text-xs font-medium ${
                      isCurrent || isCompleted
                        ? "text-white"
                        : !isAccessible
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {step.name}
                  </Text>
                  {step.required && (
                    <Text className="ml-1 text-red-500 text-xs">*</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Content area */}
      <View className="flex-1 bg-gray-50">
        {error ? (
          <View className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        ) : null}

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Step Content */}
          {currentStep === 0 && (
            // Profile Photo Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(0) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center mb-4">
                <View className={`w-1 h-8 rounded-full mr-3 ${
                  isStepCompleted(0) ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <Text className="text-xl font-bold text-gray-800">Profile Photo</Text>
                {!steps[0].required && (
                  <Text className="text-gray-500 ml-2">(Optional)</Text>
                )}
              </View>
              
              <View className="items-center">
                <TouchableOpacity onPress={handleAvatarSelect}>
                  {previewAvatar ? (
                    <Image
                      source={{ uri: previewAvatar }}
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 items-center justify-center">
                      <Ionicons name="person-outline" size={48} color="#6B7280" />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleAvatarSelect} 
                  className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm"
                >
                  <Text className="text-white font-medium">Select Photo</Text>
                </TouchableOpacity>
                <Text className="text-gray-600 text-center mt-2 text-sm">
                  Add a professional photo to make your portfolio stand out
                </Text>
              </View>
            </View>
          )}

          {currentStep === 1 && (
            // Basic Information Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(1) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center mb-4">
                <View className={`w-1 h-8 rounded-full mr-3 ${
                  isStepCompleted(1) ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <Text className="text-xl font-bold text-gray-800">Basic Information</Text>
                <Text className="text-red-500 ml-2">*Required</Text>
              </View>
              
              <TextField
                label="Full Name *"
                value={formData.fullName}
                onChangeText={(text) => handleInputChange("fullName", text)}
                placeholder="Enter your full name"
              />
              
              <TextField
                label="Professional Title"
                value={formData.professionalTitle}
                onChangeText={(text) => handleInputChange("professionalTitle", text)}
                placeholder="Enter your professional title"
              />
              
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Professional Summary *</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={formData.professionalSummary}
                  onChangeText={(text) => handleInputChange("professionalSummary", text)}
                  placeholder="Brief summary of your professional background (max 1000 characters)"
                  placeholderTextColor="#6B7280"
                  className="border border-gray-300 bg-gray-50 rounded-lg p-4 text-base text-gray-800 min-h-[120px]"
                  textAlignVertical="top"
                  maxLength={1000}
                />
                <Text className="text-gray-500 text-xs mt-1">
                  {formData.professionalSummary.length}/1000 characters
                </Text>
              </View>
            </View>
          )}

          {currentStep === 2 && (
            // TESDA Information Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(2) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center mb-4">
                <View className={`w-1 h-8 rounded-full mr-3 ${
                  isStepCompleted(2) ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <Text className="text-xl font-bold text-gray-800">TESDA Information</Text>
                <Text className="text-gray-500 ml-2">(Optional)</Text>
              </View>
              
              <NCLevelPicker 
                value={formData.ncLevel} 
                onChange={(value) => handleInputChange("ncLevel", value)} 
              />
              
              <TextField
                label="Training Center/Institution"
                value={formData.trainingCenter}
                onChangeText={(text) => handleInputChange("trainingCenter", text)}
                placeholder="Enter training center or institution"
              />
              
              <ScholarshipTypePicker 
                value={formData.scholarshipType} 
                onChange={(value) => handleInputChange("scholarshipType", value)} 
              />
              
              <DatePicker
                label="Training Duration"
                value={parseDate(formData.trainingDuration)}
                onChange={(date) => handleInputChange("trainingDuration", date.toISOString().split('T')[0])}
                placeholder="Select training duration"
              />
              
              <TextField
                label="TESDA Registration Number"
                value={formData.tesdaRegistrationNumber}
                onChangeText={(text) => handleInputChange("tesdaRegistrationNumber", text)}
                placeholder="Enter TESDA registration number"
              />
            </View>
          )}

          {currentStep === 3 && (
            // Contact Information Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(3) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center mb-4">
                <View className={`w-1 h-8 rounded-full mr-3 ${
                  isStepCompleted(3) ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <Text className="text-xl font-bold text-gray-800">Contact Information</Text>
                <Text className="text-gray-500 ml-2">(Optional)</Text>
              </View>
              
              <TextField
                label="Email"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              
              <View className="my-2">
                <Text className="text-sm font-medium mb-2 text-gray-700">Phone</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg bg-white">
                  <View className="bg-gray-100 px-3 py-4 border-r border-gray-300">
                    <Text className="text-gray-700 font-medium">+63</Text>
                  </View>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(text) => {
                      // Only allow numbers and limit to 10 digits
                      const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
                      handleInputChange("phone", cleaned);
                    }}
                    placeholder="9123456789 (10 digits)"
                    keyboardType="phone-pad"
                    maxLength={10}
                    className="flex-1 px-3 py-4 text-base text-gray-800"
                  />
                </View>
                {formData.phone && formData.phone.length < 10 && (
                  <Text className="text-red-500 text-xs mt-1">
                    Phone number must be 10 digits
                  </Text>
                )}
              </View>
              
              <TextField
                label="Website"
                value={formData.website}
                onChangeText={(text) => handleInputChange("website", text)}
                placeholder="Enter your website URL"
                keyboardType="url"
              />
            </View>
          )}

          {currentStep === 4 && (
            // Projects Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(4) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className={`w-1 h-8 rounded-full mr-3 ${
                    isStepCompleted(4) ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <Text className="text-xl font-bold text-gray-800">Projects</Text>
                  <Text className="text-gray-500 ml-2">(Optional)</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingProject(true);
                    setNewProject({
                      title: "",
                      description: "",
                      startDate: "",
                      endDate: "",
                      projectImageFile: null,
                      preview: "",
                    });
                  }}
                  className="bg-blue-500 p-2 rounded-full"
                >
                  <Ionicons name="add" size={18} color="white" />
                </TouchableOpacity>
              </View>

              {isAddingProject && (
                <View className="bg-blue-50 p-4 rounded-lg mb-4">
                  <TextField
                    label="Project Title *"
                    value={newProject.title}
                    onChangeText={(text) => setNewProject(prev => ({ ...prev, title: text }))}
                    placeholder="Enter project title"
                  />
                  
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
                    <TextInput
                      multiline
                      numberOfLines={3}
                      value={newProject.description}
                      onChangeText={(text) => setNewProject(prev => ({ ...prev, description: text }))}
                      placeholder="Describe your project"
                      placeholderTextColor="#6B7280"
                      className="border border-gray-300 bg-gray-50 rounded-lg p-4 text-base text-gray-800 min-h-[100px]"
                      textAlignVertical="top"
                    />
                  </View>
                  
                  <DatePicker
                    label="Start Date"
                    value={parseDate(newProject.startDate)}
                    onChange={(date) => setNewProject(prev => ({ ...prev, startDate: date.toISOString().split('T')[0] }))}
                  />
                  
                  <DatePicker
                    label="End Date"
                    value={parseDate(newProject.endDate)}
                    onChange={(date) => setNewProject(prev => ({ ...prev, endDate: date.toISOString().split('T')[0] }))}
                  />
                  
              <View className="items-center my-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Project Image *</Text>
                <TouchableOpacity onPress={handleProjectImageSelect} className="w-full">
                  {newProject.preview ? (
                    <Image
                      source={{ uri: newProject.preview }}
                      className="w-full h-48 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 items-center justify-center">
                      <View className="items-center">
                        <Ionicons name="image-outline" size={48} color="#6B7280" />
                        <Text className="text-gray-600 mt-3 font-medium">Tap to select image</Text>
                        <Text className="text-gray-500 text-sm mt-1">JPG, PNG or GIF</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>                  <View className="flex-row mt-4 justify-between">
                    <Button 
                      title="Add Project" 
                      onPress={handleAddProject} 
                      style={{ flex: 1, marginRight: 5 }} 
                    />
                    <Button 
                      title="Cancel" 
                      onPress={() => setIsAddingProject(false)} 
                      variant="outline" 
                      style={{ flex: 1, marginLeft: 5 }} 
                    />
                  </View>
                </View>
              )}
              
              {projects.length > 0 ? (
                <View className="space-y-4">
                  {projects.map((project) => (
                    <View key={project.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-semibold text-lg text-gray-800">{project.title}</Text>
                        <TouchableOpacity onPress={() => handleRemoveProject(project.id)}>
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                      {project.preview && (
                        <Image
                          source={{ uri: project.preview }}
                          className="w-full h-36 rounded-lg my-2"
                          resizeMode="cover"
                        />
                      )}
                      {project.description && (
                        <Text className="text-gray-600 mb-2">{project.description}</Text>
                      )}
                      <Text className="text-sm text-gray-500">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Start: N/A'} - 
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : ' End: N/A'}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Ionicons name="folder-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">No projects added yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Showcase your work and achievements
                  </Text>
                </View>
              )}
            </View>
          )}

          {currentStep === 5 && (
            // Certificates Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(5) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className={`w-1 h-8 rounded-full mr-3 ${
                    isStepCompleted(5) ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <Text className="text-xl font-bold text-gray-800">Certificates</Text>
                  <Text className="text-gray-500 ml-2">(Optional)</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingCertificate(true);
                    setEditingCertificateId(null);
                    setNewCertificate({
                      courseName: "",
                      certificateNumber: "",
                      issueDate: "",
                      certificateFile: null,
                      preview: "",
                    });
                  }}
                  className="bg-blue-500 p-2 rounded-full"
                >
                  <Ionicons name="add" size={18} color="white" />
                </TouchableOpacity>
              </View>

              {isAddingCertificate && (
                <View className="bg-blue-50 p-4 rounded-lg mb-4">
                  <TextField
                    label="Course Name *"
                    value={newCertificate.courseName}
                    onChangeText={(text) => setNewCertificate(prev => ({ ...prev, courseName: text }))}
                    placeholder="Enter course name"
                  />
                  
                  <TextField
                    label="Certificate Number *"
                    value={newCertificate.certificateNumber}
                    onChangeText={(text) => setNewCertificate(prev => ({ ...prev, certificateNumber: text }))}
                    placeholder="Enter certificate number"
                  />
                  
                  <DatePicker
                    label="Issue Date *"
                    value={parseDate(newCertificate.issueDate)}
                    onChange={(date) => setNewCertificate(prev => ({ ...prev, issueDate: date.toISOString().split('T')[0] }))}
                  />
                  
                  <View className="items-center my-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Certificate Image</Text>
                    <TouchableOpacity onPress={handleCertificateFileSelect} className="w-full">
                      {newCertificate.preview ? (
                        <Image
                          source={{ uri: newCertificate.preview }}
                          className="w-full h-48 rounded-lg"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 items-center justify-center">
                          <View className="items-center">
                            <Ionicons name="document-outline" size={48} color="#6B7280" />
                            <Text className="text-gray-600 mt-3 font-medium">Tap to select image</Text>
                            <Text className="text-gray-500 text-sm mt-1">JPG, PNG or PDF</Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  <View className="flex-row mt-4 justify-between">
                    <Button 
                      title={editingCertificateId ? "Update" : "Add Certificate"} 
                      onPress={editingCertificateId ? handleUpdateCertificate : handleAddCertificate} 
                      style={{ flex: 1, marginRight: 5 }} 
                    />
                    <Button 
                      title="Cancel" 
                      onPress={() => {
                        setIsAddingCertificate(false);
                        setEditingCertificateId(null);
                      }} 
                      variant="outline" 
                      style={{ flex: 1, marginLeft: 5 }} 
                    />
                  </View>
                </View>
              )}
              
              {certificates.length > 0 ? (
                <View className="space-y-4">
                  {certificates.map((cert) => (
                    <View key={cert.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-semibold text-lg text-gray-800">{cert.courseName}</Text>
                        <View className="flex-row">
                          <TouchableOpacity 
                            onPress={() => handleEditCertificate(cert)}
                            className="mr-2"
                          >
                            <Ionicons name="pencil" size={20} color="#3b82f6" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleRemoveCertificate(cert.id)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      {cert.preview && (
                        <Image
                          source={{ uri: cert.preview }}
                          className="w-full h-36 rounded-lg my-2"
                          resizeMode="cover"
                        />
                      )}
                      <Text className="text-sm text-gray-600">Certificate #: {cert.certificateNumber}</Text>
                      <Text className="text-sm text-gray-600">Issued: {cert.issueDate}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Ionicons name="medal-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">No certificates added yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Add your certifications and credentials
                  </Text>
                </View>
              )}
            </View>
          )}

          {currentStep === 6 && (
            // Skills Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(6) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className={`w-1 h-8 rounded-full mr-3 ${
                    isStepCompleted(6) ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <Text className="text-xl font-bold text-gray-800">Skills</Text>
                  <Text className="text-gray-500 ml-2">(Optional)</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingSkill(true);
                    setNewSkill({ name: "", type: "TECHNICAL", proficiencyLevel: "" });
                  }}
                  className="bg-blue-500 p-2 rounded-full"
                >
                  <Ionicons name="add" size={18} color="white" />
                </TouchableOpacity>
              </View>

              {isAddingSkill && (
                <View className="bg-blue-50 p-4 rounded-lg mb-4">
                  <TextField
                    label="Skill Name *"
                    value={newSkill.name}
                    onChangeText={(text) => setNewSkill(prev => ({ ...prev, name: text }))}
                    placeholder="e.g., Welding"
                  />
                  
                  <SkillTypePicker 
                    value={newSkill.type} 
                    onChange={(value) => setNewSkill(prev => ({ ...prev, type: value }))} 
                  />
                  
                  <View className="border border-gray-300 rounded-lg p-3 my-2">
                    <Text className="text-sm font-medium mb-2 text-gray-700">Proficiency Level</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {["Beginner", "Intermediate", "Advanced"].map((level) => (
                        <TouchableOpacity
                          key={level}
                          onPress={() => setNewSkill(prev => ({ ...prev, proficiencyLevel: level }))}
                          className={`mr-2 px-4 py-2 rounded-full ${
                            level === newSkill.proficiencyLevel ? "bg-blue-500" : "bg-gray-200"
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              level === newSkill.proficiencyLevel ? "text-white font-semibold" : "text-gray-700"
                            }`}
                          >
                            {level}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  <View className="flex-row mt-4 justify-between">
                    <Button 
                      title="Add Skill" 
                      onPress={handleAddSkill} 
                      style={{ flex: 1, marginRight: 5 }} 
                    />
                    <Button 
                      title="Cancel" 
                      onPress={() => setIsAddingSkill(false)} 
                      variant="outline" 
                      style={{ flex: 1, marginLeft: 5 }} 
                    />
                  </View>
                </View>
              )}
              
              {skills.length > 0 ? (
                <View className="space-y-3">
                  {skills.map((skill, index) => (
                    <View key={index} className="bg-gray-50 p-3 rounded-lg flex-row justify-between items-center border border-gray-200">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800">{skill.name}</Text>
                        <Text className="text-sm text-gray-600">Type: {skill.type}</Text>
                        {skill.proficiencyLevel && (
                          <Text className="text-sm text-gray-600">Level: {skill.proficiencyLevel}</Text>
                        )}
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleRemoveSkill(index)} 
                        className="p-2"
                      >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Ionicons name="build-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">No skills added yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Add your technical and professional skills
                  </Text>
                </View>
              )}
            </View>
          )}

          {currentStep === 7 && (
            // Experiences Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(7) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className={`w-1 h-8 rounded-full mr-3 ${
                    isStepCompleted(7) ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <Text className="text-xl font-bold text-gray-800">Experiences</Text>
                  <Text className="text-gray-500 ml-2">(Optional)</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingExperience(true);
                    setNewExperience({
                      jobTitle: "",
                      company: "",
                      duration: "",
                      responsibilities: "",
                    });
                  }}
                  className="bg-blue-500 p-2 rounded-full"
                >
                  <Ionicons name="add" size={18} color="white" />
                </TouchableOpacity>
              </View>

              {isAddingExperience && (
                <View className="bg-blue-50 p-4 rounded-lg mb-4">
                  <TextField
                    label="Job Title *"
                    value={newExperience.jobTitle}
                    onChangeText={(text) => setNewExperience(prev => ({ ...prev, jobTitle: text }))}
                    placeholder="e.g., Software Engineer"
                  />
                  
                  <TextField
                    label="Company *"
                    value={newExperience.company}
                    onChangeText={(text) => setNewExperience(prev => ({ ...prev, company: text }))}
                    placeholder="e.g., ABC Corp"
                  />
                  
                  <TextField
                    label="Duration"
                    value={newExperience.duration}
                    onChangeText={(text) => setNewExperience(prev => ({ ...prev, duration: text }))}
                    placeholder="e.g., Jan 2020 - Dec 2022"
                  />
                  
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Responsibilities</Text>
                    <TextInput
                      multiline
                      numberOfLines={3}
                      value={newExperience.responsibilities}
                      onChangeText={(text) => setNewExperience(prev => ({ ...prev, responsibilities: text }))}
                      placeholder="Describe your responsibilities"
                      placeholderTextColor="#6B7280"
                      className="border border-gray-300 bg-gray-50 rounded-lg p-4 text-base text-gray-800 min-h-[100px]"
                      textAlignVertical="top"
                    />
                  </View>
                  
                  <View className="flex-row mt-4 justify-between">
                    <Button 
                      title="Add Experience" 
                      onPress={handleAddExperience} 
                      style={{ flex: 1, marginRight: 5 }} 
                    />
                    <Button 
                      title="Cancel" 
                      onPress={() => setIsAddingExperience(false)} 
                      variant="outline" 
                      style={{ flex: 1, marginLeft: 5 }} 
                    />
                  </View>
                </View>
              )}
              
              {experiences.length > 0 ? (
                <View className="space-y-3">
                  {experiences.map((exp, index) => (
                    <View key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-semibold text-lg text-gray-800">{exp.jobTitle}</Text>
                        <TouchableOpacity onPress={() => handleRemoveExperience(index)}>
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-gray-700">{exp.company}</Text>
                      {exp.duration && <Text className="text-sm text-gray-600">Duration: {exp.duration}</Text>}
                      {exp.responsibilities && (
                        <Text className="text-sm text-gray-600 mt-2">{exp.responsibilities}</Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Ionicons name="briefcase-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">No experiences added yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Add your work experience and roles
                  </Text>
                </View>
              )}
            </View>
          )}

          {currentStep === 8 && (
            // Awards & Recognitions Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(8) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className={`w-1 h-8 rounded-full mr-3 ${
                    isStepCompleted(8) ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <Text className="text-xl font-bold text-gray-800">Awards & Recognitions</Text>
                  <Text className="text-gray-500 ml-2">(Optional)</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingAward(true);
                    setNewAward({ title: "", issuer: "", dateReceived: "" });
                  }}
                  className="bg-blue-500 p-2 rounded-full"
                >
                  <Ionicons name="add" size={18} color="white" />
                </TouchableOpacity>
              </View>

              {isAddingAward && (
                <View className="bg-blue-50 p-4 rounded-lg mb-4">
                  <TextField
                    label="Award Title *"
                    value={newAward.title}
                    onChangeText={(text) => setNewAward(prev => ({ ...prev, title: text }))}
                    placeholder="e.g., Best Employee"
                  />
                  
                  <TextField
                    label="Issuer"
                    value={newAward.issuer}
                    onChangeText={(text) => setNewAward(prev => ({ ...prev, issuer: text }))}
                    placeholder="e.g., XYZ Organization"
                  />
                  
                  <DatePicker
                    label="Date Received"
                    value={parseDate(newAward.dateReceived)}
                    onChange={(date) => setNewAward(prev => ({ ...prev, dateReceived: date.toISOString().split('T')[0] }))}
                  />
                  
                  <View className="flex-row mt-4 justify-between">
                    <Button 
                      title="Add Award" 
                      onPress={handleAddAward} 
                      style={{ flex: 1, marginRight: 5 }} 
                    />
                    <Button 
                      title="Cancel" 
                      onPress={() => setIsAddingAward(false)} 
                      variant="outline" 
                      style={{ flex: 1, marginLeft: 5 }} 
                    />
                  </View>
                </View>
              )}
              
              {awardsRecognitions.length > 0 ? (
                <View className="space-y-3">
                  {awardsRecognitions.map((award, index) => (
                    <View key={index} className="bg-gray-50 p-3 rounded-lg flex-row justify-between items-center border border-gray-200">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800">{award.title}</Text>
                        {award.issuer && <Text className="text-sm text-gray-600">Issuer: {award.issuer}</Text>}
                        {award.dateReceived && <Text className="text-sm text-gray-600">Received: {award.dateReceived}</Text>}
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleRemoveAward(index)} 
                        className="p-2"
                      >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Ionicons name="trophy-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">No awards added yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Add your achievements and recognitions
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Steps 9-12: Remaining Optional Steps and Final Required Step */}
          {currentStep === 9 && (
            // Continuing Education Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(9) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className={`w-1 h-8 rounded-full mr-3 ${
                    isStepCompleted(9) ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <Text className="text-xl font-bold text-gray-800">Continuing Education</Text>
                  <Text className="text-gray-500 ml-2">(Optional)</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingEducation(true);
                    setNewEducation({ courseName: "", institution: "", completionDate: "" });
                  }}
                  className="bg-blue-500 p-2 rounded-full"
                >
                  <Ionicons name="add" size={18} color="white" />
                </TouchableOpacity>
              </View>
              
              {isAddingEducation && (
                <View className="bg-blue-50 p-4 rounded-lg mb-4">
                  <TextField
                    label="Course Name *"
                    value={newEducation.courseName}
                    onChangeText={(text) => setNewEducation(prev => ({ ...prev, courseName: text }))}
                    placeholder="e.g., Advanced Welding"
                  />
                  
                  <TextField
                    label="Institution"
                    value={newEducation.institution}
                    onChangeText={(text) => setNewEducation(prev => ({ ...prev, institution: text }))}
                    placeholder="e.g., TESDA Institute"
                  />
                  
                  <DatePicker
                    label="Completion Date"
                    value={parseDate(newEducation.completionDate)}
                    onChange={(date) => setNewEducation(prev => ({ ...prev, completionDate: date.toISOString().split('T')[0] }))}
                  />
                  
                  <View className="flex-row mt-4 justify-between">
                    <Button 
                      title="Add Education" 
                      onPress={handleAddEducation} 
                      style={{ flex: 1, marginRight: 5 }} 
                    />
                    <Button 
                      title="Cancel" 
                      onPress={() => setIsAddingEducation(false)} 
                      variant="outline" 
                      style={{ flex: 1, marginLeft: 5 }} 
                    />
                  </View>
                </View>
              )}
              
              {continuingEducations.length > 0 ? (
                <View className="space-y-3">
                  {continuingEducations.map((edu, index) => (
                    <View key={index} className="bg-gray-50 p-3 rounded-lg flex-row justify-between items-center border border-gray-200">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800">{edu.courseName}</Text>
                        {edu.institution && <Text className="text-sm text-gray-600">Institution: {edu.institution}</Text>}
                        {edu.completionDate && <Text className="text-sm text-gray-600">Completed: {edu.completionDate}</Text>}
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleRemoveEducation(index)} 
                        className="p-2"
                      >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Ionicons name="library-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">No education entries added yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Add your continuing education and courses
                  </Text>
                </View>
              )}
            </View>
          )}

          {currentStep === 10 && (
            // Professional Memberships Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(10) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className={`w-1 h-8 rounded-full mr-3 ${
                    isStepCompleted(10) ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <Text className="text-xl font-bold text-gray-800">Professional Memberships</Text>
                  <Text className="text-gray-500 ml-2">(Optional)</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingMembership(true);
                    setNewMembership({ organization: "", membershipType: "", startDate: "" });
                  }}
                  className="bg-blue-500 p-2 rounded-full"
                >
                  <Ionicons name="add" size={18} color="white" />
                </TouchableOpacity>
              </View>
              
              {isAddingMembership && (
                <View className="bg-blue-50 p-4 rounded-lg mb-4">
                  <TextField
                    label="Organization *"
                    value={newMembership.organization}
                    onChangeText={(text) => setNewMembership(prev => ({ ...prev, organization: text }))}
                    placeholder="e.g., IEEE"
                  />
                  
                  <TextField
                    label="Membership Type"
                    value={newMembership.membershipType}
                    onChangeText={(text) => setNewMembership(prev => ({ ...prev, membershipType: text }))}
                    placeholder="e.g., Professional Member"
                  />
                  
                  <DatePicker
                    label="Join Date"
                    value={parseDate(newMembership.startDate)}
                    onChange={(date) => setNewMembership(prev => ({ ...prev, startDate: date.toISOString().split('T')[0] }))}
                  />
                  
                  <View className="flex-row mt-4 justify-between">
                    <Button 
                      title="Add Membership" 
                      onPress={handleAddMembership} 
                      style={{ flex: 1, marginRight: 5 }} 
                    />
                    <Button 
                      title="Cancel" 
                      onPress={() => setIsAddingMembership(false)} 
                      variant="outline" 
                      style={{ flex: 1, marginLeft: 5 }} 
                    />
                  </View>
                </View>
              )}
              
              {professionalMemberships.length > 0 ? (
                <View className="space-y-3">
                  {professionalMemberships.map((mem, index) => (
                    <View key={index} className="bg-gray-50 p-3 rounded-lg flex-row justify-between items-center border border-gray-200">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800">{mem.organization}</Text>
                        {mem.membershipType && <Text className="text-sm text-gray-600">Type: {mem.membershipType}</Text>}
                        {mem.startDate && <Text className="text-sm text-gray-600">Joined: {mem.startDate}</Text>}
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleRemoveMembership(index)} 
                        className="p-2"
                      >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">No memberships added yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Add your professional associations
                  </Text>
                </View>
              )}
            </View>
          )}

          {currentStep === 11 && (
            // References Step
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(11) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className={`w-1 h-8 rounded-full mr-3 ${
                    isStepCompleted(11) ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <Text className="text-xl font-bold text-gray-800">References</Text>
                  <Text className="text-gray-500 ml-2">(Optional)</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingReference(true);
                    setNewReference({ name: "", position: "", company: "", contact: "", email: "" });
                  }}
                  className="bg-blue-500 p-2 rounded-full"
                >
                  <Ionicons name="add" size={18} color="white" />
                </TouchableOpacity>
              </View>
              
              {isAddingReference && (
                <View className="bg-blue-50 p-4 rounded-lg mb-4">
                  <TextField
                    label="Name *"
                    value={newReference.name}
                    onChangeText={(text) => setNewReference(prev => ({ ...prev, name: text }))}
                    placeholder="e.g., John Doe"
                  />
                  
                  <TextField
                    label="Position"
                    value={newReference.position}
                    onChangeText={(text) => setNewReference(prev => ({ ...prev, position: text }))}
                    placeholder="e.g., Manager"
                  />
                  
                  <TextField
                    label="Company"
                    value={newReference.company}
                    onChangeText={(text) => setNewReference(prev => ({ ...prev, company: text }))}
                    placeholder="e.g., ABC Corp"
                  />
                  
                  <TextField
                    label="Contact"
                    value={newReference.contact}
                    onChangeText={(text) => setNewReference(prev => ({ ...prev, contact: text }))}
                    placeholder="e.g., +1234567890"
                    keyboardType="phone-pad"
                  />
                  
                  <TextField
                    label="Email"
                    value={newReference.email}
                    onChangeText={(text) => setNewReference(prev => ({ ...prev, email: text }))}
                    placeholder="e.g., john.doe@example.com"
                    keyboardType="email-address"
                  />
                  
                  <View className="flex-row mt-4 justify-between">
                    <Button 
                      title="Add Reference" 
                      onPress={handleAddReference} 
                      style={{ flex: 1, marginRight: 5 }} 
                    />
                    <Button 
                      title="Cancel" 
                      onPress={() => setIsAddingReference(false)} 
                      variant="outline" 
                      style={{ flex: 1, marginLeft: 5 }} 
                    />
                  </View>
                </View>
              )}
              
              {references.length > 0 ? (
                <View className="space-y-3">
                  {references.map((ref, index) => (
                    <View key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-semibold text-gray-800">{ref.name}</Text>
                        <TouchableOpacity onPress={() => handleRemoveReference(index)}>
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                      {ref.position && <Text className="text-sm text-gray-600">Position: {ref.position}</Text>}
                      {ref.company && <Text className="text-sm text-gray-600">Company: {ref.company}</Text>}
                      {ref.contact && <Text className="text-sm text-gray-600">Contact: {ref.contact}</Text>}
                      {ref.email && <Text className="text-sm text-gray-600">Email: {ref.email}</Text>}
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">No references added yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Add professional references
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {currentStep === 12 && (
            // Additional Information Step (Final Required Step)
            <View className={`bg-white rounded-2xl p-5 shadow-sm mb-4 ${
              isStepCompleted(12) ? 'border-2 border-green-200' : ''
            }`}>
              <View className="flex-row items-center mb-4">
                <View className={`w-1 h-8 rounded-full mr-3 ${
                  isStepCompleted(12) ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <Text className="text-xl font-bold text-gray-800">Additional Information</Text>
                <Text className="text-red-500 ml-2">*Required</Text>
              </View>
              
              <TextField
                label="Primary Course Type *"
                value={formData.primaryCourseType}
                onChangeText={(text) => handleInputChange("primaryCourseType", text)}
                placeholder="e.g., Computer Programming"
              />
              
              <VisibilityPicker 
                value={formData.visibility} 
                onChange={(value) => handleInputChange("visibility", value)} 
              />
            </View>
          )}

          {/* Navigation Buttons */}
          <View className="flex-row justify-between mt-6 mb-4">
            <Button
              title="Previous"
              onPress={handlePreviousStep}
              disabled={currentStep === 0 || loading}
              variant="outline"
              style={{ flex: 0.45 }}
            />
            
            {currentStep === totalSteps - 1 ? (
              <Button
                title={loading ? "Creating..." : "Create Portfolio"}
                onPress={handleSubmit}
                disabled={loading}
                loading={loading}
                style={{ flex: 0.45 }}
              />
            ) : (
              <Button
                title="Next"
                onPress={handleNextStep}
                disabled={loading}
                style={{ flex: 0.45 }}
              />
            )}
          </View>
        
          {/* Extra padding for bottom safe area */}
          <View style={{ height: Platform.OS === 'ios' ? 30 : 10 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
