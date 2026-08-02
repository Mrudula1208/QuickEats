import { Component } from '@angular/core';
// Import Component because this file controls the Reviews page.

import { CommonModule } from '@angular/common';
// Import CommonModule because HTML uses @for and @if.

import { FormsModule } from '@angular/forms';
// Import FormsModule because ngModel is used.

import { ReviewService } from '../../../core/services/review.service';
// Import ReviewService because all review logic is written there.

import { ReviewModel } from '../../../core/models/review.model';
// Import ReviewModel because it defines one review object.

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss'
})

export class ReviewsComponent {

  // Store all customer reviews.
  customerReviews: ReviewModel[] = [];

  // Store new review entered by customer.
  newReview: ReviewModel = {

    reviewId: 0,

    customerName: '',

    restaurantName: '',

    rating: 5,

    reviewMessage: '',

    reviewDate: new Date()

  };

  constructor(

    // Angular automatically creates ReviewService.
    private reviewService: ReviewService

  ) {

    // Load reviews immediately.
    this.loadReviews();

  }

  // Load all reviews.
  loadReviews(): void {

    this.customerReviews =
      this.reviewService.getReviews();

    console.log(this.customerReviews);

  }

  // Runs when customer clicks Submit Review.
  submitReview(): void {

    // Generate temporary id.
    this.newReview.reviewId = Date.now();

    // Store today's date.
    this.newReview.reviewDate = new Date();

    // Save review.
    this.reviewService.addReview(

      this.newReview

    );

    // Reload reviews.
    this.loadReviews();

    // Clear form.
    this.newReview = {

      reviewId: 0,

      customerName: '',

      restaurantName: '',

      rating: 5,

      reviewMessage: '',

      reviewDate: new Date()

    };

  }

}