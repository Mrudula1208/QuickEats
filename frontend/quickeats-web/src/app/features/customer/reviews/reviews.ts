import { Component } from '@angular/core';
// Import Component because this file controls the Reviews page.

import { CommonModule } from '@angular/common';
// Import CommonModule because HTML uses @for and @if.

import { FormsModule } from '@angular/forms';
// Import FormsModule because ngModel is used.

import { ReviewService } from '../../../core/services/review.service';
// Used to call Review APIs.

import { Review } from '../../../core/models/review.model';
// Review model stores one review.

import { Restaurant } from '../../../core/models/restaurant.model';
// Restaurant model stores restaurant details.

import { RestaurantService } from '../../../core/services/restaurant.service';
// Used to load restaurants for the dropdown.

import { AuthService } from '../../../core/services/auth.service';
// Used to check whether the Customer is logged in.

import { ToastrService } from 'ngx-toastr';
// Used to show success/error notifications.

import { RouterLink } from '@angular/router';
// RouterLink makes routerLink work in HTML.

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss'
})

export class ReviewsComponent {

  // Store all customer reviews.
  customerReviews: Review[] = [];

  // Store all restaurants (for the dropdown).
  restaurants: Restaurant[] = [];

  // Average Rating across all loaded reviews.
  averageRating = 0;

  // Number of Reviews.
  reviewCount = 0;

  // true = Customer is logged in.
  isLoggedIn = false;

  // Rating selected in the Add Review form.
  newRating = 5;

  // Comment typed in the Add Review form.
  newComment = '';

  // Restaurant selected in the Add Review form.
  selectedRestaurantId = 0;

  // Star values used to draw rating stars.
  stars = [1, 2, 3, 4, 5];

  // Validation error message shown below the textarea.
  commentError = '';

  // true = show success message after review submission.
  reviewSuccess = false;

  constructor(

    // Angular automatically creates ReviewService.
    private reviewService: ReviewService,

    private restaurantService: RestaurantService,

    private authService: AuthService,

    // Toast notifications.
    private toastr: ToastrService

  ) {

    // Check whether Customer is logged in.
    this.isLoggedIn = this.authService.isLoggedIn();

    // Load reviews immediately.
    this.loadReviews();

    // Load restaurants for the dropdown.
    this.loadRestaurants();

  }

  // Load all reviews.
  loadReviews(): void {

    this.reviewService
      .getReviews()
      .subscribe({

        // API Success.
        next: (data: Review[]) => {

          this.customerReviews = data;

          this.reviewCount = data.length;

          // Compute average rating.
          this.computeAverageRating();

        },

        // API Failed.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

  // Load all restaurants for the dropdown.
  loadRestaurants(): void {

    this.restaurantService
      .getRestaurants()
      .subscribe({

        // API Success.
        next: (data: Restaurant[]) => {

          this.restaurants = data;

        },

        // API Failed.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

  // Compute average Rating from loaded reviews.
  computeAverageRating(): void {

    if (this.customerReviews.length === 0) {

      this.averageRating = 0;

      return;

    }

    const total = this.customerReviews
      .reduce((sum, r) => sum + r.rating, 0);

    this.averageRating = total / this.customerReviews.length;

  }

  // true = this star should be filled.
  isStarFilled(star: number, rating: number): boolean {

    return star <= Math.round(rating);

  }

  // Select the Rating in the Add Review form.
  setRating(rating: number): void {

    this.newRating = rating;

  }

  // Validate the comment field.
  // Returns true if the comment is valid.
  validateComment(): boolean {

    if (!this.newComment.trim()) {

      this.commentError = 'Please write a review before submitting.';

      return false;

    }

    if (this.newComment.trim().length < 5) {

      this.commentError = 'Review must be at least 5 characters.';

      return false;

    }

    this.commentError = '';

    return true;

  }

  // true = the Submit Review button should be enabled.
  canSubmitReview(): boolean {

    return this.selectedRestaurantId > 0 && this.newComment.trim().length > 0;

  }

  // Runs when customer clicks Submit Review.
  submitReview(): void {

    // Validate before submitting.
    if (!this.validateComment()) {

      return;

    }

    // Hide previous success message.
    this.reviewSuccess = false;

    const review: Review = {

      id: 0,

      customerId: 0,

      restaurantId: this.selectedRestaurantId,

      customerName: '',

      restaurantName: '',

      rating: this.newRating,

      comment: this.newComment,

      createdAt: new Date()

    };

    this.reviewService
      .addReview(review)
      .subscribe({

        // API Success.
        next: () => {

          // Clear Form.
          this.newRating = 5;
          this.newComment = '';
          this.selectedRestaurantId = 0;
          this.commentError = '';

          // Show success message.
          this.reviewSuccess = true;
          this.toastr.success('Review submitted successfully!');

          // Reload Reviews.
          this.loadReviews();

        },

        // API Failed.
        error: (err: any) => {

          this.toastr.error('Failed to submit review. Please try again.');

        }

      });

  }

}
