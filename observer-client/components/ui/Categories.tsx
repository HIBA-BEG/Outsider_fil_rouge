import { View, Switch, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../app/context/ThemeContext';

export default function Categories() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <View className="mt-6">
    <View className="flex-row items-center justify-between">
      <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Select Categories</Text>
      <TouchableOpacity>
        <Text className="text-gray-400">See All</Text>
      </TouchableOpacity>
    </View>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
      <TouchableOpacity className="mr-3 rounded-full bg-purple-600 px-6 py-2">
        <Text className="text-white">Tous</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mr-3 rounded-full bg-gray-800 px-6 py-2">
        <Text className="text-white">Musique</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mr-3 rounded-full bg-gray-800 px-6 py-2">
        <Text className="text-white">Sports</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mr-3 rounded-full bg-gray-800 px-6 py-2">
        <Text className="text-white">Danse</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mr-3 rounded-full bg-gray-800 px-6 py-2">
        <Text className="text-white">Art</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mr-3 rounded-full bg-gray-800 px-6 py-2">
        <Text className="text-white">Photographie</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mr-3 rounded-full bg-gray-800 px-6 py-2">
        <Text className="text-white">Jeux vidéo</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mr-3 rounded-full bg-gray-800 px-6 py-2">
        <Text className="text-white">Échange linguistique</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mr-3 rounded-full bg-gray-800 px-6 py-2">
        <Text className="text-white">Fitness</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
  );
} 