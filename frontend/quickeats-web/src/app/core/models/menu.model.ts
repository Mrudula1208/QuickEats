// =============================================
// Menu Model
// Represents one food item.
// Data comes from Menu API.
// =============================================

export interface MenuItem {

  // Unique Menu Id
  id: number;

  // Restaurant Id
  // Which restaurant this menu belongs to
  restaurantId: number;

  // Food Name
  name: string;

  // Food Description
  description: string;

  // Price
  price: number;

  // Food Image
  imageUrl: string;

  // Available or Not
  isAvailable: boolean;

}