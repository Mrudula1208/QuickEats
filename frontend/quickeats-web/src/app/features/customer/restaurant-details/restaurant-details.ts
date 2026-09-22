import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of, catchError, Subscription } from 'rxjs';
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
export class RestaurantDetailsComponent implements OnInit, OnDestroy {

  restaurant = signal<Restaurant | undefined>(undefined);
  isLoadingRestaurant = signal(true);
  isLoadingMenu = signal(true);
  restaurantError = signal<string | null>(null);
  menuError = signal<string | null>(null);

  menus = signal<MenuItem[]>([]);
  filteredMenus = signal<MenuItem[]>([]);

  searchText = '';
  selectedCategory = 'All';
  vegOnly = false;
  minPrice = 0;
  maxPrice = 10000;

  categories = signal<string[]>([]);

  reviews = signal<Review[]>([]);
  averageRating = signal(0);
  reviewCount = signal(0);

  isLoggedIn = false;
  newRating = 5;
  newComment = '';
  stars = [1, 2, 3, 4, 5];
  commentError = signal('');
  reviewSuccess = signal(false);

  activeMenuTab = signal('menu');

  skeletonMenuCards = Array.from({ length: 4 });
  cartCount = 0;

  private routeSub?: Subscription;

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
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadRestaurantData(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
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

  loadRestaurantData(id: number): void {
    this.restaurant.set(undefined);
    this.isLoadingRestaurant.set(true);
    this.isLoadingMenu.set(true);
    this.restaurantError.set(null);
    this.menuError.set(null);

    // Each request resolves independently so the page is never blocked on a slow
    // side section. The restaurant and menu render as soon as THEY are ready,
    // while reviews and the average rating load in the background (they only
    // populate the Reviews tab, which is hidden by default).
    this.loadRestaurantDetails(id);
    this.loadMenu(id);
    this.loadReviews(id);
    this.loadAverageRating(id);
  }

  private loadRestaurantDetails(id: number): void {
    this.restaurantService.getRestaurantById(id).pipe(
      catchError(err => {
        this.restaurantError.set(err?.status === 404
          ? 'restaurant-not-found'
          : err?.status === 0
            ? 'Could not reach the server. Please check your connection.'
            : 'Something went wrong while loading this restaurant.');
        return of(null);
      })
    ).subscribe({
      next: (restaurant) => {
        this.isLoadingRestaurant.set(false);
        if (restaurant) {
          this.restaurant.set(restaurant);
          // The restaurant payload already includes rating + review count,
          // so the header shows these instantly without waiting for the
          // separate reviews requests.
          this.averageRating.set(restaurant.rating ?? 0);
          this.reviewCount.set(restaurant.reviewCount ?? 0);
        } else if (!this.restaurantError()) {
          this.restaurantError.set('restaurant-not-found');
        }
      }
    });
  }

  retryRestaurant(): void {
    this.restaurant.set(undefined);
    this.loadRestaurantData(this.restaurantId);
  }

  loadRestaurant(id: number): void {
    this.loadRestaurantData(id);
  }

  loadMenu(id: number): void {
    this.menuService.getMenuByRestaurantId(id).subscribe({
      next: (data) => {
        this.menus.set(data);
        this.filteredMenus.set(data);
        this.categories.set(data
          .map(m => m.category)
          .filter((value, index, array) => array.indexOf(value) === index));
        this.isLoadingMenu.set(false);
      },
      error: () => {
        this.isLoadingMenu.set(false);
        this.menuError.set('Could not load the menu. Please try again later.');
      }
    });
  }

  loadReviews(restaurantId: number): void {
    this.reviewService.getReviewsByRestaurant(restaurantId).subscribe({
      next: (data: Review[]) => { this.reviews.set(data); this.reviewCount.set(data.length); },
      error: () => {}
    });
  }

  loadAverageRating(restaurantId: number): void {
    this.reviewService.getAverageRating(restaurantId).subscribe({
      next: (data: number) => { this.averageRating.set(data); },
      error: () => {}
    });
  }

  isStarFilled(star: number, rating: number): boolean {
    return star <= Math.round(rating);
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    const restaurant = this.restaurant();
    if (restaurant) {
      this.favoritesService.toggle(restaurant);
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
      this.commentError.set('Please write a review before submitting.');
      return false;
    }
    if (this.newComment.trim().length < 5) {
      this.commentError.set('Review must be at least 5 characters.');
      return false;
    }
    this.commentError.set('');
    return true;
  }

  canSubmitReview(): boolean {
    return this.newComment.trim().length > 0;
  }

  submitReview(): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Please login to submit a review.', 'Login Required');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (!this.validateComment()) return;
    const restaurantId = Number(this.route.snapshot.paramMap.get('id'));
    this.reviewSuccess.set(false);

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
        this.commentError.set('');
        this.reviewSuccess.set(true);
        this.toastr.success('Review submitted successfully!');
        this.loadReviews(restaurantId);
        this.loadAverageRating(restaurantId);
      },
      error: () => { this.toastr.error('Failed to submit review. Please try again.'); }
    });
  }

  applyFilters(): void {
    let result = this.menus();

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

    this.filteredMenus.set(result);
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
    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Please login to add items to your cart.', 'Login Required');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.cartService.addToCart(menu);
    this.toastr.success(`${menu.name} added to cart!`);
  }

  cartIncrease(menuId: number): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Please login to modify your cart.', 'Login Required');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
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
    return this.filteredMenus().filter(m => m.isBestseller);
  }

  addToWishlist(menu: MenuItem): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Please login to save items to your wishlist.', 'Login Required');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.wishlistService.addToWishlist({
      wishlistId: 0,
      menuId: menu.id,
      restaurantId: menu.restaurantId,
      restaurantName: this.restaurant()?.name || '',
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
    return this.filteredMenus().filter(m => m.category === category);
  }

  getDistinctFilteredCategories(): string[] {
    return [...new Set(this.filteredMenus().map(m => m.category))].filter(Boolean);
  }

  formatTime(timeStr?: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hour = parseInt(parts[0], 10);
    const min = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${min} ${ampm}`;
  }
}