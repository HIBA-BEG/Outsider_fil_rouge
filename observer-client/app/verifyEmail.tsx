import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthApi from './(services)/authApi';
import Illustration from '../components/ui/Illustration';
import { useTheme } from '../context/ThemeContext';

export default function VerifyEmail() {
  const { isDarkMode } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [token, setToken] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);

  const handleVerifyEmail = async () => {
    try {
      if (!token) {
        setError('Please provide a verification token');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      await AuthApi.verifyEmail(token);
      setSuccess('Email verified successfully! You can now log in.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Email verification error:', error);
      setError(error.message || 'Failed to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setShowResendModal(true);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      setError(error.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  const submitResendVerification = async () => {
    if (!resendEmail) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await AuthApi.resendVerification(resendEmail);
      setSuccess('Verification email has been resent. Please check your inbox.');
      setShowResendModal(false);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      setError(error.message || 'Failed to resend verification email.');
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
            <Illustration name="email-verification" height={screenWidth * 0.5} />
          </View>

          <Text
            className={`mb-6 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Verify Your Email
          </Text>

          <View className="mb-6 pt-4">
            <Text className={`mb-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enter the verification token from your email to complete your registration.
            </Text>

            <View className="gap-4">
              <View>
                <Text
                  className={`mb-2 text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Verification Token
                </Text>
                <TextInput
                  className={`rounded-3xl border p-4 ${
                    isDarkMode
                      ? 'border-gray-700 bg-gray-900 text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-900'
                  }`}
                  value={token}
                  onChangeText={setToken}
                  placeholder="Paste verification token here"
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                  multiline
                  numberOfLines={6}
                  style={{ height: 120 }}
                />
              </View>
            </View>
          </View>

          {error ? (
            <View className="mb-4 rounded-full border border-red-500/20 bg-red-500/10 p-4">
              <Text className="text-sm text-red-500">{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View className="mb-4 rounded-full border border-green-500/20 bg-green-500/10 p-4">
              <Text className="text-sm text-green-500">{success}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            className={`mb-4 rounded-full p-4 ${
              loading ? 'bg-purple-400' : 'bg-purple-600 active:bg-purple-700'
            }`}
            onPress={handleVerifyEmail}
            disabled={loading}>
            <Text className="text-center font-semibold text-white">
              {loading ? 'Verifying...' : 'Verify Email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResendVerification} className="p-4">
            <Text className={`text-center ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              Didn't receive the email? Resend
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')} className="p-4">
            <Text className={`text-center ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              Back to Login
            </Text>
          </TouchableOpacity>

          {/* Resend Email Modal */}
          <Modal
            animationType="slide"
            transparent
            visible={showResendModal}
            onRequestClose={() => setShowResendModal(false)}>
            <View className="flex-1 items-center justify-center bg-black/50">
              <View
                className={`m-5 w-5/6 rounded-2xl p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <Text
                  className={`mb-4 text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  Resend Verification Email
                </Text>

                <Text className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Enter your email address to resend the verification email.
                </Text>

                <TextInput
                  className={`mb-4 rounded-full border p-4 ${
                    isDarkMode
                      ? 'border-gray-700 bg-gray-800 text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-900'
                  }`}
                  value={resendEmail}
                  onChangeText={setResendEmail}
                  placeholder="Your email address"
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View className="flex-row justify-end gap-3">
                  <TouchableOpacity
                    className="rounded-full bg-gray-400 px-4 py-2"
                    onPress={() => setShowResendModal(false)}>
                    <Text className="font-medium text-white">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="rounded-full bg-purple-600 px-4 py-2"
                    onPress={submitResendVerification}>
                    <Text className="font-medium text-white">Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
