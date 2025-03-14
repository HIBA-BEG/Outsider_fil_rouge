import AsyncStorage from '@react-native-async-storage/async-storage';
import { Comment } from '../../types/comment';
import axiosInstance from './axiosInstance';

const commentService = {
  getEventComments: async (eventId: string): Promise<Comment[]> => {
    try {
      const response = await axiosInstance.get(`/comments/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event comments:', error);
      throw error;
    }
  },

  createComment: async (eventId: string, data: { content: string }): Promise<Comment> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      // console.log('Token:', token);
      const response = await axiosInstance.post(`/comments/event/${eventId}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  updateComment: async (commentId: string, content: string): Promise<Comment> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.patch(`/comments/${commentId}`, { content }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId: string): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      await axiosInstance.delete(`/comments/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  deleteCommentAsOrganizer: async (commentId: string): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      await axiosInstance.delete(`/comments/organizer/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error deleting comment as organizer:', error);
      throw error;
    }
  },
};

export default commentService; 