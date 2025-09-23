import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function GraduateHomepage() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: 'white' }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Graduate Homepage</Text>
      <Button title="Edit Profile" onPress={() => router.push('/GraduateProfile')} />
      <View style={{ height: 12 }} />
      <Button title="View Portfolio" onPress={() => router.push('/Portfolio')} />
      <View style={{ height: 12 }} />
      <Button title="Logout" onPress={() => router.replace('/Login')} />
    </View>
  );
}


