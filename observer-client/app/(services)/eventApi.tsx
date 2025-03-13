import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

import axiosInstance from './axiosInstance';
import { Event } from '../../types/event';
import { Interest } from '../../types/interest';

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
  },

  async registerForEvent(eventId: string): Promise<Event> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.post(`/events/${eventId}/register`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  async cancelRegistration(eventId: string): Promise<Event> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.delete(`/events/${eventId}/register`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error canceling registration:', error);
      throw error;
    }
  },

  async getAvailableSpots(eventId: string): Promise<number> {
    try {
      const response = await axiosInstance.get(`/events/${eventId}/available-spots`);
      return response.data;
    } catch (error) {
      console.error('Error getting available spots:', error);
      throw error;
    }
  },

  async getRegisteredEvents(): Promise<Event[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.get('/events/user/registered', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching registered events:', error);
      return [];
    }
  },

  async updateEvent(eventId: string, eventData: any, images?: string[]): Promise<Event> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();
      
      if (eventData.title) formData.append('title', eventData.title);
      if (eventData.description) formData.append('description', eventData.description);
      if (eventData.location) formData.append('location', eventData.location);
      
      if (eventData.startDate) {
        const startDate = typeof eventData.startDate === 'string' 
          ? eventData.startDate 
          : new Date(eventData.startDate).toISOString();
        formData.append('startDate', startDate);
      }
      
      if (eventData.endDate) {
        const endDate = typeof eventData.endDate === 'string' 
          ? eventData.endDate 
          : new Date(eventData.endDate).toISOString();
        formData.append('endDate', endDate);
      }
      
      if (eventData.maxParticipants) formData.append('maxParticipants', String(eventData.maxParticipants));
      if (eventData.price) formData.append('price', String(eventData.price));
      
      if (eventData.city && eventData.city._id) {
        formData.append('city', eventData.city._id);
      }
      
      if (Array.isArray(eventData.interests) && eventData.interests.length > 0) {
        const interestIds = eventData.interests.map((interest: Interest) => interest._id);
        formData.append('interests', interestIds.join(','));
      }
      
      if (eventData.isPublic !== undefined) {
        formData.append('isPublic', String(eventData.isPublic));
      }
      
      if (images && images.length > 0) {
        for (const imageUri of images) {
          if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
            continue;
          }
          
          const fileInfo = await FileSystem.getInfoAsync(imageUri);
          
          if (!fileInfo.exists) {
            console.error('File does not exist:', imageUri);
            continue;
          }
          
          formData.append('poster', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'image.jpg',
            size: fileInfo.size
          } as any);
        }
      }
      
      console.log('Sending update formData:', formData);

      const response = await axiosInstance.patch(`/events/${eventId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }
};

export default eventService;
