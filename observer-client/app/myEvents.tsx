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
import EventDetailsModal from '../components/ui/EventDetails';
import CustomAlert from '../components/ui/CustomAlert';

export default function MyEvents() {
  const { isDarkMode } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [showCreateSuccessAlert, setShowCreateSuccessAlert] = useState(false);
  const [showCreateErrorAlert, setShowCreateErrorAlert] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState('');

  const fetchMyEvents = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const MyEvents = await eventService.findByOrganizer();
      
      if (MyEvents && Array.isArray(MyEvents)) {
        const sortedEvents = MyEvents.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setEvents(sortedEvents);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setIsError(true);
      setErrorMessage('Unable to load events. Please try again later.');
      setShowErrorAlert(true);
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

  const handleCloseAddEvent = (success?: boolean, error?: string) => {
    setShowAddEventModal(false);
    if (success) {
      setTimeout(() => {
        setShowCreateSuccessAlert(true);
        fetchMyEvents(); 
      }, 300);
    } else if (error) {
      setCreateErrorMessage(error);
      setTimeout(() => {
        setShowCreateErrorAlert(true);
      }, 300);
    }
  };

  const handleUpdateEvent = (eventId: string) => {
    // I'll implement this later
    // console.log('Update event:', eventId);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteAlert(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      await eventService.deleteEvent(eventToDelete);
      setShowDeleteAlert(false);
      setShowSuccessAlert(true);
      fetchMyEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      setErrorMessage('Failed to delete event. Please try again.');
      setShowDeleteAlert(false);
      setShowErrorAlert(true);
    }
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const handleCloseEventDetails = () => {
    setShowEventDetailsModal(false);
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className={`flex-1 items-center justify-center ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
        <Text className={`text-lg mb-4 ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
          Unable to load events
        </Text>
        <TouchableOpacity
          onPress={fetchMyEvents}
          className={`rounded-full px-6 py-3 ${isDarkMode ? 'bg-white/20' : 'bg-primary-dark'}`}
        >
          <Text className={isDarkMode ? 'text-white' : 'text-white'}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
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
                  You haven't organized any events yet.
                </Text>
              </View>
            ) : (
              <View className="my-4">
                {events.map((event) => {
                  console.log('Event poster:', event.poster);
                  const startDate = new Date(event.startDate);
                  return (
                    <TouchableOpacity
                      key={event._id}
                      onPress={() => handleEventPress(event)}
                      className={`mt-4 flex rounded-2xl p-4 backdrop-blur-sm ${
                        isDarkMode ? 'bg-white/30' : 'bg-black/80'
                      }`}>
                      <View className="h-32 w-full overflow-hidden rounded-2xl">
                        <Image
                          // source={require('../assets/event1.jpg')}
                          source={
                            event.poster && event.poster.length > 0
                              ? { uri: event.poster[0] }
                              : require('../assets/event1.jpg')
                          }
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

                      <View className="mb-2 flex-row justify-end">
                        <TouchableOpacity
                          onPress={() => handleUpdateEvent(event._id)}
                          className="mr-4">
                          <Text className="text-green-400">✎</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteEvent(event._id)}
                          className="mr-2">
                          <Text className="text-red-400">🗑</Text>
                        </TouchableOpacity>
                      </View>
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
        <EventDetailsModal
          visible={showEventDetailsModal}
          event={selectedEvent}
          onClose={handleCloseEventDetails}
        />
      </View>

      <CustomAlert
        visible={showDeleteAlert}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        buttons={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setShowDeleteAlert(false)
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: confirmDeleteEvent
          }
        ]}
      />

      <CustomAlert
        visible={showSuccessAlert}
        title="Success"
        message="Event deleted successfully"
        buttons={[
          {
            text: "OK",
            onPress: () => setShowSuccessAlert(false)
          }
        ]}
      />

      <CustomAlert
        visible={showErrorAlert}
        title="Error"
        message={errorMessage}
        buttons={[
          {
            text: "OK",
            onPress: () => setShowErrorAlert(false)
          }
        ]}
      />

      <CustomAlert
        visible={showCreateSuccessAlert}
        title="Success"
        message="Event created successfully"
        buttons={[
          {
            text: "OK",
            onPress: () => setShowCreateSuccessAlert(false)
          }
        ]}
      />

      <CustomAlert
        visible={showCreateErrorAlert}
        title="Error"
        message={createErrorMessage}
        buttons={[
          {
            text: "OK",
            onPress: () => setShowCreateErrorAlert(false)
          }
        ]}
      />
    </>
  );
}
