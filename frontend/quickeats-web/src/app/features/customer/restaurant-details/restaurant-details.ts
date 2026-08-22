import { Component } from '@angular/core';
// Import Component because this is an Angular Component.

import { CommonModule } from '@angular/common';
// Import CommonModule because HTML uses the date pipe.

import { FormsModule } from '@angular/forms';
// Required for ngModel (search box and veg toggle).

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// ActivatedRoute reads restaurant id from URL.
// Router opens another page.
// RouterLink makes routerLink work in HTML.

import { Restaurant } from '../../../core/models/restaurant.model';
// Restaurant model stores restaurant details.

import { MenuItem } from '../../../core/models/menu.model';
// Menu model stores menu items.

import { RestaurantService } from '../../../core/services/restaurant.service';
// Used to call Restaurant APIs.

import { MenuService } from '../../../core/services/menu.service';
// Used to call Menu APIs.

import { CartService } from '../../../core/services/cart.service';
// Used to add food into cart.

import { WishlistService } from '../../../core/services/wishlist.service';
// Used to save food items into the Wishlist.

import { ReviewService } from '../../../core/services/review.service';
// Used to call Review APIs.

import { Review } from '../../../core/models/review.model';
// Review model stores one review.

import { AuthService } from '../../../core/services/auth.service';
// Used to check whether the Customer is logged in.

import { ToastrService } from 'ngx-toastr';
// Used to show success/error notifications.

import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner';
// Shared spinner shown while data is loading.

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.scss'
})

export class RestaurantDetailsComponent {

  // Store restaurant details.
  restaurant?: Restaurant;

  // true = restaurant details are still loading.
  isLoadingRestaurant = true;

  // true = menu items are still loading.
  isLoadingMenu = true;

  // Store all menu items.
  menus: MenuItem[] = [];

  // Store the filtered menu items.
  filteredMenus: MenuItem[] = [];

  // Search text typed by the customer.
  searchText = '';

  // Selected category.
  // "All" means show every category.
  selectedCategory = 'All';

  // true = show only veg items.
  vegOnly = false;

  // Price range filter.
  minPrice = 0;
  maxPrice = 10000;

  // Store quantity of every menu item.
  // Key = menu id, Value = quantity.
  quantities: { [id: number]: number } = {};

  // List of available categories.
  categories: string[] = [];

  // Store all Reviews of this Restaurant.
  reviews: Review[] = [];

  // Average Rating of this Restaurant.
  averageRating = 0;

  // Number of Reviews of this Restaurant.
  reviewCount = 0;

  // true = Customer is logged in.
  isLoggedIn = false;

  // Rating selected in the Add Review form.
  newRating = 5;

  // Comment typed in the Add Review form.
  newComment = '';

  // Star values used to draw rating stars.
  stars = [1, 2, 3, 4, 5];

  // Validation error message shown below the textarea.
  commentError = '';

  // true = show success message after review submission.
  reviewSuccess = false;

  // Angular injects all required services.
  constructor(

    private route: ActivatedRoute,

    private restaurantService: RestaurantService,

    private menuService: MenuService,

    private cartService: CartService,

    private wishlistService: WishlistService,

    private reviewService: ReviewService,

    private authService: AuthService,

    private toastr: ToastrService,

    private router: Router

  ) {

    // Check whether Customer is logged in.
    this.isLoggedIn = this.authService.isLoggedIn();

    // Read restaurant id from URL.
    const restaurantId =
      Number(this.route.snapshot.paramMap.get('id'));

    // Load restaurant details.
    this.restaurantService
      .getRestaurantById(restaurantId)
      .subscribe({

        // API Success.
        next: (data) => {

          // Store restaurant.
          this.restaurant = data;

          this.isLoadingRestaurant = false;

          console.log(this.restaurant);

        },

        // API Failed.
        error: (err) => {

          console.log(err);

          this.isLoadingRestaurant = false;

        }

      });

    // Load restaurant menu.
    this.menuService
      .getMenuByRestaurantId(restaurantId)
      .subscribe({

        // API Success.
        next: (data) => {

          // Store menus.
          this.menus = data;

          this.filteredMenus = data;

          // Build the category list.
          this.categories =
            data
              .map(m => m.category)
              .filter((value, index, array) =>
                array.indexOf(value) === index);

          console.log(this.menus);

          this.isLoadingMenu = false;

        },

        // API Failed.
        error: (err) => {

          console.log(err);

          this.isLoadingMenu = false;

        }

      });

    // Load Reviews of this Restaurant.
    this.loadReviews(restaurantId);

    // Load average Rating of this Restaurant.
    this.loadAverageRating(restaurantId);

  }

