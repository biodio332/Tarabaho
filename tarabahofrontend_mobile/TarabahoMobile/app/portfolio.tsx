"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Linking,
  type TextStyle,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"

interface Certificate {
  id: string
  courseName?: string
  certificateNumber?: string
  issueDate?: string
  certificateFilePath?: string
}

// Theme constants for consistent styling
const theme = {
  spacing: {
    xs: 4, // 4px
    sm: 8, // 8px
    md: 16, // 16px
    lg: 24, // 24px
    xl: 32, // 32px
    xxl: 48, // 48px
  },
  colors: {
    primary: {
      light: "#BFDBFE", // blue-200
      main: "#3B82F6", // blue-500
      dark: "#1D4ED8", // blue-700
    },
    secondary: {
      light: "#F3F4F6", // gray-100
      main: "#9CA3AF", // gray-400
      dark: "#374151", // gray-700
    },
    text: {
      primary: "#111827", // gray-900
      secondary: "#4B5563", // gray-600
      tertiary: "#9CA3AF", // gray-400
      inverse: "#FFFFFF", // white
    },
    background: {
      default: "#FFFFFF", // white
      secondary: "#F9FAFB", // gray-50
      tertiary: "#F3F4F6", // gray-100
    },
    border: {
      light: "#E5E7EB", // gray-200
      main: "#D1D5DB", // gray-300
    },
    success: {
      light: "#D1FAE5", // green-100
      main: "#10B981", // green-500
    },
    error: {
      light: "#FEE2E2", // red-100
      main: "#EF4444", // red-500
    },
  },
  typography: {
    h1: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: Platform.select({ ios: "700", android: "700" }) as TextStyle["fontWeight"],
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: Platform.select({ ios: "700", android: "700" }) as TextStyle["fontWeight"],
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: Platform.select({ ios: "600", android: "600" }) as TextStyle["fontWeight"],
    },
    subtitle1: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: Platform.select({ ios: "600", android: "600" }) as TextStyle["fontWeight"],
    },
    subtitle2: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: Platform.select({ ios: "500", android: "500" }) as TextStyle["fontWeight"],
    },
    body1: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: Platform.select({ ios: "400", android: "400" }) as TextStyle["fontWeight"],
    },
    body2: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: Platform.select({ ios: "400", android: "400" }) as TextStyle["fontWeight"],
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: Platform.select({ ios: "400", android: "400" }) as TextStyle["fontWeight"],
    },
  },
  shadows: {
    xs: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  shape: {
    borderRadius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      full: 9999,
    },
  },
}

// Common component styles
const componentStyles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.shape.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.sm,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.shape.borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSecondary: {
    backgroundColor: theme.colors.background.tertiary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.shape.borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDestructive: {
    backgroundColor: theme.colors.error.light,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.shape.borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.lg,
  },
})

// Custom component to display certificate images from Supabase
interface CertificateImageProps {
  filePath: string
  token: string | null // kept for compatibility but not used
  style?: any // Use the appropriate type from react-native StyleSheet
  resizeMode?: "cover" | "contain" | "stretch" | "center" | "repeat"
}

function CertificateImage({ filePath, style, resizeMode }: CertificateImageProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)

  // The filePath is already a complete URL from Supabase
  if (!filePath || !filePath.startsWith("http")) {
    return null
  }

  return (
    <Image
      source={{ uri: filePath }}
      style={style}
      resizeMode={resizeMode || "cover"}
      onLoadStart={() => setLoading(true)}
      onLoadEnd={() => setLoading(false)}
      onError={() => setError(true)}
    />
  )
}

