import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthApi from './(services)/authApi';

import Illustration from '~/components/ui/Illustration';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await AuthApi.login(email, password);

      // console.log('response f login', response);

      await AsyncStorage.setItem('authToken', response.token);

      AuthApi.setAuthToken(response.token);

      // console.log('token f login', response.token);

      router.push('/');
    } catch (error: any) {
      console.log('error f login', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-dark">
      <View className="flex-1">
        <View className="p-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-lg text-white">← Back</Text>
          </TouchableOpacity>
          <ScrollView className="mb-8">
            <View className="mb-6 items-center">
              <Illustration width={screenWidth} height={screenWidth * 0.5} />
            </View>

            <Text className="text-center text-5xl font-extrabold text-white">Saluuuut !!</Text>
            <Text className="text-center text-lg text-gray-400">Connectez-vous à votre compte</Text>

            <View className="space-y-4">
              <View>
                <Text className="mb-2 pl-2 text-lg text-white">Votre Email</Text>
                <View className="flex-row items-center rounded-full bg-white/10">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="email@example.com"
                    placeholderTextColor="#666"
                    className="flex-1 px-4 py-4 text-white"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Text className="pr-4 text-green-500">✓</Text>
                </View>
              </View>

              <View className="mt-4">
                <Text className="mb-2 pl-2 text-lg text-white">Votre mot de passe</Text>
                <View className="flex-row items-center rounded-full bg-white/10">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#666"
                    className="flex-1 px-4 py-4 text-white"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pr-4">
                    <Text className="text-gray-400">{showPassword ? '👁' : '👁‍🗨'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <TouchableOpacity className="mr-2 h-5 w-5 rounded border border-white/30" />
                  <Text className="text-white">Se souvenir de moi</Text>
                </View>
                <TouchableOpacity>
                  <Text className="text-purple-500">Mot de passe oublié ?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="mt-6 rounded-full bg-purple-600 py-3"
                onPress={handleLogin}
                disabled={loading}
                // onPress={() => router.push('/')}
              >
                <Text className="text-center text-lg font-semibold text-white">
                  {loading ? 'Loading...' : 'Se connecter'}
                </Text>
              </TouchableOpacity>

              {error ? <Text className="mt-2 text-center text-red-500">{error}</Text> : null}

              {/* <TouchableOpacity className="flex-row items-center justify-center space-x-2 rounded-full bg-white py-4">
              <Image source={require('../../assets/images/google-icon.png')} className="h-5 w-5" />
              <Text className="font-semibold text-[#14132A]">Sign in with Google</Text>
            </TouchableOpacity> */}

              <View className="mt-6 flex-row justify-center">
                <Text className="text-gray-400">Je suis un nouvel utilisateur. </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text className="text-purple-500">S'inscrire</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
