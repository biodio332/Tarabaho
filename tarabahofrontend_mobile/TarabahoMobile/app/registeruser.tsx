import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterUser() {

  const [form, setForm] = useState<{ username: string; password: string; confirmPassword: string; firstName: string; lastName: string; email: string; address: string; contactNo: string; birthday: string; }>(
    { username: '', password: '', confirmPassword: '', firstName: '', lastName: '', email: '', address: '', contactNo: '', birthday: '' }
  );
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
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
    if (!form.address.trim()) return 'Address is required';
    if (!form.contactNo.trim()) return 'Contact number is required';
    if (!form.birthday) return 'Birthday is required';
    return '';
  };

  const handleChange = (name: string, value: string): void => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (): Promise<void> => {
    const errMsg = validate();
    if (errMsg) { setError(errMsg); return; }
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
      Alert.alert('Registration successful', 'You can now log in.', [{ text: 'OK', onPress: () => router.replace('/login') }]);
    } catch (err) {
      const message: string = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
      <View className="flex-1 px-6 py-10">
        <Text className="mb-6 text-2xl font-extrabold text-secondary">Register as User</Text>
        <View className="space-y-4">
          <TextField placeholder="Username" autoCapitalize="none" value={form.username} onChangeText={v => handleChange('username', v)} />
          <TextField placeholder="Password" secureTextEntry value={form.password} onChangeText={v => handleChange('password', v)} />
          <TextField placeholder="Confirm Password" secureTextEntry value={form.confirmPassword} onChangeText={v => handleChange('confirmPassword', v)} />
          <View className="flex-row gap-4">
            <View className="flex-1"><TextField placeholder="First Name" value={form.firstName} onChangeText={v => handleChange('firstName', v)} /></View>
            <View className="flex-1"><TextField placeholder="Last Name" value={form.lastName} onChangeText={v => handleChange('lastName', v)} /></View>
          </View>
          <TextField placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={v => handleChange('email', v)} />
          <TextField placeholder="Address" value={form.address} onChangeText={v => handleChange('address', v)} />
          <View className="flex-row gap-4">
            <View className="flex-1"><TextField placeholder="Contact Number" keyboardType="phone-pad" value={form.contactNo} onChangeText={v => handleChange('contactNo', v)} /></View>
            <View className="flex-1"><TextField placeholder="Birthday (YYYY-MM-DD)" value={form.birthday} onChangeText={v => handleChange('birthday', v)} /></View>
          </View>
          {error ? <Text className="text-sm text-danger">{error}</Text> : null}
          <Button title={loading ? 'Registering...' : 'Register'} onPress={handleSubmit} loading={loading} />
          <Button title="Back to Login" onPress={() => router.replace('/login')} variant="outline" />
        </View>
      </View>
    </ScrollView>
  );
}


