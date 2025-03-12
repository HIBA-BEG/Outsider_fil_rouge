import { View, Switch, Text } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <View className="flex-row items-center gap-2">
      <Text className={isDarkMode ? 'text-white' : 'text-black'}>{isDarkMode ? '🌙' : '☀️'}</Text>
      <Switch value={isDarkMode} onValueChange={toggleTheme} />
    </View>
  );
}
