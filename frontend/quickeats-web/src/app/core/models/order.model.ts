export interface OrderModel {

  id: number;

  customerName: string;

  restaurantName: string;

  address: string;

  phone: string;

  items: any[];

  total: number;

  paymentMethod: string;

  status: string;

  estimatedDeliveryTime: string;

  date: Date;

}