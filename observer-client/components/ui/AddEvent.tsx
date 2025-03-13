import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native';

import cityService from '../../app/(services)/cityApi';
import eventService from '../../app/(services)/eventApi';
import interestService from '../../app/(services)/interestApi';
import { useTheme } from '../../context/ThemeContext';
import { City } from '../../types/city';
import { EventStatus } from '../../types/event';
import { Interest } from '../../types/interest';
import * as ImagePicker from 'expo-image-picker';
import CustomAlert from './CustomAlert';
import { router } from 'expo-router';

interface AddEventProps {
  onClose: (success?: boolean, error?: string) => void;
}

const AddEvent: React.FC<AddEventProps> = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    location: '',
    maxParticipants: '',
    price: '',
    isPublic: true,
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: false,
      quality: 0.5,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      const citiesData = await cityService.getAllCities();
      setCities(citiesData);
    };

    const fetchInterests = async () => {
      const interestsData = await interestService.getAllInterests();
      setInterests(interestsData);
    };
    fetchCities();
    fetchInterests();
  }, []);

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      setErrorMessage('Please select at least one interest');
      setShowErrorAlert(true);
      return;
    }

    if (!selectedCity) {
      setErrorMessage('Please select a city');
      setShowErrorAlert(true);
      return;
    }

    if (!formData.title || formData.title === '') {
      setErrorMessage('Please enter a title');
      setShowErrorAlert(true);
      return;
    }

    if (!formData.description || formData.description === '') {
      setErrorMessage('Please enter a description');
      setShowErrorAlert(true);
      return;
    }

    if (!images || images.length === 0) {
      setErrorMessage('Please select at least one image');
      setShowErrorAlert(true);
      return;
    }

    if (!formData.location || formData.location === '') {
      setErrorMessage('Please enter a location');
      setShowErrorAlert(true);
      return;
    }

    if (!formData.maxParticipants || formData.maxParticipants === '') {
      setErrorMessage('Please enter a max participants');
      setShowErrorAlert(true);
      return;
    }

    if (!formData.price || formData.price === '') {
      setErrorMessage('Please enter a price');
      setShowErrorAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        location: formData.location,
        maxParticipants: parseInt(formData.maxParticipants),
        price: parseFloat(formData.price),
        city: selectedCity,
        interests: selectedInterests,
        isPublic: formData.isPublic,
      };

      await eventService.createEvent(eventData, images);
      onClose(true);
    } catch (error) {
      console.error('Error creating event:', error);
      setErrorMessage('Failed to create event. Please try again.');
      setShowErrorAlert(true);
      // onClose(false, 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | Date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInterestSelection = (itemValue: string) => {
    if (!itemValue) return;

    if (!selectedInterests.includes(itemValue)) {
      setSelectedInterests((prev) => [...prev, itemValue]);
    }
  };

  const removeInterest = (interestId: string) => {
    setSelectedInterests((prev) => prev.filter((id) => id !== interestId));
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={isDarkMode ? 'white' : 'black'} />;
  }

  return (
    <SafeAreaView className={`flex-1 px-4 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6 mt-6 flex-row gap-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Text
              className={`text-xl font-bold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
              ←
            </Text>
          </TouchableOpacity>
          <Text
            className={`text-2xl font-bold ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
            Create New Event
          </Text>
        </View>

        <View className="gap-6">
          <View>
            <Text
              className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
              Event Title
            </Text>
            <TextInput
              placeholder="Event Title"
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
              className={`rounded-full border px-4 py-3 ${
                isDarkMode
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
              }`}
              autoCapitalize="words"
            />
          </View>
          <View>
            <Text
              className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
              Description
            </Text>
            <TextInput
              placeholder="Event Description"
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
              className={`rounded-2xl border px-4 py-3 ${
                isDarkMode
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
              }`}
              multiline
              numberOfLines={4}
            />
          </View>
      
          <View>
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
                    handleInputChange('startDate', newDate);
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
                    handleInputChange('startDate', newDate);
                  }
                }}
              />
            )}
          </View>

          <View>
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
                  {formData.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    handleInputChange('endDate', newDate);
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
                    handleInputChange('endDate', newDate);
                  }
                }}
              />
            )}
          </View>

          <View>
            <Text
              className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
              Location
            </Text>

            <TextInput
              placeholder="Location"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
              className={`rounded-full border px-4 py-3 ${
                isDarkMode
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
              }`}
            />
          </View>

          <View>
            <Text
              className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
              City
            </Text>
            <View
              className={`overflow-hidden rounded-full border ${
                isDarkMode
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
              }`}>
              <Picker
                selectedValue={selectedCity}
                onValueChange={(itemValue) => setSelectedCity(itemValue)}
                dropdownIconColor={isDarkMode ? '#fff' : '#14132A'}
                placeholder="Select a city"
                style={{
                  color: isDarkMode ? '#999' : '#666',
                  height: 55,
                }}>
                <Picker.Item label="Select a city" value="" enabled={false} />
                {cities.map((city) => (
                  <Picker.Item
                    key={city._id}
                    label={`${city.name}, ${city.admin_name}`}
                    value={city._id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text
              className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
              Interests
            </Text>
            <View
              className={`overflow-hidden rounded-full border ${
                isDarkMode
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
              }`}>
              <Picker
                selectedValue=""
                onValueChange={handleInterestSelection}
                dropdownIconColor={isDarkMode ? '#fff' : '#14132A'}
                style={{
                  color: isDarkMode ? '#999' : '#666',
                  height: 55,
                }}>
                <Picker.Item label="Select interests" value="" enabled={false} />
                {interests.map((interest) => (
                  <Picker.Item
                    key={interest._id}
                    label={interest.category}
                    value={interest._id}
                    enabled={!selectedInterests.includes(interest._id)}
                    style={{
                      color: isDarkMode ? '#14132A' : '#666',
                      // backgroundColor: isDarkMode ? '#14132A' : '#fff',
                    }}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* <View>
            <Text
              className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
              Interests
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest._id}
                  onPress={() => handleInterestSelection(interest._id)}
                  className={`rounded-full px-4 py-2 ${
                    selectedInterests.includes(interest._id)
                      ? isDarkMode
                        ? 'border-white/40 bg-white/20'
                        : 'border-primary-dark bg-primary-dark'
                      : isDarkMode
                        ? 'border-white/20 bg-white/10'
                        : 'border-primary-dark/20 bg-primary-dark/10'
                  } border`}>
                  <Text
                    className={`${
                      selectedInterests.includes(interest._id)
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
          </View> */}

          <View className="mt-2 flex-row flex-wrap">
            {selectedInterests.map((interestId) => {
              const interest = interests.find((i) => i._id === interestId);
              return interest ? (
                <View
                  key={interestId}
                  className={`m-1 flex-row items-center rounded-full px-3 py-1 ${
                    isDarkMode ? 'bg-white/20' : 'bg-primary-dark/20'
                  }`}>
                  <Text className={isDarkMode ? 'text-white' : 'text-primary-dark'}>
                    {interest.category}
                  </Text>
                  <TouchableOpacity onPress={() => removeInterest(interestId)} className="ml-2">
                    <Text className={isDarkMode ? 'text-white' : 'text-primary-dark'}>×</Text>
                  </TouchableOpacity>
                </View>
              ) : null;
            })}
          </View>

          <View>
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
                  <Text className={`text-4xl ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                    +
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View>
            <Text
              className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
              Max Participants
            </Text>
            <TextInput
              placeholder="Max Participants"
              placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
              value={formData.maxParticipants}
              onChangeText={(text) => handleInputChange('maxParticipants', text)}
              keyboardType="numeric"
              className={`rounded-full border px-4 py-3 ${
                isDarkMode
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
              }`}
            />
          </View>

          <View>
            <Text
              className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
              Price
            </Text>
            <TextInput
              placeholder="Price"
              placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
              value={formData.price}
              onChangeText={(text) => handleInputChange('price', text)}
              keyboardType="numeric"
              className={`rounded-full border px-4 py-3 ${
                isDarkMode
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
              }`}
            />
          </View>

          <View className="mb-4">
                <Text
                  className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
                  Public Event
                </Text>
            <TouchableOpacity
              onPress={() => handleInputChange('isPublic', !formData.isPublic)}
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

          <View className="mb-10 mt-4 flex-row justify-center gap-3">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`rounded-full border border-green-500 bg-green-500/10 px-6 py-4`}>
              <Text className="text-green-500">{isLoading ? 'Creating...' : 'Create Event'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onClose()}
              className={`rounded-full border border-red-500 bg-red-500/10 px-6 py-4`}>
              <Text className="text-red-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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

export default AddEvent;
