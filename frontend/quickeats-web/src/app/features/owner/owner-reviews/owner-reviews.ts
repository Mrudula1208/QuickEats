import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { ReviewService } from '../../../core/services/review.service';
import { Restaurant } from '../../../core/models/restaurant.model';
import { Review } from '../../../core/models/review.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-owner-reviews',
  standalone: true,
  imports: [CommonModule, OwnerNavComponent],
  templateUrl: './owner-reviews.html',
  styleUrl: './owner-reviews.scss'
})
export class OwnerReviewsComponent {

  restaurant = signal<Restaurant | undefined>(undefined);
  reviews = signal<Review[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  totalReviews = signal(0);
  averageRating = signal(0);
  ratingDistribution = signal<number[]>([0, 0, 0, 0, 0]);

  constructor(
    private restaurantService: RestaurantService,
    private reviewService: ReviewService,
    private toastr: ToastrService
  ) {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    // Load owner's restaurant info
    this.restaurantService.getMyRestaurants().subscribe({
      next: (restaurants) => {
        const owned = restaurants && restaurants.length > 0 ? restaurants[0] : undefined;
        this.restaurant.set(owned);
      },
      error: () => console.error('Failed to load owner restaurants')
    });

    // Load strictly isolated owner reviews
    this.reviewService.getOwnerReviews().subscribe({
      next: (reviews) => {
        this.reviews.set(reviews || []);
        this.computeStats(reviews || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load reviews. Please try again.');
        this.toastr.error('Failed to load reviews');
      }
    });
  }

  retry(): void {
    this.loadData();
  }

  computeStats(reviews: Review[]): void {
    this.totalReviews.set(reviews.length);

    if (reviews.length === 0) {
      this.averageRating.set(0);
      this.ratingDistribution.set([0, 0, 0, 0, 0]);
      return;
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating.set(Math.round((sum / reviews.length) * 10) / 10);

    const dist = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating - 1]++;
      }
    });
    this.ratingDistribution.set(dist);
  }

  getStars(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getDistributionPercent(count: number): number {
    const total = this.totalReviews();
    if (total === 0) return 0;
    return (count / total) * 100;
  }
}
