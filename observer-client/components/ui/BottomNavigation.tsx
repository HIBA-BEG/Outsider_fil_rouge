import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function BottomNavigation() {
  const handleMyEvents = () => {
    router.push('/myEvents');
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <View className="absolute bottom-5 left-0 right-0 mx-4">
      <View className="flex-row items-center justify-around rounded-full bg-gray-800/80 py-3">
        <TouchableOpacity onPress={handleHome}>
          <View className="rounded-full bg-white p-3">
            <Text>🏠</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-gray-400">🎵</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMyEvents}>
          <Text className="text-gray-400">📅</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-gray-400">🔔</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-gray-400">💬</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
