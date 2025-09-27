import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/ui/Button';

export default function GraduateHomepage() {
  const router = useRouter();
  
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-12">
          <Text className="text-3xl font-extrabold text-black tracking-wide mb-4">Graduate Dashboard</Text>
          <Text className="text-base text-gray-500 font-semibold">Welcome to your graduate portal</Text>
        </View>

        <View className="w-full">
          <Button 
            title="Edit Profile" 
            onPress={() => router.push('/graduateprofile')} 
            style={{ marginBottom: 12 }}
          />
          <Button 
            title="View Portfolio" 
            onPress={() => router.push('/portfolio')} 
            variant="outline"
            style={{ marginBottom: 12 }}
          />
          <Button 
            title="Logout" 
            onPress={() => router.replace('/login')} 
            variant="outline"
          />
        </View>
      </View>
    </View>
  );
}


