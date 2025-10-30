import "react-native-reanimated";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardAvoidingView, Platform, LogBox } from "react-native";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";

// Disable the annoying error overlay in development
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Text strings must be rendered within a <Text> component')) {
      return; // Suppress this specific error
    }
    originalConsoleError(...args);
  };

  // Alternative: Use LogBox to ignore specific warnings
  LogBox.ignoreLogs(['Text strings must be rendered within a <Text> component']);
  
  // Or completely disable error overlay (uncomment if needed)
  // LogBox.ignoreAllLogs(true);
}

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
              <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen 
                name="login" 
                options={{ 
                  title: "Login", 
                  headerShown: false,
                  gestureEnabled: false,
                  keyboardHandlingEnabled: true
                }} 
              />
              <Stack.Screen 
                name="logingraduate" 
                options={{ 
                  title: "Graduate Login", 
                  headerShown: false,
                  gestureEnabled: false,
                  keyboardHandlingEnabled: true
                }} 
              />
              <Stack.Screen 
                name="registeruser" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false,
                  keyboardHandlingEnabled: true
                }} 
              />
              <Stack.Screen 
                name="registergraduate" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false,
                  keyboardHandlingEnabled: true
                }} 
              />
              <Stack.Screen name="userhomepage" options={{ title: "User Home", headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="userprofile" options={{ title: "User Profile", headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="graduatehomepage" options={{ title: "Graduate Home", headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="graduateprofile" options={{ title: "Graduate Profile", headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="portfolio" options={{ 
                title: "Portfolio", 
                headerShown: false,
                gestureEnabled: false // Disable swipe-to-go-back gesture
              }} />
              <Stack.Screen name="viewportfolio" options={{ 
                title: "View Portfolio", 
                headerShown: false,
                gestureEnabled: false 
              }} />
              <Stack.Screen name="createportfolio" options={{ title: "Create Portfolio", headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="editportfolio" options={{ title: "Edit Portfolio", headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal", gestureEnabled: false }} />
            </Stack>
            <StatusBar 
              style="dark"
              backgroundColor="transparent"
              translucent
            />
          </KeyboardAvoidingView>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
