
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

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8080"

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
  const [uploadAttempts, setUploadAttempts] = useState(0) // Track upload attempts
  
  // Handle profile picture selection
  const pickImage = async () => {
    console.log("Starting pickImage function");
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
        console.error("Missing credentials: username or token is missing");
        Alert.alert(
          "Session Error",
          "You need to be logged in to change your profile picture.",
          [{ text: "Log In", onPress: () => router.replace('/logingraduate') }]
        );
        return;
      }
      
      // Skip token validation before image selection to minimize issues
      console.log("Launching image picker");
      
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
            console.log("Starting upload process...");
            await uploadProfileImage(selectedAsset.uri);
            console.log("Upload completed successfully");
          } catch (uploadError) {
            console.error("Upload error in pickImage:", uploadError);
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
        await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username']);
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
        await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username']);
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
            await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username']);
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
        await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username']);
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
            await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username']);
            router.replace('/logingraduate');
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* Back Button - consistent with portfolio page */}
      <View className="absolute top-12 left-4 z-20">
        <TouchableOpacity
          onPress={() => router.push('/graduatehomepage')}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md active:opacity-90 border border-gray-200"
        >
          <Ionicons name="chevron-back" size={22} color="#1D4ED8" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text className="text-red-600 text-center mt-4 text-base">{error}</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-blue-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16 }}>
          <View className="bg-white mx-4 mt-10 mb-4 rounded-2xl shadow-sm p-6 items-center">
            <TouchableOpacity 
              className="relative mb-4" 
              onPress={pickImage}
              disabled={imageUploading}
            >
              {imageUploading ? (
                <View className="w-28 h-28 rounded-full bg-blue-100 items-center justify-center">
                  <ActivityIndicator size="small" color="#3b82f6" />
                </View>
              ) : graduate?.profilePicture ? (
                <Image 
                  source={{ 
                    uri: graduate.profilePicture.startsWith('http') 
                      ? graduate.profilePicture 
                      : `${BACKEND_URL}${graduate.profilePicture}` 
                  }} 
                  style={{ width: 112, height: 112, borderRadius: 56 }}
                  resizeMode="cover"
                  // Add a cache-busting parameter to prevent cached images
                  key={`profile-${Date.now()}`}
                  // Add onLoad and onError handlers
                  onLoadStart={() => console.log("Image loading started")}
                  onLoad={() => console.log("Image loaded successfully")}
                  onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                />
              ) : (
                <View className="w-28 h-28 rounded-full bg-blue-100 items-center justify-center">
                  <Ionicons name="person" size={48} color="#3b82f6" />
                </View>
              )}
              <View className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 rounded-full items-center justify-center border-4 border-white">
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            
            <View className="flex-row items-center mb-1">
              <Text className="text-2xl font-bold text-gray-900">
                {graduate?.firstName || ""} {graduate?.lastName || ""}
              </Text>
              <View className={`ml-2 px-2 py-0.5 rounded-full ${getVerificationStatus().bgColor} ${getVerificationStatus().borderColor} border`}>
                <Text className={`text-xs font-semibold ${getVerificationStatus().textColor}`}>
                  {getVerificationStatus().text}
                </Text>
              </View>
            </View>
            
            <Text className="text-base text-gray-500 mb-1">@{graduate?.username || ""}</Text>
            {graduate?.phoneNumber && <Text className="text-sm text-gray-600">{graduate.phoneNumber}</Text>}
          </View>

          <View className="bg-white mx-4 mb-4 rounded-2xl shadow-sm p-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Contact Information</Text>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#6b7280" />
                <TextInput
                  value={form.email}
                  onChangeText={(t) => handleChange("email", t)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-3 text-base text-gray-900"
                />
              </View>
            </View>

            {/* Address Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Address</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="location-outline" size={20} color="#6b7280" />
                <TextInput
                  value={form.address}
                  onChangeText={(t) => handleChange("address", t)}
                  placeholder="Enter your address"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-3 text-base text-gray-900"
                />
              </View>
            </View>

            {/* Birthday Input */}
            <View className="mb-0">
              <Text className="text-sm font-medium text-gray-700 mb-2">Birthday</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                <TextInput
                  value={form.birthday}
                  onChangeText={(t) => handleChange("birthday", t)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-3 text-base text-gray-900"
                />
              </View>
            </View>
          </View>

          <View className="bg-white mx-4 mb-4 rounded-2xl shadow-sm p-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">About Me</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <TextInput
                value={form.biography}
                onChangeText={(t) => handleChange("biography", t)}
                multiline
                numberOfLines={4}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#9ca3af"
                textAlignVertical="top"
                className="text-base text-gray-900 min-h-[100px]"
              />
            </View>
          </View>

          <View className="bg-white mx-4 mb-6 rounded-2xl shadow-sm p-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Security</Text>
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-2">Change Password</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
                <TextInput
                  value={form.password}
                  onChangeText={(t) => handleChange("password", t)}
                  secureTextEntry
                  placeholder="Enter new password (optional)"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-3 text-base text-gray-900"
                />
              </View>
            </View>
            <Text className="text-xs text-gray-500 mt-1">Leave blank to keep current password</Text>
          </View>

          <View className="px-4 pb-8">
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className="bg-blue-600 rounded-xl py-4 items-center shadow-sm"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Save Changes</Text>
              )}
            </TouchableOpacity>
            
            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              className="mt-4 border border-red-500 rounded-xl py-4 items-center"
            >
              <Text className="text-red-500 font-semibold text-base">Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      
      {/* No bottom navigation as requested */}
    </View>
  )
}
