import React from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Event, EventStatus } from '../../types/event';

interface EventDetailsModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
}

export default function EventDetailsModal({ visible, event, onClose }: EventDetailsModalProps) {
  const { isDarkMode } = useTheme();

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

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose} 
        className="flex-1 items-center justify-center bg-black/50"
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={e => e.stopPropagation()} 
          className={`w-[90%] max-h-[80%] rounded-2xl p-6 ${
            isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'
          }`}
        >
          {event && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={onClose} className="absolute right-0 top-0 z-10 ">
                <Text
                  className={`text-xl font-bold ${
                    isDarkMode ? 'text-primary-light' : 'text-primary-dark'
                  }`}>
                  ✕
                </Text>
              </TouchableOpacity>

              <Text
                className={`pb-4 text-xl font-bold ${
                  isDarkMode ? 'text-primary-light' : 'text-primary-dark'
                }`}>
                {event.title}
              </Text>

              <View className="mb-4 h-48 w-full overflow-hidden rounded-2xl">
                <Image
                  source={
                    event.poster && event.poster.length > 0
                      ? { uri: event.poster[0] }
                      : require('../../assets/event1.jpg')
                  }
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>

              <Text
                className={`${getStatusColor(event.status as EventStatus)} text-right font-semibold`}>
                {event.status}
              </Text>

              <View className="space-y-2">
                <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Text className="font-semibold">Start: </Text>
                  {new Date(event.startDate).toLocaleString()}
                </Text>
                <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Text className="font-semibold">End: </Text>
                  {new Date(event.endDate).toLocaleString()}
                </Text>
                <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Text className="font-semibold">Location: </Text>
                  {event.location}
                </Text>
                <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Text className="font-semibold">City: </Text>
                  {event.city}
                </Text>
                <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Text className="font-semibold">Price: </Text>${event.price}
                </Text>
                <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Text className="font-semibold">Capacity: </Text>
                  {event.maxParticipants} participants
                </Text>
                <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Text className="font-semibold">Registered: </Text>
                  {event.registeredUsers?.length || 0} participants
                </Text>
                <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Text className="font-semibold">Visibility: </Text>
                  {event.isPublic ? 'Public' : 'Private'}
                </Text>
                <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Text className="font-semibold">Description: </Text>
                  {event.description}
                </Text>
              </View>
            </ScrollView>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
