import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const ratingService = {
  createRating: async (eventId: string, score: number) => {
    const token = await AsyncStorage.getItem('authToken');
    console.log('token', token);
    const response = await axios.post(
      `${API_URL}/ratings/event/${eventId}`,
      { score },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getEventAverageRating: async (eventId: string) => {
    const response = await axios.get(`${API_URL}/ratings/event/${eventId}/average`);
    return response.data;
  },

  getEventRatings: async (eventId: string) => {
    const response = await axios.get(`${API_URL}/ratings/event/${eventId}`);
    return response.data;
  },

  cancelRating: async (eventId: string) => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axios.delete(`${API_URL}/ratings/event/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default ratingService;
