import { useState } from "react"
import { View, Text, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, StatusBar } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Stack } from "expo-router"
import TextField from "@/components/ui/TextField"
import Button from "@/components/ui/Button"
import { API_CONFIG } from '@/config';

const BACKEND_URL = API_CONFIG.BACKEND_URL;

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const router = useRouter()
  const { type = "user" } = useLocalSearchParams<{ type?: string }>()

  const apiPath = type === "graduate" ? "/api/graduate" : "/api/user"

  const handleSendOtp = async () => {
    if (!email) {
      setError("Email is required")
      return
    }

    // Email validation to match backend regex
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!emailRegex.test(email)) {
      setError("Invalid email format")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    console.log("Sending OTP request with email:", email, "type:", type)
    try {
      const res = await fetch(`${BACKEND_URL}${apiPath}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        // Try to extract error message from response
        let errorMessage = "Failed to send OTP. Please try again."
        try {
          const contentType = res.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json()
            errorMessage = errorData.message || errorData.error || errorData || errorMessage
          } else {
            // Backend often returns plain text error messages
            const textError = await res.text()
            errorMessage = textError || errorMessage
          }
        } catch (parseErr) {
          console.error("Error parsing response:", parseErr)
        }
        console.error("OTP request failed:", res.status, errorMessage)
        throw new Error(typeof errorMessage === "string" ? errorMessage : "An unexpected error occurred.")
      }

      // Check if response has success message
      let successMessage = "OTP sent to your email."
      try {
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const responseData = await res.json()
          successMessage = responseData.message || responseData || successMessage
        } else {
          const textResponse = await res.text()
          successMessage = textResponse || successMessage
        }
      } catch (parseErr) {
        console.log("Could not parse success response:", parseErr)
      }
      
      console.log("OTP request successful:", successMessage)
      setSuccess(typeof successMessage === "string" ? successMessage : "OTP sent to your email.")
      setStep(2)
    } catch (err: any) {
      console.error("OTP request error:", err)
      setError(err.message || "Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError("Email is required")
      return
    }
    if (!otp || otp.trim() === "") {
      setError("OTP is required")
      return
    }
    if (!newPassword || newPassword.trim() === "") {
      setError("New password is required")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    console.log("Resetting password with email:", email, "type:", type)
    try {
      const res = await fetch(`${BACKEND_URL}${apiPath}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      })

      if (!res.ok) {
        // Try to extract error message from response
        let errorMessage = "Failed to reset password. Please try again."
        try {
          const contentType = res.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json()
            errorMessage = errorData.message || errorData.error || errorData || errorMessage
          } else {
            // Backend often returns plain text error messages
            const textError = await res.text()
            errorMessage = textError || errorMessage
          }
        } catch (parseErr) {
          console.error("Error parsing response:", parseErr)
        }
        console.error("Reset password failed:", res.status, errorMessage)
        throw new Error(typeof errorMessage === "string" ? errorMessage : "An unexpected error occurred.")
      }

      // Check if response has success message
      let successMessage = "Password reset successfully. Redirecting to sign in..."
      try {
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const responseData = await res.json()
          successMessage = responseData.message || responseData || successMessage
        } else {
          const textResponse = await res.text()
          successMessage = textResponse || successMessage
        }
      } catch (parseErr) {
        console.log("Could not parse success response:", parseErr)
      }
      
      console.log("Password reset successful:", successMessage)
      setSuccess(typeof successMessage === "string" ? successMessage : "Password reset successfully.")
      
      setTimeout(() => {
        if (type === "graduate") {
          router.replace("/logingraduate")
        } else {
          router.replace("/login")
        }
      }, 2000)
    } catch (err: any) {
      console.error("Reset password error:", err)
      setError(err.message || "Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setError("")
      setSuccess("")
    } else {
      if (type === "graduate") {
        router.back()
      } else {
        router.back()
      }
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" translucent={false} hidden={false} />
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
                  letterSpacing: -0.5,
                  textAlign: "center"
                }}>
                  {step === 1 ? "Forgot Password" : "Reset Password"}
                </Text>
                
                <Text style={{
                  fontSize: 16,
                  color: "#6b7280",
                  textAlign: "center",
                  lineHeight: 24
                }}>
                  {step === 1 
                    ? "Enter your email to receive a verification code" 
                    : "Enter the code and create a new password"
                  }
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
                marginBottom: 8,
                textAlign: "center"
              }}>
                {step === 1 ? "Forgot Password?" : "Create New Password"}
              </Text>

              <Text style={{
                fontSize: 14,
                color: "#3b82f6",
                marginBottom: 32,
                textAlign: "center",
                fontWeight: "600"
              }}>
                {type === "graduate" ? "Graduate Account" : "User Account"}
              </Text>

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
              
              {success ? (
                <View style={{
                  backgroundColor: "#f0fdf4",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#22c55e"
                }}>
                  <Text style={{ color: "#22c55e", fontSize: 14, fontWeight: "500" }}>
                    {success}
                  </Text>
                </View>
              ) : null}

              {step === 1 ? (
                <View>
                  <TextField 
                    label="Email Address" 
                    value={email} 
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="done"
                    placeholder="you@example.com"
                  />

                  <Button
                    title={loading ? "Sending..." : "Send Verification Code"}
                    onPress={handleSendOtp}
                    loading={loading}
                  />
                </View>
              ) : (
                <View>
                  <TextField 
                    label="Verification Code" 
                    value={otp} 
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    returnKeyType="next"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />

                  <TextField 
                    label="New Password" 
                    secureTextEntry={!showNewPassword}
                    value={newPassword} 
                    onChangeText={setNewPassword}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="next"
                    placeholder="At least 6 characters"
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        style={{ padding: 4 }}
                      >
                        <Text style={{
                          color: "#6b7280",
                          fontSize: 16,
                          fontWeight: "500"
                        }}>
                          {showNewPassword ? "🙈" : "👁️"}
                        </Text>
                      </TouchableOpacity>
                    }
                  />

                  <TextField 
                    label="Confirm Password" 
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword} 
                    onChangeText={setConfirmPassword}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    placeholder="Re-enter your password"
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ padding: 4 }}
                      >
                        <Text style={{
                          color: "#6b7280",
                          fontSize: 16,
                          fontWeight: "500"
                        }}>
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </Text>
                      </TouchableOpacity>
                    }
                  />

                  <Button
                    title={loading ? "Resetting..." : "Change Password"}
                    onPress={handleResetPassword}
                    loading={loading}
                  />
                </View>
              )}

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

              {/* Back to Sign In */}
              <View style={{ gap: 12 }}>
                <Button
                  title={`Back to ${type === "graduate" ? "Graduate" : "User"} Login`}
                  onPress={() => {
                    if (type === "graduate") {
                      router.replace("/logingraduate")
                    } else {
                      router.replace("/login")
                    }
                  }}
                  variant="outline"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    </>
  )
}