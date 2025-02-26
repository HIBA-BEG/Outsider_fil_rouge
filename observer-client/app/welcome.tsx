import { View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Illustration from '~/components/ui/Illustration';
import { Dimensions } from 'react-native';
import { useTheme } from './context/ThemeContext';

export default function Welcome() {
  const screenWidth = Dimensions.get('window').width;
  const { isDarkMode } = useTheme();

  return (
    <View className="bg-primary-dark flex-1 p-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className={`text-lg ${isDarkMode ? 'text-primary-dark' : 'text-white'}`}>← Back</Text>
      </TouchableOpacity>
      <View className="flex-1 items-center justify-center"></View>
      <View className="mb-6 items-center">
        <Illustration width={screenWidth} height={screenWidth * 0.5} />
      </View>

      <View className="mb-8">
        <Text className="mb-2 text-center text-3xl font-bold text-white">
          There's a lot happening around you!
        </Text>
        <Text className="text-center text-gray-400">
          Find events around you, you can search and buy event tickets as you wish
        </Text>
      </View>

      <View className="space-y-4">
        <TouchableOpacity
          onPress={() => router.push('/login')}
          className="mb-4 rounded-full bg-white py-3">
          <Text className="text-primary-dark text-center text-lg font-semibold">Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/register')}
          className="rounded-full border border-white/30 py-3">
          <Text className="text-primary-light text-center text-lg font-semibold">Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
