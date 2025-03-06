import axiosInstance from './axiosInstance';

import { Interest } from '~/types/interest';

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
};

export default interestService;
