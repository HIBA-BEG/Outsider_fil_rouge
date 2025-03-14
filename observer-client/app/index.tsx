import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthApi from './(services)/authApi';
import eventService from './(services)/eventApi';
import BottomNavigation from '../components/ui/BottomNavigation';
import EventDetailsModal from '../components/ui/EventDetails';
import Interests from '../components/ui/Interests';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Event } from '../types/event';

import { API_URL } from '~/config';

export default function Index() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { logout } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchEvents();
    handleProfilePress();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [selectedInterest, events, searchQuery]);

  const handleProfilePress = async () => {
    // console.log('Profile button pressed');
    // const token = await AsyncStorage.getItem('authToken');
    if (user) {
      console.log('Navigating to /profile');
      router.push('/profile');
    } else {
      console.log('Navigating to /welcome');
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
    let filtered = events;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (event) =>
          (event.title?.toLowerCase() || '').includes(query) ||
          (event.organizer?.firstName?.toLowerCase() || '').includes(query) ||
          (event.organizer?.lastName?.toLowerCase() || '').includes(query)
      );
    }

    if (selectedInterest !== 'all') {
      filtered = filtered.filter(
        // @ts-ignore
        (event) => event.interests && event.interests._id === selectedInterest
      );
    }

    setFilteredEvents(filtered);
  };

  const handleInterestSelect = (interestId: string) => {
    setSelectedInterest(interestId);
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  return (
    <View className={`flex-1 px-4 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      {isLoading ? (
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      ) : (
        <>
          <SafeAreaView className="flex-1">
            <ThemeToggle />
            <View className="mb-2 mt-2 flex-row items-center gap-2">
              <TouchableOpacity onPress={handleProfilePress}>
                <Image
                  source={
                    API_URL + user?.profilePicture
                      ? { uri: API_URL + user?.profilePicture }
                      : require('../assets/profile-icon.jpg')
                  }
                  className="h-10 w-10 rounded-full"
                />
              </TouchableOpacity>
              {/* <View className="flex-row items-center gap-2">
            <Text className={`text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View> */}

              <TextInput
                placeholder="Search events, or organizers"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
                className={`flex-1 rounded-full border px-4 py-3 ${
                  isDarkMode
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                }`}
              />

              <TouchableOpacity onPress={handleLogout}>
                <View
                  className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'} p-2`}>
                  <Feather name="log-out" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* <View className="mt-4">
            <TextInput
              placeholder="Search events, or organizers"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className={`rounded-full px-4 py-3 ${
                isDarkMode
                  ? 'bg-primary-light/30 text-white'
                  : 'bg-primary-dark/10 text-primary-dark'
              }`}
            />
          </View> */}
              <Interests
                onSelectInterest={handleInterestSelect}
                selectedInterest={selectedInterest}
              />

              <View className="mt-6">
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-lg font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
                    Top Events
                  </Text>
                  <TouchableOpacity>
                    <Text className={isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}>
                      See all
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                  {filteredEvents.slice(0, 4).map((event) => (
                    <TouchableOpacity
                      key={event._id}
                      onPress={() => handleEventPress(event)}
                      className={`mr-4 w-40 rounded-2xl p-4 ${
                        isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                      }`}>
                      <View className="h-32 w-full overflow-hidden rounded-2xl">
                        <Image
                          source={
                            API_URL + event.poster
                              ? { uri: API_URL + event.poster }
                              : require('../assets/event3.jpg')
                          }
                          className="h-full w-full"
                        />
                      </View>
                      <Text
                        className={`mt-2 font-semibold ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                        {event.title}
                      </Text>
                      <Text
                        className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                        {event.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mt-6">
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
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
                        onPress={() => handleEventPress(event)}
                        className={`mt-4 rounded-2xl p-4 ${
                          isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                        }`}>
                        <View className="h-48 w-full overflow-hidden rounded-2xl">
                          <Image
                            source={
                              API_URL + event.poster
                                ? { uri: API_URL + event.poster[0] }
                                : require('../assets/event1.jpg')
                            }
                            className="h-full w-full"
                          />
                        </View>
                        <View className="mt-3">
                          <Text
                            className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                            {event.title}
                          </Text>
                          <Text
                            className={`mt-1 text-sm ${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                            {event.description}
                          </Text>
                          <Text
                            className={`mt-2 text-sm ${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                            📅 {new Date(event.startDate).toLocaleDateString()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>
            </ScrollView>

            <BottomNavigation />
          </SafeAreaView>

          <EventDetailsModal
            visible={isModalVisible}
            event={selectedEvent}
            onClose={() => setIsModalVisible(false)}
          />
        </>
      )}
    </View>
  );
}
