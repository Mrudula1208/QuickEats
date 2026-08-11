export interface OrderDeliveryResponse {

  // Unique delivery ID.
  id: number;

  // ID of the order being delivered.
  orderId: number;

  // ID of the delivery partner.
  deliveryPartnerId: number;

  // Current delivery status.
  deliveryStatus: string;

  // Date and time when delivery was assigned.
  assignedAt: Date;

}