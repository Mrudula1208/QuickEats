import { Component } from '@angular/core';
// Import Component because this file controls the Reviews page.

import { CommonModule } from '@angular/common';
// Import CommonModule because HTML uses @for and @if.

import { FormsModule } from '@angular/forms';
// Import FormsModule because ngModel is used.

import { ReviewService } from '../../../core/services/review.service';
// Import ReviewService because all review logic is written there.

import { Review } from '../../../core/models/review.model';
// Import Review because it defines one review object.

import { ToastrService } from 'ngx-toastr';

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
  customerReviews: Review[] = [];

  // Store new review entered by customer.
  newReview: Review = {

    id: 0,

    customerId: 1,

    restaurantId: 1,

    customerName: '',

    restaurantName: '',

    rating: 5,

    comment: '',

    createdAt: new Date()

  };

  constructor(

    // Angular automatically creates ReviewService.
    private reviewService: ReviewService,

    // Toast notifications.
    private toastr: ToastrService

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
        next: (data: Review[]) => {

          // data
          // Reviews from Backend.
          this.customerReviews = data;

          console.log(this.customerReviews);

        },

        // error
        // Runs if API Fails.
        error: (err: any) => {

          console.log(err);

        }

      });

    }
  // Runs when customer clicks Submit Review.
   submitReview(): void {

    // Go to Backend.
    // Save Review.
    this.reviewService
      .addReview(this.newReview)
      .subscribe({

        // next
        // Runs if API Success.
        next: () => {

          // Reload Reviews.
          this.loadReviews();

          // Clear Form.
          this.newReview = {

            id: 0,

            customerId: 1,

            restaurantId: 1,

            customerName: '',

            restaurantName: '',

            rating: 5,

            comment: '',

            createdAt: new Date()

          };

          this.toastr.success('Review Added');

        },

        // error
        // Runs if API Fails.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

}
