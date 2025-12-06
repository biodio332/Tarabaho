import React, { useState, ReactNode } from 'react';
import { 
  View, 
  Text, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { API_CONFIG } from '@/config';

const BACKEND_URL = API_CONFIG.BACKEND_URL;

// Utility function to handle date conversion
const parseDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date();
  try {
    return new Date(dateString);
  } catch (e) {
    return new Date();
  }
};

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

  type FormField = {
    field: keyof typeof form;
    placeholder: string;
    icon: ReactNode;
    halfWidth?: boolean;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    helperText?: string;
  };

  type Section = {
    title: string;
    fields: FormField[];
  };

  const sections: Section[] = [
    {
      title: 'Account Information',
      fields: [
        {
          field: 'username',
          placeholder: 'Username',
          icon: <Ionicons name="person-outline" size={20} color="#6b7280" />,
          autoCapitalize: 'none'
        },
        {
          field: 'password',
          placeholder: 'Password',
          icon: <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />,
          secureTextEntry: true,
          helperText: 'At least 6 characters long'
        },
        {
          field: 'confirmPassword',
          placeholder: 'Confirm Password',
          icon: <Ionicons name="shield-checkmark-outline" size={20} color="#6b7280" />,
          secureTextEntry: true
        }
      ]
    },
    {
      title: 'Personal Information',
      fields: [
        {
          field: 'firstName',
          placeholder: 'First Name',
          icon: <Ionicons name="person-outline" size={20} color="#6b7280" />,
          halfWidth: true
        },
        {
          field: 'lastName',
          placeholder: 'Last Name',
          icon: <Ionicons name="person-outline" size={20} color="#6b7280" />,
          halfWidth: true
        },
        {
          field: 'email',
          placeholder: 'Email Address',
          icon: <Ionicons name="mail-outline" size={20} color="#6b7280" />,
          keyboardType: 'email-address',
          autoCapitalize: 'none'
        },
        {
          field: 'address',
          placeholder: 'Address',
          icon: <Ionicons name="location-outline" size={20} color="#6b7280" />
        },
        {
          field: 'contactNo',
          placeholder: 'Phone Number',
          icon: <Ionicons name="call-outline" size={20} color="#6b7280" />,
          keyboardType: 'phone-pad'
        },
        {
          field: 'birthday',
          placeholder: 'Birthday (YYYY-MM-DD)',
          icon: <Ionicons name="calendar-outline" size={20} color="#6b7280" />
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          className="bg-white"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.push('/logingraduate')}
            className="absolute left-4 top-4 w-10 h-10 rounded-full bg-white/90 shadow-sm items-center justify-center z-50"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1 px-6 pt-4 pb-8">
            <View className="mb-8 mt-14">
              <Text className="text-3xl font-bold text-gray-900">Graduate Profile</Text>
              <Text className="mt-2 text-base text-gray-600">Create your freelancer profile</Text>
            </View>

            {sections.map((section, index) => (
              <View key={section.title} className="mb-6">
                <Text className="mb-4 text-lg font-semibold text-gray-700">{section.title}</Text>
                <View className="space-y-2">
                  {section.fields.map((field, fieldIndex) => (
                    <React.Fragment key={field.field}>
                      {field.halfWidth ? (
                        fieldIndex % 2 === 0 ? (
                          <View className="flex-row gap-4">
                            <View className="flex-1">
                              {field.field === 'birthday' ? (
                                <DatePicker
                                  label={field.placeholder?.replace(' (YYYY-MM-DD)', '')}
                                  value={parseDate(form[field.field])}
                                  onChange={(date) => handleChange(field.field, date.toISOString().split('T')[0])}
                                />
                              ) : (
                                <TextField
                                  leftIcon={field.icon}
                                  value={form[field.field]}
                                  onChangeText={v => handleChange(field.field, v)}
                                  error={error && error.includes(field.field) ? error : ''}
                                  {...field}
                                />
                              )}
                            </View>
                            {section.fields[fieldIndex + 1] && (
                              <View className="flex-1">
                                {section.fields[fieldIndex + 1].field === 'birthday' ? (
                                  <DatePicker
                                    label={section.fields[fieldIndex + 1].placeholder?.replace(' (YYYY-MM-DD)', '')}
                                    value={parseDate(form[section.fields[fieldIndex + 1].field])}
                                    onChange={(date) => handleChange(section.fields[fieldIndex + 1].field, date.toISOString().split('T')[0])}
                                  />
                                ) : (
                                  <TextField
                                    leftIcon={section.fields[fieldIndex + 1].icon}
                                    value={form[section.fields[fieldIndex + 1].field]}
                                    onChangeText={v => handleChange(section.fields[fieldIndex + 1].field, v)}
                                    error={error && error.includes(section.fields[fieldIndex + 1].field) ? error : ''}
                                    {...section.fields[fieldIndex + 1]}
                                  />
                                )}
                              </View>
                            )}
                          </View>
                        ) : null
                      ) : (
                        field.field === 'birthday' ? (
                          <DatePicker
                            label={field.placeholder?.replace(' (YYYY-MM-DD)', '')}
                            value={parseDate(form[field.field])}
                            onChange={(date) => handleChange(field.field, date.toISOString().split('T')[0])}
                          />
                        ) : (
                          <TextField
                            leftIcon={field.icon}
                            value={form[field.field]}
                            onChangeText={v => handleChange(field.field, v)}
                            error={error && error.includes(field.field) ? error : ''}
                            {...field}
                          />
                        )
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            ))}

            {error ? (
              <View className="mb-4 p-4 bg-red-50 rounded-lg">
                <Text className="text-sm text-red-600 font-medium">{error}</Text>
              </View>
            ) : null}

            <View style={{ 
              marginTop: 24,
              paddingHorizontal: 4,
              paddingBottom: Platform.OS === 'ios' ? 16 : 24
            }}>
              <Button
                title={loading ? 'Creating Profile...' : 'Create Profile'}
                onPress={handleSubmit}
                loading={loading}
                style={{
                  marginBottom: 16,
                  height: 56,
                  borderRadius: 12
                }}
              />
              <Button
                title="Back to Login"
                onPress={() => router.replace('/login')}
                variant="outline"
                style={{
                  height: 56,
                  borderRadius: 12
                }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


