import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthApi from './(services)/authApi';
import Illustration from '../components/ui/Illustration';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPassword() {
  const { isDarkMode } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await AuthApi.forgotPassword(email);
      setSuccess('Password reset instructions have been sent to your email');
      setTimeout(() => {
        router.push('/resetPassword');
      }, 3000);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Feather name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>

          <View className="mb-4 items-center">
            <Illustration name="forgot-password" height={screenWidth * 0.5} />
          </View>

          <Text
            className={`mb-6 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Forgot Password
          </Text>

          <View className="gap-4">
            <View>
              <Text
                className={`mb-1 mb-2 pl-2 text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-primary-dark'
                }`}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                className={`flex-row items-center rounded-full p-4 ${
                  isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                }`}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {error ? <Text className="text-sm text-red-500">{error}</Text> : null}

            {success ? <Text className="text-sm text-green-500">{success}</Text> : null}

            <TouchableOpacity
              className={`rounded-full p-4 ${
                loading ? 'bg-purple-400' : 'bg-purple-600 active:bg-purple-700'
              }`}
              onPress={handleResetPassword}
              disabled={loading}>
              <Text className="text-center font-semibold text-white">
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')} className="mt-4">
              <Text className={`text-center ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
