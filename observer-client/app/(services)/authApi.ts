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
      const requiredFields = [
        'firstName',
        'lastName',
        'email',
        'password',
        'role',
        'city',
        'interests',
      ];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`${field} is required`);
        }
      }

      const response = await axiosInstance.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
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

  static async forgotPassword(email: string) {
    try {
      const response = await axiosInstance.post(`/auth/forgot-password`, { email });

      console.log('Forgot password response::', response.data);
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  static async resetPassword(token: string, newPassword: string) {
    try {
      const response = await axiosInstance.post(`/auth/reset-password`, {
        token,
        newPassword,
      });

      console.log('Reset password response::', response.data);

      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  static async verifyEmail(token: string) {
    try {
      const response = await axiosInstance.post(`/auth/verify-email`, { token });
      console.log('Email verification response::', response.data);
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  static async resendVerification(email: string) {
    try {
      const response = await axiosInstance.post(`/auth/resend-verification`, { email });
      console.log('Resend verification response::', response.data);
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }
}

export default AuthApi;
