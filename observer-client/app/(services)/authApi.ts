import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import axiosInstance from './axiosInstance';

interface AuthResponse {
  token: string;
}

class AuthApi {
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Attempting login with:', email);

      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      console.log('Login response::', response.data);

      return response.data;
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.message?.includes('banned')) {
        throw new Error('ACCOUNT_BANNED');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // console.error('Login error:', error);
      throw new Error('An error occurred during login');
    }
  }

  static async register(formData: FormData): Promise<AuthResponse> {
    try {
      console.log('Registering user with form data:', formData);
      const response = await axiosInstance.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw this.handleError(error);
    }
  }

  static async logout(): Promise<void> {
    AuthApi.clearAuthToken();
    await AsyncStorage.removeItem('authToken');
  }

  private static handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return new Error('An unexpected error occurred');
  }

  static setAuthToken(token: string): void {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  static clearAuthToken(): void {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
}

export default AuthApi;
