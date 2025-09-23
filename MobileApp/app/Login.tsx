import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default function Login() {
  const [loginType, setLoginType] = useState<'user' | 'graduate'>('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const endpoint = loginType === 'user' ? '/api/user/token' : '/api/graduate/token';
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Invalid username or password');
      }
      try {
        const data = await res.json().catch(() => ({} as any));
        if (data && typeof data.token === 'string' && data.token.length > 0) {
          await AsyncStorage.setItem('authToken', data.token);
        }
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('userType', loginType);
        await AsyncStorage.setItem('username', username);
      } catch {}

      if (loginType === 'graduate') {
        router.replace('/GraduateHomepage');
      } else {
        // For user flow, keep them on the same screen or navigate to a placeholder
        Alert.alert('Login successful', `Welcome, ${username}!`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }

  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Login</Text>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <Button title="User" onPress={() => setLoginType('user')} disabled={loginType === 'user'} />
        <View style={{ width: 8 }} />
        <Button title="Graduate" onPress={() => setLoginType('graduate')} disabled={loginType === 'graduate'} />
      </View>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
      />
      {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
      <View style={{ height: 16 }} />
      <Button title="Register as User" onPress={() => router.push('/RegisterUser')} />
      <View style={{ height: 8 }} />
      <Button title="Register as Graduate" onPress={() => router.push('/RegisterGraduate')} />
    </View>
  );
}
