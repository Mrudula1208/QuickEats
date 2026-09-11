import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Restaurant } from '../../../core/models/restaurant.model';
import { MenuItem } from '../../../core/models/menu.model';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { MenuService } from '../../../core/services/menu.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ReviewService } from '../../../core/services/review.service';
import { Review } from '../../../core/models/review.model';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantFavoritesService } from '../../../core/services/restaurant-favorites.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.scss'
})
export class RestaurantDetailsComponent {

  restaurant?: Restaurant;
  isLoadingRestaurant = true;
  isLoadingMenu = true;
  restaurantError: string | null = null;
  menuError: string | null = null;

  menus: MenuItem[] = [];
  filteredMenus: MenuItem[] = [];

  searchText = '';
  selectedCategory = 'All';
  vegOnly = false;
  minPrice = 0;
  maxPrice = 10000;

  categories: string[] = [];

  reviews: Review[] = [];
  averageRating = 0;
  reviewCount = 0;

  isLoggedIn = false;
  newRating = 5;
  newComment = '';
  stars = [1, 2, 3, 4, 5];
  commentError = '';
  reviewSuccess = false;

  activeMenuTab = signal('menu');

  skeletonMenuCards = Array.from({ length: 4 });
  cartCount = 0;

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private menuService: MenuService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private favoritesService: RestaurantFavoritesService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.favoritesService.load();
    this.loadRestaurant(this.restaurantId);
  }

  get restaurantId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  cartQuantityInCart(menuId: number): number {
    const item = this.cartService.cartItems().find(x => x.menu.id === menuId);
    return item ? item.quantity : 0;
  }

  hasCartItems(): boolean {
    return this.cartService.cartItems().length > 0;
  }

  // Sticky category navigation: scroll to the requested category block.
  scrollToCategory(category: string): void {
    this.selectedCategory = 'All';
    this.searchText = '';
    this.vegOnly = false;
    this.applyFilters();

    requestAnimationFrame(() => {
      const el = document.getElementById('category-' + category.replace(/\s+/g, '-'));
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  loadRestaurant(id: number): void {
    this.isLoadingRestaurant = true;
    this.restaurantError = null;

    this.restaurantService.getRestaurantById(id).subscribe({
      next: (data) => { this.restaurant = data; this.isLoadingRestaurant = false; },
      error: (err) => {
        this.isLoadingRestaurant = false;
        this.restaurantError = err?.status === 404
          ? 'restaurant-not-found'
          : err?.status === 0
            ? 'Could not reach the server. Please check your connection.'
            : 'Something went wrong while loading this restaurant.';
      }
    });

    this.loadMenu(id);
    this.loadReviews(id);
    this.loadAverageRating(id);
  }

  retryRestaurant(): void {
    this.restaurant = undefined;
    this.loadRestaurant(this.restaurantId);
  }

  loadMenu(id: number): void {
    this.isLoadingMenu = true;
    this.menuError = null;
    this.menus = [];
    this.filteredMenus = [];

    this.menuService.getMenuByRestaurantId(id).subscribe({
      next: (data) => {
        this.menus = data;
        this.filteredMenus = data;
        this.categories = data
          .map(m => m.category)
          .filter((value, index, array) => array.indexOf(value) === index);
        this.isLoadingMenu = false;
      },
      error: () => {
        this.isLoadingMenu = false;
        this.menuError = 'Could not load the menu. Please try again later.';
      }
    });
  }

  loadReviews(restaurantId: number): void {
    this.reviewService.getReviewsByRestaurant(restaurantId).subscribe({
      next: (data: Review[]) => { this.reviews = data; this.reviewCount = data.length; },
      error: () => {}
    });
  }

  loadAverageRating(restaurantId: number): void {
    this.reviewService.getAverageRating(restaurantId).subscribe({
      next: (data: number) => { this.averageRating = data; },
      error: () => {}
    });
  }

  isStarFilled(star: number, rating: number): boolean {
    return star <= Math.round(rating);
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    if (this.restaurant) {
      this.favoritesService.toggle(this.restaurant);
    }
  }

  isFavorite(restaurantId: number): boolean {
    return this.favoritesService.isFavorite(restaurantId);
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
    return this.newComment.trim().length > 0;
  }

  submitReview(): void {
    if (!this.validateComment()) return;
    const restaurantId = Number(this.route.snapshot.paramMap.get('id'));
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

    this.reviewService.addReview(review).subscribe({
      next: () => {
        this.newRating = 5;
        this.newComment = '';
        this.commentError = '';
        this.reviewSuccess = true;
        this.toastr.success('Review submitted successfully!');
        this.loadReviews(restaurantId);
        this.loadAverageRating(restaurantId);
      },
      error: () => { this.toastr.error('Failed to submit review. Please try again.'); }
    });
  }

  applyFilters(): void {
    let result = this.menus;

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(search));
    }

    if (this.selectedCategory !== 'All') {
      result = result.filter(m => m.category === this.selectedCategory);
    }

    if (this.vegOnly) {
      result = result.filter(m => m.isVeg);
    }

    result = result.filter(m => m.price >= this.minPrice && m.price <= this.maxPrice);

    this.filteredMenus = result;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  getSalePrice(menu: MenuItem): number {
    if (menu.discountPercent > 0) {
      const discount = (menu.price * menu.discountPercent) / 100;
      return menu.price - discount;
    }
    return menu.price;
  }

  // Add a single item to the cart. The Add button then becomes a
  // quantity stepper, so this only fires when the item is not yet in cart.
  addToCart(menu: MenuItem): void {
    this.cartService.addToCart(menu);
    this.toastr.success(`${menu.name} added to cart!`);
  }

  cartIncrease(menuId: number): void {
    this.cartService.increaseQuantity(menuId);
  }

  cartDecrease(menuId: number): void {
    this.cartService.decreaseQuantity(menuId);
  }

  getCartTotal(): number {
    return this.cartService.getGrandTotal();
  }

  getCartCount(): number {
    return this.cartService.cartItems().length;
  }

  getPopularItems(): MenuItem[] {
    return this.filteredMenus.filter(m => m.isBestseller);
  }

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
      next: () => { this.toastr.success('Added to wishlist!'); },
      error: () => {}
    });
  }

  getMenuItemsByCategory(category: string): MenuItem[] {
    return this.filteredMenus.filter(m => m.category === category);
  }

  getDistinctFilteredCategories(): string[] {
    return [...new Set(this.filteredMenus.map(m => m.category))].filter(Boolean);
  }
}
