import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/Review`;

  constructor(private http: HttpClient) {}

  // Get all Reviews (Admin)
  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  // Get all Reviews of one Restaurant
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

  // Delete one Review
  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reviewId}`);
  }

  // Add a new Review
  addReview(review: Review): Observable<any> {
    const dto = {
      CustomerId: review.customerId,
      RestaurantId: review.restaurantId,
      Rating: review.rating,
      Comment: review.comment
    };

    return this.http.post(this.apiUrl, dto);
  }
}
