// Structure of one delivery.
// Matches OrderDeliveryResponseDto in the Backend.
export interface Delivery {
  id: number;
  orderId: number;
  deliveryPartnerId: number;
  deliveryStatus: string;
  assignedAt: Date;

  // Order details needed by the Delivery Partner.
  restaurantName: string;
  customerName: string;
  deliveryAddress: string;
  phoneNumber: string;
  totalAmount: number;
  orderStatus: string;
  items: DeliveryItem[];
}

// Structure of one item inside a delivery.
export interface DeliveryItem {
  menuItemId: number;
  quantity: number;
  name: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDeliveryResponse extends Delivery {}
