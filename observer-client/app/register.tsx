import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import AuthApi from './(services)/authApi';
import cityService from './(services)/cityApi';
import interestService from './(services)/interestApi';
import CustomAlert from '../components/ui/CustomAlert';
import { City } from '../types/city';
import { Interest } from '../types/interest';

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

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as { text: string; onPress: () => void }[],
  });

  const [citySearchText, setCitySearchText] = useState('');
  const [interestSearchText, setInterestSearchText] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roleOptions = [
    { id: 'participant', label: 'Participant' },
    { id: 'organizer', label: 'Organizer' },
  ];

  const filteredCities = cities.filter((city) =>
    `${city.name}, ${city.admin_name}`.toLowerCase().includes(citySearchText.toLowerCase())
  );

  const filteredInterests = interests.filter((interest) =>
    interest.category.toLowerCase().includes(interestSearchText.toLowerCase())
  );

  const selectedCityName = cities.find((city) => city._id === selectedCity)
    ? `${cities.find((city) => city._id === selectedCity)?.name}, ${cities.find((city) => city._id === selectedCity)?.admin_name}`
    : '';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
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
      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !role ||
        !selectedCity ||
        selectedInterests.length === 0
      ) {
        setAlertConfig({
          visible: true,
          title: 'Missing Information',
          message: 'Please fill in all the required fields marked with *',
          buttons: [
            { text: 'OK', onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })) },
          ],
        });
        return;
      }

      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      formData.append('email', email.trim());
      formData.append('password', password);
      formData.append('role', role);
      formData.append('city', selectedCity);
      formData.append('interests', JSON.stringify(selectedInterests));

      if (image) {
        const filename = image.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
          uri: image,
          type,
          name: filename,
        } as any);
      }

      await AuthApi.register(formData);

      setAlertConfig({
        visible: true,
        title: 'Success!',
        message: 'Registration successful! Please check your email to verify your account.',
        buttons: [
          {
            text: 'OK',
            onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });

      setTimeout(() => {
        router.push('/verifyEmail');
      }, 3000);
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage =
        error?.response?.data?.message || error.message || 'An unexpected error occurred';

      setAlertConfig({
        visible: true,
        title: 'Registration Failed',
        message: errorMessage,
        buttons: [
          { text: 'OK', onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })) },
        ],
      });
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
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
              className={`mb-6 text-gray-400 ${isDarkMode ? 'text-white' : 'text-black'} text-center`}>
              Create an account
            </Text>
            <View className="mb-4">
              <Text
                className={`text-sm underline ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Fields marked with <Text className="text-lg font-bold text-red-500">*</Text> are
                required
              </Text>
            </View>
            <View className="gap-4">
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text
                    className={`mb-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                    First Name <Text className="text-lg font-bold text-red-500">*</Text>
                  </Text>
                  <View
                    className={`rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'}`}>
                    <TextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="First Name"
                      placeholderTextColor={isDarkMode ? '#666' : '#999'}
                      className={`px-4 py-4 ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text
                    className={`mb-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                    Last Name <Text className="text-lg font-bold text-red-500">*</Text>
                  </Text>
                  <View
                    className={`rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'}`}>
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Last Name"
                      placeholderTextColor={isDarkMode ? '#666' : '#999'}
                      className={`px-4 py-4 ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text
                  className={`mb-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                  Email <Text className="text-lg font-bold text-red-500">*</Text>
                </Text>
                <View
                  className={`flex-row items-center rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'}`}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="email@example.com"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    className={`flex-1 px-4 py-4 ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {email.length > 0 && <Text className="pr-4 text-green-500">✓</Text>}
                </View>
              </View>

              <View>
                <Text
                  className={`mb-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                  Password <Text className="text-lg font-bold text-red-500">*</Text>
                </Text>
                <View
                  className={`flex-row items-center rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'}`}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    className={`flex-1 px-4 py-4 ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pr-4">
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color={isDarkMode ? '#666' : '#999'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text
                    className={`mb-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                    Role <Text className="text-lg font-bold text-red-500">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowRoleDropdown(true)}
                    className={`flex-row items-center justify-between rounded-full px-4 py-3.5 ${
                      isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                    }`}>
                    <Text
                      className={`${isDarkMode ? 'text-white' : 'text-primary-dark'} ${
                        !role ? 'text-opacity-50' : ''
                      }`}>
                      {role ? roleOptions.find((r) => r.id === role)?.label : 'Select a role'}
                    </Text>
                    <Feather name="chevron-down" size={20} color={isDarkMode ? '#fff' : '#666'} />
                  </TouchableOpacity>

                  <Modal
                    visible={showRoleDropdown}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowRoleDropdown(false)}>
                    <TouchableOpacity
                      className="flex-1 bg-black/50"
                      activeOpacity={1}
                      onPress={() => setShowRoleDropdown(false)}>
                      <View
                        className={`m-4 mt-[85%] overflow-hidden rounded-3xl ${
                          isDarkMode ? 'bg-primary-dark' : 'bg-white'
                        }`}>
                        <FlatList
                          data={roleOptions}
                          keyExtractor={(item) => item.id}
                          className="max-h-96"
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              onPress={() => {
                                setRole(item.id);
                                setShowRoleDropdown(false);
                              }}
                              className={`flex-row items-center justify-between border-b p-4 ${
                                isDarkMode ? 'border-white/10' : 'border-gray-100'
                              }`}>
                              <Text
                                className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                                {item.label}
                              </Text>
                              {role === item.id && (
                                <Feather name="check" size={20} color="#8B5CF6" />
                              )}
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    </TouchableOpacity>
                  </Modal>
                </View>

                <View className="flex-1">
                  <Text
                    className={`mb-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                    City <Text className="text-lg font-bold text-red-500">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCityDropdown(true)}
                    className={`flex-row items-center justify-between rounded-full px-4 py-3.5 ${
                      isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                    }`}>
                    <Text
                      className={`${isDarkMode ? 'text-white' : 'text-primary-dark'} ${
                        !selectedCity ? 'text-opacity-50' : ''
                      }`}>
                      {selectedCityName || 'Select a city'}
                    </Text>
                    <Feather name="chevron-down" size={20} color={isDarkMode ? '#fff' : '#666'} />
                  </TouchableOpacity>

                  <Modal
                    visible={showCityDropdown}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowCityDropdown(false)}>
                    <TouchableOpacity
                      className="flex-1 bg-black/50"
                      activeOpacity={1}
                      onPress={() => setShowCityDropdown(false)}>
                      <View
                        className={`m-4 mt-32 overflow-hidden rounded-3xl ${
                          isDarkMode ? 'bg-primary-dark' : 'bg-white'
                        }`}>
                        <View
                          className={`border-b p-4 ${
                            isDarkMode ? 'border-white/10' : 'border-gray-200'
                          }`}>
                          <TextInput
                            value={citySearchText}
                            onChangeText={setCitySearchText}
                            placeholder="Search city..."
                            placeholderTextColor={isDarkMode ? '#666' : '#999'}
                            className={`rounded-full px-4 py-2 ${
                              isDarkMode
                                ? 'bg-white/10 text-white'
                                : 'bg-gray-100 text-primary-dark'
                            }`}
                          />
                        </View>
                        <FlatList
                          data={filteredCities}
                          keyExtractor={(item) => item._id}
                          className="max-h-96"
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedCity(item._id);
                                setShowCityDropdown(false);
                                setCitySearchText('');
                              }}
                              className={`border-b p-4 ${
                                isDarkMode ? 'border-white/10' : 'border-gray-100'
                              }`}>
                              <Text
                                className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                                {item.name}, {item.admin_name}
                              </Text>
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    </TouchableOpacity>
                  </Modal>
                </View>
              </View>

              <View>
                <Text
                  className={`mb-2 pl-2 text-lg ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                  Interests <Text className="text-lg font-bold text-red-500">*</Text>
                </Text>
                <View
                  className={`rounded-2xl ${isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'}`}>
                  {isLoading ? (
                    <View className="items-center justify-center p-4">
                      <Text className={isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}>
                        Loading...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => setShowInterestDropdown(true)}
                        className="flex-row items-center justify-between px-4 py-3.5">
                        <Text
                          className={`${isDarkMode ? 'text-white/50' : 'text-primary-dark/50'}`}>
                          Select interests
                        </Text>
                        <Feather
                          name="chevron-down"
                          size={20}
                          color={isDarkMode ? '#fff' : '#666'}
                        />
                      </TouchableOpacity>

                      <Modal
                        visible={showInterestDropdown}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowInterestDropdown(false)}>
                        <TouchableOpacity
                          className="flex-1 bg-black/50"
                          activeOpacity={1}
                          onPress={() => setShowInterestDropdown(false)}>
                          <View
                            className={`m-4 mt-32 overflow-hidden rounded-3xl ${
                              isDarkMode ? 'bg-primary-dark' : 'bg-white'
                            }`}>
                            <View
                              className={`border-b p-4 ${
                                isDarkMode ? 'border-white/10' : 'border-gray-200'
                              }`}>
                              <TextInput
                                value={interestSearchText}
                                onChangeText={setInterestSearchText}
                                placeholder="Search interests..."
                                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                                className={`rounded-full px-4 py-2 ${
                                  isDarkMode
                                    ? 'bg-white/10 text-white'
                                    : 'bg-gray-100 text-primary-dark'
                                }`}
                              />
                            </View>
                            <FlatList
                              data={filteredInterests}
                              keyExtractor={(item) => item._id}
                              className="max-h-96"
                              renderItem={({ item }) => (
                                <TouchableOpacity
                                  onPress={() => {
                                    toggleInterest(item);
                                    setInterestSearchText('');
                                  }}
                                  className={`flex-row items-center justify-between border-b p-4 ${
                                    isDarkMode ? 'border-white/10' : 'border-gray-100'
                                  }`}>
                                  <Text
                                    className={`${
                                      isDarkMode ? 'text-white' : 'text-primary-dark'
                                    }`}>
                                    {item.category}
                                  </Text>
                                  {selectedInterests.includes(item._id) && (
                                    <Feather name="check" size={20} color="#8B5CF6" />
                                  )}
                                </TouchableOpacity>
                              )}
                            />
                          </View>
                        </TouchableOpacity>
                      </Modal>

                      {selectedInterests.length > 0 && (
                        <View className="flex-row flex-wrap gap-2 p-4">
                          {interests
                            .filter((interest) => selectedInterests.includes(interest._id))
                            .map((interest) => (
                              <View
                                key={interest._id}
                                className="flex-row items-center rounded-full bg-purple-500 px-3 py-1">
                                <Text className="text-white">{interest.category}</Text>
                                <TouchableOpacity
                                  onPress={() => toggleInterest(interest)}
                                  className="ml-2">
                                  <Feather name="x" size={16} color="white" />
                                </TouchableOpacity>
                              </View>
                            ))}
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>

              <TouchableOpacity
                onPress={pickImage}
                className={`mt-4 items-center justify-center rounded-3xl p-6 ${
                  isDarkMode ? 'bg-white/10' : 'bg-primary-dark/5'
                } active:scale-95`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                  elevation: 2,
                }}>
                {image ? (
                  <View className="relative">
                    <Image
                      source={{ uri: image }}
                      className="h-28 w-28 rounded-full"
                      style={{
                        borderWidth: 3,
                        borderColor: isDarkMode ? '#ffffff30' : '#00000020',
                      }}
                    />
                    <View className="absolute bottom-0 right-0 rounded-full bg-primary-dark/80 p-2">
                      <Feather name="camera" size={18} color="#fff" />
                    </View>
                  </View>
                ) : (
                  <View className="relative h-28 w-28">
                    <View className="h-full w-full items-center justify-center rounded-full border-2 border-dashed border-gray-400/30 bg-gray-400/10">
                      <Feather
                        name="camera"
                        size={32}
                        color={isDarkMode ? '#ffffff80' : '#00000080'}
                      />
                    </View>
                  </View>
                )}
                <Text
                  className={`mt-3 font-medium ${isDarkMode ? 'text-white/70' : 'text-primary-dark/70'}`}>
                  Add Profile Picture <Text className="text-gray-500">(Optional)</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRegister}
                className={`mt-6 rounded-full py-3 ${isDarkMode ? 'bg-white' : 'bg-primary-dark'}`}>
                <Text
                  className={`text-center text-lg font-semibold ${
                    isDarkMode ? 'text-primary-dark' : 'text-white'
                  }`}>
                  Create Account
                </Text>
              </TouchableOpacity>

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
