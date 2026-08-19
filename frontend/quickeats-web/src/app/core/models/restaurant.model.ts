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

  // Created Date
  createdAt: string;

  // Average Rating
  rating?: number;

  // Delivery fee per order (0 = free delivery).
  deliveryCharge: number;

  // Minimum order amount required.
  minimumOrder: number;
}