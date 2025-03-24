import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthApi from './(services)/authApi';
import CustomAlert from '../components/ui/CustomAlert';
import Illustration from '../components/ui/Illustration';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const { isDarkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBanAlert, setShowBanAlert] = useState(false);
  const [showVerificationLink, setShowVerificationLink] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await AuthApi.login(email, password);
      AuthApi.setAuthToken(response.token);
      await login(response.token);
      // console.log('token f login', response.token);

      router.push('/');
    } catch (error: any) {
      if (error.message === 'Please verify your email before logging in') {
        setError(
          'Your email address has not been verified. Please check your email for verification instructions.'
        );
        setShowVerificationLink(true);
      } else if (error.message === 'ACCOUNT_BANNED') {
        setShowBanAlert(true);
      } else {
        console.log('error f login', error);
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
        <View className="flex-1">
          <View className="p-6">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className={`text-lg ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                ← Back
              </Text>
            </TouchableOpacity>

            <ScrollView className="mb-8">
              <View className="mb-6 items-center">
                <Illustration width={screenWidth} height={screenWidth * 0.5} />
              </View>

              <Text
                className={`text-center text-5xl font-extrabold ${
                  isDarkMode ? 'text-white' : 'text-primary-dark'
                }`}>
                Welcome Back!
              </Text>
              <Text
                className={`text-center text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign in to your account
              </Text>

              <View className="mt-8 gap-4">
                <View>
                  <Text
                    className={`mb-2 pl-2 text-lg ${
                      isDarkMode ? 'text-white' : 'text-primary-dark'
                    }`}>
                    Email
                  </Text>
                  <View
                    className={`flex-row items-center rounded-full ${
                      isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                    }`}>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="email@example.com"
                      placeholderTextColor={isDarkMode ? '#666' : '#999'}
                      className={`flex-1 px-4 py-4 ${
                        isDarkMode ? 'text-white' : 'text-primary-dark'
                      }`}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {email.length > 0 && <Text className="pr-4 text-green-500">✓</Text>}
                  </View>
                </View>

                <View>
                  <Text
                    className={`mb-2 pl-2 text-lg ${
                      isDarkMode ? 'text-white' : 'text-primary-dark'
                    }`}>
                    Password
                  </Text>
                  <View
                    className={`flex-row items-center rounded-full ${
                      isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                    }`}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={isDarkMode ? '#666' : '#999'}
                      className={`flex-1 px-4 py-4 ${
                        isDarkMode ? 'text-white' : 'text-primary-dark'
                      }`}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="pr-4">
                      <Feather
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color={isDarkMode ? '#666' : '#999'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity onPress={() => router.push('/forgotPassword')} className="p-2">
                  <Text className="text-right text-purple-500">Forgot password ?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`mt-4 rounded-full py-3 ${
                    isDarkMode ? 'bg-white' : 'bg-primary-dark'
                  }`}
                  onPress={handleLogin}
                  disabled={loading}>
                  <Text
                    className={`text-center text-lg font-semibold ${
                      isDarkMode ? 'text-primary-dark' : 'text-white'
                    }`}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Text>
                </TouchableOpacity>

                {error && <Text className="my-2 text-center text-red-500">{error}</Text>}

                {showVerificationLink && (
                  <TouchableOpacity
                    className="rounded-full bg-red-500 py-3"
                    onPress={() => router.push('/verifyEmail')}>
                    <Text className="text-center text-lg font-semibold text-white">
                      Verify your email now
                    </Text>
                  </TouchableOpacity>
                )}

                <View className="mt-6 flex-row justify-center">
                  <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text className="font-semibold text-purple-500">Register</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>

      <CustomAlert
        visible={showBanAlert}
        title="Account Banned"
        message="Your account has been banned. Please contact support for more information."
        buttons={[
          {
            text: 'OK',
            style: 'destructive',
            onPress: () => {
              setShowBanAlert(false);
              setEmail('');
              setPassword('');
            },
          },
        ]}
      />
    </>
  );
}
