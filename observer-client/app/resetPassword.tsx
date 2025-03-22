import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthApi from './(services)/authApi';
import Illustration from '../components/ui/Illustration';
import { useTheme } from '../context/ThemeContext';

export default function ResetPassword() {
  const { isDarkMode } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      if (!token) {
        setError('Please provide a reset token');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      await AuthApi.resetPassword(token, password);
      setSuccess('Password has been reset successfully');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      <ScrollView className="flex-1">
        <View className="p-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Feather name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>

          <View className="mb-8 items-center">
            <Illustration name="reset-password" height={screenWidth * 0.5} />
          </View>

          <Text
            className={`mb-6 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Reset Password
          </Text>

          <View className="gap-4">
            <View>
              <Text
                className={`mb-1 text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Reset Token
              </Text>
              <TextInput
                className={`rounded-full p-4 ${
                  isDarkMode ? 'bg-secondary-dark text-white' : 'bg-white text-gray-900'
                }`}
                value={token}
                onChangeText={setToken}
                placeholder="Enter reset token from email"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              />
            </View>

            <View>
              <Text
                className={`mb-1 text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                New Password
              </Text>
              <View className="relative">
                <TextInput
                  className={`rounded-full p-4 ${
                    isDarkMode ? 'bg-secondary-dark text-white' : 'bg-white text-gray-900'
                  }`}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={isDarkMode ? '#9ca3af' : '#6b7280'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text
                className={`mb-1 text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Confirm New Password
              </Text>
              <View className="relative">
                <TextInput
                  className={`rounded-full p-4 ${
                    isDarkMode ? 'bg-secondary-dark text-white' : 'bg-white text-gray-900'
                  }`}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Feather
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={isDarkMode ? '#9ca3af' : '#6b7280'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text className="text-sm text-red-500">{error}</Text> : null}

            {success ? <Text className="text-sm text-green-500">{success}</Text> : null}

            <TouchableOpacity
              className={`mt-4 rounded-full p-4 ${
                loading ? 'bg-purple-400' : 'bg-purple-600 active:bg-purple-700'
              }`}
              onPress={handleResetPassword}
              disabled={loading}>
              <Text className="text-center font-semibold text-white">
                {loading ? 'Resetting...' : 'Reset Password'}
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
