import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';
import { Review, EligibleReviewOrder, CreateReviewRequest, UpdateReviewRequest } from '../../../core/models/review.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss'
})
export class ReviewsComponent implements OnInit {
  activeTab: 'my-reviews' | 'write-review' | 'all-reviews' = 'my-reviews';

  myReviews = signal<Review[]>([]);
  allReviews = signal<Review[]>([]);
  eligibleOrders = signal<EligibleReviewOrder[]>([]);

  isLoading = signal(true);
  isSubmitting = signal(false);
  isLoggedIn = false;
  isCustomer = false;

  // New Review Form State
  selectedOrderId: number | null = null;
  selectedRestaurantId = 0;
  selectedRestaurantName = '';
  selectedRestaurantImage = '';
  newRating = 5;
  newComment = '';
  hoverRating = 0;
  formError = '';

  // Filter state for all reviews
  allReviewsSearch = signal('');
  selectedFilterRating = signal<number | null>(null);

  // Edit Review State
  editingReviewId: number | null = null;
  editRating = 5;
  editComment = '';
  editHoverRating = 0;
  editError = '';
  isSavingEdit = signal(false);

  filteredAllReviews = computed(() => {
    let list = this.allReviews();
    const query = this.allReviewsSearch().toLowerCase().trim();
    const filter = this.selectedFilterRating();

    if (query) {
      list = list.filter(r =>
        r.restaurantName.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query) ||
        r.comment.toLowerCase().includes(query)
      );
    }

    if (filter !== null) {
      list = list.filter(r => Math.round(r.rating) === filter);
    }

    return list;
  });

  unreviewedOrders = computed(() => {
    return this.eligibleOrders().filter(o => !o.alreadyReviewed);
  });

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isCustomer = this.isLoggedIn && this.authService.getRole() === 'Customer';

    const requestedTab = this.route.snapshot.queryParamMap.get('tab');
    if (requestedTab === 'write' && this.isCustomer) {
      this.activeTab = 'write-review';
    }

    if (this.isCustomer) {
      this.loadMyReviews();
      this.loadEligibleOrders();
    } else {
      // Owners/Admins/Delivery Partners and logged-out visitors only see the
      // public community reviews on this page.
      this.activeTab = 'all-reviews';
      this.loadAllReviews();
    }
  }

  loadMyReviews(): void {
    this.isLoading.set(true);
    this.reviewService.getMyReviews().subscribe({
      next: (data) => {
        this.myReviews.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastr.error('Failed to load your reviews.');
      }
    });
  }

  loadEligibleOrders(): void {
    this.reviewService.getEligibleOrders().subscribe({
      next: (data) => {
        this.eligibleOrders.set(data || []);
        if (data && data.length > 0 && !this.selectedOrderId) {
          const firstUnreviewed = data.find(o => !o.alreadyReviewed) || data[0];
          this.selectOrder(firstUnreviewed);
        }
      },
      error: () => {}
    });
  }

  loadAllReviews(): void {
    this.isLoading.set(true);
    // Only publicly-visible (approved/published) reviews are shown here.
    this.reviewService.getPublicReviews().subscribe({
      next: (data) => {
        this.allReviews.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.allReviews.set([]);
        this.isLoading.set(false);
        this.toastr.error('Failed to load community reviews.');
      }
    });
  }

  selectOrder(order: EligibleReviewOrder): void {
    this.selectedOrderId = order.orderId;
    this.selectedRestaurantId = order.restaurantId;
    this.selectedRestaurantName = order.restaurantName;
    this.selectedRestaurantImage = order.restaurantImageUrl || '';
    this.formError = '';
  }

  onOrderDropdownChange(): void {
    if (!this.selectedOrderId) return;
    const order = this.eligibleOrders().find(o => o.orderId === +this.selectedOrderId!);
    if (order) {
      this.selectOrder(order);
    }
  }

  setRating(rating: number): void {
    this.newRating = rating;
  }

  setHoverRating(rating: number): void {
    this.hoverRating = rating;
  }

  resetHoverRating(): void {
    this.hoverRating = 0;
  }

  submitReview(): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Please log in to submit a review.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.selectedRestaurantId || this.selectedRestaurantId <= 0) {
      this.formError = 'Please select a delivered order to review.';
      return;
    }

    if (!this.newComment || this.newComment.trim().length < 5) {
      this.formError = 'Please write a review with at least 5 characters.';
      return;
    }

    if (this.newRating < 1 || this.newRating > 5) {
      this.formError = 'Please choose a rating between 1 and 5 stars.';
      return;
    }

    this.formError = '';
    this.isSubmitting.set(true);

    const payload: CreateReviewRequest = {
      restaurantId: this.selectedRestaurantId,
      orderId: this.selectedOrderId ?? undefined,
      rating: this.newRating,
      comment: this.newComment.trim()
    };

    this.reviewService.addReview(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.toastr.success('Your review has been published successfully!', 'Review Submitted');
        this.newComment = '';
        this.newRating = 5;
        this.activeTab = 'my-reviews';
        this.loadMyReviews();
        this.loadEligibleOrders();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : 'Failed to submit review.');
        this.formError = msg;
        this.toastr.error(msg);
      }
    });
  }

  deleteReview(reviewId: number): void {
    if (!confirm('Are you sure you want to delete this review?')) return;

    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.toastr.success('Review deleted successfully.');
        this.myReviews.update(list => list.filter(r => r.id !== reviewId));
        this.loadEligibleOrders();
      },
      error: () => this.toastr.error('Failed to delete review.')
    });
  }

  startEdit(review: Review): void {
    this.editingReviewId = review.id;
    this.editRating = review.rating || 5;
    this.editComment = review.comment || '';
    this.editHoverRating = 0;
    this.editError = '';
  }

  cancelEdit(): void {
    this.editingReviewId = null;
    this.editComment = '';
    this.editRating = 5;
    this.editHoverRating = 0;
    this.editError = '';
    this.isSavingEdit.set(false);
  }

  setEditRating(rating: number): void {
    this.editRating = rating;
  }

  setEditHoverRating(rating: number): void {
    this.editHoverRating = rating;
  }

  resetEditHoverRating(): void {
    this.editHoverRating = 0;
  }

  saveEdit(review: Review): void {
    if (!this.editingReviewId) return;

    if (!this.editComment || this.editComment.trim().length < 5) {
      this.editError = 'Please write a review with at least 5 characters.';
      return;
    }

    if (this.editRating < 1 || this.editRating > 5) {
      this.editError = 'Please choose a rating between 1 and 5 stars.';
      return;
    }

    this.editError = '';
    this.isSavingEdit.set(true);

    const payload: UpdateReviewRequest = {
      rating: this.editRating,
      comment: this.editComment.trim()
    };

    this.reviewService.updateReview(review.id, payload).subscribe({
      next: () => {
        this.isSavingEdit.set(false);
        this.toastr.success('Your review has been updated successfully.', 'Review Updated');
        this.myReviews.update(list =>
          list.map(r => r.id === review.id
            ? { ...r, rating: this.editRating, comment: this.editComment.trim() }
            : r)
        );
        this.cancelEdit();
      },
      error: (err) => {
        this.isSavingEdit.set(false);
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : 'Failed to update review.');
        this.editError = msg;
        this.toastr.error(msg);
      }
    });
  }

  switchTab(tab: 'my-reviews' | 'write-review' | 'all-reviews'): void {
    if ((tab === 'my-reviews' || tab === 'write-review') && !this.isCustomer) {
      tab = 'all-reviews';
    }
    this.activeTab = tab;
    if (tab === 'all-reviews' && this.allReviews().length === 0) {
      this.loadAllReviews();
    }
  }

  getStarsArray(rating: number): number[] {
    const fullStars = Math.floor(rating || 0);
    return Array.from({ length: 5 }, (_, i) => i < fullStars ? 1 : 0);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);
  }
}
