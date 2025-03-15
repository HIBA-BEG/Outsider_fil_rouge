import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';
import userService from './(services)/userApi';
import CustomAlert from '../components/ui/CustomAlert';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/user';
export default function AllUsers() {
  const { isDarkMode } = useTheme();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  // const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'organizers' | 'participants' | 'suggestions'>(
    'suggestions'
  );

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      let fetchedUsers: User[];

      switch (activeTab) {
        case 'organizers':
          fetchedUsers = await userService.findAllOrganizers();
          break;
        case 'participants':
          fetchedUsers = await userService.findAllParticipants();
          break;
        case 'all':
          fetchedUsers = await userService.allUsers();
          break;
        default:
          fetchedUsers = await userService.suggestedUsers(currentUser?._id || '');
        //   console.log('Fetched suggested users:', fetchedUsers);
      }

      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Unable to load users. Please try again later.');
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const handleAddFriend = async (userId: string) => {
    try {
      // i'll handle the friend request later
      // setSuccessMessage('Friend request sent successfully');
      // setShowSuccessAlert(true);
    } catch (error) {
      console.log('Error sending friend request:', error);
      setErrorMessage('Failed to send friend request');
      setShowErrorAlert(true);
    }
  };

  useEffect(() => {
    // console.log('Tab changed to:', activeTab);
    fetchUsers();
  }, [activeTab]);

  const TabButton = ({ title, tab }: { title: string; tab: typeof activeTab }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`flex-1 rounded-full px-4 py-2 ${
        activeTab === tab ? (isDarkMode ? 'bg-white/20' : 'bg-primary-dark') : 'bg-transparent'
      }`}>
      <Text
        className={`text-center ${
          activeTab === tab
            ? 'font-semibold text-white'
            : isDarkMode
              ? 'text-white/60'
              : 'text-primary-dark/60'
        }`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
        {isLoading ? (
          <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
        ) : (
          <ScrollView
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
            <View className="py-4">
              <Text
                className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                Discover People
              </Text>

              <View className="mb-2 mt-4 flex-row rounded-full bg-white/5 p-1">
                <TabButton title="Suggestions" tab="suggestions" />
                <TabButton title="All" tab="all" />
                <TabButton title="Organizers" tab="organizers" />
                <TabButton title="Participants" tab="participants" />
              </View>
            </View>

            <View className="gap-4">
              {users.map((user) => (
                <TouchableOpacity
                  key={user._id}
                  className={`rounded-2xl p-4 ${isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'}`}>
                  <View className="flex-row items-center">
                    <Image
                      source={
                        API_URL + user.profilePicture
                          ? { uri: API_URL + user.profilePicture }
                          : require('../assets/profile-icon.jpg')
                      }
                      className="h-16 w-16 rounded-full"
                    />
                    <View className="flex-1 pl-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Text
                            className={`text-lg font-semibold ${
                              isDarkMode ? 'text-white' : 'text-primary-dark'
                            }`}>
                            {user.firstName} {user.lastName}
                          </Text>
                          {user.role === 'organizer' && (
                            <View
                              className={`ml-2 rounded-full px-2 py-0.5 ${
                                isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'
                              }`}>
                              <Text
                                className={`text-xs ${
                                  isDarkMode ? 'text-purple-300' : 'text-purple-600'
                                }`}>
                                Organizer
                              </Text>
                            </View>
                          )}
                          {user.role === 'participant' && (
                            <View
                              className={`ml-2 rounded-full px-2 py-0.5 ${
                                isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'
                              }`}>
                              <Text
                                className={`text-xs ${
                                  isDarkMode ? 'text-green-300' : 'text-green-600'
                                }`}>
                                Participant
                              </Text>
                            </View>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => handleAddFriend(user._id)}
                          className={`rounded-full p-2 ${
                            isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'
                          }`}>
                          <Feather
                            name="user-plus"
                            size={18}
                            color={isDarkMode ? '#3b82f6' : '#2563eb'}
                          />
                        </TouchableOpacity>
                      </View>
                      {user.city && user.city[0] && (
                        <Text
                          className={`${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                          📍 {user.city[0].name}
                        </Text>
                      )}
                      {user.interests && user.interests.length > 0 && (
                        <View className="mt-2 flex-row flex-wrap">
                          {user.interests.slice(0, 3).map((interest) => (
                            <View
                              key={interest._id}
                              className={`mr-2 mt-1 rounded-full px-2 py-1 ${
                                isDarkMode ? 'bg-white/20' : 'bg-primary-dark/20'
                              }`}>
                              <Text
                                className={`text-xs ${
                                  isDarkMode ? 'text-white' : 'text-primary-dark'
                                }`}>
                                {interest.category}
                              </Text>
                            </View>
                          ))}
                          {user.interests.length > 3 && (
                            <Text
                              className={`mt-1 text-xs ${
                                isDarkMode ? 'text-white/60' : 'text-primary-dark/60'
                              }`}>
                              +{user.interests.length - 3} more
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {users.length === 0 && (
                <View className="mt-4 items-center">
                  <Text
                    className={`text-lg ${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                    No users found
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>

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

      {/* <CustomAlert
        visible={showSuccessAlert}
        title="Success"
        message={successMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowSuccessAlert(false),
          },
        ]}
      /> */}
    </>
  );
}
