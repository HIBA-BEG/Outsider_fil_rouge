import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import interestService from '../../app/(services)/interestApi';
import CustomAlert from './CustomAlert';
import { Feather } from '@expo/vector-icons';

interface AddInterestProps {
  visible: boolean;
  onClose: (success?: boolean, error?: string) => void;
}

const AddInterest: React.FC<AddInterestProps> = ({ visible, onClose }) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
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
      await interestService.createInterest({
        category: formData.category.trim(),
        description: formData.description.trim(),
      });
      onClose(true);
    } catch (error) {
      console.error('Error creating interest:', error);
      setErrorMessage('Failed to create interest. Please try again.');
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={isDarkMode ? 'white' : 'black'} />;
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onClose()}
        className="flex-1 items-center justify-center bg-black/50">
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className={`w-[90%] max-h-[80%] rounded-2xl p-6 ${
            isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'
          }`}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => onClose()} className="absolute right-0 top-0 z-10">
              <Text
                className={`text-xl font-bold ${
                  isDarkMode ? 'text-primary-light' : 'text-primary-dark'
                }`}>
                ✕
              </Text>
            </TouchableOpacity>

            <Text
              className={`pb-4 text-xl font-bold ${
                isDarkMode ? 'text-primary-light' : 'text-primary-dark'
              }`}>
              Create New Interest
            </Text>

            <View className="mt-4 gap-4">
              <View>
                <Text
                  className={`mb-2 font-semibold ${
                    isDarkMode ? 'text-primary-light' : 'text-primary-dark'
                  }`}>
                  Category
                </Text>
                <TextInput
                  placeholder="Enter category name"
                  value={formData.category}
                  onChangeText={(text) => handleInputChange('category', text)}
                  placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
                  className={`rounded-xl border px-4 py-3 ${
                    isDarkMode
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                  }`}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text
                  className={`mb-2 font-semibold ${
                    isDarkMode ? 'text-primary-light' : 'text-primary-dark'
                  }`}>
                  Description
                </Text>
                <TextInput
                  placeholder="Enter description"
                  value={formData.description}
                  onChangeText={(text) => handleInputChange('description', text)}
                  placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
                  className={`rounded-xl border px-4 py-3 ${
                    isDarkMode
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                  }`}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>

          <View className="mt-6 flex-row justify-end gap-3">
            <TouchableOpacity
              onPress={() => onClose()}
              className="rounded-full border border-red-500 bg-red-500/10 px-6 py-3">
              <Text className="text-red-500">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`rounded-full border border-green-500 bg-green-500/10 px-6 py-3`}>
              <Text className="text-green-500">{isLoading ? 'Creating...' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>

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
    </Modal>
  );
};

export default AddInterest;
