import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

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

  async createEvent(eventData: any, images: string[]): Promise<Event> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();
      
      Object.keys(eventData).forEach(key => {
        if (key === 'interests') {
          formData.append(key, eventData[key]);
        } else {
          formData.append(key, String(eventData[key]));
        }
      });

      for (const imageUri of images) {
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        console.log('File info:', fileInfo);

        if (!fileInfo.exists) {
          console.error('File does not exist:', imageUri);
          continue;
        }

        formData.append('poster', {
          uri: imageUri,
          // type: imageType,
          // name: imageFileName || 'image.jpg',
           type: 'image/jpeg',
          name: 'image.jpg',
          size: fileInfo.size
        } as any);
      }

      console.log('Images being sent:', images);
      console.log('FormData being sent:', formData);

      const response = await axiosInstance.post('/events', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.delete(`/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
};

export default eventService;
