import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { Review } from '../../../core/models/review.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminNavComponent
  ],
  templateUrl: './admin-reviews.html',
  styleUrl: './admin-reviews.scss'
})
export class AdminReviews implements OnInit {
  reviews = signal<Review[]>([]);
  filteredReviews = signal<Review[]>([]);
  isLoading = signal(true);
  loadError = signal('');

  // Search & Filter state
  searchQuery = '';
  selectedRating: number | null = null;
  selectedRestaurant = '';
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest';

  // Computed Stats
  totalReviews = signal(0);
  averageRating = signal(0);
  ratingCounts = signal<{ [star: number]: number }>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  uniqueRestaurants = signal<string[]>([]);

  constructor(
    private reviewService: ReviewService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.reviewService.getReviews().subscribe({
      next: (data: Review[]) => {
        this.reviews.set(Array.isArray(data) ? data : []);
        this.calculateStats();
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set('Could not load reviews. Please verify server connection.');
        this.toastr.error('Could not load reviews. Please try again.');
      }
    });
  }

  calculateStats(): void {
    const reviews = this.reviews();
    const total = reviews.length;
    this.totalReviews.set(total);

    if (total === 0) {
      this.averageRating.set(0);
      this.uniqueRestaurants.set([]);
      this.ratingCounts.set({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      return;
    }

    let sum = 0;
    const counts: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const restSet = new Set<string>();

    for (const r of reviews) {
      const roundedStar = Math.min(5, Math.max(1, Math.round(r.rating || 0)));
      counts[roundedStar] = (counts[roundedStar] || 0) + 1;
      sum += (r.rating || 0);

      if (r.restaurantName) {
        restSet.add(r.restaurantName);
      }
    }

    this.averageRating.set(+(sum / total).toFixed(1));
    this.uniqueRestaurants.set(Array.from(restSet).sort());
    this.ratingCounts.set(counts);
  }

  applyFilters(): void {
    let result = [...this.reviews()];

    // Search query
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(r =>
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.restaurantName && r.restaurantName.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q))
      );
    }

    // Rating filter
    if (this.selectedRating !== null) {
      result = result.filter(r => Math.round(r.rating) === this.selectedRating);
    }

    // Restaurant filter
    if (this.selectedRestaurant) {
      result = result.filter(r => r.restaurantName === this.selectedRestaurant);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      if (this.sortBy === 'newest') return dateB - dateA;
      if (this.sortBy === 'oldest') return dateA - dateB;
      if (this.sortBy === 'highest') return (b.rating || 0) - (a.rating || 0);
      if (this.sortBy === 'lowest') return (a.rating || 0) - (b.rating || 0);
      return 0;
    });

    this.filteredReviews.set(result);
  }

  setRatingFilter(star: number | null): void {
    this.selectedRating = star;
    this.applyFilters();
  }

  getStarPercent(star: number): number {
    if (this.totalReviews() === 0) return 0;
    return Math.round(((this.ratingCounts()[star] || 0) / this.totalReviews()) * 100);
  }

  getStarsArray(rating: number): number[] {
    const fullStars = Math.floor(rating || 0);
    return Array.from({ length: 5 }, (_, i) => i < fullStars ? 1 : 0);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);
  }

  deleteReview(reviewId: number): void {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;

    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.toastr.success('Review deleted successfully.');
        this.reviews.set(this.reviews().filter(r => r.id !== reviewId));
        this.calculateStats();
        this.applyFilters();
      },
      error: () => this.toastr.error('Failed to delete review.')
    });
  }

  retry(): void {
    this.loadReviews();
  }
}
