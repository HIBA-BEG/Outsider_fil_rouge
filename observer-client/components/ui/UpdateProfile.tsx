import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { User } from '../../types/user';
import { Interest } from '../../types/interest';
import interestService from '../../app/(services)/interestApi';
import cityService from '~/app/(services)/cityApi';
import { City } from '~/types/city';
import { Picker } from '@react-native-picker/picker';
import userService from '~/app/(services)/userApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import CustomAlert from './CustomAlert';

interface UpdateProfileProps {
  isVisible: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (updatedData: Partial<User>) => Promise<void>;
}

const UpdateProfile = ({ isVisible, onClose, user, onUpdate }: UpdateProfileProps) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    city: user.city,
    interests: user.interests,
  });
  const [loading, setLoading] = useState(false);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedCity, setSelectedCity] = useState<City[]>([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interests, cities] = await Promise.all([
          interestService.getAllInterests(),
          cityService.getAllCities(),
        ]);
        setInterests(interests);
        setSelectedCity(cities);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (isVisible) {
      fetchData();
    }
  }, [isVisible]);

  const handleInterestToggle = (interestId: string) => {
    setFormData((prev) => {
      const currentInterests = Array.isArray(prev.interests)
        ? prev.interests.map((i) => (typeof i === 'string' ? i : i._id))
        : [];

      if (currentInterests.includes(interestId)) {
        return {
          ...prev,
          interests: currentInterests.filter((id) => id !== interestId),
        };
      } else {
        return {
          ...prev,
          interests: [...currentInterests, interestId],
        };
      }
    });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await onUpdate(formData);
      onClose();
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
      setShowErrorAlert(true);
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.deleteProfile();
      await AsyncStorage.removeItem('authToken');
      setShowDeleteAlert(false);
      setShowSuccessAlert(true);
    } catch (error) {
      setShowDeleteAlert(false);
      setErrorMessage('Failed to delete account. Please try again.');
      setShowErrorAlert(true);
      console.error('Error deleting account:', error);
    }
  };

  const isInterestSelected = (interestId: string) => {
    const currentInterests = Array.isArray(formData.interests)
      ? formData.interests.map((i) => (typeof i === 'string' ? i : i._id))
      : [];
    return currentInterests.includes(interestId);
  };

  return (
    <>
      <Modal visible={isVisible} animationType="slide" transparent={true}>
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
                className={`mb-6 text-center text-xl font-bold ${
                  isDarkMode ? 'text-primary-light' : 'text-primary-dark'
                }`}
              >
                Update Profile
              </Text>

              <View className="space-y-6">
                <View>
                  <Text
                    className={`mb-2 text-lg ${
                      isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'
                    }`}>
                    First Name
                  </Text>
                  <TextInput
                    value={formData.firstName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                    className={`rounded-full border px-4 py-3 ${
                      isDarkMode 
                        ? 'border-white/20 bg-white/10 text-white' 
                        : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                    }`}
                    placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
                  />
                </View>

                <View>
                  <Text
                    className={`mb-2 mt-2 text-lg ${
                      isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'
                    }`}>
                    Last Name
                  </Text>
                  <TextInput
                    value={formData.lastName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                    className={`rounded-full border px-4 py-3 ${
                      isDarkMode 
                        ? 'border-white/20 bg-white/10 text-white' 
                        : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                    }`}
                    placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
                  />
                </View>

                <View>
                  <Text
                    className={`mb-2 mt-2 text-lg ${
                      isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'
                    }`}>
                    Email
                  </Text>
                  <TextInput
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    className={`rounded-full border px-4 py-3 ${
                      isDarkMode 
                        ? 'border-white/20 bg-white/10 text-white' 
                        : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                    }`}
                    placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
                    keyboardType="email-address"
                  />
                </View>

                <View>
                  <Text
                    className={`mb-2 mt-2 text-lg ${
                      isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'
                    }`}>
                    City
                  </Text>
                  <View 
                    className={`rounded-full border overflow-hidden ${
                      isDarkMode 
                        ? 'border-white/20 bg-white/10' 
                        : 'border-primary-dark/20 bg-primary-dark/10'
                    }`}
                  >
                    <Picker
                      selectedValue={formData.city}
                      onValueChange={(itemValue) => 
                        setFormData(prev => ({ ...prev, city: itemValue }))
                      }
                      style={{
                        color: isDarkMode ? '#fff' : '#14132A',
                        height: 50,
                      }}
                      dropdownIconColor={isDarkMode ? '#fff' : '#14132A'}
                    >
                      <Picker.Item 
                        label="Select a city" 
                        value="" 
                        style={{
                          color: isDarkMode ? '#ffffff80' : '#14132A80',
                        }}
                      />
                      {selectedCity.map((city) => (
                        <Picker.Item
                          key={city._id}
                          label={`${city.name}, ${city.admin_name}`}
                          value={city._id}
                          style={{
                            color: isDarkMode ? '#14132A' : '#fff',
                          }}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text
                    className={`mb-2 mt-2 text-lg ${
                      isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'
                    }`}>
                    Interests
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {interests.map((interest) => (
                      <TouchableOpacity
                        key={interest._id}
                        onPress={() => handleInterestToggle(interest._id)}
                        className={`rounded-full px-4 py-2 ${
                          isInterestSelected(interest._id)
                            ? isDarkMode 
                              ? 'border-white/40 bg-white/20' 
                              : 'border-primary-dark bg-primary-dark'
                            : isDarkMode
                              ? 'border-white/20 bg-white/10'
                              : 'border-primary-dark/20 bg-primary-dark/10'
                        } border`}>
                        <Text
                          className={`${
                            isInterestSelected(interest._id)
                              ? isDarkMode 
                                ? 'text-white' 
                                : 'text-white'
                              : isDarkMode
                                ? 'text-white/80'
                                : 'text-primary-dark'
                          }`}>
                          {interest.category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View className="mt-6 flex-row justify-end gap-3">
                <TouchableOpacity
                  onPress={onClose}
                  className={`rounded-full border px-6 py-2 ${
                    isDarkMode 
                      ? 'border-white/20' 
                      : 'border-primary-dark/20'
                  }`}>
                  <Text 
                    className={`${
                      isDarkMode ? 'text-primary-light' : 'text-primary-dark'
                    }`}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleUpdate}
                  disabled={loading}
                  className={`rounded-full px-6 py-2 ${
                    isDarkMode ? 'bg-white/20' : 'bg-primary-dark'
                  }`}>
                  <Text 
                    className={`${
                      isDarkMode ? 'text-primary-light' : 'text-white'
                    }`}>
                    {loading ? 'Updating...' : 'Update'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View 
                className={`my-6 h-[1px] w-full ${
                  isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                }`} 
              />

              <View className="items-center">
                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  className={`rounded-full border border-red-500 bg-red-500/10 px-6 py-2`}
                >
                  <Text className="text-red-500">
                    Delete My Account
                  </Text>
                </TouchableOpacity>
                <Text 
                  className={`mt-2 text-xs ${
                    isDarkMode ? 'text-white/50' : 'text-primary-dark/50'
                  }`}
                >
                  This action cannot be undone
                </Text>
              </View>

            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <CustomAlert
        visible={showDeleteAlert}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        buttons={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setShowDeleteAlert(false)
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: handleDeleteConfirm
          }
        ]}
      />

      <CustomAlert
        visible={showSuccessAlert}
        title="Success"
        message="Your account has been deleted successfully"
        buttons={[
          {
            text: "OK",
            onPress: () => {
              setShowSuccessAlert(false);
              onClose();
              router.navigate('/');
            }
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
    </>
  );
};

export default UpdateProfile;
