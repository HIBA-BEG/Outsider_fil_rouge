import { User } from "./user";
import { Event } from "./event";

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

