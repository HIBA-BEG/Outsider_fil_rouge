import AsyncStorage from '@react-native-async-storage/async-storage';

import axiosInstance from './axiosInstance';
import { User } from '../../types/user';

const adminService = {
  async banUser(userId: string): Promise<User> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axiosInstance.post(`/admin/users/${userId}/ban`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async unbanUser(userId: string): Promise<User> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axiosInstance.post(`/admin/users/${userId}/unban`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default adminService;
