import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { Event, EventStatus } from '../../types/event';

import { API_URL } from '~/config';
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

  const handleExpand = () => {
    onClose();
    router.push({
      pathname: '/details',
      params: { id: event?._id },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50">
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className={`max-h-[80%] w-[90%] rounded-2xl p-6 ${
            isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'
          }`}>
          {event && (
            <>
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
                      API_URL + event.poster && event.poster.length > 0
                        ? { uri: API_URL + event.poster[0] }
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

                <View className="mt-4 gap-3">
                  <DetailRow
                    icon="calendar"
                    label="Start"
                    value={new Date(event.startDate).toLocaleString()}
                    isDarkMode={isDarkMode}
                  />
                  <DetailRow
                    icon="calendar"
                    label="End"
                    value={new Date(event.endDate).toLocaleString()}
                    isDarkMode={isDarkMode}
                  />
                  <DetailRow
                    icon="map-pin"
                    label="Location"
                    value={event.location}
                    isDarkMode={isDarkMode}
                  />
                  <DetailRow
                    icon="map"
                    label="City"
                    value={event.city?.name || 'No city specified'}
                    isDarkMode={isDarkMode}
                  />
                  <DetailRow
                    icon="dollar-sign"
                    label="Price"
                    value={`${event.price} DH`}
                    isDarkMode={isDarkMode}
                  />
                </View>
              </ScrollView>
              <TouchableOpacity
                onPress={handleExpand}
                className={`mt-4 rounded-full p-3 ${
                  isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/80'
                }`}>
                <Text className="text-center text-base font-semibold text-white">
                  View More Details
                </Text>
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function DetailRow({
  icon,
  label,
  value,
  isDarkMode,
}: {
  icon: any;
  label: string;
  value: string;
  isDarkMode: boolean;
}) {
  return (
    <View className="flex-row items-center">
      <Feather name={icon} size={20} color={isDarkMode ? '#fff' : '#000'} />
      <Text
        className={`ml-2 font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
        {label}:
      </Text>
      <Text className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{value}</Text>
    </View>
  );
}
