import { City } from "~/types/city";
import axiosInstance from "./axiosInstance";

const cityService = {
  async getAllCities(): Promise<string[]> {
    try {
      const response = await axiosInstance.get('/cities/all');
      // console.log('Cities:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  },

  async getAllRegions(): Promise<string[]> {
    try {
      const response = await axiosInstance.get('/cities/regions');
    //   console.log('Regions:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
  },

  async getCitiesByRegion(region: string): Promise<City[]> {
    try {
      const response = await axiosInstance.get(`/cities/region/${region}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  },

  async searchCities(query: string): Promise<City[]> {
    try {
      const response = await axiosInstance.get(`/cities/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }
};

export default cityService;