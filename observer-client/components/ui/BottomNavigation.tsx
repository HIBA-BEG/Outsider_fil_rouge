import { View, Switch, Text, TouchableOpacity } from 'react-native';

export default function BottomNavigation() {

  return (
    <View className="absolute bottom-5 left-0 right-0 mx-4">
        <View className="flex-row items-center justify-around rounded-full bg-gray-800/80 py-3">
          <TouchableOpacity>
            <View className="rounded-full bg-white p-3">
              <Text>🏠</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-gray-400">🎵</Text>
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