import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, ScrollView, TextInput, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';

type Graduate = {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  birthday?: string;
  biography?: string;
  profilePicture?: string;
  [key: string]: unknown;
};

export default function GraduateProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [graduate, setGraduate] = useState<Graduate | null>(null);
  const [form, setForm] = useState({ email: '', address: '', birthday: '', biography: '', password: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setError('');
      setLoading(true);
      try {
        const username = await AsyncStorage.getItem('username');
        if (!username) { setError('Missing username. Please log in again.'); setLoading(false); return; }
        let token = await AsyncStorage.getItem('authToken');
        if (!token) {
          const tokenRes = await fetch(`${BACKEND_URL}/api/graduate/get-token`, { method: 'GET', credentials: 'include' });
          const tokenJson = await tokenRes.json().catch(() => ({} as any));
          token = tokenJson?.token;
        }
        if (!token) { setError('Authentication token is missing. Please sign in again.'); setLoading(false); return; }
        const profileRes = await fetch(`${BACKEND_URL}/api/graduate/username/${encodeURIComponent(username)}`, { method: 'GET', credentials: 'include', headers: { Authorization: `Bearer ${token}` } });
        if (!profileRes.ok) {
          const data = await profileRes.json().catch(() => ({}));
          throw new Error(data.message || data.error || 'Failed to load profile');
        }
        const data: Graduate = await profileRes.json();
        setGraduate(data);
        setForm({ email: data.email || '', address: data.address || '', birthday: data.birthday || '', biography: (data as any).biography || '', password: '' });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleChange = (key: keyof typeof form, value: string) => { setForm((prev) => ({ ...prev, [key]: value })); setError(''); };

  const handleSave = async () => {
    if (!graduate?.id) { setError('Missing graduate ID.'); return; }
    try {
      setLoading(true);
      let token = await AsyncStorage.getItem('authToken');
      if (!token) {
        const tokenRes = await fetch(`${BACKEND_URL}/api/graduate/get-token`, { method: 'GET', credentials: 'include' });
        const tokenJson = await tokenRes.json().catch(() => ({} as any));
        token = tokenJson?.token;
      }
      if (!token) { throw new Error('Authentication token is missing. Please sign in again.'); }
      const updatePayload: any = { ...graduate, email: form.email, address: form.address, birthday: form.birthday, biography: form.biography };
      if (!form.password) { delete updatePayload.password; } else { updatePayload.password = form.password; }
      const res = await fetch(`${BACKEND_URL}/api/graduate/${graduate.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, credentials: 'include', body: JSON.stringify(updatePayload) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.message || data.error || 'Failed to update profile'); }
      const updated = await res.json();
      setGraduate(updated);
      setForm((prev) => ({ ...prev, password: '' }));
      Alert.alert('Success', 'Profile updated');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unknown error'); } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
      <Button title="Back" onPress={() => router.back()} />
      <Text style={{ fontSize: 20, marginVertical: 12 }}>Graduate Profile</Text>
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={{ color: 'red' }}>{error}</Text>
      ) : (
        <ScrollView>
          {graduate?.profilePicture ? (
            <Image source={{ uri: graduate.profilePicture as string }} style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 12 }} />
          ) : null}
          <Text>Username: {graduate?.username || ''}</Text>
          <Text>First Name: {graduate?.firstName || ''}</Text>
          <Text>Last Name: {graduate?.lastName || ''}</Text>
          <Text>Email</Text>
          <TextInput value={form.email} onChangeText={(t) => handleChange('email', t)} autoCapitalize="none" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
          <Text>Address</Text>
          <TextInput value={form.address} onChangeText={(t) => handleChange('address', t)} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
          <Text>Birthday</Text>
          <TextInput value={form.birthday} onChangeText={(t) => handleChange('birthday', t)} placeholder="YYYY-MM-DD" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
          <Text>Biography</Text>
          <TextInput value={form.biography} onChangeText={(t) => handleChange('biography', t)} multiline style={{ borderWidth: 1, padding: 8, marginBottom: 8, minHeight: 60 }} />
          <Text>Password</Text>
          <TextInput value={form.password} onChangeText={(t) => handleChange('password', t)} secureTextEntry style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
          <Button title="Save" onPress={handleSave} />
        </ScrollView>
      )}
    </View>
  );
}


