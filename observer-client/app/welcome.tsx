import { router } from 'expo-router';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';

import Illustration from '../components/ui/Illustration';
import { useTheme } from '../context/ThemeContext';

export default function Welcome() {
  const screenWidth = Dimensions.get('window').width;
  const { isDarkMode } = useTheme();

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'} p-6`}>
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className={`text-lg ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>← Back</Text>
      </TouchableOpacity>
      <View className="flex-1 items-center justify-center" />

      <View className="items-center justify-center">
        <View className="mb-6 items-center">
          <Illustration width={screenWidth} height={screenWidth * 0.5} />
        </View>

        <View className="mb-8">
          <Text
            className={`mb-2 text-center text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-primary-dark'
            }`}>
            There's a lot happening around you!
          </Text>
          <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Find events around you, you can search and buy event tickets as you wish
          </Text>
        </View>

        <View className="w-full gap-4">
          <TouchableOpacity
            onPress={() => router.push('/login')}
            className={`rounded-full py-3 ${isDarkMode ? 'bg-white' : 'bg-primary-dark'}`}>
            <Text
              className={`text-center text-lg font-semibold ${
                isDarkMode ? 'text-primary-dark' : 'text-white'
              }`}>
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/register')}
            className={`rounded-full border py-3 ${
              isDarkMode ? 'border-white/30' : 'border-primary-dark/30'
            }`}>
            <Text
              className={`text-center text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-primary-dark'
              }`}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
