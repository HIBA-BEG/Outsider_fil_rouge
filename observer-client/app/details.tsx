import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Event, EventStatus } from '../types/event';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import eventService from './(services)/eventApi';
import CustomAlert from '../components/ui/CustomAlert';
import { useAuth } from '~/context/AuthContext';
import { API_URL } from '../config';
import CommentSection from '../components/ui/CommentSection';
import ratingService from './(services)/ratingApi';

export default function Details() {
  const { isDarkMode } = useTheme();
  const { user: currentUser } = useAuth();
  const params = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [availableSpots, setAvailableSpots] = useState<number>(0);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress: () => void; }[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);

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
    const fetchEventDetails = async () => {
      if (params.id) {
        const events = await eventService.findAll();
        const foundEvent = events.find(e => e._id === params.id);
        setEvent(foundEvent || null);
        
        try {
          const spots = await eventService.getAvailableSpots(params.id as string);
          setAvailableSpots(spots);
        } catch (error) {
          console.error('Error fetching available spots:', error);
        }

        // console.log('registeredUsers', foundEvent?.registeredUsers);
        // console.log('currentUser', currentUser?._id);

        if (foundEvent && foundEvent.registeredUsers.includes(currentUser?._id || '')) {
          setIsRegistered(true);
        }
      }
    };
    fetchEventDetails();
  }, [params.id, currentUser?._id]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!event) return;
      try {
        const [average, ratings] = await Promise.all([
          ratingService.getEventAverageRating(event._id),
          ratingService.getEventRatings(event._id)
        ]);
        setAverageRating(average);
        
        const userRating = ratings.find(r => r.user._id === currentUser?._id);
        if (userRating) {
          setUserRating(userRating.score);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };
    
    fetchRatings();
  }, [event?._id, currentUser?._id]);

  const showAlert = (config: typeof alertConfig) => {
    setAlertConfig({ ...config, visible: true });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const canCancelReservation = (startDate: string): boolean => {
    const eventStart = new Date(startDate);
    const hoursBeforeEvent = new Date(eventStart);
    hoursBeforeEvent.setHours(hoursBeforeEvent.getHours() - 48);
    return new Date() < hoursBeforeEvent;
  };

  const handleReservation = async () => {
    if (!event) return;

    if (isRegistered) {
      if (!canCancelReservation(event.startDate.toString())) {
        showAlert({
          visible: true,
          title: "Cannot Cancel Reservation",
          message: "Reservations can only be cancelled up to 48 hours before the event starts.",
          buttons: [
            { text: "OK", onPress: hideAlert }
          ]
        });
        return;
      }

      showAlert({
        visible: true,
        title: "Cancel Reservation",
        message: "Are you sure you want to cancel your reservation?",
        buttons: [
          {
            text: "Cancel",
            style: "cancel",
            onPress: hideAlert
          },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
              hideAlert();
              await processCancellation();
            }
          }
        ]
      });
    } else {
      showAlert({
        visible: true,
        title: "Confirm Reservation",
        message: "Would you like to reserve a ticket for this event?",
        buttons: [
          {
            text: "Cancel",
            style: "cancel",
            onPress: hideAlert
          },
          {
            text: "Reserve",
            onPress: async () => {
              hideAlert();
              await processReservation();
            }
          }
        ]
      });
    }
  };

  const processReservation = async () => {
    setIsLoading(true);
    try {
      await eventService.registerForEvent(event!._id);
      setIsRegistered(true);
      const spots = await eventService.getAvailableSpots(event!._id);
      setAvailableSpots(spots);
      showAlert({
        visible: true,
        title: "Success",
        message: "Your reservation has been confirmed!",
        buttons: [{ text: "OK", onPress: hideAlert }]
      });
    } catch (error) {
      showAlert({
        visible: true,
        title: "Error",
        message: "Failed to make reservation. Please try again.",
        buttons: [{ text: "OK", onPress: hideAlert }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processCancellation = async () => {
    setIsLoading(true);
    try {
      await eventService.cancelRegistration(event!._id);
      setIsRegistered(false);
      const spots = await eventService.getAvailableSpots(event!._id);
      setAvailableSpots(spots);
      showAlert({
        visible: true,
        title: "Success",
        message: "Your reservation has been cancelled.",
        buttons: [{ text: "OK", onPress: hideAlert }]
      });
    } catch (error) {
      showAlert({
        visible: true,
        title: "Error",
        message: "Failed to cancel reservation. Please try again.",
        buttons: [{ text: "OK", onPress: hideAlert }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (score: number) => {
    if (!event || !currentUser) return;

    setIsRatingLoading(true);
    try {
      if (userRating) {
        await ratingService.cancelRating(event._id);
        setUserRating(null);
      }
      
      if (userRating !== score) {
        await ratingService.createRating(event._id, score);
        setUserRating(score);
      }
      
      const newAverage = await ratingService.getEventAverageRating(event._id);
      setAverageRating(newAverage);
    } catch (error: any) {
      showAlert({
        visible: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to update rating",
        buttons: [{ text: "OK", onPress: hideAlert }]
      });
    } finally {
      setIsRatingLoading(false);
    }
  };

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
        <View className="relative h-64">
          <Image
            source={
              API_URL + event.poster && event.poster.length > 0
                ? { uri: API_URL + event.poster[0] }
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

          {new Date(event.endDate) > new Date() && (
            <TouchableOpacity
              onPress={handleReservation}
              disabled={isLoading || availableSpots === 0}
              className={`absolute bottom-4 left-4 right-4 rounded-full p-4 ${
                isLoading 
                  ? 'bg-gray-500' 
                  : availableSpots === 0 
                    ? 'bg-red-500'
                    : isRegistered 
                      ? 'bg-red-500'
                      : 'bg-blue-500'
              }`}>
              <Text className="text-center text-white font-semibold">
                {isLoading 
                  ? 'Processing...' 
                  : availableSpots === 0 
                    ? 'Event Full'
                    : isRegistered 
                      ? 'Cancel Reservation'
                      : `Reserve a Ticket (${availableSpots} left)`}
              </Text>
            </TouchableOpacity>
          )}
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
            <DetailRow icon="dollar-sign" label="Price" value={`${event.price} DH`} isDarkMode={isDarkMode} />
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
            <View className="mt-2">
              <View className="flex-row items-center">
                <Text className={`text-3xl font-bold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
                  {averageRating.toFixed(1)}
                </Text>
                <View className="ml-2 flex-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      disabled={isRatingLoading || !event || new Date() < new Date(event.endDate)}
                      onPress={() => handleRating(star)}
                    >
                      <Feather
                        name={star <= (userRating || averageRating) ? "star" : "star"}
                        size={20}
                        color={star <= (userRating || averageRating) ? '#FFD700' : '#808080'}
                        style={{ opacity: isRatingLoading ? 0.5 : 1 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {new Date() < new Date(event?.endDate || '') && (
                <Text className="mt-2 text-sm text-gray-500">
                  Rating will be available after the event ends
                </Text>
              )}
              {userRating && (
                <Text className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your rating: {userRating}/5
                </Text>
              )}
            </View>
          </View>

          <CommentSection eventId={event._id} organizerId={event.organizer._id} />
        </View>
      </ScrollView>
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </>
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