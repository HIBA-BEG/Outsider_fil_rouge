import { Event } from './event';
import { User } from './user';

export interface Comment {
  _id: string;
  content: string;
  user: User;
  event: Event;
  archivedByOwner: boolean;
  archivedByOrganizer: boolean;
  createdAt: Date;
  updatedAt: Date;
}
