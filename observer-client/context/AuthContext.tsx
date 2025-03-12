import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { User } from '../types/user';
import userService from '../app/(services)/userApi';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserContext: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const userData = await userService.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await AsyncStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      const userData = await userService.getProfile();
      setUser(userData);
      router.replace('/');
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUserContext = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        logout,
        updateUserContext 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}