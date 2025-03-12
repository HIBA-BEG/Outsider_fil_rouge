import { Interest } from "./interest";

export interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  city: string;
  poster: string;
  maxParticipants: number;
  price: number;
  interests: Interest[];
  isPublic: boolean;
  isArchived: boolean;
  status: string;
  createdAt: Date;
  registeredUsers: string[];
  // organizer: string;
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}
