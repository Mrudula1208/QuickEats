export interface Delivery {
  id: number;
  orderId: number;
  deliveryPartnerId: number;
  deliveryStatus: string;
  assignedAt: Date;
}

export interface OrderDeliveryResponse extends Delivery {}