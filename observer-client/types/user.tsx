import { Event } from "./event";
import { Interest } from "./interest";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  city: number;
  role: 'admin' | 'organizer' | 'participant';
  isBanned: boolean;
  // profilePicture?: File;
  profilePicture: string | null;
  profileVerified: boolean;
  interests: Interest[];
  registeredEvents: Event[];
  createdEvents: Event[];
};
