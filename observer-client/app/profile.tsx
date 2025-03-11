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
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ActivityIndicator } from 'react-native';
import { User } from '../types/user';
import userService from './(services)/userApi';

const Profile = () => {
  const { isDarkMode } = useTheme();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await userService.getProfile();
      console.log('User Data:', userData); 
    console.log('Interests:', userData.interests); 
      setUser(userData);
    } catch (error) {
      console.error('Error loading profile:', error);
      // i'll handle the error later
    } finally {
      setLoading(false);
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

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      <View className="relative flex-1">
        <Image
          // source={user.profilePicture ? { uri: user.profilePicture } : require('../assets/event1.jpg')}
          source={require('../assets/event1.jpg')}
          className="absolute left-0 top-0 w-full"
          style={{ height: headerHeight }}
          resizeMode="cover"
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
            // source={user.profilePicture ? { uri: user.profilePicture } : require('../assets/event3.jpg')}
            source={require('../assets/event3.jpg')}
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
            <Text 
              className={`text-2xl font-bold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`} 
              style={{ fontSize: screenWidth * 0.06 }}
            >
              {`${user.firstName} ${user.lastName}`}
            </Text>

            <View className="mt-4 flex-row flex-wrap justify-between">
              <TouchableOpacity
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
                        ? 'bg-white/10 border border-white/20' 
                        : 'bg-primary-dark/10 border border-primary-dark/20'
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
                My Events
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {user.registeredEvents.map((event, index) => (
                  <Image
                    key={event._id}
                    source={{ uri: event.poster }}
                    className="mb-3 rounded-lg"
                    style={{
                      width: screenWidth > 600 ? (screenWidth - 32) / 3 - 4 : (screenWidth - 32) / 2 - 4,
                      height: screenWidth * 0.3,
                    }}
                  />
                ))}
              </View>

              <TouchableOpacity 
                className={`my-5 rounded-full ${
                  isDarkMode ? 'bg-white/20' : 'bg-primary-dark'
                } p-3`}
              >
                <Text 
                  className="text-center text-primary-light" 
                  style={{ fontSize: screenWidth * 0.04 }}
                >
                  View More Events
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
