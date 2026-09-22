import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review, CreateReviewRequest, EligibleReviewOrder, UpdateReviewRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/Review`;

  constructor(private http: HttpClient) {}

  // Get all Reviews across platform (Admin / Public)
  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  // Get the public reviews shown on the Home page (approved/published reviews)
  getPublicReviews(limit?: number): Observable<Review[]> {
    const params = limit ? `?limit=${limit}` : '';
    return this.http.get<Review[]>(`${this.apiUrl}/public${params}`);
  }

  // Get all Reviews submitted by the currently logged-in Customer
  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/my`);
  }

  // Get delivered orders eligible for review by the currently logged-in Customer
  getEligibleOrders(): Observable<EligibleReviewOrder[]> {
    return this.http.get<EligibleReviewOrder[]>(`${this.apiUrl}/eligible-orders`);
  }

  // Get all Reviews of one Restaurant (Public)
  getReviewsByRestaurant(restaurantId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/restaurant/${restaurantId}`);
  }

  // Get all Reviews for the currently authenticated Owner (Backend Isolated)
  getOwnerReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/owner`);
  }

  // Get average Rating of one Restaurant
  getAverageRating(restaurantId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/restaurant/${restaurantId}/average`);
  }

  // Delete one Review (Admin or Author Customer)
  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reviewId}`);
  }

  // Update one Review (Author Customer only; backend enforces ownership)
  updateReview(reviewId: number, review: UpdateReviewRequest): Observable<any> {
    const dto = {
      Rating: review.rating,
      Comment: review.comment
    };

    return this.http.put(`${this.apiUrl}/${reviewId}`, dto);
  }

  // Create a new Review
  addReview(review: CreateReviewRequest | Review): Observable<any> {
    const dto = {
      RestaurantId: review.restaurantId,
      OrderId: review.orderId,
      Rating: review.rating,
      Comment: review.comment
    };

    return this.http.post(this.apiUrl, dto);
  }
}
