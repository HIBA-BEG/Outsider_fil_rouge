import axiosInstance from './axiosInstance';

import { Interest } from '../../types/interest';

const interestService = {
  async getAllInterests(): Promise<Interest[]> {
    try {
      const response = await axiosInstance.get('/interests');
      // console.log('Interests:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching interests:', error);
      return [];
    }
  },

  async getInterestsByCategory(category: string): Promise<Interest[]> {
    try {
      const response = await axiosInstance.get(`/interests?category=${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interests by category:', error);
      return [];
    }
  },


  createInterest: async (data: { category: string; description: string }): Promise<Interest> => {
    try {
      const response = await axiosInstance.post('/interests', data);
      return response.data;
    } catch (error) {
      console.error('Error creating interest:', error);
      throw error;
    }
  },

  updateInterest: async (id: string, data: { category: string; description: string }): Promise<Interest> => {
    try {
      const response = await axiosInstance.patch(`/interests/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating interest:', error);
      throw error;
    }
  },

  deleteInterest: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/interests/${id}`);
    } catch (error) {
      console.error('Error deleting interest:', error);
      throw error;
    }
  },
};

export default interestService;
