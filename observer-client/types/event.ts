import { City } from './city';
import { Interest } from './interest';
import { User } from './user';

export interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  city: City;
  poster: string;
  maxParticipants: number;
  price: number;
  interests: Interest[];
  isPublic: boolean;
  isArchived: boolean;
  status: string;
  createdAt: Date;
  registeredUsers: string[];
  organizer: User;
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}
