import "react-native-reanimated";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardAvoidingView, Platform } from "react-native";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="login" 
                options={{ 
                  title: "Login", 
                  headerShown: false,
                  gestureEnabled: true,
                  keyboardHandlingEnabled: true
                }} 
              />
              <Stack.Screen 
                name="logingraduate" 
                options={{ 
                  title: "Graduate Login", 
                  headerShown: false,
                  gestureEnabled: true,
                  keyboardHandlingEnabled: true
                }} 
              />
              <Stack.Screen name="registeruser" options={{ title: "Register User" }} />
              <Stack.Screen name="registergraduate" options={{ title: "Register Graduate" }} />
              <Stack.Screen name="graduatehomepage" options={{ title: "Graduate Home", headerShown: false }} />
              <Stack.Screen name="graduateprofile" options={{ title: "Graduate Profile" }} />
              <Stack.Screen name="portfolio" options={{ title: "Portfolio" }} />
              <Stack.Screen name="createportfolio" options={{ title: "Create Portfolio" }} />
              <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
            </Stack>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          </KeyboardAvoidingView>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
