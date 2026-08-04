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

    this.reviewService
      .getReviews()
      .subscribe({

        // next
        // Runs if API Success.
        next: (data:ReviewModel[]) => {

          // data
          // Reviews from Backend.
          this.customerReviews = data;

          console.log(this.customerReviews);

        },

        // error
        // Runs if API Fails.
        error: (err:any) => {

          console.log(err);

        }

      });

    }
  // Runs when customer clicks Submit Review.
   submitReview(): void {

    // Generate Review Id.
    this.newReview.reviewId = Date.now();

    // Store Current Date.
    this.newReview.reviewDate = new Date();

    // Go to Backend.
    // Save Review.
    this.reviewService
      .addReviews(this.newReview)
      .subscribe({

        // next
        // Runs if API Success.
        next: () => {

          // Reload Reviews.
          this.loadReviews();

          // Clear Form.
          this.newReview = {

            reviewId: 0,

            customerName: '',

            restaurantName: '',

            rating: 5,

            reviewMessage: '',

            reviewDate: new Date()

          };

          alert("Review Added");

        },

        // error
        // Runs if API Fails.
        error: (err:any) => {

          console.log(err);

        }

      });

  }

}