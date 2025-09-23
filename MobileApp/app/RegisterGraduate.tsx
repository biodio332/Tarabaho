import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

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

  const validate = () => {
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
      return { field: 'general', message: 'Failed to connect to server: ' + err.message };
    }
  };

  const handleSubmit = async () => {
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setLoading(true);
    setError('');
    const duplicate = await checkDuplicates();
    if (duplicate) {
      setError(duplicate.message);
      setLoading(false);
      return;
    }
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
      Alert.alert('Registration successful', 'You can now log in.', [
        { text: 'OK', onPress: () => router.replace('/Login') },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Register as Graduate</Text>
      <TextInput placeholder="Username" value={form.username} onChangeText={v => handleChange('username', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} autoCapitalize="none" />
      <TextInput placeholder="Password" value={form.password} onChangeText={v => handleChange('password', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} secureTextEntry />
      <TextInput placeholder="Confirm Password" value={form.confirmPassword} onChangeText={v => handleChange('confirmPassword', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} secureTextEntry />
      <TextInput placeholder="First Name" value={form.firstName} onChangeText={v => handleChange('firstName', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Last Name" value={form.lastName} onChangeText={v => handleChange('lastName', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Email" value={form.email} onChangeText={v => handleChange('email', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} keyboardType="email-address" autoCapitalize="none" />
      <TextInput placeholder="Contact Number" value={form.contactNo} onChangeText={v => handleChange('contactNo', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} keyboardType="phone-pad" />
      <TextInput placeholder="Birthday (YYYY-MM-DD)" value={form.birthday} onChangeText={v => handleChange('birthday', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Address" value={form.address} onChangeText={v => handleChange('address', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Hourly Rate (PHP)" value={form.hourly} onChangeText={v => handleChange('hourly', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} keyboardType="numeric" />
      {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
      <Button title={loading ? 'Registering...' : 'Register'} onPress={handleSubmit} disabled={loading} />
      <View style={{ height: 16 }} />
      <Button title="Back to Login" onPress={() => router.replace('/Login')} />
    </ScrollView>
  );
}
