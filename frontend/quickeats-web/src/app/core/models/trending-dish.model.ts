import { MenuItem } from './menu.model';

// =============================================
// Trending Dish Model
// A MenuItem plus the restaurant context needed
// by the "Trending Dishes" home section.
// Data comes from GET /api/Menu/trending.
// =============================================

export interface TrendingDish extends MenuItem {

  // Restaurant this dish belongs to.
  restaurantName: string;

  // Restaurant average rating used as the dish rating.
  rating: number;

  // Real number of times this dish has been ordered (0 when no order history).
  totalOrdered: number;
}