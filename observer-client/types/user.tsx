import { City } from './city';
import { Event } from './event';
import { Interest } from './interest';

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  city: City[];
  role: 'admin' | 'organizer' | 'participant';
  isBanned: boolean;
  isArchived: boolean;
  // profilePicture?: File;
  profilePicture: string | null;
  profileVerified: boolean;
  interests: Interest[];
  registeredEvents: Event[];
  createdEvents: Event[];
};
