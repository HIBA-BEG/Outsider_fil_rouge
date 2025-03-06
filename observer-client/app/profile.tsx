// import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView } from 'react-native';

import { useTheme } from '~/context/ThemeContext';

const Profile = () => {
  const { isDarkMode } = useTheme();

  return (
    <View className="relative flex-1">
      <Image
        source={require('../assets/event1.jpg')}
        className=" absolute left-0 top-0 h-1/2 w-full"
        resizeMode="cover"
      />

      {/* <LinearGradient
        colors={['transparent', 'white', '#14132A', ]}
        className="absolute bottom-0 h-2/3 w-full"
      /> */}

      <View
        className="absolute bottom-0 h-[70%] w-full translate-y-10 transform bg-primary-light"
        style={{
          transform: [{ rotate: '75deg' }],
        }}
      />
      <View
        className="absolute bottom-0 h-[70%] w-full translate-y-10 transform bg-primary-light/40"
        style={{
          transform: [{ rotate: '85deg' }],
        }}
      />
      <View
        className="absolute bottom-0 h-[75%] w-full translate-y-10 transform bg-primary-light/40"
        style={{
          transform: [{ rotate: '-77deg' }],
        }}
      />
      <View
        className="absolute bottom-0 h-[73%] w-full translate-y-10 transform bg-primary-light/30"
        style={{
          transform: [{ rotate: '-85deg' }],
        }}
      />

      <View className="absolute left-8 top-[37%] h-28 w-28 overflow-hidden rounded-full border-2 border-white">
        <Image
          source={require('../assets/event3.jpg')}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      <ScrollView className="absolute bottom-0 w-full p-4 ">
        <View className="mb-4 flex-row items-center">
          <View>
            <Text className="text-2xl font-bold">Susan Goph</Text>
            <View className="mx-4 flex-row justify-between">
              <TouchableOpacity className="mr-2 flex-1 rounded-full bg-gray-200 p-3">
                <Text className="text-center text-gray-700">Update My Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity className="ml-2 flex-1 rounded-full bg-gray-200 p-3">
                <Text className="text-center text-gray-700">My friends</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
              <TouchableOpacity
                className={`mr-3 rounded-full ${isDarkMode ? 'border border-2 border-white/30' : 'border border-2 border-primary-dark/30'} px-6 py-2`}>
                <Text className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                  Musique
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`mr-3 rounded-full ${isDarkMode ? 'border border-2 border-white/30' : 'border border-2 border-primary-dark/30'} px-6 py-2`}>
                <Text className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>Danse</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`mr-3 rounded-full ${isDarkMode ? 'border border-2 border-white/30' : 'border border-2 border-primary-dark/30'} px-6 py-2`}>
                <Text className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>Art</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`mr-3 rounded-full ${isDarkMode ? 'border border-2 border-white/30' : 'border border-2 border-primary-dark/30'} px-6 py-2`}>
                <Text className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                  Photographie
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Here gonna display the events that the user has created or attended */}
        <View className="flex-row flex-wrap justify-between">
          <Image
            source={require('../assets/event2.jpg')}
            className="mb-2 h-32 w-[48%] rounded-lg"
          />
          <Image
            source={require('../assets/event1.jpg')}
            className="mb-2 h-32 w-[48%] rounded-lg"
          />
          <Image
            source={require('../assets/event4.jpg')}
            className="mb-2 h-32 w-[48%] rounded-lg"
          />
          <Image
            source={require('../assets/event3.jpg')}
            className="mb-2 h-32 w-[48%] rounded-lg"
          />
        </View>

        <TouchableOpacity className="mt-4">
          <Text className="text-center text-blue-500">view more events</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Profile;
