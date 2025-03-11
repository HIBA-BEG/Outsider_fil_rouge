import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress: () => void;
  }[];
}

const CustomAlert = ({ visible, title, message, buttons }: CustomAlertProps) => {
  const { isDarkMode } = useTheme();

  const getButtonStyle = (style?: 'default' | 'cancel' | 'destructive') => {
    switch (style) {
      case 'destructive':
        return 'text-red-500';
      case 'cancel':
        return isDarkMode ? 'text-white/70' : 'text-primary-dark/70';
      default:
        return isDarkMode ? 'text-white' : 'text-primary-dark';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View 
          className={`w-[80%] rounded-2xl p-6 ${
            isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'
          }`}
        >
          <Text 
            className={`mb-2 text-center text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-primary-dark'
            }`}
          >
            {title}
          </Text>
          <Text 
            className={`mb-6 text-center ${
              isDarkMode ? 'text-white/80' : 'text-primary-dark/80'
            }`}
          >
            {message}
          </Text>
          <View className="flex-row justify-end space-x-4">
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={button.onPress}
                className="px-4 py-2"
              >
                <Text className={getButtonStyle(button.style)}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert; 