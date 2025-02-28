import { View, Text, Image, TextInput, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import ThemeToggle from '../components/ui/ThemeToggle';
import BottomNavigation from '../components/ui/BottomNavigation';
import TopEvents from '../components/ui/TopEvents';
import Categories from '../components/ui/Categories';
import AllEvents from '~/components/ui/AllEvents';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import AuthApi from './(services)/authApi';

export default function Index() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    handleProfilePress();
  }, []);

  const handleProfilePress = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      router.push('/profile');
    } else {
      router.push('/welcome');
    }
   
  };

  const handleLogout = async () => {
    await AuthApi.logout();
    // await AsyncStorage.removeItem('authToken');
    console.log('Logged out');
    router.push('/');
  };

  return (
    <View className={`flex-1 px-4 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      <SafeAreaView className="flex-1">
        <ThemeToggle />
        <View className="mb-2 mt-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={handleProfilePress}>
            <Image
              source={require('../assets/profile-icon.jpg')}
              className="h-10 w-10 rounded-full"
            />
          </TouchableOpacity>
          <View className="flex-row items-center space-x-2">
            <Text className={`text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {/* {user?.firstName} */}
            </Text>
          </View>
          
          <TouchableOpacity onPress={handleLogout}>
            <View className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'} p-2`}>
              <Feather name="log-out" size={24} color='white' />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView>
          <View className="mt-4 flex-row ">
            {/* <Feather name="search" size={20} color="#666" /> */}
            <TextInput
              placeholder="Search artist"
              placeholderTextColor="#fff"
              className={`w-full rounded-full px-4 py-3 text-white ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}
            />
          </View>
          <Categories />
          <TopEvents />
          <AllEvents />
        </ScrollView>

        <BottomNavigation />
      </SafeAreaView>
    </View>
  );
}
