// Structure of one delivery.
// Matches OrderDeliveryResponseDto in the Backend.
export interface DeliveryItem {
  menuItemId: number;
  quantity: number;
  name?: string;
  itemName?: string;
  unitPrice?: number;
  price?: number;
  totalPrice?: number;
}

export interface Delivery {
  id: number;
  orderId: number;
  deliveryPartnerId: number;
  deliveryStatus: string;
  assignedAt: Date | string;
  pickedUpAt?: Date | string;
  deliveredAt?: Date | string;

  // Delivery Partner details
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryPartnerEmail?: string;

  // Order & Restaurant details needed by the Delivery Partner.
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  customerName?: string;
  deliveryAddress?: string;
  phoneNumber?: string;
  customerPhone?: string;
  paymentMethod?: string;
  totalAmount?: number;
  orderStatus?: string;
  orderCreatedAt?: Date | string;
  items?: DeliveryItem[];
  orderItems?: DeliveryItem[];
}

export interface OrderDeliveryResponse extends Delivery {}

export interface DeliveryPartnerSummary {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  profileImageUrl?: string;
  isActive: boolean;
  activeDeliveriesCount: number;
  completedDeliveriesCount: number;
  createdAt: Date | string;
}

export interface CreateDeliveryPartnerDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  phoneNumber?: string;
  address?: string;
}

export interface CreateOrderDeliveryDto {
  orderId: number;
  deliveryPartnerId: number;
  deliveryStatus?: string;
}
