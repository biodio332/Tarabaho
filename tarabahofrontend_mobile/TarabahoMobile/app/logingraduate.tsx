import { useState } from "react"
import { View, Text, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import TextField from "@/components/ui/TextField"
import Button from "@/components/ui/Button";
import { API_CONFIG } from '@/config';

const BACKEND_URL = API_CONFIG.BACKEND_URL;

export default function LoginGraduate() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  const handleLogin = async () => { 
    if (!username || !password) {
      setError("Please enter your username and password")
      return
    }

    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const res = await fetch(`${BACKEND_URL}/api/graduate/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) throw new Error("Invalid graduate credentials")
      const data = await res.json()

      if (data?.token) {
        // Clear any previous session data completely
        await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username'])
        
        await AsyncStorage.multiSet([
          ["authToken", data.token],
          ["isLoggedIn", "true"],
          ["userType", "graduate"],
          ["username", username],
        ])
        setSuccessMessage("Login successful! Redirecting to Graduate Dashboard...")
        setTimeout(() => router.replace("/graduatehomepage"), 1200)
      } else {
        throw new Error("No token received from server")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: "#f9fafb" }}
        >
          <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
            {/* Header Section */}
            <View style={{ 
              alignItems: "center", 
              paddingTop: 80, 
              paddingBottom: 40,
              paddingHorizontal: 24
            }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#ffffff",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#076dfd",
                shadowOpacity: 0.15,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 12,
                elevation: 8,
                marginBottom: 24
              }}>
                <Image 
                  source={require("../assets/images/TARABAHO.png")} 
                  style={{ height: 60, width: 60 }} 
                  resizeMode="contain"
                />
              </View>
              
              <Text style={{
                fontSize: 32,
                fontWeight: "700",
                color: "#1f2937",
                marginBottom: 8,
                letterSpacing: -0.5
              }}>
                Graduate Portal
              </Text>
              
              <Text style={{
                fontSize: 16,
                color: "#1f2937",
                textAlign: "center",
                lineHeight: 24
              }}>
                Access your professional dashboard and portfolio
              </Text>
            </View>

            {/* Form Section */}
            <View style={{
              flex: 1,
              backgroundColor: "#ffffff",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 40,
              shadowColor: "#000000",
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: -4 },
              shadowRadius: 12,
              elevation: 8
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: 32,
                textAlign: "center"
              }}>
                Graduate Login
              </Text>

              <TextField 
                label="Username" 
                value={username} 
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
                textContentType="username"
                returnKeyType="next"
                placeholder="Enter your username"
              />
              
              <TextField 
                label="Password" 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                placeholder="Enter your password"
              />

              {error ? (
                <View style={{
                  backgroundColor: "#fef2f2",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#ef4444"
                }}>
                  <Text style={{ color: "#ef4444", fontSize: 14, fontWeight: "500" }}>
                    {error}
                  </Text>
                </View>
              ) : null}
              
              {successMessage ? (
                <View style={{
                  backgroundColor: "#f0fdf4",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#22c55e"
                }}>
                  <Text style={{ color: "#22c55e", fontSize: 14, fontWeight: "500" }}>
                    {successMessage}
                  </Text>
                </View>
              ) : null}

              {/* Forgot Password Link */}
              <View style={{ alignItems: "flex-end", marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => router.push("/forgotpassword?type=graduate")}
                >
                  <Text style={{
                    color: "#3b82f6",
                    fontSize: 14,
                    fontWeight: "500",
                    textDecorationLine: "underline"
                  }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title={loading ? "Signing in..." : "Sign In"}
                onPress={handleLogin}
                loading={loading}
              />

              {/* Divider */}
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 32
              }}>
                <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
                <Text style={{
                  marginHorizontal: 16,
                  fontSize: 14,
                  color: "#6b7280",
                  fontWeight: "500"
                }}>
                  OR
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
              </View>

              {/* Alternative Actions */}
              <View style={{ gap: 12 }}>
                <Button
                  title="Back to User Login"
                  onPress={async () => {
                    // Clear any existing session data before switching login types
                    try {
                      await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username', 'userId', 'graduateId']);
                    } catch (error) {
                      console.warn('Failed to clear session data:', error);
                    }
                    router.push("/login");
                  }}
                  variant="outline"
                />
                <Button
                  title="Register as Graduate"
                  onPress={() => router.push("/registergraduate")}
                  variant="outline"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
