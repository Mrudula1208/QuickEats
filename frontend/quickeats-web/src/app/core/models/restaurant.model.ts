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

  // Opening Time (HH:mm format)
  openingTime: string;

  // Closing Time (HH:mm format)
  closingTime: string;

  // Computed on server based on current time
  isOpenNow: boolean;

  // True when the restaurant is flagged for the Featured home section.
  isFeatured?: boolean;

  // Optional geographic coordinates (used by the "Near You" section).
  latitude?: number | null;

  longitude?: number | null;

  // Distance from the caller in km, only present on nearby API responses.
  distanceKm?: number | null;

  // Created Date
  createdAt: string;

  // Average Rating
  rating?: number;

  // Number of reviews received (returned on the backend Restaurant DTO).
  reviewCount?: number;

  // Delivery fee per order (0 = free delivery).
  deliveryCharge: number;

  // Minimum order amount required.
  minimumOrder: number;
}
