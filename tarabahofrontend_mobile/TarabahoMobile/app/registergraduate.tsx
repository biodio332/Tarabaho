import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterGraduate() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    contactNo: '',
    birthday: '',
    address: '',
    hourly: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = (): string => {
    if (!form.username.trim()) return 'Username is required';
    if (!form.password) return 'Password is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.lastName.trim()) return 'Last name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!validateEmail(form.email)) return 'Invalid email format';
    if (!form.contactNo.trim()) return 'Contact number is required';
    if (!form.birthday) return 'Birthday is required';
    if (!form.address.trim()) return 'Address is required';
    if (!form.hourly || isNaN(Number(form.hourly)) || Number(form.hourly) <= 0) return 'Hourly rate must be greater than 0';
    return '';
  };

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const checkDuplicates = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/graduate/check-duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, phoneNumber: form.contactNo }),
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        if (text.includes('Username already exists')) return { field: 'username', message: 'Username already exists' };
        if (text.includes('Email already exists')) return { field: 'email', message: 'Email already exists' };
        if (text.includes('Phone number already exists')) return { field: 'contactNo', message: 'Phone number already exists' };
        return { field: 'general', message: text || 'Failed to validate details' };
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { field: 'general', message: 'Failed to connect to server: ' + message };
    }
  };

  const handleSubmit = async () => {
    const errMsg = validate();
    if (errMsg) { setError(errMsg); return; }
    setLoading(true);
    setError('');
    const duplicate = await checkDuplicates();
    if (duplicate) { setError(duplicate.message); setLoading(false); return; }
    const payload = {
      username: form.username,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.contactNo,
      birthday: form.birthday,
      address: form.address,
      hourly: Number(form.hourly),
    };
    try {
      const res = await fetch(`${BACKEND_URL}/api/graduate/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Registration failed');
      }
      Alert.alert('Registration successful', 'You can now log in.', [{ text: 'OK', onPress: () => router.replace('/login') }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
      <View className="flex-1 px-6 py-10">
        <Text className="mb-6 text-2xl font-extrabold text-secondary">Register as Graduate</Text>
        <View className="space-y-4">
          <TextField placeholder="Username" autoCapitalize="none" value={form.username} onChangeText={(v) => handleChange('username', v)} />
          <TextField placeholder="Password" secureTextEntry value={form.password} onChangeText={(v) => handleChange('password', v)} />
          <TextField placeholder="Confirm Password" secureTextEntry value={form.confirmPassword} onChangeText={(v) => handleChange('confirmPassword', v)} />
          <View className="flex-row gap-4">
            <View className="flex-1">
              <TextField placeholder="First Name" value={form.firstName} onChangeText={(v) => handleChange('firstName', v)} />
            </View>
            <View className="flex-1">
              <TextField placeholder="Last Name" value={form.lastName} onChangeText={(v) => handleChange('lastName', v)} />
            </View>
          </View>
          <TextField placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => handleChange('email', v)} />
          <View className="flex-row gap-4">
            <View className="flex-1">
              <TextField placeholder="Contact Number" keyboardType="phone-pad" value={form.contactNo} onChangeText={(v) => handleChange('contactNo', v)} />
            </View>
            <View className="flex-1">
              <TextField placeholder="Birthday (YYYY-MM-DD)" value={form.birthday} onChangeText={(v) => handleChange('birthday', v)} />
            </View>
          </View>
          <TextField placeholder="Address" value={form.address} onChangeText={(v) => handleChange('address', v)} />
          <TextField placeholder="Hourly Rate (PHP)" keyboardType="numeric" value={form.hourly} onChangeText={(v) => handleChange('hourly', v)} />
          {error ? <Text className="text-sm text-danger">{error}</Text> : null}
          <Button title={loading ? 'Registering...' : 'Register'} onPress={handleSubmit} loading={loading} />
          <Button title="Back to Login" onPress={() => router.replace('/login')} variant="outline" />
        </View>
      </View>
    </ScrollView>
  );
}


