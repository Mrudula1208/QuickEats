export interface Restaurant {

  // Primary Key
  id: number;

  // Restaurant Name
  name: string;

  // Description
  description: string;

  // Address
  address: string;

  // Phone Number
  phoneNumber: string;

  // Restaurant Image
  imageUrl: string;

  // Restaurant Active Status
  isActive: boolean;

  // Created Date
  createdAt: string;

  // Average Rating
  rating?: number;
}