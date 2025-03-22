import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';

import interestService from '../../app/(services)/interestApi';
import { useTheme } from '../../context/ThemeContext';
import { Interest } from '../../types/interest';

interface InterestsProps {
  onSelectInterest?: (interest: string) => void;
  selectedInterest?: string;
}

export default function Interests({ onSelectInterest, selectedInterest }: InterestsProps) {
  const { isDarkMode } = useTheme();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const fetchedInterests = await interestService.getAllInterests();
      setInterests(fetchedInterests);
    } catch (error) {
      console.error('Error fetching interests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="mt-6">
      {isLoading ? (
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      ) : (
        <>
          <View className="flex-row items-center justify-between">
            <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Filter by Interest
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <TouchableOpacity
              onPress={() => onSelectInterest?.('all')}
              className={`mr-3 rounded-full ${
                selectedInterest === 'all'
                  ? isDarkMode
                    ? 'bg-primary-light/60'
                    : 'bg-primary-dark/70'
                  : isDarkMode
                    ? 'border-2 border-white/30'
                    : 'border-2 border-primary-dark/30'
              } px-6 py-2`}>
              <Text
                className={`${
                  selectedInterest === 'all'
                    ? isDarkMode
                      ? 'text-primary-dark'
                      : 'text-primary-light'
                    : isDarkMode
                      ? 'text-white'
                      : 'text-primary-dark'
                }`}>
                All
              </Text>
            </TouchableOpacity>

            {interests.map((interest) => (
              <TouchableOpacity
                key={interest._id}
                onPress={() => onSelectInterest?.(interest._id)}
                className={`mr-3 rounded-full ${
                  selectedInterest === interest._id
                    ? isDarkMode
                      ? 'bg-primary-light/60'
                      : 'bg-primary-dark/70'
                    : isDarkMode
                      ? 'border-2 border-white/30'
                      : 'border-2 border-primary-dark/30'
                } px-6 py-2`}>
                <Text
                  className={`${
                    selectedInterest === interest._id
                      ? isDarkMode
                        ? 'text-primary-dark'
                        : 'text-primary-light'
                      : isDarkMode
                        ? 'text-white'
                        : 'text-primary-dark'
                  }`}>
                  {interest.category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
