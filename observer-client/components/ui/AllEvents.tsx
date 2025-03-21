import { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

import eventService from '../../app/(services)/eventApi';
import { useTheme } from '../../context/ThemeContext';
import { Event } from '../../types/event';

export default function AllEvents() {
  const { isDarkMode } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await eventService.getPersonalizedEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between">
        <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
          All Events
        </Text>
        <TouchableOpacity>
          <Text className="text-gray-400">Voir tous</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-2">
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : events.length === 0 ? (
          <Text className={`text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
            There's nothing available for the moment.
          </Text>
        ) : (
          events.slice(0, 4).map((event) => (
            <TouchableOpacity
              key={event._id}
              className={`mt-4 flex items-center rounded-2xl p-4 backdrop-blur-sm ${isDarkMode ? 'bg-white/30' : 'bg-black/80'}`}>
              <View className="h-32 w-full overflow-hidden rounded-2xl">
                <Image
                  source={
                    process.env.EXPO_PUBLIC_API_URL + event.poster
                      ? { uri: process.env.EXPO_PUBLIC_API_URL + event.poster[0] }
                      : require('../assets/event1.jpg')
                  }
                  className="h-full w-full"
                  style={{ backgroundColor: '#4B0082' }}
                />
              </View>
              <Text className="mt-2 text-base text-white">{event.title}</Text>
              <Text className="text-sm text-gray-400">{event.description}</Text>
              <Text className="text-sm text-gray-400">{new Date(event.startDate).toString()}</Text>
            </TouchableOpacity>
          ))
        )}

        {/* <TouchableOpacity className={`mt-4 rounded-2xl p-4 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-white/30' : 'bg-black/80'}`}>
            <View className="h-32 w-full overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event2.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#4B0082' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">Jenny Wilson</Text>
            <Text className="text-sm text-gray-400">Danse contemporaine</Text>
          </TouchableOpacity>

          <TouchableOpacity className={`mt-4 rounded-2xl p-4 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-white/30' : 'bg-black/80'}`}>
            <View className="h-32 w-full overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event3.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#4B0082' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">Jenny Wilson</Text>
            <Text className="text-sm text-gray-400">Danse contemporaine</Text>
          </TouchableOpacity>

          <TouchableOpacity className={`mt-4 rounded-2xl p-4 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-white/30' : 'bg-black/80'}`}>
            <View className="h-32 w-full overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event4.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#4B0082' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">Jenny Wilson</Text>
            <Text className="text-sm text-gray-400">Danse contemporaine</Text>
          </TouchableOpacity> */}
      </View>
    </View>
  );
}
