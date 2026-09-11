import { Component } from '@angular/core';
// Component
// Tells Angular that this file controls the Admin Reviews page.

import { CommonModule } from '@angular/common';
// CommonModule
// Gives us Angular features such as @if, @for and date pipe.

import { ReviewService } from '../../../core/services/review.service';
// ReviewService
// Used to call Review APIs.

import { Review } from '../../../core/models/review.model';
// Review
// Defines the structure of one review.

import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
// Top navigation bar for the Admin Panel.

import { ToastrService } from 'ngx-toastr';
// Displays success/error toast notifications.


@Component({

  // selector
  // Name Angular uses for this Component.
  selector: 'app-admin-reviews',

  // standalone
  // Means this Component works independently.
  standalone: true,

  // imports
  // Modules required by this Component.
  imports: [
    CommonModule,
    AdminNavComponent
  ],

  // Connects TypeScript with HTML.
  templateUrl: './admin-reviews.html',

  // Connects the SCSS file.
  styleUrl: './admin-reviews.scss'

})


export class AdminReviews {


  // Store all reviews.
  //
  // Review
  // Means one Review object.
  //
  // []
  // Means multiple Review objects.
  //
  // =
  // Starts with an empty array.

  reviews: Review[] = [];

  // Page loading state.
  isLoading = true;

  // Error message when reviews fail to load.
  loadError = '';


  constructor(

    // reviewService
    // Variable used to access ReviewService.
    //
    // private
    // Can be used only inside this Component.
    //
    // :
    // Separates variable name from its type.
    //
    // ReviewService
    // Type of the injected Service.

    private reviewService: ReviewService,
    private toastr: ToastrService

  ) {

    // Constructor runs automatically
    // when Admin Reviews page opens.

    // Load all reviews immediately.

    this.loadReviews();

  }


  // Load all Reviews.
  loadReviews(): void {

    // Start loading reviews.
    this.isLoading = true;
    this.loadError = '';

    // STEP 1
    // Call ReviewService.
    //
    // getReviews()
    // Sends GET request to Backend.

    this.reviewService
      .getReviews()

      // STEP 2
      // subscribe()
      // Waits for Backend response.

      .subscribe({

        // Backend successfully returned reviews.

        next: (data: Review[]) => {

          // Store Backend data
          // inside reviews array.

          this.reviews = data;

          this.isLoading = false;

        },


        // Backend/API request failed.

        error: () => {
          this.isLoading = false;
          this.loadError = 'Could not load reviews. Please try again.';
          this.toastr.error('Could not load reviews. Please try again.');
        }

      });

  }


  // Retry loading reviews.
  retry(): void {
    this.loadReviews();
  }


  // Delete Review.
  deleteReview(

    // ID of the review we want to delete.
    reviewId: number

  ): void {

    // Ask for confirmation before deleting.
    if (!confirm('Delete this review? This cannot be undone.')) return;

    // STEP 1
    // Call ReviewService.
    //
    // deleteReview()
    // Sends DELETE request to Backend.

    this.reviewService
      .deleteReview(reviewId)

      // STEP 2
      // Wait for Backend response.

      .subscribe({

        // Backend successfully deleted review.

        next: () => {

          // STEP 3
          // Show success message.
          this.toastr.success('Review deleted');

          // Load the latest reviews
          // from Backend.

          this.loadReviews();

        },


        // Backend/API error.

        error: () => this.toastr.error('Failed to delete review')

      });

  }

}
