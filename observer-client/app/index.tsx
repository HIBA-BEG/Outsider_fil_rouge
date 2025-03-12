import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthApi from './(services)/authApi';
import BottomNavigation from '../components/ui/BottomNavigation';
import Categories from '../components/ui/Interests';
import ThemeToggle from '../components/ui/ThemeToggle';
import TopEvents from '../components/ui/TopEvents';
import { useTheme } from '../context/ThemeContext';

import AllEvents from '../components/ui/AllEvents';
import { useAuth } from '../context/AuthContext';
import Interests from '../components/ui/Interests';
import eventService from './(services)/eventApi';
import { Event } from '../types/event';

export default function Index() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { logout } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState('all');

  useEffect(() => {
    fetchEvents();
    handleProfilePress();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [selectedInterest, events]);

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
    await logout();
    console.log('Logged out');
  };

  const fetchEvents = async () => {
    try {
      const eventsData = await eventService.findAll();
      // console.log('Events data:', eventsData);
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    if (selectedInterest === 'all') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(
        (event) => event.interests && event.interests._id === selectedInterest
      );
      setFilteredEvents(filtered);
    }
  };

  const handleInterestSelect = (interestId: string) => {
    setSelectedInterest(interestId);
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
              {user?.firstName} {user?.lastName}
            </Text>
          </View>

          <TouchableOpacity onPress={handleLogout}>
            <View
              className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'} p-2`}>
              <Feather name="log-out" size={24} color="white" />
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
          <Interests onSelectInterest={handleInterestSelect} selectedInterest={selectedInterest} />
          {/* <TopEvents />
          <AllEvents /> */}

          <View className="mt-6">
            <View className="flex-row items-center justify-between">
              <Text
                className={`text-lg font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
                Top Events
              </Text>
              <TouchableOpacity>
                <Text className="text-gray-400">Voir tous</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
              {filteredEvents.slice(0, 4).map((event) => (
                <TouchableOpacity
                  key={event._id}
                  className={`mr-4 flex w-40 items-center rounded-2xl p-2 backdrop-blur-sm ${
                    isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/80'
                  }`}>
                  <View className="h-32 w-32 overflow-hidden rounded-2xl">
                    <Image
                      source={require('../assets/event2.jpg')}
                      className="h-full w-full"
                      style={{ backgroundColor: '#4B0082' }}
                    />
                  </View>
                  <Text className="mt-2 text-base text-white">{event.title}</Text>
                  <Text className="text-sm text-gray-400">{event.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="mt-6">
            <View className="flex-row items-center justify-between">
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                All Events
              </Text>
            </View>

            <View className="mt-2">
              {filteredEvents.length === 0 ? (
                <Text className={`text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  No events found for this category.
                </Text>
              ) : (
                filteredEvents.map((event) => (
                  <TouchableOpacity
                    key={event._id}
                    className={`mt-4 flex items-center rounded-2xl p-4 backdrop-blur-sm ${
                      isDarkMode ? 'bg-white/30' : 'bg-black/80'
                    }`}>
                    <View className="h-32 w-full overflow-hidden rounded-2xl">
                      <Image
                        source={require('../assets/event1.jpg')}
                        className="h-full w-full"
                        style={{ backgroundColor: '#4B0082' }}
                      />
                    </View>
                    <Text className="mt-2 text-base text-white">{event.title}</Text>
                    <Text className="text-sm text-gray-400">{event.description}</Text>
                    <Text className="text-sm text-gray-400">
                      {new Date(event.startDate).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        <BottomNavigation />
      </SafeAreaView>
    </View>
  );
}
