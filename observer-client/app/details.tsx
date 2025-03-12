import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Event, EventStatus } from '../types/event';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import eventService from './(services)/eventApi';

export default function Details() {
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);

  const mockRating = 4.5;
  const mockComments = [
    {
      id: 1,
      user: 'John Doe',
      rating: 5,
      comment: 'Amazing event! Would definitely recommend.',
      date: '2024-03-15'
    },
    {
      id: 2,
      user: 'Jane Smith',
      rating: 4,
      comment: 'Great organization, but the venue was a bit small.',
      date: '2024-03-14'
    }
  ];

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.SCHEDULED:
        return 'text-green-500';
      case EventStatus.CANCELLED:
        return 'text-red-500';
      case EventStatus.COMPLETED:
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (params.id) {
        const events = await eventService.findAll();
        const foundEvent = events.find(e => e._id === params.id);
        setEvent(foundEvent || null);
      }
    };
    fetchEvent();
  }, [params.id]);

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      <View className="relative h-64">
        <Image
          source={
            event.poster && event.poster.length > 0
              ? { uri: event.poster[0] }
              : require('../assets/event1.jpg')
          }
          className="h-full w-full"
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 top-12 rounded-full bg-black/50 p-2">
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="p-6">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-2xl font-bold ${
              isDarkMode ? 'text-primary-light' : 'text-primary-dark'
            }`}>
            {event.title}
          </Text>
          <Text className={`${getStatusColor(event.status as EventStatus)} font-semibold`}>
            {event.status}
          </Text>
        </View>

        <View className="mt-4 gap-3">
          <DetailRow icon="user" label="Organizer" value={`${event.organizer?.firstName} ${event.organizer?.lastName}`} isDarkMode={isDarkMode} />
          <DetailRow icon="calendar" label="Start" value={new Date(event.startDate).toLocaleString()} isDarkMode={isDarkMode} />
          <DetailRow icon="calendar" label="End" value={new Date(event.endDate).toLocaleString()} isDarkMode={isDarkMode} />
          <DetailRow icon="map-pin" label="Location" value={event.location} isDarkMode={isDarkMode} />
          <DetailRow icon="map" label="City" value={event.city?.name || 'No city specified'} isDarkMode={isDarkMode} />
          <DetailRow icon="dollar-sign" label="Price" value={`$${event.price}`} isDarkMode={isDarkMode} />
          <DetailRow icon="users" label="Capacity" value={`${event.maxParticipants} participants`} isDarkMode={isDarkMode} />
          <DetailRow icon="user-check" label="Registered" value={`${event.registeredUsers?.length || 0} participants`} isDarkMode={isDarkMode} />
          <DetailRow icon="eye" label="Visibility" value={event.isPublic ? 'Public' : 'Private'} isDarkMode={isDarkMode} />
        </View>

        <View className="mt-4">
          <Text className={`text-lg font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
            Description
          </Text>
          <Text className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {event.description}
          </Text>
        </View>

        <View className="mt-8">
          <Text className={`text-lg font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
            Ratings
          </Text>
          <View className="mt-2 flex-row items-center">
            <Text className={`text-3xl font-bold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
              {mockRating}
            </Text>
            <View className="ml-2 flex-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                  key={star}
                  name="star"
                  size={20}
                  color={star <= mockRating ? '#FFD700' : '#808080'}
                />
              ))}
            </View>
          </View>
        </View>

        <View className="mt-8">
          <Text className={`text-lg font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
            Comments
          </Text>
          {mockComments.map((comment) => (
            <View key={comment.id} className="mt-4 rounded-lg bg-gray-800/20 p-4">
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
                  {comment.user}
                </Text>
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Feather
                      key={star}
                      name="star"
                      size={16}
                      color={star <= comment.rating ? '#FFD700' : '#808080'}
                    />
                  ))}
                </View>
              </View>
              <Text className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {comment.comment}
              </Text>
              <Text className="mt-2 text-sm text-gray-500">{comment.date}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value, isDarkMode }: { icon: any; label: string; value: string; isDarkMode: boolean }) {
  return (
    <View className="flex-row items-center">
      <Feather name={icon} size={20} color={isDarkMode ? '#fff' : '#000'} />
      <Text className={`ml-2 font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
        {label}:
      </Text>
      <Text className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{value}</Text>
    </View>
  );
}