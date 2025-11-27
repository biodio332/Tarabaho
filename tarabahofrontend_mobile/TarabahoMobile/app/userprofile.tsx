import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const BACKEND_URL = (process.env.EXPO_PUBLIC_BACKEND_URL || 'https://tarabaho-backend.onrender.com').replace(/\/$/, '');

interface User {
  id: number;
  firstname: string;  // Backend uses lowercase
  lastname: string;   // Backend uses lowercase
  username: string;
  email: string;
  phoneNumber?: string;
  location?: string;  // Backend uses location instead of address
  profilePicture?: string;
  birthday?: string;
  latitude?: number;
  longitude?: number;
  preferredRadius?: number;
  isVerified?: boolean;
}

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  // Password change modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile picture states
  const [uploadingPicture, setUploadingPicture] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login first');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/user/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFirstName(userData.firstname || '');
        setLastName(userData.lastname || '');
        setUsername(userData.username || '');
        setEmail(userData.email || '');
        setPhoneNumber(userData.phoneNumber || '');
        setAddress(userData.location || '');
      } else {
        throw new Error('Failed to load profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      // Update profile data (email and location only - other fields not supported by backend)
      const updateData = {
        email: email.trim(),
        location: address.trim(), // Backend uses 'location' field for address
      };

      const response = await fetch(`${BACKEND_URL}/api/user/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // Update phone number separately if changed
        if (phoneNumber.trim() !== (user?.phoneNumber || '')) {
          try {
            const phoneResponse = await fetch(`${BACKEND_URL}/api/user/update-phone`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
            });
            
            if (!phoneResponse.ok) {
              const phoneError = await phoneResponse.text();
              console.log('Phone update failed:', phoneError);
              // Don't fail the entire operation for phone update failures
            }
          } catch (phoneError) {
            console.log('Phone update error:', phoneError);
            // Don't fail the entire operation for phone update failures
          }
        }

        // Reload the profile to get updated data
        await loadUserProfile();
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!\n\nNote: First name, last name, and username cannot be changed.');
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }

      // Show image picker options
      Alert.alert(
        'Select Profile Picture',
        'Choose an option to update your profile picture',
        [
          {
            text: 'Camera',
            onPress: () => openCamera(),
          },
          {
            text: 'Photo Library',
            onPress: () => openImageLibrary(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to access image picker');
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open image library');
    }
  };

  const uploadProfilePicture = async (imageAsset: any) => {
    try {
      setUploadingPicture(true);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: imageAsset.uri,
        type: imageAsset.type || 'image/jpeg',
        name: imageAsset.fileName || `profile_picture_${Date.now()}.jpg`,
      } as any);

      const response = await fetch(`${BACKEND_URL}/api/user/upload-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to upload profile picture');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validate passwords
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all password fields');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        return;
      }

      if (newPassword.length < 8) {
        Alert.alert('Error', 'New password must be at least 8 characters long');
        return;
      }

      setChangingPassword(true);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const updateData = {
        password: newPassword,
      };

      const response = await fetch(`${BACKEND_URL}/api/user/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Password changed successfully!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all authentication related data
              const keysToRemove = ['authToken', 'isLoggedIn', 'userType', 'username', 'userId', 'graduateId'];
              await AsyncStorage.multiRemove(keysToRemove);
              console.log('UserProfile - Cleared AsyncStorage keys:', keysToRemove);
              router.replace('/login');
            } catch (error) {
              console.error('UserProfile - Error during logout:', error);
              Alert.alert('Error', 'Failed to logout properly');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (user) {
      setFirstName(user.firstname || '');
      setLastName(user.lastname || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setAddress(user.location || '');
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
      }}>
        <TouchableOpacity
          onPress={() => router.push('/userhomepage')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#f3f4f6',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#1f2937" />
        </TouchableOpacity>

        <Text style={{
          fontSize: 20,
          fontWeight: '600',
          color: '#1f2937',
        }}>
          My Profile
        </Text>

        <TouchableOpacity
          onPress={isEditing ? handleCancel : () => setIsEditing(true)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: isEditing ? '#ef4444' : '#4f46e5',
          }}
        >
          <Text style={{
            color: 'white',
            fontWeight: '600',
            fontSize: 14,
          }}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Picture Section */}
        <View style={{
          backgroundColor: 'white',
          marginHorizontal: 20,
          marginTop: 20,
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <TouchableOpacity
            onPress={handleProfilePictureUpload}
            disabled={uploadingPicture}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#e5e7eb',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              position: 'relative',
              opacity: uploadingPicture ? 0.7 : 1,
            }}
          >
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={40} color="#9ca3af" />
            )}
            
            {/* Upload Overlay */}
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: '#4f46e5',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 3,
              borderColor: 'white',
            }}>
              {uploadingPicture ? (
                <ActivityIndicator size={12} color="white" />
              ) : (
                <Ionicons name="camera" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: 4,
          }}>
            {user?.firstname} {user?.lastname}
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: '#6b7280',
            marginBottom: 8,
          }}>
            @{user?.username}
          </Text>

          <Text style={{
            fontSize: 12,
            color: '#9ca3af',
            textAlign: 'center',
          }}>
            {uploadingPicture ? 'Uploading...' : 'Tap photo to change'}
          </Text>
        </View>

        {/* Profile Information */}
        <View style={{
          backgroundColor: 'white',
          marginHorizontal: 20,
          marginTop: 20,
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: 20,
          }}>
            Profile Information
          </Text>

          {/* First Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#9ca3af',
              marginBottom: 8,
            }}>
              First Name (Cannot be changed)
            </Text>
            <TextInput
              value={firstName}
              editable={false}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
              }}
              placeholder="Enter first name"
            />
          </View>

          {/* Last Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#9ca3af',
              marginBottom: 8,
            }}>
              Last Name (Cannot be changed)
            </Text>
            <TextInput
              value={lastName}
              editable={false}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
              }}
              placeholder="Enter last name"
            />
          </View>

          {/* Username */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#9ca3af',
              marginBottom: 8,
            }}>
              Username (Cannot be changed)
            </Text>
            <TextInput
              value={username}
              editable={false}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
              }}
              placeholder="Enter username"
              autoCapitalize="none"
            />
          </View>

          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 8,
            }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              editable={isEditing}
              style={{
                borderWidth: 1,
                borderColor: isEditing ? '#d1d5db' : '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: isEditing ? 'white' : '#f9fafb',
                color: '#1f2937',
              }}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone Number */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 8,
            }}>
              Phone Number
            </Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={isEditing}
              style={{
                borderWidth: 1,
                borderColor: isEditing ? '#d1d5db' : '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: isEditing ? 'white' : '#f9fafb',
                color: '#1f2937',
              }}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Location */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 8,
            }}>
              Location
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              editable={isEditing}
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: isEditing ? '#d1d5db' : '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: isEditing ? 'white' : '#f9fafb',
                color: '#1f2937',
                textAlignVertical: 'top',
              }}
              placeholder="Enter location"
            />
          </View>

          {/* Save Button */}
          {isEditing && (
            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={saving}
              style={{
                backgroundColor: '#4f46e5',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 8,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Account Actions */}
        <View style={{
          backgroundColor: 'white',
          marginHorizontal: 20,
          marginTop: 20,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1f2937',
            paddingHorizontal: 20,
            paddingTop: 20,
            marginBottom: 16,
          }}>
            Account Actions
          </Text>

          {/* Change Password */}
          <TouchableOpacity
            onPress={() => setShowPasswordModal(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#dbeafe',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Ionicons name="lock-closed" size={20} color="#1e40af" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#1f2937',
              }}>
                Change Password
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                marginTop: 2,
              }}>
                Update your account password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#fee2e2',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Ionicons name="log-out" size={20} color="#dc2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#dc2626',
              }}>
                Logout
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                marginTop: 2,
              }}>
                Sign out of your account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 20,
              textAlign: 'center',
            }}>
              Change Password
            </Text>

            {/* Current Password */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8,
              }}>
                Current Password
              </Text>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: 'white',
                  color: '#1f2937',
                }}
                placeholder="Enter current password"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* New Password */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8,
              }}>
                New Password
              </Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: 'white',
                  color: '#1f2937',
                }}
                placeholder="Enter new password (min 8 characters)"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Confirm Password */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8,
              }}>
                Confirm New Password
              </Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: 'white',
                  color: '#1f2937',
                }}
                placeholder="Confirm new password"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Buttons */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: '#374151',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={changingPassword}
                style={{
                  flex: 1,
                  backgroundColor: '#4f46e5',
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  opacity: changingPassword ? 0.7 : 1,
                }}
              >
                {changingPassword ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    Change Password
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}