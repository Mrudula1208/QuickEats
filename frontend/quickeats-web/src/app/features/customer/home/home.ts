import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Restaurant } from '../../../core/models/restaurant.model';
import { MenuItem } from '../../../core/models/menu.model';
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

  restaurants = signal<Restaurant[]>([]);
  allMenuItems = signal<MenuItem[]>([]);
  activeOffers = signal<CouponModel[]>([]);
  reviews = signal<Review[]>([]);
  cuisineCategories = signal<{ name: string; icon: string }[]>([{ name: 'All', icon: 'restaurant' }]);

  isLoading = signal(true);
  loadError = signal<string | null>(null);
  activeCategory = signal<string>('All');
  wishlistMenuIds = signal<Set<number>>(new Set());

  searchText = '';
  showOpenOnly = false;
  showClosedOnly = false;
  minRating = 0;

  // Max 4 Featured Restaurants
  featuredRestaurants = computed(() => {
    let list = this.restaurants();
    const sorted = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return sorted.slice(0, 4);
  });

  // Max 6 Trending Dishes
  trendingDishes = computed(() => {
    const items = this.allMenuItems().filter(m => m.isAvailable);
    const bestsellers = items.filter(m => m.isBestseller);
    const result = bestsellers.length >= 6 ? bestsellers.slice(0, 6) : items.slice(0, 6);
    return result;
  });

  // Max 3 Today's Best Offers
  bestOffers = computed(() => {
    const now = new Date();
    const valid = this.activeOffers().filter(c => c.isActive && new Date(c.expiryDate) > now);
    return valid.slice(0, 3);
  });

  // Max 4 Restaurants Near You
  restaurantsNearYou = computed(() => {
    const list = this.restaurants();
    // Prioritize active open restaurants with defined addresses
    const openFirst = [...list].sort((a, b) => (b.isOpenNow ? 1 : 0) - (a.isOpenNow ? 1 : 0));
    return openFirst.slice(0, 4);
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
    this.loadHomeData();
    this.favoritesService.load();
    this.loadWishlist();
  }

  loadHomeData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      restaurants: this.restaurantService.getRestaurants(),
      menuItems: this.menuService.getMenus(),
      categories: this.categoryService.getCategories(),
      coupons: this.couponService.getCoupons(),
      reviews: this.reviewService.getReviews()
    }).subscribe({
      next: (data) => {
        this.restaurants.set(data.restaurants);
        this.allMenuItems.set(data.menuItems);

        const categoryNames = (data.categories && data.categories.length > 0)
          ? data.categories.map(c => c.name)
          : [...new Set(data.menuItems.map(m => m.category).filter(Boolean) as string[])];

        this.cuisineCategories.set([
          { name: 'All', icon: this.cuisineIcons['All'] || 'restaurant' },
          ...categoryNames.sort().map(name => ({
            name,
            icon: this.cuisineIcons[name] || 'restaurant'
          }))
        ]);

        this.activeOffers.set(
          data.coupons.filter(c => c.isActive && new Date(c.expiryDate) > new Date())
        );

        this.reviews.set(data.reviews.slice(0, 6));

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load platform data. Please check your connection and try again.');
      }
    });
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
    this.cartService.addToCart(item);
    this.toastr.success(`${item.name} added to cart!`);
  }

  toggleFavorite(event: Event, restaurant: Restaurant): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(restaurant);
  }

  isFavorite(restaurantId: number): boolean {
    return this.favoritesService.isFavorite(restaurantId);
  }

  toggleDishWishlist(event: Event, dish: MenuItem): void {
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
        restaurantName: this.getRestaurantName(dish.restaurantId),
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

  trackByRestaurantId(_index: number, r: Restaurant): number {
    return r.id;
  }

  trackByMenuId(_index: number, m: MenuItem): number {
    return m.id;
  }
}
