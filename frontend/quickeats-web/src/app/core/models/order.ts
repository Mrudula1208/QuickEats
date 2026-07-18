// Represents one complete order.

import { CartItem } from './cart-item.model';
export interface Order {

  // Order Id
  id: number;

  // Customer delivery address
  address: string;

  // Customer phone number
  phone: string;

  // All ordered items
  items:CartItem[];


  // Final amount
  total: number;

  // Order Date
  date: Date;

}