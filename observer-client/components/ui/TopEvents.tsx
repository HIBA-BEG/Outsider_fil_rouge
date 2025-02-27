import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TopEvents() {
  const { isDarkMode } = useTheme();

  return (
    <View className="mt-6">
        <View className="flex-row items-center justify-between">
          <Text className={`text-lg font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>Top Events</Text>
          <TouchableOpacity>
            <Text className="text-gray-400">Voir tous</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <TouchableOpacity className={`mr-4 rounded-2xl p-2 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/80'}`}>
            <View className="h-32 w-32 overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event1.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#4B0082' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">Jenny Wilson</Text>
            <Text className="text-sm text-gray-400">Danse contemporaine</Text>
          </TouchableOpacity>

          <TouchableOpacity className={`mr-4 rounded-2xl p-2 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-white/30' : 'bg-primary-dark/80'}`}>
            <View className="h-32 w-32 overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event2.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#800080' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">Wade Warren</Text>
            <Text className="text-sm text-gray-400">Musician</Text>
          </TouchableOpacity>
          <TouchableOpacity className={`mr-4 rounded-2xl p-2 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/80'}`}>
            <View className="h-32 w-32 overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event3.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#800080' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">Wade Warren</Text>
            <Text className="text-sm text-gray-400">Musician</Text>
          </TouchableOpacity>
          <TouchableOpacity className={`mr-4 rounded-2xl p-2 flex items-center backdrop-blur-sm ${isDarkMode ? 'bg-primary-light/30' : 'bg-primary-dark/80'}`}>
            <View className="h-32 w-32 overflow-hidden rounded-2xl">
              <Image
                source={require('../../assets/event4.jpg')}
                className="h-full w-full"
                style={{ backgroundColor: '#800080' }}
              />
            </View>
            <Text className="mt-2 text-base text-white">Wade Warren</Text>
            <Text className="text-sm text-gray-400">Musician</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
  );
} 