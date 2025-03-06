import AsyncStorage from '@react-native-async-storage/async-storage';

import axiosInstance from './axiosInstance';
import { Event } from '../../types/event';

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

  async findByOrganizer(): Promise<Event[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.get('/events/organizer/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  async createEvent(event: Event): Promise<Event> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.post('/events', event, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  },
};

export default eventService;
