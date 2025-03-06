import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

export default function Categories() {
  const { isDarkMode } = useTheme();

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between">
        <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Select Categories
        </Text>
        <TouchableOpacity>
          <Text className="text-gray-400">See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        <TouchableOpacity
          className={`mr-3 rounded-full ${isDarkMode ? 'bg-primary-light/60' : 'bg-primary-dark/70'} px-6 py-2`}>
          <Text className={`${isDarkMode ? 'text-primary-dark' : 'text-primary-light'}`}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`mr-3 rounded-full ${isDarkMode ? 'border border-2 border-white/30' : 'border border-2 border-primary-dark/30'} px-6 py-2`}>
          <Text className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>Musique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`mr-3 rounded-full ${isDarkMode ? 'border border-2 border-white/30' : 'border border-2 border-primary-dark/30'} px-6 py-2`}>
          <Text className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>Sports</Text>
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
          <Text className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>Photographie</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`mr-3 rounded-full ${isDarkMode ? 'border border-2 border-white/30' : 'border border-2 border-primary-dark/30'} px-6 py-2`}>
          <Text className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>Jeux vidéo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`mr-3 rounded-full ${isDarkMode ? 'border border-2 border-white/30' : 'border border-2 border-primary-dark/30'} px-6 py-2`}>
          <Text className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
            Échange linguistique
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`mr-3 rounded-full ${isDarkMode ? 'border border-2 border-white/30' : 'border border-2 border-primary-dark/30'} px-6 py-2`}>
          <Text className={`${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>Fitness</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