// Ensure backend URL doesn't end with a slash
const BACKEND_URL = (process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8080").replace(/\/$/, "")

interface Project {
  id?: number
  name: string
  description?: string
  technologies?: string[]
  projectImageFilePath?: string
}

interface Skill {
  id?: number
  name: string
  type?: string
  proficiencyLevel?: string
}

interface Experience {
  id?: number
  jobTitle: string
  employer: string
  description?: string
  startDate?: string
  endDate?: string
}

interface Award {
  id?: number
  title: string
  issuer: string
  dateReceived?: string
  description?: string
}

interface Education {
  id?: number
  courseName: string
  institution: string
  startDate?: string
  endDate?: string
  description?: string
}

interface Membership {
  id?: number
  organization: string
  membershipType: string
  startDate?: string
  endDate?: string
}

interface Reference {
  id?: number
  name: string
  position: string
  company: string
  contact?: string
  email?: string
}

interface Portfolio {
  id?: number
  fullName: string
  professionalTitle?: string
  professionalSummary?: string
  primaryCourseType?: string
  scholarScheme?: string
  designTemplate?: string
  customSectionJson?: string
  visibility?: string
  email?: string
  phone?: string
  website?: string
  portfolioCategory?: string
  preferredWorkLocation?: string
  workScheduleAvailability?: string
  salaryExpectations?: string
  avatar?: string

  // TESDA Information
  ncLevel?: string
  trainingCenter?: string
  scholarshipType?: string
  trainingDuration?: string
  tesdaRegistrationNumber?: string

  // Collections
  skills: Skill[]
  experiences: Experience[]
  awardsRecognitions: Award[]
  continuingEducations: Education[]
  professionalMemberships: Membership[]
  references: Reference[]
  projects: Project[]
}
export default function PortfolioScreen() {
  // Component setup
  const router = useRouter()
  const { width: screenWidth } = Dimensions.get("window")

  // State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [graduate, setGraduate] = useState<any>(null)
  const [graduateName, setGraduateName] = useState("")
  const [graduateId, setGraduateId] = useState<number | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

  const renderProfileHeader = () => (
    <View className="mx-4 mt-14 mb-4 overflow-hidden">
      <View className="bg-gradient-to-tr from-blue-900 via-blue-800 to-blue-700 rounded-xl p-5 pb-16">
        <View className="absolute top-0 left-0 right-0 opacity-10">
          <View className="h-32 w-32 rounded-full bg-white absolute -top-10 -left-10 opacity-20" />
          <View className="h-24 w-24 rounded-full bg-white absolute top-20 -right-10 opacity-15" />
        </View>
      </View>
      
      <View className="bg-white rounded-xl shadow-md border border-gray-200 px-5 pt-16 pb-5 -mt-8 z-10">
        <View className="items-center -mt-28 mb-3">
          {graduate?.profilePicture ? (
            <View className="rounded-full p-1.5 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-lg">
              <Image 
                source={{ uri: graduate.profilePicture }} 
                className="w-36 h-36 rounded-full border-2 border-white" 
              />
            </View>
          ) : (
            <View className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-white items-center justify-center shadow-lg">
              <Ionicons name="person" size={54} color="#3B82F6" />
            </View>
          )}
        </View>
        
        <View className="items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2" style={{ fontFamily: "Roboto" }}>
            {portfolio?.fullName || graduateName}
          </Text>
          
          {portfolio?.professionalTitle && (
            <View className="bg-blue-50 px-4 py-2 rounded-full mt-1 border border-blue-100/80">
              <Text className="text-blue-700 font-semibold text-base" style={{ fontFamily: "Roboto" }}>
                {portfolio?.professionalTitle}
              </Text>
            </View>
          )}
          
          {portfolio?.preferredWorkLocation && (
            <View className="flex-row items-center mt-3">
              <Ionicons name="location-outline" size={18} color="#3B82F6" />
              <Text className="text-gray-600 ml-2 text-base font-medium" style={{ fontFamily: "Roboto" }}>{portfolio.preferredWorkLocation}</Text>
            </View>
          )}
        </View>
        
        {portfolio?.email || portfolio?.phone || portfolio?.website ? (
          <View className="flex-row justify-center flex-wrap mt-1">
            {portfolio?.email && (
              <TouchableOpacity 
                onPress={() => Linking.openURL(`mailto:${portfolio.email}`)}
                className="flex-row items-center bg-blue-50 px-4 py-2.5 rounded-full mr-3 mb-2 border border-blue-100"
              >
                <Ionicons name="mail-outline" size={16} color="#2563EB" />
                <Text className="text-blue-700 ml-2 font-semibold text-sm" style={{ fontFamily: "Roboto" }}>Email</Text>
              </TouchableOpacity>
            )}
            
            {portfolio?.phone && (
              <TouchableOpacity 
                onPress={() => Linking.openURL(`tel:${portfolio.phone}`)}
                className="flex-row items-center bg-blue-50 px-4 py-2.5 rounded-full mr-3 mb-2 border border-blue-100"
              >
                <Ionicons name="call-outline" size={16} color="#2563EB" />
                <Text className="text-blue-700 ml-2 font-semibold text-sm" style={{ fontFamily: "Roboto" }}>Call</Text>
              </TouchableOpacity>
            )}
            
            {portfolio?.website && (
              <TouchableOpacity 
                onPress={() => {
                  if (portfolio.website) {
                    Linking.openURL(portfolio.website.startsWith('http') ? portfolio.website : `https://${portfolio.website}`)
                  }
                }}
                className="flex-row items-center bg-blue-50 px-4 py-2.5 rounded-full mb-2 border border-blue-100"
              >
                <Ionicons name="globe-outline" size={16} color="#2563EB" />
                <Text className="text-blue-700 ml-2 font-semibold text-sm" style={{ fontFamily: "Roboto" }}>Website</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </View>
    </View>
  )

  // Load portfolio data
  useEffect(() => {
    const loadPortfolio = async () => {
      setError("")
      setLoading(true)
      try {
        const username = await AsyncStorage.getItem("username")
        if (!username) {
          throw new Error("Missing username. Please log in again.")
        }
        setGraduateName(username)

        let token = await AsyncStorage.getItem("authToken")
        if (!token) {
          const tokenRes = await fetch(`${BACKEND_URL}/api/graduate/get-token`, {
            credentials: "include",
          })
          const tokenJson = await tokenRes.json()
          token = tokenJson?.token
        }

        if (!token) {
          throw new Error("Authentication token is missing. Please sign in again.")
        }

        // Load graduate data
        const gradRes = await fetch(`${BACKEND_URL}/api/graduate/username/${encodeURIComponent(username)}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!gradRes.ok) {
          const data = await gradRes.json().catch(() => ({}))
          throw new Error(data.message || data.error || "Failed to resolve graduate")
        }

        const graduate = await gradRes.json()
        setGraduate(graduate)

        const graduateId = graduate?.id
        setGraduateId(graduateId || null)

        if (!graduateId) {
          throw new Error("Graduate ID not found.")
        }

        // Load portfolio data
        const portRes = await fetch(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (portRes.status === 404) {
          setPortfolio(null)
        } else if (!portRes.ok) {
          const data = await portRes.json().catch(() => ({}))
          throw new Error(data.message || data.error || "Failed to load portfolio")
        } else {
          const data: Portfolio = await portRes.json()
          console.log("Portfolio data received:", JSON.stringify(data, null, 2))
          // console.log("Projects in portfolio:", data.projects ? data.projects.length : 0)
          if (data.projects && data.projects.length > 0) {
            console.log("First project details:", JSON.stringify(data.projects[0], null, 2))
          }
          // console.log("References in portfolio:", data.references ? data.references.length : 0)
          if (data.references && data.references.length > 0) {
            console.log("First reference details:", JSON.stringify(data.references[0], null, 2))
            
            // Ensure references data is properly structured
            data.references = data.references.map(ref => ({
              id: ref.id,
              name: ref.name || '',
              position: ref.position || '',
              company: ref.company || '',
              contact: ref.contact || '',
              email: ref.email || ''
            }))
          }
          setPortfolio(data)
        }

        // Load certificates
        const certRes = await fetch(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (certRes.ok) {
          const certs = await certRes.json()
          setCertificates(Array.isArray(certs) ? certs : [])
        }

        setAuthToken(token)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    loadPortfolio()
  }, [])

  // Handle portfolio deletion
  const handleDeletePortfolio = async () => {
    Alert.alert("Delete Portfolio", "Are you sure you want to delete this portfolio? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!graduateId || !authToken) {
            setError("Missing authentication or graduate ID.")
            return
          }

          try {
            const res = await fetch(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${authToken}` },
              credentials: "include",
            })

            if (!res.ok) {
              const data = await res.json().catch(() => ({}))
              throw new Error(data.message || data.error || "Failed to delete portfolio")
            }

            Alert.alert("Success", "Portfolio deleted successfully.")
            router.push("/graduatehomepage")
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error")
          }
        },
      },
    ])
  }

  // Certificate modal handlers
  const handleCertificatePress = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
  }

  const closeCertificateModal = () => {
    setSelectedCertificate(null)
  }

  // Render main content if portfolio exists
  const renderPortfolioContent = () => {
    if (!portfolio) return null

    return (
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1 bg-gray-50"
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}>
        {renderProfileHeader()}
        {/* Main Content */}
        <View className="px-4 py-6">{/* Portfolio sections will be rendered here */}</View>
      </ScrollView>
    )
  }

  const renderBackButton = () => (
    <View className="absolute top-12 left-4 z-20">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md active:opacity-90 border border-gray-200"
      >
        <Ionicons name="chevron-back" size={22} color="#1D4ED8" />
      </TouchableOpacity>
    </View>
  )

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  )

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center p-6">
      <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
        <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
      </View>
      <Text className="text-red-600 text-center font-medium">{error}</Text>
    </View>
  )

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-6">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name="document-outline" size={32} color="#6B7280" />
      </View>
      <Text className="text-gray-600 text-center mb-6 text-lg">
        Create your professional portfolio to showcase your skills and experience.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/createportfolio")}
        className="bg-blue-600 px-8 py-3 rounded-full shadow-sm"
      >
        <Text className="text-white font-semibold text-base">Create Portfolio</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {loading ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : !portfolio ? (
        renderEmptyState()
      ) : (
        <>
          {renderBackButton()}
          <ScrollView
            className="flex-1 bg-gray-50"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
          >
            {renderProfileHeader()}

              <View className="px-4">
                {/* About Section */}
                <View className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <View className="px-5 py-4 border-b border-gray-100">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <Ionicons name="person-outline" size={20} color="#2563EB" />
                      </View>
                      <Text className="text-lg font-bold text-gray-900" style={{ fontFamily: "Roboto" }}>
                        About Me
                      </Text>
                    </View>
                  </View>
                  
                  <View className="p-5">
                    <Text className="text-gray-700 leading-6 text-base" style={{ fontFamily: "Roboto" }}>
                      {portfolio.professionalSummary ? 
                        portfolio.professionalSummary : 
                        <Text className="text-gray-500 italic">No summary provided</Text>
                      }
                    </Text>
                      
                    {portfolio.ncLevel && (
                      <View className="mt-4 pt-4 border-t border-gray-100">
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                            <Ionicons name="school-outline" size={16} color="#2563EB" />
                          </View>
                          <Text className="font-semibold text-blue-800 text-sm ml-3" style={{ fontFamily: "Roboto" }}>
                            {String(portfolio.ncLevel)}
                            {portfolio.trainingCenter ? ` at ${portfolio.trainingCenter}` : ''}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>              {/* Skills Section */}
              {portfolio.skills?.length > 0 && (
                <View className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
                  <View className="px-5 py-4 border-b border-gray-100">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <Ionicons name="hammer-outline" size={20} color="#2563EB" />
                      </View>
                      <Text className="text-lg font-bold text-gray-900" style={{ fontFamily: "Roboto" }}>
                        Professional Skills
                      </Text>
                    </View>
                  </View>
                  
                  <View className="p-5">
                    <View className="space-y-4">
                      {portfolio.skills.map((skill, index) => (
                        <View 
                          key={index} 
                          className="bg-gradient-to-r from-blue-50/50 to-blue-50/30 rounded-xl border border-blue-100 p-5 mb-3"
                          style={{
                            backgroundColor: '#f8fafc',
                            borderColor: '#e2e8f0',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 3,
                            elevation: 2,
                          }}
                        >
                          {/* Main skill name - larger and more prominent */}
                          <View className="mb-4">
                            <Text 
                              className="text-gray-900 font-bold text-xl" 
                              style={{ fontFamily: "Roboto" }}
                            >
                              {skill.name}
                            </Text>
                          </View>
                          
                          {/* Bottom row with type and proficiency */}
                          <View className="flex-row justify-between items-center">
                            {/* Skill type */}
                            {skill.type && (
                              <View className="bg-blue-600 px-4 py-2 rounded-full">
                                <Text className="text-white text-sm font-bold" style={{ fontFamily: "Roboto" }}>
                                  {skill.type.replace(/_/g, ' ').toUpperCase()}
                                </Text>
                              </View>
                            )}
                            
                            {/* Proficiency level with colored indicator */}
                            {skill.proficiencyLevel && (
                              <View className="flex-row items-center">
                                <View className={`w-4 h-4 rounded-full mr-3 ${
                                  skill.proficiencyLevel.toLowerCase().includes('beginner') ? 'bg-yellow-500' : 
                                  skill.proficiencyLevel.toLowerCase().includes('intermediate') ? 'bg-orange-500' : 
                                  skill.proficiencyLevel.toLowerCase().includes('advanced') ? 'bg-green-500' :
                                  'bg-blue-500'
                                }`} />
                                <Text className="text-gray-800 text-base font-semibold" style={{ fontFamily: "Roboto" }}>
                                  {skill.proficiencyLevel}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Experience Section */}
              {portfolio.experiences?.length > 0 && (
                <View className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <View className="px-5 py-4 border-b border-gray-100">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <Ionicons name="briefcase-outline" size={20} color="#2563EB" />
                      </View>
                      <Text className="text-lg font-bold text-gray-900" style={{ fontFamily: "Roboto" }}>
                        Work Experience
                      </Text>
                    </View>
                  </View>
                  
                  <View className="p-5">
                    {portfolio.experiences.map((experience, index) => (
                      <View
                        key={index}
                        className={`${
                          index < portfolio.experiences.length - 1 ? "mb-5 pb-5 border-b border-gray-100" : ""
                        }`}
                      >
                        <View className="flex-row items-start">
                          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                            <Ionicons name="business-outline" size={18} color="#2563EB" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: "Roboto" }}>{experience.jobTitle}</Text>
                            <Text className="text-base text-blue-600 font-semibold mb-2" style={{ fontFamily: "Roboto" }}>{experience.employer}</Text>
                            <View className="flex-row items-center mt-1 mb-3">
                              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                              <Text className="text-sm text-gray-600 ml-2 font-medium" style={{ fontFamily: "Roboto" }}>
                                {experience.startDate} - {experience.endDate || "Present"}
                              </Text>
                            </View>
                            {experience.description && (
                              <View className="bg-gray-50 rounded-lg p-4 mt-2">
                                <Text className="text-gray-700 text-sm leading-6" style={{ fontFamily: "Roboto" }}>{experience.description}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Awards Section */}
              {portfolio.awardsRecognitions?.length > 0 && (
                <View className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
                  <View className="px-5 py-4 border-b border-gray-100">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <Ionicons name="trophy-outline" size={20} color="#2563EB" />
                      </View>
                      <Text className="text-lg font-bold text-gray-900" style={{ fontFamily: "Roboto" }}>
                        Awards & Recognitions
                      </Text>
                    </View>
                  </View>
                  
                  <View className="p-5">
                    {portfolio.awardsRecognitions.map((award, index) => (
                      <View
                        key={index}
                        className={`${
                          index < portfolio.awardsRecognitions.length - 1 ? "mb-5 pb-5 border-b border-gray-100" : ""
                        }`}
                      >
                        <View className="flex-row items-start">
                          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                            <Ionicons name="medal-outline" size={18} color="#2563EB" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: "Roboto" }}>{award.title}</Text>
                            <Text className="text-base text-blue-600 font-semibold mb-2" style={{ fontFamily: "Roboto" }}>{award.issuer}</Text>
                            {award.dateReceived && (
                              <View className="flex-row items-center mt-1 mb-3">
                                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                                <Text className="text-sm text-gray-600 ml-2 font-medium" style={{ fontFamily: "Roboto" }}>{award.dateReceived}</Text>
                              </View>
                            )}
                            {award.description && (
                              <View className="bg-gray-50 rounded-lg p-4 mt-2">
                                <Text className="text-gray-700 text-sm leading-6" style={{ fontFamily: "Roboto" }}>{award.description}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Certificates Gallery */}
              {certificates?.length > 0 && (
                <View className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <View className="px-4 py-3 border-b border-gray-100">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                        <Ionicons name="ribbon-outline" size={18} color="#2563EB" />
                      </View>
                      <Text className="text-base font-bold text-gray-800" style={{ fontFamily: "Roboto" }}>
                        Certifications
                      </Text>
                    </View>
                  </View>
                  
                  <View className="p-4">
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      className="flex-row"
                      bounces={false}
                      overScrollMode="never"
                      scrollEventThrottle={16}>
                      {certificates.map((cert, index) => (
                        <TouchableOpacity
                          key={cert.id || index}
                          onPress={() => handleCertificatePress(cert)}
                          className="mr-3 last:mr-0"
                        >
                          <View className="shadow-sm rounded-lg overflow-hidden border border-gray-200">
                            {cert.certificateFilePath ? (
                              <CertificateImage
                                filePath={cert.certificateFilePath}
                                token={authToken}
                                style={{
                                  width: screenWidth * 0.4,
                                  height: screenWidth * 0.28,
                                }}
                                resizeMode="cover"
                              />
                            ) : (
                              <View
                                className="bg-gray-100 items-center justify-center"
                                style={{
                                  width: screenWidth * 0.4,
                                  height: screenWidth * 0.28,
                                }}
                              >
                                <Ionicons name="document-outline" size={24} color="#3B82F6" />
                                <Text className="text-blue-500 mt-1 text-xs" style={{ fontFamily: "Roboto" }}>No image</Text>
                              </View>
                            )}
                            <View className="bg-white p-2 border-t border-gray-100">
                              <Text className="text-sm font-medium text-gray-800" numberOfLines={1} style={{ fontFamily: "Roboto" }}>
                                {cert.courseName || "Certificate"}
                              </Text>
                              <View className="flex-row items-center mt-1">
                                <Ionicons name="calendar-outline" size={12} color="#3B82F6" />
                                <Text className="text-xs text-blue-500 ml-1" style={{ fontFamily: "Roboto" }}>{cert.issueDate || "No date"}</Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}

              {/* Projects Section */}
              {portfolio.projects?.length > 0 && (
                <View className="mb-6 overflow-hidden">
                  <View className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <View className="px-4 py-3 border-b border-gray-100">
                      <View className="flex-row items-center">
                        <View className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center shadow-sm">
                          <Ionicons name="code-slash-outline" size={18} color="#3B82F6" />
                        </View>
                        <Text className="text-base font-bold text-gray-900 ml-3" style={{ fontFamily: "Roboto" }}>
                          Portfolio Projects
                        </Text>
                      </View>
                    </View>
                    
                    <View className="p-4">
                      {portfolio.projects.map((project, index) => (
                        <View
                          key={index}
                          className={`${
                            index < portfolio.projects.length - 1 ? "mb-5 pb-5 border-b border-gray-100" : ""
                          }`}
                        >
                          <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                              <Ionicons name="folder-open-outline" size={16} color="#3B82F6" />
                            </View>
                            <Text className="text-base font-semibold text-gray-800" style={{ fontFamily: "Roboto" }}>{project.name}</Text>
                          </View>
                          
                          {project.projectImageFilePath ? (
                            <View className="mb-3 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                              <Image
                                source={{ uri: project.projectImageFilePath }}
                                style={{
                                  width: "100%",
                                  height: screenWidth * 0.5,
                                }}
                                resizeMode="cover"
                                onError={(e) => console.log("Image loading error:", e.nativeEvent.error)}
                              />
                            </View>
                          ) : (
                            <View className="mb-3 bg-gray-100 rounded-lg items-center justify-center border border-gray-200" style={{ height: screenWidth * 0.4 }}>
                              <Ionicons name="image-outline" size={32} color="#3B82F6" />
                              <Text className="text-blue-500 text-sm mt-2" style={{ fontFamily: "Roboto" }}>No project image available</Text>
                            </View>
                          )}
                          
                          {project.description && (
                            <View className="mb-3 bg-blue-50 rounded-lg p-4 border border-blue-100/30">
                              <Text className="text-gray-700 text-sm leading-5" style={{ fontFamily: "Roboto" }}>{project.description}</Text>
                            </View>
                          )}
                          
                          {project.technologies && project.technologies.length > 0 && (
                            <View className="flex-row flex-wrap gap-2 mt-2">
                              {project.technologies.map((tech, techIndex) => (
                                <View key={techIndex} className="bg-blue-100/70 rounded-full px-3 py-1.5 border border-blue-200/50">
                                  <Text className="text-blue-700 text-xs font-medium" style={{ fontFamily: "Roboto" }}>{tech}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Education Section */}
              {portfolio.continuingEducations?.length > 0 && (
                <View className="mb-6 overflow-hidden">
                  <View className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <View className="px-4 py-3 border-b border-gray-100">
                      <View className="flex-row items-center">
                        <View className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center shadow-sm">
                          <Ionicons name="school-outline" size={18} color="#3B82F6" />
                        </View>
                        <Text className="text-base font-bold text-gray-900 ml-3" style={{ fontFamily: "Roboto" }}>
                          Education & Training
                        </Text>
                      </View>
                    </View>
                    
                    <View className="p-4">
                      {portfolio.continuingEducations.map((education, index) => (
                        <View
                          key={index}
                          className={`${
                            index < portfolio.continuingEducations.length - 1 ? "mb-4 pb-4 border-b border-gray-100" : ""
                          }`}
                        >
                          <View className="flex-row items-start">
                            <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center mr-3">
                              <Ionicons name="book-outline" size={18} color="#3B82F6" />
                            </View>
                            <View className="flex-1">
                              <Text className="text-base font-semibold text-gray-800" style={{ fontFamily: "Roboto" }}>{education.courseName}</Text>
                              <Text className="text-sm text-blue-600 font-medium" style={{ fontFamily: "Roboto" }}>{education.institution}</Text>
                              <View className="flex-row items-center mt-1 mb-2">
                                <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                                <Text className="text-xs text-gray-500 ml-1" style={{ fontFamily: "Roboto" }}>
                                  {education.startDate} - {education.endDate || "Present"}
                                </Text>
                              </View>
                              {education.description && (
                                <View className="bg-blue-50 rounded-lg p-3 mt-2 border border-blue-100/30">
                                  <Text className="text-gray-700 text-xs leading-5" style={{ fontFamily: "Roboto" }}>{education.description}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* TESDA Information Section */}
              {portfolio.ncLevel && (
                <View className="mb-6 overflow-hidden">
                  <View className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <View className="px-5 py-4 border-b border-gray-100">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center shadow-sm mr-3">
                          <Ionicons name="medal-outline" size={20} color="#3B82F6" />
                        </View>
                        <Text className="text-lg font-bold text-gray-900" style={{ fontFamily: "Roboto" }}>
                          TESDA Certification
                        </Text>
                      </View>
                    </View>
                    
                    <View className="p-5">
                      <View className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                        <View className="p-4 flex-row">
                          <View className="w-1/3">
                            <Text className="text-blue-600 text-sm font-semibold" style={{ fontFamily: "Roboto" }}>NC Level</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-900 font-bold text-base" style={{ fontFamily: "Roboto" }}>{String(portfolio.ncLevel)}</Text>
                          </View>
                        </View>
                        
                        {portfolio.trainingCenter && (
                          <View className="p-4 flex-row">
                            <View className="w-1/3">
                              <Text className="text-blue-600 text-sm font-semibold" style={{ fontFamily: "Roboto" }}>Training Center</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-900 font-bold text-base" style={{ fontFamily: "Roboto" }}>{portfolio.trainingCenter}</Text>
                            </View>
                          </View>
                        )}
                        
                        {portfolio.scholarshipType && (
                          <View className="p-4 flex-row">
                            <View className="w-1/3">
                              <Text className="text-blue-600 text-sm font-semibold" style={{ fontFamily: "Roboto" }}>Scholarship</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-900 font-bold text-base" style={{ fontFamily: "Roboto" }}>{portfolio.scholarshipType}</Text>
                            </View>
                          </View>
                        )}
                        
                        {portfolio.trainingDuration && (
                          <View className="p-4 flex-row">
                            <View className="w-1/3">
                              <Text className="text-blue-600 text-sm font-semibold" style={{ fontFamily: "Roboto" }}>Duration</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-900 font-bold text-base" style={{ fontFamily: "Roboto" }}>{portfolio.trainingDuration}</Text>
                            </View>
                          </View>
                        )}
                        
                        {portfolio.tesdaRegistrationNumber && (
                          <View className="p-4 flex-row">
                            <View className="w-1/3">
                              <Text className="text-blue-600 text-sm font-semibold" style={{ fontFamily: "Roboto" }}>Registration No.</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-900 font-bold text-base" style={{ fontFamily: "Roboto" }}>{String(portfolio.tesdaRegistrationNumber)}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* References Section */}
              {portfolio.references?.length > 0 && (
                <View className="mb-6">
                  <View className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <View className="px-5 py-4 border-b border-gray-100">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                          <Ionicons name="people-outline" size={20} color="#2563EB" />
                        </View>
                        <Text className="text-lg font-bold text-gray-900" style={{ fontFamily: "Roboto" }}>
                          Professional References
                        </Text>
                      </View>
                    </View>
                    
                    <View className="p-5">
                      {portfolio.references.map((reference, index) => (
                        <View
                          key={index}
                          className={`${
                            index < portfolio.references.length - 1 ? "mb-6 pb-6 border-b border-gray-100" : ""
                          }`}
                        >
                          <View className="flex-row items-start">
                            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
                              <Ionicons name="person-outline" size={20} color="#2563EB" />
                            </View>
                            <View className="flex-1">
                              <Text className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: "Roboto" }}>
                                {reference.name || "No name provided"}
                              </Text>
                              
                              {reference.position && (
                                <Text className="text-base text-gray-700 font-medium mb-1" style={{ fontFamily: "Roboto" }}>
                                  {reference.position}
                                </Text>
                              )}
                              
                              {reference.company && (
                                <Text className="text-sm text-blue-600 font-medium mb-3" style={{ fontFamily: "Roboto" }}>
                                  {reference.company}
                                </Text>
                              )}
                              
                              <View className="mt-2">
                                {reference.email && reference.email.trim() !== '' && (
                                  <TouchableOpacity 
                                    onPress={() => Linking.openURL(`mailto:${reference.email}`)}
                                    className="flex-row items-center mb-2"
                                  >
                                    <Ionicons name="mail-outline" size={16} color="#2563EB" />
                                    <Text className="text-gray-700 text-sm font-medium ml-2" style={{ fontFamily: "Roboto" }}>
                                      {reference.email}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                                
                                {reference.contact && reference.contact.trim() !== '' && (
                                  <TouchableOpacity 
                                    onPress={() => Linking.openURL(`tel:${reference.contact}`)}
                                    className="flex-row items-center"
                                  >
                                    <Ionicons name="call-outline" size={16} color="#2563EB" />
                                    <Text className="text-gray-700 text-sm font-medium ml-2" style={{ fontFamily: "Roboto" }}>
                                      {reference.contact}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
              
              {/* Profile Action Buttons */}
              <View className="mb-8 mt-4 px-2">
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    onPress={handleDeletePortfolio}
                    className="flex-1 bg-red-600 py-3.5 rounded-lg mb-0 active:opacity-90"
                    style={{
                      elevation: 2,
                      shadowColor: "#f87171",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                    }}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text className="text-white font-semibold text-center text-base" style={{ fontFamily: "Roboto" }}>
                        Delete Profile
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (portfolio?.id && graduateId) {
                        router.push({
                          pathname: "/editportfolio",
                          params: {
                            portfolioId: portfolio.id,
                            graduateId: graduateId
                          }
                        });
                      }
                    }}
                    className="flex-1 bg-blue-600 py-3.5 rounded-lg active:opacity-90"
                    style={{
                      elevation: 2,
                      shadowColor: "#60a5fa",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                    }}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text className="text-white font-semibold text-center text-base" style={{ fontFamily: "Roboto" }}>
                        Edit Profile
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Certificate Preview Modal */}
          <Modal
            visible={selectedCertificate !== null}
            transparent={true}
            animationType="fade"
            onRequestClose={closeCertificateModal}
            statusBarTranslucent={true}
          >
            <View className="flex-1 bg-black/95 justify-center items-center">
              <TouchableOpacity
                onPress={closeCertificateModal}
                className="absolute right-6 top-12 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md items-center justify-center z-10 border border-white/20"
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {selectedCertificate && (
                <View className="w-full p-5">
                  <View className="mb-6 px-2">
                    <View className="w-16 h-1 bg-white/30 mx-auto mb-6 rounded-full" />
                    
                    <Text className="text-2xl font-bold text-white text-center mb-2" style={{ fontFamily: "Roboto" }}>
                      {selectedCertificate?.courseName || "Certificate"}
                    </Text>
                    
                    <View className="flex-row items-center justify-center mb-1">
                      {selectedCertificate?.certificateNumber && (
                        <View className="flex-row items-center">
                          <Ionicons name="document-text-outline" size={14} color="#93C5FD" style={{ marginRight: 4 }} />
                          <Text className="text-base text-blue-300" style={{ fontFamily: "Roboto" }}>{selectedCertificate.certificateNumber}</Text>
                        </View>
                      )}
                    </View>
                    
                    {selectedCertificate?.issueDate && (
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="calendar-outline" size={14} color="#93C5FD" style={{ marginRight: 4 }} />
                        <Text className="text-sm text-blue-300" style={{ fontFamily: "Roboto" }}>Issued: {selectedCertificate.issueDate}</Text>
                      </View>
                    )}
                  </View>

                  {selectedCertificate?.certificateFilePath ? (
                    <View className="rounded-xl overflow-hidden shadow-2xl" style={{
                      shadowColor: "#3B82F6",
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.3,
                      shadowRadius: 20,
                    }}>
                      <CertificateImage
                        filePath={selectedCertificate.certificateFilePath}
                        token={authToken}
                        style={{
                          width: screenWidth - 32,
                          height: screenWidth * 0.8,
                        }}
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    <View className="w-full h-96 items-center justify-center bg-gradient-to-b from-blue-900/30 to-black/50 rounded-2xl">
                      <Ionicons name="document-outline" size={70} color="#3B82F6" />
                      <Text className="text-blue-300 mt-6 text-lg" style={{ fontFamily: "Roboto" }}>No certificate image available</Text>
                    </View>
                  )}
                  
                  <TouchableOpacity
                    onPress={closeCertificateModal}
                    className="mt-8 bg-blue-700/20 py-4 rounded-xl backdrop-blur-md border border-blue-500/20"
                  >
                    <Text className="text-white text-center font-medium" style={{ fontFamily: "Roboto" }}>Close Preview</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Modal>

          {/* Touchable Background Overlay (visible when modal is open) */}
          {selectedCertificate && (
            <TouchableOpacity onPress={closeCertificateModal} className="absolute inset-0 bg-black/50" />
          )}
        </>
      )}
    </SafeAreaView>
  )
}
