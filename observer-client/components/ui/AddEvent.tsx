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
} from 'react-native';

import cityService from '../../app/(services)/cityApi';
import eventService from '../../app/(services)/eventApi';
import interestService from '../../app/(services)/interestApi';
import { useTheme } from '../../context/ThemeContext';
import { City } from '../../types/city';
import { EventStatus } from '../../types/event';
import { Interest } from '../../types/interest';
import * as ImagePicker from 'expo-image-picker';

const AddEvent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: false,
      quality: 0.5,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
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
    setIsLoading(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        location: formData.location,
        maxParticipants: formData.maxParticipants,
        price: formData.price,
        city: selectedCity,
        interests: selectedInterests,
        isPublic: formData.isPublic
      };

      await eventService.createEvent(eventData, images);
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
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

  if (isLoading) {
    return <ActivityIndicator size="large" color={isDarkMode ? 'white' : 'black'} />;
  }

  return (
    <ScrollView
      className={`flex-1 px-4 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}
      showsVerticalScrollIndicator={false}>
      <View className="mt-6">
        <Text className={`mb-4 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Create New Event
        </Text>

        <View className="space-y-4">
          <View>
            <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Event Title
            </Text>
            <View
              className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
              <TextInput
                placeholder="Event Title"
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                placeholderTextColor="#ECECED"
                className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
                autoCapitalize="words"
              />
            </View>
          </View>
          <View>
            <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Description
            </Text>
            <View
              className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
              <TextInput
                placeholder="Event Description"
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                placeholderTextColor="#ECECED"
                className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
          <View>
            <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Start Date
            </Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
              <Text
                className={`rounded-full px-4 py-3 ${isDarkMode ? 'bg-primary-light/30 text-white' : 'bg-primary-dark/70 text-black'}`}>
                {formData.startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={formData.startDate}
                mode="date"
                display="default"
                className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
                onChange={(event, date) => {
                  setShowStartDatePicker(false);
                  if (date) handleInputChange('startDate', date);
                }}
              />
            )}
          </View>

          <View>
            <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              End Date
            </Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
              <Text
                className={`rounded-full px-4 py-3 ${isDarkMode ? 'bg-primary-light/30 text-white' : 'bg-primary-dark/70 text-black'}`}>
                {formData.endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={formData.endDate}
                mode="date"
                display="default"
                className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
                onChange={(event, date) => {
                  setShowEndDatePicker(false);
                  if (date) handleInputChange('endDate', date);
                }}
              />
            )}
          </View>

          <View>
            <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Location
            </Text>
            <View
              className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
              <TextInput
                placeholder="Location"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={formData.location}
                onChangeText={(text) => handleInputChange('location', text)}
                className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
              />
            </View>
          </View>

          <View>
            <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              City
            </Text>
            <View
              className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
              <Picker
                selectedValue={selectedCity}
                onValueChange={(itemValue) => setSelectedCity(itemValue)}
                dropdownIconColor={isDarkMode ? 'white' : 'black'}
                placeholder="Select a city"
                style={{
                  color: isDarkMode ? 'white' : 'black',
                  height: 55,
                  paddingHorizontal: 16,
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
            <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Interests
            </Text>
            <View
              className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
              <Picker
                selectedValue={selectedInterests}
                onValueChange={(itemValue) => setSelectedInterests(itemValue)}
                dropdownIconColor={isDarkMode ? 'white' : 'black'}
                placeholder="Select an interest"
                style={{
                  color: isDarkMode ? 'white' : 'black',
                  height: 55,
                  paddingHorizontal: 16,
                }}>
                <Picker.Item label="Select an interest" value="" enabled={false} />
                {interests.map((interest) => (
                  <Picker.Item key={interest._id} label={interest.category} value={interest._id} />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Event Images
            </Text>
            <View className="flex-row flex-wrap">
              {images.map((uri, index) => (
                <View key={index} className="m-1">
                  <Image 
                    source={{ uri }} 
                    className="h-20 w-20 rounded-lg"
                  />
                  <TouchableOpacity 
                    onPress={() => setImages(images.filter((_, i) => i !== index))}
                    className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"
                  >
                    <Text className="text-white text-xs">×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 5 && (
                <TouchableOpacity
                  onPress={pickImage}
                  className={`h-20 w-20 m-1 items-center justify-center rounded-lg border-2 border-dashed
                    ${isDarkMode ? 'border-white/30' : 'border-black/30'}`}
                >
                  <Text className={`text-4xl ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                    +
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View>
            <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Max Participants
            </Text>
            <View
              className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
              <TextInput
                placeholder="Max Participants"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={formData.maxParticipants}
                onChangeText={(text) => handleInputChange('maxParticipants', text)}
                keyboardType="numeric"
                className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
              />
            </View>
          </View>

          <View>
            <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Price
            </Text>
            <View
              className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
              <TextInput
                placeholder="Price"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={formData.price}
                onChangeText={(text) => handleInputChange('price', text)}
                keyboardType="numeric"
                className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
              />
            </View>
          </View>

          <View className="mt-2 flex-row items-center justify-between">
            <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Public Event
            </Text>
            <TouchableOpacity
              onPress={() => handleInputChange('isPublic', !formData.isPublic)}
              className={`m-2 mt-2 rounded-full px-4 py-2 ${formData.isPublic ? 'bg-[#302D60]' : 'bg-gray-300'}`}>
              <Text className="text-center text-white">{formData.isPublic ? 'Yes' : 'No'}</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-10 mt-6 flex-row justify-between">
            <LinearGradient
              colors={isDarkMode ? ['#6a1b9a', '#ab47bc'] : ['#524F85', '#302D60']}
              style={{ borderRadius: 25, flex: 1, marginRight: 10 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={{ paddingVertical: 15, borderRadius: 25 }}>
                <Text className="text-center font-semibold text-white">Create Event</Text>
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient
              colors={isDarkMode ? ['#524F85', '#302D60'] : ['#4A4A4A', '#9E9E9E']}
              style={{ borderRadius: 25, flex: 1, marginLeft: 10 }}>
              <TouchableOpacity onPress={onClose} style={{ paddingVertical: 15, borderRadius: 25 }}>
                <Text className="text-center font-semibold text-white">Cancel</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AddEvent;
