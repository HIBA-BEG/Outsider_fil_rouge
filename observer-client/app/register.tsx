import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import AuthApi from './(services)/authApi';
import cityService from './(services)/cityApi';
import interestService from './(services)/interestApi';

import { City } from '~/types/city';
import { Interest } from '~/types/interest';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const { isDarkMode } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [1, 1],
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const toggleInterest = (interest: Interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest._id)
        ? prev.filter((id) => id !== interest._id)
        : [...prev, interest._id]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [interestsData, citiesData] = await Promise.all([
          interestService.getAllInterests(),
          cityService.getAllCities(),
        ]);

        setInterests(interestsData);
        setCities(citiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRegister = async () => {
    try {
      if (!image) {
        throw new Error('Profile picture is required');
      }

      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('city', selectedCity);
      formData.append('interests', JSON.stringify(selectedInterests));

    
      const filename = image.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
        name: filename,
        type: fileType,
      } as any);

      console.log('FormData structure:', Object.keys(formData));
      console.log('FormData _parts:', formData);

      console.log('FormData contents un registered file:', JSON.stringify(formData));

      const response = await AuthApi.register(formData);
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
        router.replace('/');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      // I will handle the error (show alert wlla message to user)
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="relative flex-1">
        <Image
          source={
            isDarkMode
              ? require('../assets/undraw_dark.png')
              : require('../assets/undraw_light.png')
          }
          className="absolute left-0 top-0 h-full w-full"
          resizeMode="cover"
        />
        <View
          className={`p-6 ${isDarkMode ? 'bg-primary-dark/80' : 'bg-primary-light/80'}  flex-1`}>
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className={`text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>← Back</Text>
          </TouchableOpacity>

          <ScrollView>
            <Text
              className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'} text-center`}>
              Let's Start
            </Text>
            <Text
              className={`text-gray-400 ${isDarkMode ? 'text-white' : 'text-black'} text-center`}>
              Create an account
            </Text>
            <View className="space-y-4">
              <View>
                <Text
                  className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  First Name
                </Text>
                <View
                  className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
                  <TextInput
                    placeholder="Enter your first name"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholderTextColor="#ECECED"
                    className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View>
                <Text
                  className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Last Name
                </Text>
                <View
                  className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
                  <TextInput
                    placeholder="Enter your last name"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholderTextColor="#ECECED"
                    className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View>
                <Text
                  className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Email Address
                </Text>
                <View
                  className={`flex-row items-center rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
                  <TextInput
                    placeholder="email@example.com"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#ECECED"
                    className={`flex-1 px-4 py-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Text className="pr-4 text-green-500">✓ @</Text>
                </View>
              </View>

              <View>
                <Text
                  className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Password
                </Text>
                <View
                  className={` flex-row items-center rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
                  <TextInput
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#ECECED"
                    className={`flex-1 px-4 py-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pr-4">
                    <Text className="text-gray-400">{showPassword ? '👁' : '👁‍🗨'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text
                  className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Role
                </Text>
                <View
                  className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
                  <Picker
                    dropdownIconColor={isDarkMode ? 'white' : 'black'}
                    placeholder="Select a role"
                    selectedValue={role}
                    onValueChange={setRole}
                    style={{
                      color: isDarkMode ? 'white' : 'black',
                      height: 55,
                      paddingHorizontal: 16,
                    }}>
                    <Picker.Item
                      label="Select a role"
                      value=""
                      enabled={false}
                      // style={{ color: isDarkMode ? 'white' : 'black' }}
                    />
                    <Picker.Item label="Participant" value="participant" />
                    <Picker.Item label="Organizer" value="organizer" />
                  </Picker>
                </View>
              </View>

              <View>
                <Text
                  className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
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

              {/* <View>
              <Text className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Interests
              </Text>
              <View
                className={`rounded-full ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
                <Picker
                  selectedValue={selectedCity}
                  onValueChange={(itemValue) => setSelectedCity(itemValue)}
                  dropdownIconColor={isDarkMode ? 'white' : 'black'}
                  placeholder="Select one or many interests"
                  style={{
                    color: isDarkMode ? 'white' : 'black',
                    height: 50,
                    paddingHorizontal: 16,
                  }}>
                  <Picker.Item
                    label="Select one or many interests"
                    value=""
                    enabled={false}
                    // style={{ color: isDarkMode ? 'white' : 'black' }}
                  />
                  <Picker.Item label="Dance" value="Dance" />
                  <Picker.Item label="Music" value="Music" />
                  <Picker.Item label="Art" value="Art" />
                  <Picker.Item label="Sports" value="Sports" />
                  <Picker.Item label="Food" value="Food" />
                  <Picker.Item label="Travel" value="Travel" />
                  <Picker.Item label="Fashion" value="Fashion" />
                  <Picker.Item label="Technology" value="Technology" />
                  <Picker.Item label="Books" value="Books" />
                  <Picker.Item label="Movies" value="Movies" />
                  <Picker.Item label="TV" value="TV" />
                  <Picker.Item label="Gaming" value="Gaming" />
                </Picker>
              </View>
            </View> */}

              <View>
                <Text
                  className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Interests
                </Text>
                <View
                  className={`rounded-3xl p-4 ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
                  {isLoading ? (
                    <View className="items-center justify-center p-4">
                      <Text className={`${isDarkMode ? 'text-white' : 'text-black'}`}>
                        Loading...
                      </Text>
                    </View>
                  ) : (
                    <ScrollView className="max-h-32">
                      <View className="flex-row flex-wrap gap-2">
                        {interests.map((interest) => (
                          <TouchableOpacity
                            key={interest._id}
                            onPress={() => toggleInterest(interest)}
                            className={`rounded-full px-4 py-2 ${
                              selectedInterests.includes(interest._id)
                                ? 'bg-purple-600'
                                : isDarkMode
                                  ? 'bg-primary-light/20'
                                  : 'bg-primary-dark/20'
                            }`}>
                            <Text
                              className={`${
                                selectedInterests.includes(interest._id)
                                  ? 'text-white'
                                  : isDarkMode
                                    ? 'text-white/70'
                                    : 'text-black/70'
                              }`}>
                              {interest.category}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                  {selectedInterests.length > 0 && (
                    <Text
                      className={`mt-2 text-sm ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                      Selected: {selectedInterests.length} interests
                    </Text>
                  )}
                </View>
              </View>
              <View>
                <Text
                  className={`m-2 mt-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Profile Picture
                </Text>
                <TouchableOpacity
                  onPress={pickImage}
                  className={`items-center rounded-full p-4 ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/70'}`}>
                  {image ? (
                    <Image source={{ uri: image }} className="h-24 w-24 rounded-full" />
                  ) : (
                    <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-400/20">
                      <Text
                        className={`text-4xl ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                        +
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View className="mt-4 flex-row items-start">
                <TouchableOpacity
                  className={`mr-2 mt-1 h-5 w-5 rounded border ${isDarkMode ? 'border-white/30' : 'border-black/30'}`}
                />
                <Text className={`flex-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  I agree to the <Text className="text-purple-500">Terms & Conditions</Text> and{' '}
                  <Text className="text-purple-500">Privacy Policy</Text>
                </Text>
              </View>

              <TouchableOpacity
                className="mt-6 rounded-full bg-purple-600 py-3"
                onPress={handleRegister}>
                <Text
                  className={`text-center text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Create Account
                </Text>
              </TouchableOpacity>

              {/* <TouchableOpacity className="flex-row items-center justify-center space-x-2 rounded-full bg-white py-3">
              <Image source={require('../assets/images/google-icon.png')} className="h-5 w-5" />
              <Text className="font-semibold text-[#14132A]">Sign Up with Google</Text>
            </TouchableOpacity> */}

              <View className="mt-6 flex-row justify-center">
                <Text className={`text-gray-400 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text className={`text-purple-500 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
