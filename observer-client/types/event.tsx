export interface Event {
    _id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    city: string;
    // poster: string;
    maxParticipants: number;
    price: number;
    interests: string[];
    isPublic: boolean;
    isArchived: boolean;
    status: string; 
    // organizer: string; 
  }