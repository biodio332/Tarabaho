
import { useEffect, useState } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar
} from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { DatePicker } from "../components/ui/DatePicker"
import { API_CONFIG } from '@/config';

const BACKEND_URL = API_CONFIG.BACKEND_URL;

type Graduate = {
  id?: number
  username?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  address?: string
  birthday?: string
  biography?: string
  profilePicture?: string
  isVerified?: boolean
  [key: string]: unknown
}

export default function GraduateProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [imageUploading, setImageUploading] = useState(false)
  const [error, setError] = useState("")
  const [graduate, setGraduate] = useState<Graduate | null>(null)
  const [form, setForm] = useState({ email: "", address: "", birthday: "", biography: "", password: "" })
  const [birthdayDate, setBirthdayDate] = useState<Date>(new Date())
  const [uploadAttempts, setUploadAttempts] = useState(0) // Track upload attempts
  
  // Handle profile picture selection
  const pickImage = async () => {
    try {
      // Check and request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos');
        return;
      }
      
      // Check both token and username before continuing
      const username = await AsyncStorage.getItem("username");
      const token = await AsyncStorage.getItem("authToken");
      
      if (!username || !token) {
        Alert.alert(
          "Session Error",
          "You need to be logged in to change your profile picture.",
          [{ text: "Log In", onPress: () => router.replace('/logingraduate') }]
        );
        return;
      }
      
      // Skip token validation before image selection to minimize issues
      
      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Lower quality for better upload performance
        base64: false,
        exif: false,
      });
      
      // Check if user canceled
      if (result.canceled) {
        console.log("Image selection canceled");
        return;
      }
      
      // Check if an image was selected
      if (result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        console.log("Image selected:", {
          uri: selectedAsset.uri,
          width: selectedAsset.width,
          height: selectedAsset.height
        });
        
        // Verify the URI is valid
        if (!selectedAsset.uri) {
          throw new Error("Selected image URI is invalid");
        }
        
        // Reset upload attempts counter
        setUploadAttempts(0);
        
        // Refresh graduate data before uploading to ensure we have fresh data
        try {
          await refreshGraduateData();
          
          // Process the image after refresh
          try {
            await uploadProfileImage(selectedAsset.uri);
          } catch (uploadError) {
            const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
            
            // Only show error if it's not an authentication error (which is handled in uploadProfileImage)
            if (!errorMessage.includes("Authentication failed") && !errorMessage.includes("Session expired")) {
              Alert.alert('Upload Failed', errorMessage);
            }
          }
        } catch (refreshError) {
          console.error("Error refreshing graduate data:", refreshError);
          const errorMessage = refreshError instanceof Error ? refreshError.message : 'Unknown error';
          Alert.alert('Error', 'Failed to prepare upload: ' + errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Image picker error:', errorMessage);
      
      // Don't show alert for cancel operations
      if (errorMessage !== "Image selection canceled or no asset selected") {
        Alert.alert('Error', 'Failed to select image: ' + errorMessage);
      }
    }
  };
  
  // Function to refresh graduate data
  const refreshGraduateData = async () => {
    try {
      const username = await AsyncStorage.getItem("username");
      const token = await AsyncStorage.getItem("authToken");
      
      if (!username || !token) {
        throw new Error("Missing credentials");
      }
      
      console.log("Refreshing graduate data for username:", username);
      
      const profileRes = await fetch(`${BACKEND_URL}/api/graduate/username/${encodeURIComponent(username)}`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });
      
      if (profileRes.status === 401) {
        console.error("Authentication failed when refreshing profile");
        await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username', 'userId', 'graduateId', 'portfolioId']);
        router.replace('/logingraduate');
        throw new Error("Session expired. Please log in again.");
      }
      
      if (!profileRes.ok) {
        throw new Error(`Failed to refresh profile (${profileRes.status})`);
      }
      
      const data: Graduate = await profileRes.json();
      console.log("Refreshed graduate data:", data);
      
      // Update graduate state
      setGraduate(data);
      
      return data;
    } catch (error) {
      console.error("Error refreshing graduate data:", error);
      throw error;
    }
  };
  
  // Upload profile image to server using FormData and fetch
  const uploadProfileImage = async (imageUri: string) => {
    console.log("Starting uploadProfileImage function with URI:", imageUri);
    // Increment attempt counter to help with debugging
    setUploadAttempts(prev => prev + 1);
    
    if (!graduate?.id) {
      console.error("Missing graduate ID");
      setError("Missing graduate ID.");
      return;
    }
    
    setImageUploading(true);
    
    try {
      // Verify we have fresh credentials before proceeding
      const username = await AsyncStorage.getItem("username");
      const token = await AsyncStorage.getItem("authToken");
      
      if (!username) {
        console.error("Username missing from storage");
        throw new Error("Missing authentication data. Please log in again.");
      }
      
      if (!token) {
        console.error("Token missing from storage");
        throw new Error("Authentication token is missing. Please sign in again.");
      }
      
      // Create proper FormData for multipart/form-data
      const formData = new FormData();
      
      // Get the filename from the URI
      const filename = imageUri.split('/').pop() || 'profile.jpg';
      
      // Create the file object with correct platform handling for iOS
      const fileObject = {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        name: filename,
        type: 'image/jpeg', // Default to JPEG for better compatibility
      };
      
      console.log(`Uploading image: ${filename} from ${imageUri}`);
      
      // Append the file to the form data using the field name 'file' to match web implementation
      // @ts-ignore - TypeScript doesn't recognize the React Native FormData structure
      formData.append('file', fileObject);
      
      // Log formData contents for debugging
      console.log("FormData created for upload");
      
      // Use the same endpoint pattern as the web implementation
      const uploadUrl = `${BACKEND_URL}/api/graduate/${graduate.id}/upload-picture`;
      console.log(`Making request to: ${uploadUrl}`);
      console.log(`Using token: ${token.substring(0, 10)}...`);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // Don't set Content-Type, let fetch set it with the correct boundary
        }
      });
      
      console.log(`Upload response status: ${response.status}`);
      
      // Check if unauthorized
      if (response.status === 401 || response.status === 403) {
        console.error(`Authentication failed with status: ${response.status}`);
        await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username', 'userId', 'graduateId', 'portfolioId']);
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [{ text: "OK", onPress: () => router.replace('/logingraduate') }]
        );
        throw new Error("Authentication failed. Please log in again.");
      }
      
      // Check if the request was successful
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = "Could not read error response";
        }
        console.error(`Upload failed with status: ${response.status}. Response: ${errorText}`);
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      // Parse the response
      let responseText;
      try {
        responseText = await response.text();
        console.log("Response text:", responseText);
      } catch (e) {
        console.error("Error reading response text:", e);
        throw new Error("Failed to read server response");
      }
      
      let data;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
          console.log("Response data:", data);
        } catch (e) {
          console.error("Error parsing response JSON:", e);
          throw new Error("Invalid response from server");
        }
      } else {
        console.log("Empty response from server");
      }
      
      // Refresh data to get updated profile picture
      await refreshGraduateData();
      
      // Force a refresh to show the new image with a timestamp to bust cache
      const timestamp = new Date().getTime();
      if (graduate?.profilePicture) {
        setGraduate(prev => prev ? { 
          ...prev, 
          profilePicture: `${prev.profilePicture}?t=${timestamp}` 
        } : null);
      }
      
      Alert.alert("Success", "Profile picture updated successfully");
      return data;
      
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Only show error alert if it's not an authentication error (which we already handled)
      if (!errorMessage.includes("Authentication failed") && !errorMessage.includes("Session expired")) {
        Alert.alert('Upload Failed', errorMessage);
      }
      throw error;
    } finally {
      setImageUploading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setError("")
      setLoading(true)
      try {
        // Get username and token
        const username = await AsyncStorage.getItem("username")
        if (!username) {
          setError("Missing username. Please log in again.")
          router.push("/logingraduate")
          return
        }
        
        const token = await AsyncStorage.getItem("authToken")
        if (!token) {
          setError("Authentication token is missing. Please sign in again.")
          router.push("/logingraduate")
          return
        }
        
        console.log(`Fetching profile for username: ${username}`);
        console.log(`Using token (length: ${token.length})`);
        
        // Fetch the profile data
        const profileRes = await fetch(`${BACKEND_URL}/api/graduate/username/${encodeURIComponent(username)}`, {
          method: "GET",
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          },
          credentials: 'include' // Include cookies if any
        })
        
        console.log("Profile response status:", profileRes.status);
        
        if (!profileRes.ok) {
          // Handle 401 Unauthorized specially
          if (profileRes.status === 401) {
            console.error("Authentication failed when fetching profile");
            await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username', 'userId', 'graduateId', 'portfolioId']);
            router.replace('/logingraduate');
            throw new Error("Session expired. Please log in again.");
          }
          
          // Handle other errors
          const data = await profileRes.json().catch(() => ({}))
          throw new Error(data.message || data.error || `Failed to load profile (${profileRes.status})`)
        }
        
        // Parse the profile data
        const data: Graduate = await profileRes.json()
        
        // Debug log to check profile picture URL
        console.log("Graduate data:", data)
        console.log("Profile picture URL:", data.profilePicture)
        
        // Add timestamp to prevent caching issues with the profile picture
        if (data.profilePicture) {
          const timestamp = new Date().getTime();
          data.profilePicture = `${data.profilePicture}?t=${timestamp}`;
        }
        
        // Update state with the profile data
        setGraduate(data)
        setForm({
          email: data.email || "",
          address: data.address || "",
          birthday: data.birthday || "",
          biography: (data as any).biography || "",
          password: "",
        })
        
        // Set birthday date if available
        if (data.birthday) {
          const parsedDate = new Date(data.birthday)
          if (!isNaN(parsedDate.getTime())) {
            setBirthdayDate(parsedDate)
          }
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        console.error("Error fetching profile:", errorMessage);
        
        // Don't show error for session expiration - we're redirecting
        if (!errorMessage.includes("Session expired")) {
          setError(errorMessage);
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [])

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError("")
  }

  const handleBirthdayChange = (date: Date) => {
    setBirthdayDate(date)
    // Format date as YYYY-MM-DD for the form
    const formattedDate = date.toISOString().split('T')[0]
    setForm((prev) => ({ ...prev, birthday: formattedDate }))
    setError("")
  }

  const handleSave = async () => {
    if (!graduate?.id) {
      setError("Missing graduate ID.")
      return
    }
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem("authToken")
      if (!token) {
        throw new Error("Authentication token is missing. Please sign in again.")
      }
      const updatePayload: any = {
        ...graduate,
        email: form.email,
        address: form.address,
        birthday: form.birthday,
        biography: form.biography,
      }
      if (!form.password) {
        delete updatePayload.password
      } else {
        updatePayload.password = form.password
      }
      const res = await fetch(`${BACKEND_URL}/api/graduate/${graduate.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(updatePayload),
      })
      
      if (res.status === 401) {
        console.error("Authentication failed when updating profile");
        await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username', 'userId', 'graduateId', 'portfolioId']);
        router.replace('/logingraduate');
        throw new Error("Session expired. Please log in again.");
      }
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || data.error || "Failed to update profile")
      }
      
      const updated = await res.json()
      setGraduate(updated)
      setForm((prev) => ({ ...prev, password: "" }))
      Alert.alert("Success", "Profile updated")
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      setError(errorMessage)
      
      // Don't show error for session expiration - we're redirecting
      if (!errorMessage.includes("Session expired")) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Determine verification status - similar to web implementation
  const getVerificationStatus = () => {
    if (graduate?.isVerified) {
      return { 
        text: "Verified", 
        textColor: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-200" 
      };
    }
    return { 
      text: "Not Verified", 
      textColor: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-200"
    };
  };
  
  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('GraduateProfile - Starting logout process...');
              
              // Clear ALL authentication and session related data
              const keysToRemove = ['authToken', 'isLoggedIn', 'userType', 'username', 'userId', 'graduateId', 'portfolioId'];
              await AsyncStorage.multiRemove(keysToRemove);
              
              console.log('GraduateProfile - Cleared AsyncStorage keys:', keysToRemove);
              console.log('GraduateProfile - Redirecting to graduate login...');
              
              router.replace('/logingraduate');
            } catch (error) {
              console.error('GraduateProfile - Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header with gradient background */}
      <View style={{
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.push('/graduatehomepage')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#111827',
            letterSpacing: -0.5,
          }}>My Profile</Text>
          
          <View style={{ width: 40 }} />
        </View>
      </View>
      
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
          <View style={{
            backgroundColor: '#ffffff',
            paddingHorizontal: 32,
            paddingVertical: 24,
            borderRadius: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={{
              marginTop: 16,
              fontSize: 16,
              fontWeight: '500',
              color: '#6b7280',
            }}>Loading your profile...</Text>
          </View>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{
            backgroundColor: '#ffffff',
            padding: 32,
            borderRadius: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
            maxWidth: 320,
          }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#fee2e2',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="alert-circle" size={32} color="#dc2626" />
            </View>
            <Text style={{
              color: '#dc2626',
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 8,
            }}>Something went wrong</Text>
            <Text style={{
              color: '#6b7280',
              textAlign: 'center',
              fontSize: 14,
              lineHeight: 20,
              marginBottom: 24,
            }}>{error}</Text>
            <TouchableOpacity 
              onPress={() => router.push('/graduatehomepage')}
              style={{
                backgroundColor: '#2563eb',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                minWidth: 120,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView 
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Profile Header Card */}
          <View style={{
            backgroundColor: '#ffffff',
            marginHorizontal: 16,
            marginTop: 20,
            marginBottom: 16,
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}>
            <TouchableOpacity 
              style={{ 
                position: 'relative', 
                marginBottom: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8,
              }}
              onPress={pickImage}
              disabled={imageUploading}
              activeOpacity={0.8}
            >
              {imageUploading ? (
                <View style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: '#dbeafe',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: '#ffffff',
                }}>
                  <ActivityIndicator size="large" color="#2563eb" />
                  <Text style={{
                    marginTop: 8,
                    fontSize: 12,
                    fontWeight: '500',
                    color: '#2563eb',
                  }}>Uploading...</Text>
                </View>
              ) : graduate?.profilePicture ? (
                <View style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderWidth: 4,
                  borderColor: '#ffffff',
                  overflow: 'hidden',
                }}>
                  <Image 
                    source={{ 
                      uri: graduate.profilePicture.startsWith('http') 
                        ? graduate.profilePicture 
                        : `${BACKEND_URL}${graduate.profilePicture}` 
                    }} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    key={`profile-${Date.now()}`}
                    onLoadStart={() => console.log("Image loading started")}
                    onLoad={() => console.log("Image loaded successfully")}
                    onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                  />
                </View>
              ) : (
                <View style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: '#dbeafe',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: '#ffffff',
                }}>
                  <Ionicons name="person" size={64} color="#2563eb" />
                </View>
              )}
              <View style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 44,
                height: 44,
                backgroundColor: '#2563eb',
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: '#ffffff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
            
            {/* Name */}
            <Text style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#111827',
              textAlign: 'center',
              marginBottom: 8,
              letterSpacing: -0.5,
            }}>
              {graduate?.firstName || ""} {graduate?.lastName || ""}
            </Text>
            
            {graduate?.username && (
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: 16,
              }}>
                @{graduate.username}
              </Text>
            )}
            
            {/* Status - Enhanced design */}
            <View style={{
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 16,
              marginBottom: 8,
              backgroundColor: graduate?.isVerified ? '#dcfce7' : '#fee2e2',
              borderWidth: 2,
              borderColor: graduate?.isVerified ? '#bbf7d0' : '#fecaca',
              shadowColor: graduate?.isVerified ? '#22c55e' : '#ef4444',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons 
                  name={graduate?.isVerified ? "checkmark-circle" : "alert-circle"} 
                  size={20} 
                  color={graduate?.isVerified ? "#059669" : "#dc2626"} 
                />
                <Text style={{
                  marginLeft: 8,
                  fontSize: 16,
                  fontWeight: '700',
                  color: graduate?.isVerified ? "#059669" : "#dc2626",
                }}>
                  {getVerificationStatus().text}
                </Text>
              </View>
            </View>
            
          </View>

          {/* Contact Information Card */}
          <View style={{
            backgroundColor: '#ffffff',
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 20,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#dbeafe',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name="call" size={16} color="#2563eb" />
              </View>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#111827',
                flex: 1,
              }}>Contact Information</Text>
            </View>

            {/* Username - Read Only */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 8,
              }}>Username</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}>
                <Ionicons name="at" size={20} color="#6b7280" />
                <Text style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 16,
                  color: '#6b7280',
                  fontWeight: '500',
                }}>
                  {graduate?.username || "Not set"}
                </Text>
              </View>
            </View>

            {/* Phone Number - Read Only */}
            {graduate?.phoneNumber && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8,
                }}>Phone Number</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f9fafb',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                }}>
                  <Ionicons name="call" size={20} color="#6b7280" />
                  <Text style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: '#111827',
                    fontWeight: '500',
                  }}>
                    {graduate.phoneNumber}
                  </Text>
                </View>
              </View>
            )}

            {/* Email Input - Editable */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 8,
              }}>Email Address</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderWidth: 2,
                borderColor: '#e5e7eb',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}>
                <Ionicons name="mail" size={20} color="#2563eb" />
                <TextInput
                  value={form.email}
                  onChangeText={(t) => handleChange("email", t)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Enter your email address"
                  placeholderTextColor="#9ca3af"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: '#111827',
                    paddingVertical: 12,
                  }}
                />
              </View>
            </View>

            {/* Address Input - Editable */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 8,
              }}>Address</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderWidth: 2,
                borderColor: '#e5e7eb',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}>
                <Ionicons name="location" size={20} color="#2563eb" />
                <TextInput
                  value={form.address}
                  onChangeText={(t) => handleChange("address", t)}
                  placeholder="Enter your address"
                  placeholderTextColor="#9ca3af"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: '#111827',
                    paddingVertical: 12,
                  }}
                />
              </View>
            </View>

            {/* Birthday DatePicker */}
            <View className="mb-0">
              <DatePicker
                label="Birthday"
                value={birthdayDate}
                onChange={handleBirthdayChange}
                placeholder="Select your birthday"
                maximumDate={new Date()} // Can't select future dates
              />
            </View>
          </View>

          {/* About Me Card */}
          <View style={{
            backgroundColor: '#ffffff',
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 20,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#ddd6fe',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name="person" size={16} color="#7c3aed" />
              </View>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#111827',
                flex: 1,
              }}>About Me</Text>
            </View>
            
            <View style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 2,
              borderColor: '#e5e7eb',
              minHeight: 120,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <TextInput
                value={form.biography}
                onChangeText={(t) => handleChange("biography", t)}
                multiline
                numberOfLines={5}
                placeholder="Share something about yourself, your experience, skills, or what makes you unique..."
                placeholderTextColor="#9ca3af"
                textAlignVertical="top"
                style={{
                  fontSize: 16,
                  color: '#111827',
                  lineHeight: 22,
                  minHeight: 100,
                }}
              />
            </View>
          </View>

          {/* Security Card */}
          <View style={{
            backgroundColor: '#ffffff',
            marginHorizontal: 16,
            marginBottom: 24,
            borderRadius: 20,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#fef3c7',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name="shield-checkmark" size={16} color="#d97706" />
              </View>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#111827',
                flex: 1,
              }}>Security</Text>
            </View>
            
            <View style={{ marginBottom: 8 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 8,
              }}>Change Password</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderWidth: 2,
                borderColor: '#e5e7eb',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}>
                <Ionicons name="lock-closed" size={20} color="#2563eb" />
                <TextInput
                  value={form.password}
                  onChangeText={(t) => handleChange("password", t)}
                  secureTextEntry
                  placeholder="Enter new password (optional)"
                  placeholderTextColor="#9ca3af"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: '#111827',
                    paddingVertical: 12,
                  }}
                />
              </View>
            </View>
            <Text style={{
              fontSize: 12,
              color: '#6b7280',
              marginTop: 4,
              fontStyle: 'italic',
            }}>Leave blank to keep your current password</Text>
          </View>

          {/* Action Buttons */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: loading ? 0 : 0.3,
                shadowRadius: 8,
                elevation: loading ? 0 : 6,
                marginBottom: 12,
              }}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={{
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: 16,
                    marginLeft: 8,
                  }}>Saving...</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={{
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: 16,
                    marginLeft: 8,
                  }}>Save Changes</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#dc2626',
                borderRadius: 16,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="log-out" size={20} color="#dc2626" />
                <Text style={{
                  color: '#dc2626',
                  fontWeight: '600',
                  fontSize: 16,
                  marginLeft: 8,
                }}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      
      {/* No bottom navigation as requested */}
    </View>
  )
}
