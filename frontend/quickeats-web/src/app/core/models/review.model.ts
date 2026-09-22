export interface Review {
  id: number;
  customerId: number;
  restaurantId: number;
  orderId?: number;
  customerName: string;
  customerProfileImageUrl?: string;
  isVerifiedOrder?: boolean;
  restaurantName: string;
  restaurantImageUrl?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CreateReviewRequest {
  restaurantId: number;
  orderId?: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}

export interface EligibleReviewOrder {
  orderId: number;
  restaurantId: number;
  restaurantName: string;
  restaurantImageUrl?: string;
  totalAmount: number;
  orderDate: Date;
  alreadyReviewed: boolean;
}
