export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  city: number;
  role: string;
  isBanned: boolean;
  profilePicture?: File;
  profileVerified: boolean;
  interests: number[];
};
