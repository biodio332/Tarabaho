import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "./style/global.css";


import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="Login" options={{ title: 'Login' }} />
        <Stack.Screen name="RegisterUser" options={{ title: 'Register as User' }} />
        <Stack.Screen name="RegisterGraduate" options={{ title: 'Register as Graduate' }} />
        <Stack.Screen name="GraduateHomepage" options={{ title: 'Graduate Homepage' }} />
        <Stack.Screen name="GraduateProfile" options={{ title: 'Graduate Profile' }} />
        <Stack.Screen name="Portfolio" options={{ title: 'Portfolio' }} />
        <Stack.Screen name="CreatePortfolio" options={{ title: 'Create Portfolio' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
