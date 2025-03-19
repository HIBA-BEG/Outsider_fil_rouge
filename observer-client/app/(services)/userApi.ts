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

  async updateProfile(profileData: any): Promise<User> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();

      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('email', profileData.email);

      const cityId = typeof profileData.city === 'string' ? profileData.city : profileData.city._id;
      formData.append('city', cityId);

      if (Array.isArray(profileData.interests)) {
        const interestIds = profileData.interests.map((interest: any) =>
          typeof interest === 'string' ? interest : interest._id
        );
        formData.append('interests', interestIds.join(','));
      }

      if (profileData.profileImage?.uri) {
        const { uri, type, name } = profileData.profileImage;
        formData.append('profilePicture', {
          uri,
          type,
          name,
        } as any);
      }

      console.log('Sending profile update formData:', formData);

      const response = await axiosInstance.patch('/user/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
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

  async sendFriendRequest(receiverId: string): Promise<{ message: string }> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.post(
        `/user/friends/request/${receiverId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log('Friend request sent:', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async cancelFriendRequest(receiverId: string): Promise<{ message: string }> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.delete(`/user/friends/cancel/${receiverId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log('Friend request cancelled:', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getSentFriendRequests(): Promise<User[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.get('/user/friends/requests/sent', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log('Sent friend requests response::', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getReceivedFriendRequests(): Promise<User[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.get('/user/friends/requests/received', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async acceptFriendRequest(senderId: string): Promise<{ message: string }> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.post(
        `/user/friends/accept/${senderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async rejectFriendRequest(senderId: string): Promise<{ message: string }> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.delete(`/user/friends/reject/${senderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getFriends(): Promise<User[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.get('/user/myFriends', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('my Friends response::', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async removeFriend(friendId: string): Promise<{ message: string }> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.delete(`/user/friends/${friendId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
};

export default userService;
