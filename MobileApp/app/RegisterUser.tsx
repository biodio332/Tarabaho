import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterUser() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    contactNo: '',
    birthday: '',
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
    if (!form.address.trim()) return 'Address is required';
    if (!form.contactNo.trim()) return 'Contact number is required';
    if (!form.birthday) return 'Birthday is required';
    return '';
  };

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setLoading(true);
    setError('');
    const payload = {
      firstname: form.firstName,
      lastname: form.lastName,
      username: form.username,
      email: form.email,
      password: form.password,
      phoneNumber: form.contactNo,
      birthday: form.birthday,
      location: form.address,
    };
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/register`, {
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
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Register as User</Text>
      <TextInput placeholder="Username" value={form.username} onChangeText={v => handleChange('username', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} autoCapitalize="none" />
      <TextInput placeholder="Password" value={form.password} onChangeText={v => handleChange('password', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} secureTextEntry />
      <TextInput placeholder="Confirm Password" value={form.confirmPassword} onChangeText={v => handleChange('confirmPassword', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} secureTextEntry />
      <TextInput placeholder="First Name" value={form.firstName} onChangeText={v => handleChange('firstName', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Last Name" value={form.lastName} onChangeText={v => handleChange('lastName', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Email" value={form.email} onChangeText={v => handleChange('email', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} keyboardType="email-address" autoCapitalize="none" />
      <TextInput placeholder="Address" value={form.address} onChangeText={v => handleChange('address', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Contact Number" value={form.contactNo} onChangeText={v => handleChange('contactNo', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} keyboardType="phone-pad" />
      <TextInput placeholder="Birthday (YYYY-MM-DD)" value={form.birthday} onChangeText={v => handleChange('birthday', v)} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
      <Button title={loading ? 'Registering...' : 'Register'} onPress={handleSubmit} disabled={loading} />
      <View style={{ height: 16 }} />
      <Button title="Back to Login" onPress={() => router.replace('/Login')} />
    </ScrollView>
  );
}
