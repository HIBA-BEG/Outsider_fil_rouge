import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import eventService from '../../app/(services)/eventApi';
import { useEffect, useState } from 'react';
import { Event } from '../../types/event';

export default function TopEvents() {
  const { isDarkMode } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await eventService.findAll();
        // console.log('eventsData', eventsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return <ActivityIndicator size="large" color={isDarkMode ? 'white' : 'black'} />;
  }

  return (
    <View className="mt-6">
        <View className="flex-row items-center justify-between">
          <Text className={`text-lg font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>Top Events</Text>
          <TouchableOpacity>
            <Text className="text-gray-400">Voir tous</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        {events.slice(0, 4).map((event) => (
          <TouchableOpacity key={event._id} className={`mr-4 w-40 rounded-2xl p-2 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/80'}`}>
            <View className="h-32 w-32 overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event1.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#4B0082' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">{event.title}</Text>
            <Text className="text-sm text-gray-400 ">{event.description}</Text>
          </TouchableOpacity>
        ))}

          {/* <TouchableOpacity className={`mr-4 rounded-2xl p-2 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/80'}`}>
            <View className="h-32 w-32 overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event1.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#4B0082' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">Jenny Wilson</Text>
            <Text className="text-sm text-gray-400">Danse contemporaine</Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity className={`mr-4 rounded-2xl p-2 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-white/30' : 'bg-primary-dark/80'}`}>
            <View className="h-32 w-32 overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event2.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#800080' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">Wade Warren</Text>
            <Text className="text-sm text-gray-400">Musician</Text>
          </TouchableOpacity>
          <TouchableOpacity className={`mr-4 rounded-2xl p-2 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/80'}`}>
            <View className="h-32 w-32 overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event3.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#800080' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">Wade Warren</Text>
            <Text className="text-sm text-gray-400">Musician</Text>
          </TouchableOpacity>
          <TouchableOpacity className={`mr-4 rounded-2xl p-2 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/80'}`}>
            <View className="h-32 w-32 overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event4.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#800080' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">Wade Warren</Text>
            <Text className="text-sm text-gray-400">Musician</Text>
          </TouchableOpacity> */}
        </ScrollView>
      </View>
  );
} 