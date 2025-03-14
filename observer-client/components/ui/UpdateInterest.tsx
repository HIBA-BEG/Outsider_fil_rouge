import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import interestService from '../../app/(services)/interestApi';
import CustomAlert from './CustomAlert';
import { Feather } from '@expo/vector-icons';
import { Interest } from '../../types/interest';

interface UpdateInterestProps {
  isVisible: boolean;
  interest: Interest;
  onClose: () => void;
  onUpdate: (interest: Interest) => void;
}

const UpdateInterest: React.FC<UpdateInterestProps> = ({ isVisible, interest, onClose, onUpdate }) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: interest.category,
    description: interest.description,
  });

  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.category.trim()) {
      setErrorMessage('Please enter a category');
      setShowErrorAlert(true);
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage('Please enter a description');
      setShowErrorAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      const updatedInterest = {
        ...interest,
        category: formData.category.trim(),
        description: formData.description.trim(),
      };
      onUpdate(updatedInterest);
    } catch (error) {
      console.error('Error updating interest:', error);
      setErrorMessage('Failed to update interest. Please try again.');
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6 mt-6 flex-row gap-6">
          <TouchableOpacity onPress={onClose}>
            <Text
              className={`text-xl font-bold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
              ←
            </Text>
          </TouchableOpacity>
          <Text
            className={`text-2xl font-bold ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
            Update Interest
          </Text>
        </View>

        <View className="gap-6">
          <View>
            <Text
              className={`mb-2 text-lg ${isDarkMode ? 'text-primary-light/80' : 'text-primary-dark/80'}`}>
              Category
            </Text>
            <TextInput
              placeholder="Category"
              value={formData.category}
              onChangeText={(text) => handleInputChange('category', text)}
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
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
              className={`rounded-full border px-4 py-3 ${
                isDarkMode
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
              }`}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View className="mb-10 mt-4 flex-row justify-center gap-3">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`rounded-full border border-green-500 bg-green-500/10 px-6 py-4`}>
              <Text className="text-green-500">{isLoading ? 'Updating...' : 'Update Interest'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
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

export default UpdateInterest;
