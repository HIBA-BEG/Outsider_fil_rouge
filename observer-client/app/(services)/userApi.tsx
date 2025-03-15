import AsyncStorage from '@react-native-async-storage/async-storage';

import axiosInstance from './axiosInstance';
import { User } from '../../types/user';

const userService = {
  async getProfile(): Promise<User> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.get(`/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateProfile(updatedData: Partial<User>): Promise<User> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.patch(`/user/profile`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async addInterests(userId: string, interests: string[]): Promise<User> {
    try {
      const response = await axiosInstance.patch(`/user/${userId}/interests/add`, {
        interests,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async removeInterests(userId: string, interests: string[]): Promise<User> {
    try {
      const response = await axiosInstance.patch(`/user/${userId}/interests/remove`, {
        interests,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async deleteProfile(): Promise<{ message: string }> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.delete(`/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error: any): Error {
    if (error.response) {
      return new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      return new Error('No response from server');
    } else {
      return new Error('Error setting up request');
    }
  },

  async allUsers(): Promise<User[]> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axiosInstance.get('/user/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async archivedUsers(): Promise<User[]> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axiosInstance.get('/user/archived', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async bannedUsers(): Promise<User[]> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axiosInstance.get('/user/banned', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async findAllParticipants(): Promise<User[]> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axiosInstance.get('/user/participants', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async findAllOrganizers(): Promise<User[]> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axiosInstance.get('/user/organizers', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async suggestedUsers(userId: string): Promise<User[]> {
    try {
      // console.log('Calling suggested users API for userId:', userId);
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.get(`/user/suggested`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log('Suggested users response:', response.data);

      return response.data;
    } catch (error) {
      console.error('Error in suggestedUsers:', error);
      throw error;
    }
  },
};

export default userService;
