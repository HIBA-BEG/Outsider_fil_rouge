import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';

import CustomAlert from './CustomAlert';
import cityService from '../../app/(services)/cityApi';
import interestService from '../../app/(services)/interestApi';
import { useTheme } from '../../context/ThemeContext';
import { City } from '../../types/city';
import { Event } from '../../types/event';
import { Interest } from '../../types/interest';

interface UpdateEventProps {
  isVisible: boolean;
  onClose: () => void;
  event: Event;
  onUpdate: (updatedData: Partial<Event>) => Promise<void>;
}

const UpdateEvent = ({ isVisible, onClose, event, onUpdate }: UpdateEventProps) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
    location: event.location,
    maxParticipants: event.maxParticipants.toString(),
    price: event.price.toString(),
    city: event.city,
    interests: Array.isArray(event.interests) ? event.interests : [],
    isPublic: event.isPublic,
  });

  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  // const [images, setImages] = useState<string[]>(event.poster || []);
  const [images, setImages] = useState<string[]>(
    Array.isArray(event.poster) ? event.poster : event.poster ? [event.poster] : []
  );
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedInterests, fetchedCities] = await Promise.all([
          interestService.getAllInterests(),
          cityService.getAllCities(),
        ]);
        setInterests(fetchedInterests);
        setCities(fetchedCities);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load data. Please try again.');
        setShowErrorAlert(true);
      }
    };

    if (isVisible) {
      fetchData();
    }
  }, [isVisible]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await onUpdate({
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants, 10),
        price: parseFloat(formData.price),
      });
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
      setErrorMessage('Failed to update event. Please try again.');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  return (
    <>
      <Modal visible={isVisible} animationType="slide" transparent>
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
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={onClose} className="absolute right-0 top-0 z-10">
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
                }`}>
                Update Event
              </Text>

              <View
                className={`mb-4 h-[1px] w-full ${
                  isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                }`}
              />

              <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  Title
                </Text>
                <TextInput
                  value={formData.title}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
                  className={`rounded-full border px-4 py-3 ${
                    isDarkMode
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                  }`}
                  placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
                />
              </View>

              <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  Description
                </Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                  className={`rounded-2xl border px-4 py-3 ${
                    isDarkMode
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                  }`}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
                />
              </View>

              <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  Start Date & Time
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(true)}
                    className={`flex-1 rounded-full border px-4 py-3 ${
                      isDarkMode
                        ? 'border-white/20 bg-white/10'
                        : 'border-primary-dark/20 bg-primary-dark/10'
                    }`}>
                    <Text className={isDarkMode ? 'text-white' : 'text-primary-dark'}>
                      {formData.startDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowStartTimePicker(true)}
                    className={`flex-1 rounded-full border px-4 py-3 ${
                      isDarkMode
                        ? 'border-white/20 bg-white/10'
                        : 'border-primary-dark/20 bg-primary-dark/10'
                    }`}>
                    <Text className={isDarkMode ? 'text-white' : 'text-primary-dark'}>
                      {formData.startDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showStartDatePicker && (
                  <DateTimePicker
                    value={formData.startDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowStartDatePicker(false);
                      if (date) {
                        const newDate = new Date(formData.startDate);
                        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                        setFormData((prev) => ({ ...prev, startDate: newDate }));
                      }
                    }}
                  />
                )}

                {showStartTimePicker && (
                  <DateTimePicker
                    value={formData.startDate}
                    mode="time"
                    display="default"
                    onChange={(event, date) => {
                      setShowStartTimePicker(false);
                      if (date) {
                        const newDate = new Date(formData.startDate);
                        newDate.setHours(date.getHours(), date.getMinutes());
                        setFormData((prev) => ({ ...prev, startDate: newDate }));
                      }
                    }}
                  />
                )}
              </View>

              <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  End Date & Time
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(true)}
                    className={`flex-1 rounded-full border px-4 py-3 ${
                      isDarkMode
                        ? 'border-white/20 bg-white/10'
                        : 'border-primary-dark/20 bg-primary-dark/10'
                    }`}>
                    <Text className={isDarkMode ? 'text-white' : 'text-primary-dark'}>
                      {formData.endDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowEndTimePicker(true)}
                    className={`flex-1 rounded-full border px-4 py-3 ${
                      isDarkMode
                        ? 'border-white/20 bg-white/10'
                        : 'border-primary-dark/20 bg-primary-dark/10'
                    }`}>
                    <Text className={isDarkMode ? 'text-white' : 'text-primary-dark'}>
                      {formData.endDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showEndDatePicker && (
                  <DateTimePicker
                    value={formData.endDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowEndDatePicker(false);
                      if (date) {
                        const newDate = new Date(formData.endDate);
                        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                        setFormData((prev) => ({ ...prev, endDate: newDate }));
                      }
                    }}
                  />
                )}

                {showEndTimePicker && (
                  <DateTimePicker
                    value={formData.endDate}
                    mode="time"
                    display="default"
                    onChange={(event, date) => {
                      setShowEndTimePicker(false);
                      if (date) {
                        const newDate = new Date(formData.endDate);
                        newDate.setHours(date.getHours(), date.getMinutes());
                        setFormData((prev) => ({ ...prev, endDate: newDate }));
                      }
                    }}
                  />
                )}
              </View>

              <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  Location
                </Text>
                <TextInput
                  value={formData.location}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, location: text }))}
                  className={`rounded-full border px-4 py-3 ${
                    isDarkMode
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                  }`}
                  placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
                />
              </View>

              <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  City
                </Text>
                <View
                  className={`overflow-hidden rounded-full border ${
                    isDarkMode
                      ? 'border-white/20 bg-white/10'
                      : 'border-primary-dark/20 bg-primary-dark/10'
                  }`}>
                  <Picker
                    selectedValue={formData.city?._id}
                    onValueChange={(itemValue) =>
                      setFormData((prev) => ({
                        ...prev,
                        city: cities.find((city) => city._id === itemValue) || prev.city,
                      }))
                    }
                    style={{ color: isDarkMode ? '#fff' : '#14132A' }}>
                    {cities.map((city) => (
                      <Picker.Item key={city._id} label={city.name} value={city._id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  Interests
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {interests.map((interest) => (
                    <TouchableOpacity
                      key={interest._id}
                      onPress={() => {
                        setFormData((prev) => {
                          const currentInterests = Array.isArray(prev.interests)
                            ? prev.interests
                            : [];
                          const isSelected = currentInterests.some((i) => i._id === interest._id);
                          return {
                            ...prev,
                            interests: isSelected
                              ? currentInterests.filter((i) => i._id !== interest._id)
                              : [...currentInterests, interest],
                          };
                        });
                      }}
                      className={`rounded-full px-4 py-2 ${
                        Array.isArray(formData.interests) &&
                        formData.interests.some((i) => i._id === interest._id)
                          ? isDarkMode
                            ? 'border-white/40 bg-white/20'
                            : 'border-primary-dark bg-primary-dark'
                          : isDarkMode
                            ? 'border-white/20 bg-white/10'
                            : 'border-primary-dark/20 bg-primary-dark/10'
                      } border`}>
                      <Text
                        className={`${
                          Array.isArray(formData.interests) &&
                          formData.interests.some((i) => i._id === interest._id)
                            ? 'text-white'
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

              <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  Max Participants
                </Text>
                <TextInput
                  value={formData.maxParticipants.toString()}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, maxParticipants: text }))
                  }
                  keyboardType="numeric"
                  className={`rounded-full border px-4 py-3 ${
                    isDarkMode
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                  }`}
                  placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
                />
              </View>

              <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  Price
                </Text>
                <TextInput
                  value={formData.price}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, price: text }))}
                  keyboardType="numeric"
                  className={`rounded-full border px-4 py-3 ${
                    isDarkMode
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                  }`}
                  placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
                />
              </View>

              <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  Public Event
                </Text>
                <TouchableOpacity
                  onPress={() => setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))}
                  className={`rounded-full border px-4 py-3 ${
                    formData.isPublic
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-red-500 bg-red-500/10'
                  }`}>
                  <Text className={formData.isPublic ? 'text-green-500' : 'text-red-500'}>
                    {formData.isPublic ? 'Public' : 'Private'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  Event Images
                </Text>
                <View className="flex-row flex-wrap">
                  {images.map((uri, index) => (
                    <View key={index} className="m-1">
                      <Image source={{ uri }} className="h-20 w-20 rounded-lg" />
                      <TouchableOpacity
                        onPress={() => setImages(images.filter((_, i) => i !== index))}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1">
                        <Text className="text-xs text-white">×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {images.length < 5 && (
                    <TouchableOpacity
                      onPress={pickImage}
                      className={`m-1 h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed
                        ${isDarkMode ? 'border-white/30' : 'border-black/30'}`}>
                      <Text
                        className={`text-4xl ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                        +
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View className="mt-10 flex-row justify-center gap-3">
                <TouchableOpacity
                  onPress={handleUpdate}
                  disabled={loading}
                  className="rounded-full border border-green-500 bg-green-500/10 px-6 py-2">
                  <Text className="text-green-500">{loading ? 'Updating...' : 'Update'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
    </>
  );
};

export default UpdateEvent;
