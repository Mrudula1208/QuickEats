export interface Review {

  // Unique ID of this review.
  id: number;

  // ID of the customer who wrote the review.
  customerId: number;

  // ID of the restaurant being reviewed.
  restaurantId: number;

  // Name of the customer.
  customerName: string;

  // Name of the restaurant.
  restaurantName: string;

  // Rating given by the customer.
  //
  // Example:
  // 1, 2, 3, 4, or 5
  rating: number;

  // Text written by the customer.
  comment: string;

  // Date when the review was created.
  createdAt: Date;

}
