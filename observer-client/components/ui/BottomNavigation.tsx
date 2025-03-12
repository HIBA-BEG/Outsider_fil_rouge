import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome, FontAwesome6, Foundation, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function BottomNavigation() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  const handleMyEvents = () => {
    router.push('/myEvents');
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleAllUsers = () => {
    router.push('/allUsers');
  };


  return (
    <View className="absolute bottom-5 left-0 right-0 mx-4">
      <View className="flex-row items-center justify-around rounded-full bg-gray-800/80 py-3">
        <TouchableOpacity onPress={handleHome}>
          <View className="rounded-full bg-white p-3">
            <Text className="text-center">🏠</Text>
          {/* <Text className="text-gray-400">Home</Text> */}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAllUsers}>
          <FontAwesome6 name="users" color="text-black" size={24} style={{ textAlign: 'center' }} />
          {/* <Text className="text-gray-400">All Users</Text> */}
        </TouchableOpacity>
        {
          user?.role === 'organizer' && (
            <TouchableOpacity onPress={handleMyEvents}>
              <Text className="text-gray-400">📅</Text>
              {/* <Text className="text-gray-400">My Events</Text> */}
            </TouchableOpacity>
          )
        }
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