  // Load all Reviews of one Restaurant.
  loadReviews(restaurantId: number): void {

    this.reviewService
      .getReviewsByRestaurant(restaurantId)
      .subscribe({

        // API Success.
        next: (data: Review[]) => {

          this.reviews = data;

          this.reviewCount = data.length;

          console.log(this.reviews);

        },

        // API Failed.
        error: (err) => {

          console.log(err);

        }

      });

  }

  // Load average Rating of one Restaurant.
  loadAverageRating(restaurantId: number): void {

    this.reviewService
      .getAverageRating(restaurantId)
      .subscribe({

        // API Success.
        next: (data: number) => {

          this.averageRating = data;

        },

        // API Failed.
        error: (err) => {

          console.log(err);

        }

      });

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

    return this.newComment.trim().length > 0;

  }

  // Runs when the Customer clicks Submit Review.
  submitReview(): void {

    // Validate before submitting.
    if (!this.validateComment()) {

      return;

    }

    const restaurantId =
      Number(this.route.snapshot.paramMap.get('id'));

    // Hide previous success message.
    this.reviewSuccess = false;

    const review: Review = {

      id: 0,

      customerId: 0,

      restaurantId: restaurantId,

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

          // Clear the form.
          this.newRating = 5;
          this.newComment = '';
          this.commentError = '';

          // Show success message.
          this.reviewSuccess = true;
          this.toastr.success('Review submitted successfully!');

          // Reload Reviews and average Rating.
          this.loadReviews(restaurantId);
          this.loadAverageRating(restaurantId);

        },

        // API Failed.
        error: (err) => {

          this.toastr.error('Failed to submit review. Please try again.');

        }

      });

  }

  // Filter menus by search text, category, veg and price.
  applyFilters(): void {

    let result = this.menus;

    // Search by name.
    if (this.searchText) {

      const search = this.searchText.toLowerCase();

      result = result.filter(m =>
        m.name.toLowerCase().includes(search)
      );

    }

    // Filter by category.
    if (this.selectedCategory !== 'All') {

      result = result.filter(m =>
        m.category === this.selectedCategory
      );

    }

    // Filter veg only.
    if (this.vegOnly) {

      result = result.filter(m => m.isVeg);

    }

    // Filter by price range.
    result = result.filter(m =>
      m.price >= this.minPrice && m.price <= this.maxPrice
    );

    this.filteredMenus = result;

  }

  // Select one category from the chips.
  selectCategory(category: string): void {

    this.selectedCategory = category;

    this.applyFilters();

  }

  // Increase quantity of one menu item.
  increaseQuantity(menuId: number): void {

    this.quantities[menuId] =
      (this.quantities[menuId] || 1) + 1;

  }

  // Decrease quantity of one menu item.
  decreaseQuantity(menuId: number): void {

    const current = this.quantities[menuId] || 1;

    if (current > 1) {

      this.quantities[menuId] = current - 1;

    }

  }

  // Quantity of one menu item.
  getQuantity(menuId: number): number {

    return this.quantities[menuId] || 1;

  }

  // Discounted price after discount.
  getSalePrice(menu: MenuItem): number {

    if (menu.discountPercent > 0) {

      const discount =
        (menu.price * menu.discountPercent) / 100;

      return menu.price - discount;

    }

    return menu.price;

  }

  // Runs when Add To Cart button is clicked.
  addToCart(menu: MenuItem): void {

    // Add the selected quantity.
    const quantity = this.getQuantity(menu.id);

    for (let i = 0; i < quantity; i++) {

      // Add selected food into cart.
      this.cartService.addToCart(menu);

    }

    // Reset quantity for next time.
    this.quantities[menu.id] = 1;

    // Open Cart Page.
    this.router.navigate(['/cart']);

  }

  // Runs when Add To Wishlist button is clicked.
  addToWishlist(menu: MenuItem): void {

    this.wishlistService.addToWishlist({
      wishlistId: 0,
      menuId: menu.id,
      restaurantId: menu.restaurantId,
      restaurantName: this.restaurant?.name || '',
      foodName: menu.name,
      imageUrl: menu.imageUrl,
      price: menu.price,
      category: menu.category
    }).subscribe({

      // API Success.
      next: () => {

        console.log("Item added to wishlist");

      },

      // API Failed.
      error: (err) => {

        console.log(err);

      }

    });

  }

}
