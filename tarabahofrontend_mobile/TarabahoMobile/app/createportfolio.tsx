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
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8080";

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
    if (!newCertificate.courseName || !newCertificate.certificateNumber || !newCertificate.issueDate) {
      setError("Please fill in all required certificate fields.");
      return;
    }
    
    setCertificates((prev) => [
      ...prev,
      {
        id: Date.now(), // Temporary ID for frontend
        courseName: newCertificate.courseName,
        certificateNumber: newCertificate.certificateNumber,
        issueDate: newCertificate.issueDate,
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
    if (!newCertificate.courseName || !newCertificate.certificateNumber || !newCertificate.issueDate) {
      setError("Please fill in all required certificate fields.");
      return;
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
          throw new Error("Failed to upload profile picture");
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
          throw new Error("Failed to upload certificate");
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
        const errorData = await portfolioResponse.json();
        throw new Error(errorData.message || "Failed to create portfolio");
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
  
  // Helper component for section headers
  const SectionHeader = ({ title, onAdd }: { title: string, onAdd?: () => void }) => (
    <View className="flex-row items-center justify-between mb-4 border-b border-gray-200 pb-2">
      <Text className="text-xl font-bold text-gray-800">{title}</Text>
      {onAdd && (
        <TouchableOpacity
          onPress={onAdd}
          className="bg-blue-500 p-2 rounded-full"
        >
          <Ionicons name="add" size={18} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );

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

  return (
    <SafeAreaView 
      className="flex-1 bg-gray-50" 
      style={{ backgroundColor: '#3b82f6' }}
      edges={['top']} // Only apply safe area to the top edge
    >
      {/* Status bar styling */}
      <StatusBar backgroundColor="#3b82f6" barStyle="light-content" />
      
      {/* Header */}
      <View className="bg-blue-500 pb-6 pt-4 relative">
        {/* Back button */}
        <View className="absolute left-4 top-4 z-20">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md active:opacity-90 border border-gray-200"
          >
            <Ionicons name="chevron-back" size={22} color="#1D4ED8" />
          </TouchableOpacity>
        </View>
        
        {/* Centered title with absolute positioning to ensure perfect centering */}
        <View className="w-full items-center px-4 mt-10">
          <Text className="text-white text-2xl font-bold text-center">Create Portfolio</Text>
          <Text className="text-blue-100 text-center mt-2 px-4">
            Showcase your skills and achievements to potential employers
          </Text>
        </View>
      </View>

      {/* Content area with white background */}
      <View className="flex-1 bg-gray-50 rounded-t-3xl overflow-hidden mt-1" style={{ paddingBottom: Platform.OS === 'ios' ? 20 : 0 }}>
        {error ? (
          <View className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        ) : null}

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader title="Profile Photo" />
          <View className="items-center">
            <TouchableOpacity onPress={handleAvatarSelect}>
              {previewAvatar ? (
                <Image
                  source={{ uri: previewAvatar }}
                  className="w-32 h-32 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center">
                  <Ionicons name="person" size={64} color="#9ca3af" />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleAvatarSelect} 
              className="bg-blue-500 px-4 py-2 rounded-lg mt-4"
            >
              <Text className="text-white font-medium">Select Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Basic Information */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader title="Basic Information" />
          
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
              placeholder="Brief summary of your professional background"
              className="border border-gray-300 bg-gray-50 rounded-lg p-4 text-base text-gray-800 min-h-[120px]"
              textAlignVertical="top"
            />
          </View>
        </View>
        
        {/* TESDA Information */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader title="TESDA Information" />
          
          <TextField
            label="NC Level"
            value={formData.ncLevel}
            onChangeText={(text) => handleInputChange("ncLevel", text)}
            placeholder="e.g., NC II"
          />
          
          <TextField
            label="Training Center/Institution"
            value={formData.trainingCenter}
            onChangeText={(text) => handleInputChange("trainingCenter", text)}
            placeholder="Enter training center or institution"
          />
          
          <TextField
            label="Scholarship Type"
            value={formData.scholarshipType}
            onChangeText={(text) => handleInputChange("scholarshipType", text)}
            placeholder="e.g., Full Scholarship"
          />
          
          <TextField
            label="Training Duration"
            value={formData.trainingDuration}
            onChangeText={(text) => handleInputChange("trainingDuration", text)}
            placeholder="e.g., January 2023 - June 2023"
          />
          
          <TextField
            label="TESDA Registration Number"
            value={formData.tesdaRegistrationNumber}
            onChangeText={(text) => handleInputChange("tesdaRegistrationNumber", text)}
            placeholder="Enter TESDA registration number"
          />
        </View>
        
        {/* Contact Information */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader title="Contact Information" />
          
          <TextField
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleInputChange("email", text)}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
          
          <TextField
            label="Phone"
            value={formData.phone}
            onChangeText={(text) => handleInputChange("phone", text)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          
          <TextField
            label="Website"
            value={formData.website}
            onChangeText={(text) => handleInputChange("website", text)}
            placeholder="Enter your website URL"
            keyboardType="url"
          />
        </View>
        
        {/* Skills Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader 
            title="Skills" 
            onAdd={() => {
              setIsAddingSkill(true);
              setNewSkill({ name: "", type: "TECHNICAL", proficiencyLevel: "" });
            }}
          />
          
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
            <View className="py-4 items-center">
              <Text className="text-gray-500">No skills added yet</Text>
            </View>
          )}
        </View>
        
        {/* Projects Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader 
            title="Projects" 
            onAdd={() => {
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
          />
          
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
                <TouchableOpacity onPress={handleProjectImageSelect}>
                  {newProject.preview ? (
                    <Image
                      source={{ uri: newProject.preview }}
                      className="w-full h-48 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-48 rounded-lg bg-gray-200 items-center justify-center">
                      <Ionicons name="image" size={48} color="#9ca3af" />
                      <Text className="text-gray-500 mt-2">Tap to select image</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              
              <View className="flex-row mt-4 justify-between">
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
            <View className="py-4 items-center">
              <Text className="text-gray-500">No projects added yet</Text>
            </View>
          )}
        </View>
        
        {/* Certificates Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader 
            title="Certificates" 
            onAdd={() => {
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
          />
          
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
                <TouchableOpacity onPress={handleCertificateFileSelect}>
                  {newCertificate.preview ? (
                    <Image
                      source={{ uri: newCertificate.preview }}
                      className="w-full h-48 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-48 rounded-lg bg-gray-200 items-center justify-center">
                      <Ionicons name="document" size={48} color="#9ca3af" />
                      <Text className="text-gray-500 mt-2">Tap to select image</Text>
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
            <View className="py-4 items-center">
              <Text className="text-gray-500">No certificates added yet</Text>
            </View>
          )}
        </View>
        
        {/* Experiences Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader 
            title="Experiences" 
            onAdd={() => {
              setIsAddingExperience(true);
              setNewExperience({
                jobTitle: "",
                company: "",
                duration: "",
                responsibilities: "",
              });
            }}
          />
          
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
            <View className="py-4 items-center">
              <Text className="text-gray-500">No experiences added yet</Text>
            </View>
          )}
        </View>
        
        {/* Awards & Recognitions Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader 
            title="Awards & Recognitions" 
            onAdd={() => {
              setIsAddingAward(true);
              setNewAward({ title: "", issuer: "", dateReceived: "" });
            }}
          />
          
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
            <View className="py-4 items-center">
              <Text className="text-gray-500">No awards added yet</Text>
            </View>
          )}
        </View>
        
        {/* Continuing Education Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader 
            title="Continuing Education" 
            onAdd={() => {
              setIsAddingEducation(true);
              setNewEducation({ courseName: "", institution: "", completionDate: "" });
            }}
          />
          
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
            <View className="py-4 items-center">
              <Text className="text-gray-500">No education entries added yet</Text>
            </View>
          )}
        </View>

        {/* Professional Memberships Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader 
            title="Professional Memberships" 
            onAdd={() => {
              setIsAddingMembership(true);
              setNewMembership({ organization: "", membershipType: "", startDate: "" });
            }}
          />
          
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
            <View className="py-4 items-center">
              <Text className="text-gray-500">No memberships added yet</Text>
            </View>
          )}
        </View>

        {/* References Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader 
            title="References" 
            onAdd={() => {
              setIsAddingReference(true);
              setNewReference({ name: "", position: "", company: "", contact: "", email: "" });
            }}
          />
          
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
            <View className="py-4 items-center">
              <Text className="text-gray-500">No references added yet</Text>
            </View>
          )}
        </View>
        
        {/* Additional Information */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <SectionHeader title="Additional Information" />
          
          <TextField
            label="Primary Course Type *"
            value={formData.primaryCourseType}
            onChangeText={(text) => handleInputChange("primaryCourseType", text)}
            placeholder="e.g., Computer Science"
          />
          
          <VisibilityPicker 
            value={formData.visibility} 
            onChange={(value) => handleInputChange("visibility", value)} 
          />
        </View>
        
        {/* Submit Button */}
        <View className="my-6 mb-10">
          <Button
            title={loading ? "Creating Portfolio..." : "Create Portfolio"}
            onPress={handleSubmit}
            disabled={loading}
            loading={loading}
          />
        </View>
        
        {/* Extra padding for bottom safe area */}
        <View style={{ height: Platform.OS === 'ios' ? 30 : 10 }} />
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}
