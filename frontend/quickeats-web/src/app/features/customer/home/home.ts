import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of, catchError, timeout } from 'rxjs';
import { Restaurant } from '../../../core/models/restaurant.model';
import { MenuItem } from '../../../core/models/menu.model';
import { TrendingDish } from '../../../core/models/trending-dish.model';
import { CouponModel } from '../../../core/models/coupon.model';
import { Review } from '../../../core/models/review.model';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { MenuService } from '../../../core/services/menu.service';
import { CategoryService } from '../../../core/services/category.service';
import { CouponService } from '../../../core/services/coupon.service';
import { ReviewService } from '../../../core/services/review.service';
import { CartService } from '../../../core/services/cart.service';
import { RestaurantFavoritesService } from '../../../core/services/restaurant-favorites.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

// Location flow states for the "Near You" section.
// idle = user has not been asked for location yet.
type NearbyState = 'idle' | 'loading' | 'ready' | 'denied' | 'unavailable' | 'error' | 'empty';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  // Full catalogue of restaurants (used for hero stats, cuisine chips and name lookups).
  restaurants = signal<Restaurant[]>([]);

  // All menu items (used only to build the "Explore by Cuisine" chips).
  allMenuItems = signal<MenuItem[]>([]);

  // SECTION: Featured Restaurants - loaded from /api/Restaurant/featured.
  featuredRestaurants = signal<Restaurant[]>([]);
  featuredLoading = signal(true);

  // SECTION: Trending Dishes - loaded from /api/Menu/trending.
  trendingDishes = signal<TrendingDish[]>([]);
  trendingLoading = signal(true);

  // SECTION: Near You - loaded from /api/Restaurant/nearby using browser geolocation or selected city.
  nearbyRestaurants = signal<Restaurant[]>([]);
  nearbyState = signal<NearbyState>('idle');
  nearbyError = signal<string | null>(null);
  selectedCityName = signal<string | null>(null);

  popularCities = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 }
  ];

  activeOffers = signal<CouponModel[]>([]);
  reviews = signal<Review[]>([]);
  reviewsLoading = signal(true);
  reviewsError = signal<string | null>(null);
  cuisineCategories = signal<{ name: string; icon: string }[]>([{ name: 'All', icon: 'restaurant' }]);

  isLoading = signal(true);
  loadError = signal<string | null>(null);
  activeCategory = signal<string>('All');
  wishlistMenuIds = signal<Set<number>>(new Set());
  isCustomer = false;

  searchText = '';
  showOpenOnly = false;
  showClosedOnly = false;
  minRating = 0;

  // Max 3 Today's Best Offers
  bestOffers = computed(() => {
    const now = new Date();
    const valid = this.activeOffers().filter(c => c.isActive && new Date(c.expiryDate) > now);
    return valid.slice(0, 3);
  });

  cuisineIcons: Record<string, string> = {
    'All': 'restaurant',
    'Starters': 'tapas',
    'Main Course': 'dining',
    'Main': 'dining',
    'Biryani': 'rice_bowl',
    'Pizza': 'local_pizza',
    'Burgers': 'lunch_dining',
    'Burger': 'lunch_dining',
    'Desserts': 'cake',
    'Beverages': 'local_bar',
    'Drinks': 'local_bar',
    'Sushi': 'set_meal',
  };

  whyChooseUs = [
    {
      icon: 'bolt',
      title: 'Lightning Fast Delivery',
      desc: 'Average delivery in 30 minutes or less, straight to your doorstep.'
    },
    {
      icon: 'restaurant_menu',
      title: 'Fresh & Quality',
      desc: 'Every dish is prepared fresh with handpicked premium ingredients.'
    },
    {
      icon: 'payments',
      title: 'Best Prices',
      desc: 'Enjoy great food with exclusive discounts and unbeatable value.'
    },
    {
      icon: 'support_agent',
      title: '24/7 Support',
      desc: 'Our dedicated support team is always ready to assist you anytime.'
    }
  ];

  constructor(
    private restaurantService: RestaurantService,
    private menuService: MenuService,
    private categoryService: CategoryService,
    private couponService: CouponService,
    private reviewService: ReviewService,
    private cartService: CartService,
    private favoritesService: RestaurantFavoritesService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isCustomer = this.authService.isLoggedIn() && this.authService.getRole() === 'Customer';
    this.loadHomeData();
    this.loadReviews();
    this.loadNearby();
    this.favoritesService.load();
    this.loadWishlist();
  }

  // Loads the Home sections. Each section calls ITS OWN endpoint so that
  // Featured, Trending and Nearby never share the same restaurant array.
  loadHomeData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      featured: this.restaurantService.getFeaturedRestaurants(6).pipe(catchError(() => of([]))),
      trending: this.menuService.getTrendingDishes(6).pipe(catchError(() => of([]))),
      restaurants: this.restaurantService.getRestaurants().pipe(catchError(() => of([]))),
      menuItems: this.menuService.getMenus().pipe(catchError(() => of([]))),
      categories: this.categoryService.getCategories().pipe(catchError(() => of([]))),
      coupons: this.couponService.getCoupons().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.featuredRestaurants.set(data.featured || []);
        this.trendingDishes.set(data.trending || []);
        this.restaurants.set(data.restaurants || []);
        this.allMenuItems.set(data.menuItems || []);

        const categoryNames = (data.categories && data.categories.length > 0)
          ? data.categories.map(c => c.name)
          : [...new Set((data.menuItems || []).map(m => m.category).filter(Boolean) as string[])];

        this.cuisineCategories.set([
          { name: 'All', icon: this.cuisineIcons['All'] || 'restaurant' },
          ...categoryNames.sort().map(name => ({
            name,
            icon: this.cuisineIcons[name] || 'restaurant'
          }))
        ]);

        this.activeOffers.set(
          (data.coupons || []).filter(c => c.isActive && new Date(c.expiryDate) > new Date())
        );

        this.featuredLoading.set(false);
        this.trendingLoading.set(false);
        this.isLoading.set(false);
      },
      error: () => {
        this.featuredLoading.set(false);
        this.trendingLoading.set(false);
        this.isLoading.set(false);
        this.loadError.set('Could not load platform data. Please check your connection and try again.');
      }
    });
  }

  // ================================================================
  // CUSTOMER REVIEWS (public section)
  // ================================================================

  // Loads the public "What Our Customers Say" reviews. Loaded separately
  // so a review API failure never blocks the rest of the Home page.
  loadReviews(): void {
    this.reviewsLoading.set(true);
    this.reviewsError.set(null);

    this.reviewService.getPublicReviews(6).pipe(timeout(10000)).subscribe({
      next: (data) => {
        this.reviews.set(data || []);
        this.reviewsLoading.set(false);
      },
      error: () => {
        this.reviews.set([]);
        this.reviewsLoading.set(false);
        this.reviewsError.set('Could not load customer reviews right now. Please try again later.');
      }
    });
  }

  // ================================================================
  // NEAR YOU (location based)
  // ================================================================

  // Request the browser location and then load nearby restaurants.
  // This is triggered automatically when the Home page opens and again
  // whenever the user taps "Allow Location" / "Set Location".
  loadNearby(): void {
    this.nearbyState.set('loading');
    this.nearbyError.set(null);
    this.selectedCityName.set('Current Location');

    if (!navigator.geolocation) {
      this.nearbyState.set('unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => this.fetchNearbyRestaurants(position.coords.latitude, position.coords.longitude, 25),
      (error) => {
        if (error.code === GeolocationPositionError.PERMISSION_DENIED) {
          this.nearbyState.set('denied');
        } else {
          this.nearbyState.set('unavailable');
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }

  selectCity(city: { name: string; lat: number; lng: number }): void {
    this.selectedCityName.set(city.name);
    this.fetchNearbyRestaurants(city.lat, city.lng, 25);
  }

  fetchNearbyRestaurants(latitude: number, longitude: number, radiusKm: number = 25): void {
    this.nearbyState.set('loading');

    this.restaurantService
      .getNearbyRestaurants(latitude, longitude, radiusKm, 4)
      .pipe(timeout(10000))
      .subscribe({
        next: (restaurants) => {
          if (!restaurants || restaurants.length === 0) {
            this.nearbyRestaurants.set([]);
            this.nearbyState.set('empty');
          } else {
            this.nearbyRestaurants.set(restaurants);
            this.nearbyState.set('ready');
          }
        },
        error: () => {
          this.nearbyRestaurants.set([]);
          this.nearbyState.set('error');
          this.nearbyError.set('Could not load nearby restaurants. Please check your connection and try again.');
        }
      });
  }

  // Formats the real distance returned by the API, e.g. "1.4 km away".
  formatDistance(distanceKm: number | null | undefined): string {
    if (distanceKm == null) return '';
    if (distanceKm >= 10) return `${Math.round(distanceKm)} km away`;
    return `${distanceKm.toFixed(1)} km away`;
  }

  loadWishlist(): void {
    if (!this.authService.isLoggedIn()) return;
    this.wishlistService.getWishlist().subscribe({
      next: (items) => {
        this.wishlistMenuIds.set(new Set(items.map(i => i.menuId)));
      },
      error: () => {}
    });
  }

  retry(): void {
    this.loadReviews();
    this.loadHomeData();
  }

  get totalRestaurantCount(): number {
    return this.restaurants().length;
  }

  get openRestaurantCount(): number {
    return this.restaurants().filter(r => r.isOpenNow).length;
  }

  get averageRestaurantRating(): number {
    const ratings = this.restaurants().map(r => r.rating ?? 0).filter(r => r > 0);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }

  onSearch(): void {
    if (this.searchText.trim()) {
      this.router.navigate(['/restaurants'], { queryParams: { search: this.searchText.trim() } });
    } else {
      this.router.navigate(['/restaurants']);
    }
  }

  onCategoryClick(categoryName: string): void {
    this.activeCategory.set(categoryName);
    if (categoryName === 'All') {
      this.router.navigate(['/restaurants']);
    } else {
      this.router.navigate(['/restaurants'], { queryParams: { cuisine: categoryName } });
    }
  }

  addToCart(item: MenuItem): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Please login to add items to your cart.', 'Login Required');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }
    this.cartService.addToCart(item);
    this.toastr.success(`${item.name} added to cart!`);
  }

  onImageError(event: Event, fallback: string = 'assets/images/restaurants/dominos.jpg'): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('dominos.jpg') && !target.src.includes('cheese-pizza.png')) {
      target.src = fallback;
    }
  }

  // Hide a broken customer avatar so the gradient circle remains visible.
  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  toggleFavorite(event: Event, restaurant: Restaurant): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(restaurant);
  }

  isFavorite(restaurantId: number): boolean {
    return this.favoritesService.isFavorite(restaurantId);
  }

  toggleDishWishlist(event: Event, dish: TrendingDish): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Please log in to save items to your wishlist.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }

    const isSaved = this.wishlistMenuIds().has(dish.id);
    if (isSaved) {
      this.wishlistService.removeFromWishlist(dish.id).subscribe({
        next: () => {
          this.wishlistMenuIds.update(set => {
            const next = new Set(set);
            next.delete(dish.id);
            return next;
          });
          this.toastr.success(`${dish.name} removed from wishlist`);
        },
        error: () => this.toastr.error('Failed to update wishlist')
      });
    } else {
      this.wishlistService.addToWishlist({
        wishlistId: 0,
        menuId: dish.id,
        restaurantId: dish.restaurantId,
        restaurantName: dish.restaurantName,
        foodName: dish.name,
        imageUrl: dish.imageUrl,
        price: dish.price,
        category: dish.category || 'Food'
      }).subscribe({
        next: () => {
          this.wishlistMenuIds.update(set => {
            const next = new Set(set);
            next.add(dish.id);
            return next;
          });
          this.toastr.success(`${dish.name} added to wishlist`);
        },
        error: () => this.toastr.error('Failed to add to wishlist')
      });
    }
  }

  isDishWishlisted(dishId: number): boolean {
    return this.wishlistMenuIds().has(dishId);
  }

  useOffer(coupon: CouponModel): void {
    navigator.clipboard?.writeText(coupon.couponCode);
    this.toastr.success(`Coupon "${coupon.couponCode}" copied! Applied on eligible orders.`, 'Offer Copied');
    this.router.navigate(['/restaurants']);
  }

  getDiscountedPrice(item: MenuItem): number {
    if (!item.discountPercent) return item.price;
    return item.price - (item.price * item.discountPercent) / 100;
  }

  getRestaurantName(restaurantId: number): string {
    const restaurant = this.restaurants().find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : 'QuickEats Kitchen';
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? 1 : 0);
  }

  getInitials(name: string): string {
    if (!name) return 'Q';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);
  }

  trackByRestaurantId(_index: number, r: Restaurant): number {
    return r.id;
  }

  trackByMenuId(_index: number, m: TrendingDish): number {
    return m.id;
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