import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';
import { User } from '../types/user';
import eventService from './(services)/eventApi';
import userService from './(services)/userApi';
import CustomAlert from '../components/ui/CustomAlert';
import UpdateProfile from '../components/ui/UpdateProfile';
import { Event } from '../types/event';

const Profile = () => {
  const { isDarkMode } = useTheme();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUserProfile();
    loadRegisteredEvents();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await userService.getProfile();
      // console.log('User Data:', userData);
      // console.log('Interests:', userData.interests);
      setUser(userData);
    } catch (error) {
      console.error('Error loading profile:', error);
      setErrorMessage('Error loading profile. Please try again.');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const loadRegisteredEvents = async () => {
    try {
      const events = await eventService.getRegisteredEvents();
      setRegisteredEvents(events);
    } catch (error) {
      console.error('Error loading registered events:', error);
    }
  };

  useEffect(() => {
    const dimensionsHandler = ({ window }: { window: { width: number; height: number } }) => {
      setScreenWidth(window.width);
      setScreenHeight(window.height);
    };

    const subscription = Dimensions.addEventListener('change', dimensionsHandler);
    return () => subscription.remove();
  }, []);

  const headerHeight = screenHeight * 0.35;
  const profileImageSize = screenWidth * 0.22 > 100 ? screenWidth * 0.22 : 100;
  const profileImageTop = headerHeight - profileImageSize / 2;

  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    try {
      const updatedUser = await userService.updateProfile(updatedData);
      setUser(updatedUser);
      setIsUpdateModalVisible(false);
      setTimeout(() => {
        setSuccessMessage('Profile updated successfully');
        setShowSuccessAlert(true);
      }, 300);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
      setShowErrorAlert(true);
    }
  };

  const handleEventPress = (eventId: string) => {
    router.push({
      pathname: '/details',
      params: { id: eventId },
    });
    // console.log('eventId', eventId);
  };

  const handleViewMoreEvents = () => {
    setShowAllEvents(true);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text>Error loading profile</Text>
      </SafeAreaView>
    );
  }

  // console.log(profilePictureUrl)
  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      <View className="relative flex-1">
        <Image
          source={
            API_URL + user.profilePicture
              ? { uri: API_URL + user.profilePicture }
              : require('../assets/profile-icon.jpg')
          }
          className="absolute left-0 top-0 w-full"
          style={{ height: headerHeight }}
          resizeMode="cover"
          onError={(error) => console.log('Image load error:', error.nativeEvent)}
        />

        <View
          className="absolute overflow-hidden rounded-full border-4 border-white/90"
          style={{
            left: screenWidth * 0.08,
            top: profileImageTop,
            width: profileImageSize,
            height: profileImageSize,
          }}>
          <Image
            source={
              API_URL + user.profilePicture
                ? { uri: API_URL + user.profilePicture }
                : require('../assets/profile-icon.jpg')
            }
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>

        <ScrollView
          className="w-full p-4"
          style={{
            marginTop: headerHeight + profileImageSize / 2,
            paddingTop: Platform.OS === 'ios' ? 0 : 10,
          }}>
          <View className="mb-4">
            <View className="flex-row items-center">
              <Text
                className={`text-2xl font-bold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}
                style={{ fontSize: screenWidth * 0.06 }}>
                {`${user.firstName} ${user.lastName}`}
              </Text>

              {user.role === 'admin' && (
                <View
                  className={`ml-2 rounded-full px-2 py-0.5 ${
                    isDarkMode ? 'bg-red-500/20' : 'bg-red-500/10'
                  }`}>
                  <Text className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                    Admin
                  </Text>
                </View>
              )}
              {user.role === 'organizer' && (
                <View
                  className={`ml-2 rounded-full px-2 py-0.5 ${
                    isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'
                  }`}>
                  <Text className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                    Organizer
                  </Text>
                </View>
              )}
              {user.role === 'participant' && (
                <View
                  className={`ml-2 rounded-full px-2 py-0.5 ${
                    isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'
                  }`}>
                  <Text className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                    Participant
                  </Text>
                </View>
              )}
            </View>

            <View className="mt-4 flex-row flex-wrap justify-between">
              <TouchableOpacity
                onPress={() => setIsUpdateModalVisible(true)}
                className={`mb-2 rounded-full ${
                  isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                } p-3`}
                style={{ width: screenWidth > 380 ? '48%' : '100%' }}>
                <Text
                  className={`text-center ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}
                  style={{ fontSize: screenWidth * 0.035 }}>
                  Update My Profile
                </Text>
              </TouchableOpacity>

              {user.role !== 'admin' && (
                <TouchableOpacity
                  className={`mb-2 rounded-full ${
                    isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                  } p-3`}
                  style={{ width: screenWidth > 380 ? '48%' : '100%' }}>
                  <Text
                    className={`text-center ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}
                    style={{ fontSize: screenWidth * 0.035 }}>
                    My Friends
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {user.role !== 'admin' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-4"
                contentContainerStyle={{ paddingRight: 20 }}>
                {user.interests.map((interest, index) => (
                  <TouchableOpacity
                    key={typeof interest === 'string' ? interest : interest._id}
                    className={`mr-3 rounded-full ${
                      isDarkMode
                        ? 'border border-white/20 bg-white/10'
                        : 'border border-primary-dark/20 bg-primary-dark/10'
                    } px-4 py-2`}>
                    <Text
                      className={`${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}
                      style={{ fontSize: screenWidth * 0.035 }}>
                      {typeof interest === 'string' ? 'Loading...' : interest.category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {user.role !== 'admin' && (
            <>
              <Text
                className={`mb-2 text-lg font-semibold ${
                  isDarkMode ? 'text-primary-light' : 'text-primary-dark'
                }`}
                style={{ fontSize: screenWidth * 0.045 }}>
                Registered Events
              </Text>
              <View className="flex-row flex-wrap justify-center gap-4">
                {(showAllEvents ? registeredEvents : registeredEvents.slice(0, 2)).map((event) => (
                  <TouchableOpacity
                    key={event._id}
                    onPress={() => handleEventPress(event._id)}
                    className={`flex w-44 rounded-2xl p-2 backdrop-blur-sm ${
                      isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                    }`}>
                    <View className="h-32 w-full overflow-hidden rounded-2xl">
                      <Image
                        source={
                          API_URL + event.poster
                            ? { uri: API_URL + event.poster[0] }
                            : require('../assets/event1.jpg')
                        }
                        className="h-full w-full"
                        style={{ backgroundColor: '#4B0082' }}
                      />
                    </View>
                    <Text
                      className={`font-bold underline ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'} mt-2 text-base`}>
                      {event.title}
                    </Text>
                    <Text
                      className={`${isDarkMode ? 'text-primary-light' : 'text-primary-dark'} mt-2 text-base`}>
                      <Text className="font-bold">Start: </Text>
                      {new Date(event.startDate).toLocaleString()}
                    </Text>
                    <Text
                      className={`${isDarkMode ? 'text-primary-light' : 'text-primary-dark'} mt-2 text-base`}>
                      <Text className="font-bold">End: </Text>
                      {new Date(event.endDate).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {registeredEvents.length > 2 && !showAllEvents && (
                <TouchableOpacity
                  onPress={handleViewMoreEvents}
                  className={`my-5 rounded-full ${
                    isDarkMode ? 'bg-white/20' : 'bg-primary-dark'
                  } p-3`}>
                  <Text
                    className="text-center text-primary-light"
                    style={{ fontSize: screenWidth * 0.04 }}>
                    View More Events
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </View>
      {user && (
        <UpdateProfile
          isVisible={isUpdateModalVisible}
          onClose={() => setIsUpdateModalVisible(false)}
          user={user}
          onUpdate={handleUpdateProfile}
        />
      )}

      <CustomAlert
        visible={showSuccessAlert}
        title="Success"
        message={successMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowSuccessAlert(false),
          },
        ]}
      />

      <CustomAlert
        visible={showErrorAlert}
        title="Error"
        message={errorMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowErrorAlert(false),
          },
        ]}
      />
    </SafeAreaView>
  );
};

export default Profile;
