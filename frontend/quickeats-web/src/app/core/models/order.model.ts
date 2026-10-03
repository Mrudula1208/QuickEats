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

  paymentStatus?: string;

  deliveryStatus?: string;

  deliveryPartnerName?: string;

  cancelledBy?: string;

  cancelledAt?: Date;

  createdAt: Date;

  items: OrderItemModel[];

}

// DTO for creating order item
export interface CreateOrderItemDto {
  menuItemId?: number;
  MenuItemId?: number;
  quantity?: number;
  Quantity?: number;
}

// DTO for placing an order
export interface CreateOrderDto {
  restaurantId?: number;
  RestaurantId?: number;
  deliveryAddress?: string;
  DeliveryAddress?: string;
  phoneNumber?: string;
  PhoneNumber?: string;
  paymentMethod?: string;
  PaymentMethod?: string;
  items?: CreateOrderItemDto[];
  Items?: CreateOrderItemDto[];
  couponCode?: string | null;
  CouponCode?: string | null;
  totalAmount?: number;
  TotalAmount?: number;
}

// Standard response message from order actions
export interface OrderActionResponse {
  message: string;
}
