// One item inside an order.
export interface OrderItemModel {

  menuItemId: number;

  quantity: number;

  name: string;

  unitPrice: number;

  totalPrice: number;

}

export interface OrderModel {

  id: number;

  userId: number;

  customerName: string;

  restaurantId: number;

  restaurantName: string;

  deliveryAddress: string;

  phoneNumber: string;

  paymentMethod: string;

  totalAmount: number;

  status: string;

  createdAt: Date;

  items: OrderItemModel[];

}
