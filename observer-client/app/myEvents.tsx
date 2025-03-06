import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';

import eventService from './(services)/eventApi';
import AddEvent from '../components/ui/AddEvent';
import { useTheme } from '../context/ThemeContext';
import { Event } from '../types/event';

export default function MyEvents() {
  const { isDarkMode } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  const fetchMyEvents = async () => {
    try {
      const MyEvents = await eventService.findByOrganizer();
      console.log('My events list', MyEvents);
      const sortedEvents = MyEvents.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleAddEvent = () => {
    setShowAddEventModal(true);
  };

  const handleCloseAddEvent = () => {
    setShowAddEventModal(false);
    fetchMyEvents();
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <View className={`flex-1 px-4 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-6">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Text
                className={`text-lg font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
                ← Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddEvent}>
              <Text
                className={`text-lg font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
                Add Event
              </Text>
            </TouchableOpacity>
          </View>

          {events.length === 0 ? (
            <View className="my-4">
              <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                You haven’t organized any events yet.
              </Text>
            </View>
          ) : (
            <View className="my-4">
              {events.map((event) => {
                const startDate = new Date(event.startDate);
                return (
                  <TouchableOpacity
                    key={event._id}
                    className={`mt-4 flex rounded-2xl p-4 backdrop-blur-sm ${
                      isDarkMode ? 'bg-white/30' : 'bg-black/80'
                    }`}>
                    <View className="h-32 w-full overflow-hidden rounded-2xl">
                      <Image
                        source={require('../assets/event1.jpg')}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    </View>
                    <Text className="text-base font-medium text-white">{event.title}</Text>
                    <Text className="mt-1 text-sm text-gray-400">
                      {isNaN(startDate.getTime()) ? 'Invalid date' : startDate.toLocaleDateString()}
                    </Text>
                    {event.description && (
                      <Text className="mt-1 text-sm text-gray-400">{event.description}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
      <Modal visible={showAddEventModal} transparent animationType="slide">
        <AddEvent onClose={handleCloseAddEvent} />
      </Modal>
    </View>
  );
}
