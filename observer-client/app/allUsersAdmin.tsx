import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import userService from './(services)/userApi';
import { User } from '../types/user';
import CustomAlert from '../components/ui/CustomAlert';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import adminService from './(services)/adminApi';

export default function AllUsersAdmin() {
  const { isDarkMode } = useTheme();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showBanAlert, setShowBanAlert] = useState(false);
  const [userToBan, setUserToBan] = useState<User | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'banned' | 'archived'>('all');
  const [showUnbanAlert, setShowUnbanAlert] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      let fetchedUsers;
      
      switch (activeTab) {
        case 'banned':
          fetchedUsers = await userService.bannedUsers();
          break;
        case 'archived':
          fetchedUsers = await userService.archivedUsers();
          break;
        default:
          fetchedUsers = await userService.allUsers();
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

  const handleBanUser = async (user: User) => {
    setUserToBan(user);
    setShowBanAlert(true);
  };

  const handleUnbanUser = async (user: User) => {
    setUserToBan(user);
    setShowUnbanAlert(true);
  };

  const confirmBanUser = async () => {
    if (!userToBan) return;
    
    try {
      await adminService.banUser(userToBan._id);
      setShowBanAlert(false);
      fetchUsers(); 
      setSuccessMessage('User banned successfully');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error banning user:', error);
      setErrorMessage('Failed to ban user. Please try again.');
      setShowErrorAlert(true);
    }
  };

  const confirmUnbanUser = async () => {
    if (!userToBan) return;
    
    try {
      await adminService.unbanUser(userToBan._id);
      setShowUnbanAlert(false);
      fetchUsers();
      setSuccessMessage('User unbanned successfully');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error unbanning user:', error);
      setErrorMessage('Failed to unban user. Please try again.');
      setShowErrorAlert(true);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const TabButton = ({ title, tab }: { title: string; tab: typeof activeTab }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`flex-1 rounded-full px-4 py-2 ${
        activeTab === tab
          ? isDarkMode
            ? 'bg-white/20'
            : 'bg-primary-dark'
          : 'bg-transparent'
      }`}
    >
      <Text
        className={`text-center ${
          activeTab === tab
            ? 'text-white font-semibold'
            : isDarkMode
            ? 'text-white/60'
            : 'text-primary-dark/60'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <View className="py-4">
            <Text
              className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-primary-dark'
              }`}
            >
              Users Management
            </Text>
            
            <View className="flex-row space-x-2 mt-4 mb-2 p-1 rounded-full bg-white/5">
              <TabButton title="All Users" tab="all" />
              <TabButton title="Banned" tab="banned" />
              <TabButton title="Archived" tab="archived" />
            </View>

            <Text
              className={`mt-2 ${
                isDarkMode ? 'text-white/60' : 'text-primary-dark/60'
              }`}
            >
              {activeTab === 'all' && 'All active users in the community'}
              {activeTab === 'banned' && 'Users who have been banned'}
              {activeTab === 'archived' && 'Users who have deleted their accounts'}
            </Text>
          </View>

          <View className="space-y-4">
            {users.map((user) => (
              <TouchableOpacity
                key={user._id}
                className={`rounded-2xl p-4 mb-4 ${
                  isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                }`}
              >
                <View className="flex-row items-center">
                  <Image
                    source={ require('../assets/event4.jpg')}
                    // source={
                    //   user.profilePicture
                    //     ? { uri: user.profilePicture }
                    //     : require('../assets/event4.jpg')
                    // }
                    className="h-16 w-16 rounded-full"
                  />
                  <View className="flex-1 pl-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text
                          className={`text-lg font-semibold ${
                            isDarkMode ? 'text-white' : 'text-primary-dark'
                          }`}
                        >
                          {user.firstName} {user.lastName}
                        </Text>
                        {user.role === 'organizer' && (
                          <View 
                            className={`ml-2 rounded-full px-2 py-0.5 ${
                              isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'
                            }`}
                          >
                            <Text 
                              className={`text-xs ${
                                isDarkMode ? 'text-purple-300' : 'text-purple-600'
                              }`}
                            >
                              Organizer
                            </Text>
                          </View>
                        )}
                        {user.role === 'participant' && (
                          <View 
                            className={`ml-2 rounded-full px-2 py-0.5 ${
                              isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'
                            }`}
                          >
                            <Text 
                              className={`text-xs ${
                                isDarkMode ? 'text-green-300' : 'text-green-600'
                              }`}
                            >
                              Participant
                            </Text>
                          </View>
                        )}
                      </View>
                      {currentUser?.role === 'admin' && !user.isArchived && (
                        user.isBanned ? (
                          <TouchableOpacity
                            onPress={() => handleUnbanUser(user)}
                            className={`rounded-full p-2 ${
                              isDarkMode ? 'bg-blue-600/20' : 'bg-blue-600/10'
                            }`}
                          >
                            <Feather 
                              name="user-check" 
                              size={18} 
                              color={isDarkMode ? '#3b82f6' : '#2563eb'} 
                            />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => handleBanUser(user)}
                            className={`rounded-full p-2 ${
                              isDarkMode ? 'bg-red-500/20' : 'bg-red-500/10'
                            }`}
                          >
                            <Feather 
                              name="slash" 
                              size={18} 
                              color={isDarkMode ? '#ef4444' : '#dc2626'} 
                            />
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                    {user.city && (
                      <Text
                        className={`${
                          isDarkMode ? 'text-white/60' : 'text-primary-dark/60'
                        }`}
                      >
                        📍 {user.city.name}
                      </Text>
                    )}
                    {user.interests && user.interests.length > 0 && (
                      <View className="mt-2 flex-row flex-wrap">
                        {user.interests.slice(0, 3).map((interest) => (
                          <View
                            key={interest._id}
                            className={`mr-2 mt-1 rounded-full px-2 py-1 ${
                              isDarkMode ? 'bg-white/20' : 'bg-primary-dark/20'
                            }`}
                          >
                            <Text
                              className={`text-xs ${
                                isDarkMode ? 'text-white' : 'text-primary-dark'
                              }`}
                            >
                              {interest.category}
                            </Text>
                          </View>
                        ))}
                        {user.interests.length > 3 && (
                          <Text
                            className={`mt-1 text-xs ${
                              isDarkMode ? 'text-white/60' : 'text-primary-dark/60'
                            }`}
                          >
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
                  className={`text-lg ${
                    isDarkMode ? 'text-white/60' : 'text-primary-dark/60'
                  }`}
                >
                  No users found in this category
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <CustomAlert
        visible={showBanAlert}
        title="Ban User"
        message={`Are you sure you want to ban ${userToBan?.firstName} ${userToBan?.lastName}? This action cannot be undone.`}
        buttons={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setShowBanAlert(false)
          },
          {
            text: "Ban",
            style: "destructive",
            onPress: confirmBanUser
          }
        ]}
      />

      <CustomAlert
        visible={showUnbanAlert}
        title="Unban User"
        message={`Are you sure you want to unban ${userToBan?.firstName} ${userToBan?.lastName}?`}
        buttons={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setShowUnbanAlert(false)
          },
          {
            text: "Unban",
            onPress: confirmUnbanUser
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
        visible={showSuccessAlert}
        title="Success"
        message={successMessage}
        buttons={[
          {
            text: "OK",
            onPress: () => setShowSuccessAlert(false)
          }
        ]}
      />
    </>
  );
}