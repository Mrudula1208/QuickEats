import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { Review } from '../../../core/models/review.model';
import { Restaurant } from '../../../core/models/restaurant.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss'
})
export class ReviewsComponent {

  reviews = signal<Review[]>([]);
  restaurants = signal<Restaurant[]>([]);
  isLoading = signal(true);

  averageRating = 0;
  reviewCount = 0;
  ratingDistribution: number[] = [0, 0, 0, 0, 0];

  isLoggedIn = false;
  currentUserId = 0;

  newRating = 5;
  newComment = '';
  selectedRestaurantId = 0;
  stars = [1, 2, 3, 4, 5];
  commentError = '';
  reviewSuccess = false;

  showForm = signal(false);

  constructor(
    private reviewService: ReviewService,
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    const userId = localStorage.getItem('userId');
    this.currentUserId = userId ? parseInt(userId, 10) : 0;
    this.loadReviews();
    this.loadRestaurants();
  }

  loadReviews(): void {
    this.isLoading.set(true);
    this.reviewService.getReviews().subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.reviewCount = data.length;
        this.computeStats(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => this.restaurants.set(data),
      error: () => {}
    });
  }

  computeStats(data: Review[]): void {
    if (data.length === 0) {
      this.averageRating = 0;
      this.ratingDistribution = [0, 0, 0, 0, 0];
      return;
    }
    const total = data.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = total / data.length;
    this.ratingDistribution = [0, 0, 0, 0, 0];
    data.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        this.ratingDistribution[r.rating - 1]++;
      }
    });
  }

  getRatingPercent(star: number): number {
    if (this.reviewCount === 0) return 0;
    return (this.ratingDistribution[star - 1] / this.reviewCount) * 100;
  }

  getRatingLabel(star: number): string {
    return `${star} star`;
  }

  isStarFilled(star: number, rating: number): boolean {
    return star <= Math.round(rating);
  }

  setRating(rating: number): void {
    this.newRating = rating;
  }

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

  canSubmitReview(): boolean {
    return this.selectedRestaurantId > 0 && this.newComment.trim().length > 0;
  }

  submitReview(): void {
    if (!this.validateComment()) return;
    this.reviewSuccess = false;

    const review: Review = {
      id: 0,
      customerId: this.currentUserId,
      restaurantId: this.selectedRestaurantId,
      customerName: '',
      restaurantName: '',
      rating: this.newRating,
      comment: this.newComment,
      createdAt: new Date()
    };

    this.reviewService.addReview(review).subscribe({
      next: () => {
        this.newRating = 5;
        this.newComment = '';
        this.selectedRestaurantId = 0;
        this.commentError = '';
        this.reviewSuccess = true;
        this.showForm.set(false);
        this.toastr.success('Review submitted successfully!');
        this.loadReviews();
      },
      error: () => {
        this.toastr.error('Failed to submit review. Please try again.');
      }
    });
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    this.reviewSuccess = false;
    this.commentError = '';
  }

  isOwnReview(review: Review): boolean {
    return this.isLoggedIn && review.customerId === this.currentUserId;
  }

  deleteReview(reviewId: number): void {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.toastr.success('Review deleted');
        this.loadReviews();
      },
      error: () => {
        this.toastr.error('Failed to delete review');
      }
    });
  }

  getCustomerInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}
