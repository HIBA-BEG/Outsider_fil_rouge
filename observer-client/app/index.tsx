import { View, Text, Image, TextInput, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import ThemeToggle from '../components/ui/ThemeToggle';
import BottomNavigation from '../components/ui/BottomNavigation';
import TopEvents from '../components/ui/TopEvents';
import Categories from '../components/ui/Categories';
import AllEvents from '~/components/ui/AllEvents';

export default function Index() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <SafeAreaView className={`flex-1 px-4 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      {/* <View className="flex-row items-center justify-end p-4">
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View> */}
      <ThemeToggle />

      {/* Header */}
      <View className="mt-2 flex-row items-center justify-between">
        <TouchableOpacity>
          <View className="rounded-lg bg-gray-800 p-2">
            <Text className="text-white">☰</Text>
          </View>
        </TouchableOpacity>
        <View className="flex-row items-center space-x-2">
          <Text className={`text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Hello, Jane Cooper
          </Text>
        </View>
        <Image source={require('../assets/profile-icon.jpg')} className="h-10 w-10 rounded-full" />
      </View>

      {/* Search Bar */}
      <View className="mt-4 flex-row ">
        <Feather name="search" size={20} color="#666" />
        <TextInput
          placeholder="Search artist"
          placeholderTextColor="#666"
          className="w-full rounded-full bg-gray-800 px-4 py-3 text-white"
        />
      </View>

      <Categories />

      <TopEvents />

      <AllEvents />

      <BottomNavigation />
    </SafeAreaView>
  );
}
