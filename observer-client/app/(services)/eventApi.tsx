import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../../types/event';
import axiosInstance from './axiosInstance';

const eventService = {
  async getPersonalizedEvents(): Promise<Event[]> {
    try {
        const token = await AsyncStorage.getItem('authToken'); 
        const response = await axiosInstance.get('/events/personalized', {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        // console.log('response for personalized events', response.data);
        return response.data; 
    } catch (error) {
      console.error('Error fetching personalized events:', error);
      return [];
    }
  },

  async findAll(): Promise<Event[]> {
    try {
      const response = await axiosInstance.get('/events'); 
      return response.data; 
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },
};

export default eventService;