export interface City {
  _id: string;
  name: string;
  admin_name: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  population: number;
  isVerified: boolean;
  createdAt: Date;
}
