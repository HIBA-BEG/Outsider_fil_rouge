import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import userService from './(services)/userApi';
import CustomAlert from '../components/ui/CustomAlert';
import { useTheme } from '../context/ThemeContext';
import { User } from '../types/user';

export default function FriendsScreen() {
  const { isDarkMode } = useTheme();
  const [friends, setFriends] = useState<User[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<User[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showConfirmationAlert, setShowConfirmationAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userToAction, setUserToAction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'My friends' | 'Friend requests' | 'Sent requests'>(
    'My friends'
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      switch (activeTab) {
        case 'My friends': {
          const myFriends = await userService.getFriends();
          setFriends(myFriends);
          break;
        }
        case 'Friend requests': {
          const received = await userService.getReceivedFriendRequests();
          setReceivedRequests(received);
          break;
        }
        case 'Sent requests': {
          const sent = await userService.getSentFriendRequests();
          setSentRequests(sent);
          break;
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Failed to fetch data');
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAcceptRequest = async (senderId: string) => {
    try {
      await userService.acceptFriendRequest(senderId);
      setSuccessMessage('Friend request accepted');
      setShowSuccessAlert(true);
      fetchData();
    } catch (error) {
      console.log('error f accept friend request', error);
      setErrorMessage('Failed to accept friend request');
      setShowErrorAlert(true);
    }
  };

  const handleRejectRequest = async (senderId: string) => {
    try {
      await userService.rejectFriendRequest(senderId);
      setSuccessMessage('Friend request rejected');
      setShowSuccessAlert(true);
      fetchData();
    } catch (error) {
      console.log('error f reject friend request', error);
      setErrorMessage('Failed to reject friend request');
      setShowErrorAlert(true);
    }
  };

  const handleCancelRequest = (userId: string) => {
    setUserToAction(userId);
    setShowConfirmationAlert(true);
  };

  const confirmCancelRequest = async () => {
    if (!userToAction) return;
    try {
      await userService.cancelFriendRequest(userToAction);
      setSuccessMessage('Friend request cancelled successfully');
      setShowSuccessAlert(true);
      fetchData();
    } catch (error) {
      console.log('error f cancel friend request', error);
      setErrorMessage('Failed to cancel friend request');
      setShowErrorAlert(true);
    } finally {
      setShowConfirmationAlert(false);
      setUserToAction(null);
    }
  };

  const handleRemoveFriend = (userId: string) => {
    setUserToAction(userId);
    setShowConfirmationAlert(true);
  };

  const confirmRemoveFriend = async () => {
    if (!userToAction) return;
    try {
      await userService.removeFriend(userToAction);
      setSuccessMessage('Friend removed successfully');
      setShowSuccessAlert(true);
      fetchData();
    } catch (error) {
      console.log('error f remove friend', error);
      setErrorMessage('Failed to remove friend');
      setShowErrorAlert(true);
    } finally {
      setShowConfirmationAlert(false);
      setUserToAction(null);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const TabButton = ({ title, tab }: { title: string; tab: typeof activeTab }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`flex-1 rounded-full p-2 ${
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
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      <View className="px-4 py-2">
        <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
          Friends
        </Text>

        <View className="mb-2 mt-4 flex-row rounded-full bg-white/5 p-1">
          <TabButton title="My friends" tab="My friends" />
          <TabButton title="Friend requests" tab="Friend requests" />
          <TabButton title="Sent requests" tab="Sent requests" />
        </View>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
          <View className="py-4">
            <View className="gap-4">
              {activeTab === 'My friends' &&
                friends.map((user) => (
                  <TouchableOpacity
                    key={user._id}
                    className={`mb-4 rounded-2xl p-4 ${isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'}`}>
                    <View className="flex-row items-center">
                      <Image
                        source={
                          process.env.EXPO_PUBLIC_API_URL + user.profilePicture
                            ? { uri: process.env.EXPO_PUBLIC_API_URL + user.profilePicture }
                            : require('../assets/profile-icon.jpg')
                        }
                        className="h-16 w-16 rounded-full"
                      />
                      <View className="flex-1 pl-4">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Text
                              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                              {user.firstName} {user.lastName}
                            </Text>
                            {user.role === 'organizer' && (
                              <View
                                className={`ml-2 rounded-full px-2 py-0.5 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}>
                                <Text
                                  className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                                  Organizer
                                </Text>
                              </View>
                            )}
                            {user.role === 'participant' && (
                              <View
                                className={`ml-2 rounded-full px-2 py-0.5 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'}`}>
                                <Text
                                  className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                                  Participant
                                </Text>
                              </View>
                            )}
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemoveFriend(user._id)}
                            className={`rounded-full p-2 ${isDarkMode ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
                            <Feather
                              name="user-minus"
                              size={18}
                              color={isDarkMode ? '#ef4444' : '#dc2626'}
                            />
                          </TouchableOpacity>
                        </View>
                        {user.city && (
                          <Text
                            className={`${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                            {/* @ts-ignore */}
                            📍 {user.city.name}
                          </Text>
                        )}
                        {user.interests && user.interests.length > 0 && (
                          <View className="mt-2 flex-row flex-wrap">
                            {user.interests.slice(0, 2).map((interest) => (
                              <View
                                key={interest._id}
                                className={`mr-2 mt-1 rounded-full px-2 py-1 ${isDarkMode ? 'bg-white/20' : 'bg-primary-dark/20'}`}>
                                <Text
                                  className={`text-xs ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                                  {interest.category}
                                </Text>
                              </View>
                            ))}
                            {user.interests.length > 2 && (
                              <Text
                                className={`mt-2 text-xs ${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                                +{user.interests.length - 2} more
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

              {activeTab === 'Friend requests' &&
                receivedRequests.map((user) => (
                  <TouchableOpacity
                    key={user._id}
                    className={`mb-4 rounded-2xl p-4 ${isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'}`}>
                    <View className="flex-row items-center">
                      <Image
                        source={
                          process.env.EXPO_PUBLIC_API_URL + user.profilePicture
                            ? { uri: process.env.EXPO_PUBLIC_API_URL + user.profilePicture }
                            : require('../assets/profile-icon.jpg')
                        }
                        className="h-16 w-16 rounded-full"
                      />
                      <View className="flex-1 pl-4">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Text
                              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                              {user.firstName} {user.lastName}
                            </Text>
                            {user.role === 'organizer' && (
                              <View
                                className={`ml-2 rounded-full px-2 py-0.5 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}>
                                <Text
                                  className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                                  Organizer
                                </Text>
                              </View>
                            )}
                            {user.role === 'participant' && (
                              <View
                                className={`ml-2 rounded-full px-2 py-0.5 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'}`}>
                                <Text
                                  className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                                  Participant
                                </Text>
                              </View>
                            )}
                          </View>
                          <View className="flex-row gap-2">
                            <TouchableOpacity
                              onPress={() => handleAcceptRequest(user._id)}
                              className={`rounded-full p-2 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'}`}>
                              <Feather
                                name="check"
                                size={18}
                                color={isDarkMode ? '#22c55e' : '#16a34a'}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleRejectRequest(user._id)}
                              className={`rounded-full p-2 ${isDarkMode ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
                              <Feather
                                name="x"
                                size={18}
                                color={isDarkMode ? '#ef4444' : '#dc2626'}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                        {user.city && (
                          <Text
                            className={`${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                            {/* @ts-ignore */}
                            📍 {user.city.name}
                          </Text>
                        )}
                        {user.interests && user.interests.length > 0 && (
                          <View className="mt-2 flex-row flex-wrap">
                            {user.interests.slice(0, 2).map((interest) => (
                              <View
                                key={interest._id}
                                className={`mr-2 mt-1 rounded-full px-2 py-1 ${isDarkMode ? 'bg-white/20' : 'bg-primary-dark/20'}`}>
                                <Text
                                  className={`text-xs ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                                  {interest.category}
                                </Text>
                              </View>
                            ))}
                            {user.interests.length > 2 && (
                              <Text
                                className={`mt-2 text-xs ${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                                +{user.interests.length - 2} more
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

              {activeTab === 'Sent requests' &&
                sentRequests.map((user) => (
                  <TouchableOpacity
                    key={user._id}
                    className={`mb-4 rounded-2xl p-4 ${isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'}`}>
                    <View className="flex-row items-center">
                      <Image
                        source={
                          process.env.EXPO_PUBLIC_API_URL + user.profilePicture
                            ? { uri: process.env.EXPO_PUBLIC_API_URL + user.profilePicture }
                            : require('../assets/profile-icon.jpg')
                        }
                        className="h-16 w-16 rounded-full"
                      />
                      <View className="flex-1 pl-4">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Text
                              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                              {user.firstName} {user.lastName}
                            </Text>
                            {user.role === 'organizer' && (
                              <View
                                className={`ml-2 rounded-full px-2 py-0.5 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}>
                                <Text
                                  className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                                  Organizer
                                </Text>
                              </View>
                            )}
                            {user.role === 'participant' && (
                              <View
                                className={`ml-2 rounded-full px-2 py-0.5 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'}`}>
                                <Text
                                  className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                                  Participant
                                </Text>
                              </View>
                            )}
                          </View>
                          <TouchableOpacity
                            onPress={() => handleCancelRequest(user._id)}
                            className={`rounded-full p-2 ${isDarkMode ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
                            <Feather
                              name="x"
                              size={18}
                              color={isDarkMode ? '#ef4444' : '#dc2626'}
                            />
                          </TouchableOpacity>
                        </View>
                        {user.city && (
                          <Text
                            className={`${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                            {/* @ts-ignore */}
                            📍 {user.city.name}
                          </Text>
                        )}
                        {user.interests && user.interests.length > 0 && (
                          <View className="mt-2 flex-row flex-wrap">
                            {user.interests.slice(0, 3).map((interest) => (
                              <View
                                key={interest._id}
                                className={`mr-2 mt-1 rounded-full px-2 py-1 ${isDarkMode ? 'bg-white/20' : 'bg-primary-dark/20'}`}>
                                <Text
                                  className={`text-xs ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                                  {interest.category}
                                </Text>
                              </View>
                            ))}
                            {user.interests.length > 3 && (
                              <Text
                                className={`mt-1 text-xs ${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                                +{user.interests.length - 3} more
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

              {((activeTab === 'My friends' && friends.length === 0) ||
                (activeTab === 'Friend requests' && receivedRequests.length === 0) ||
                (activeTab === 'Sent requests' && sentRequests.length === 0)) && (
                <View className="mt-4 items-center">
                  <Text
                    className={`text-lg ${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                    No {activeTab === 'My friends' ? 'friends' : 'requests'} found
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
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
        visible={showConfirmationAlert}
        title={activeTab === 'My friends' ? 'Remove Friend' : 'Cancel Request'}
        message={
          activeTab === 'My friends'
            ? 'Are you sure you want to remove this friend?'
            : 'Are you sure you want to cancel this friend request?'
        }
        buttons={[
          {
            text: 'No',
            onPress: () => {
              setShowConfirmationAlert(false);
              setUserToAction(null);
            },
          },
          {
            text: 'Yes',
            onPress: activeTab === 'My friends' ? confirmRemoveFriend : confirmCancelRequest,
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
}
