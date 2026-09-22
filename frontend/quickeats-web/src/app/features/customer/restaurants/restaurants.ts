import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Restaurant } from '../../../core/models/restaurant.model';
import { MenuItem } from '../../../core/models/menu.model';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { MenuService } from '../../../core/services/menu.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantFavoritesService } from '../../../core/services/restaurant-favorites.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.scss'
})
export class RestaurantsComponent implements OnInit {

  restaurants = signal<Restaurant[]>([]);
  filteredRestaurants = signal<Restaurant[]>([]);
  visibleRestaurants = signal<Restaurant[]>([]);

  allMenuItems = signal<MenuItem[]>([]);
  filteredMenuItems = signal<MenuItem[]>([]);
  visibleMenuItems = signal<MenuItem[]>([]);

  cuisineCategories = signal<string[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  mobileFiltersOpen = signal(false);

  // Active view: 'dishes' or 'restaurants'
  activeView = signal<'dishes' | 'restaurants'>('dishes');

  pageSize = 9;
  visibleCount = signal(this.pageSize);
  menuPageSize = 12;
  menuVisibleCount = signal(this.menuPageSize);

  wishlistMenuIds = signal<Set<number>>(new Set());

  searchText = '';
  showOpenOnly = false;
  showClosedOnly = false;
  showVegOnly = false;
  showNonVegOnly = false;
  minRating = 0;
  selectedCuisine = 'All';
  sortBy = 'default';

  skeletonCards = Array.from({ length: 6 });

  cuisineIcons: Record<string, string> = {
    'All': 'restaurant',
    'Starters': 'tapas',
    'Main Course': 'dining',
    'Biryani': 'rice_bowl',
    'Pizza': 'local_pizza',
    'Burgers': 'lunch_dining',
    'Desserts': 'cake',
    'Beverages': 'local_bar',
    'Drinks': 'local_bar',
    'Sushi': 'set_meal',
  };

  constructor(
    private restaurantService: RestaurantService,
    private menuService: MenuService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private favoritesService: RestaurantFavoritesService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.favoritesService.load();
    this.loadWishlist();

    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchText = params['search'];
      }
      if (params['cuisine']) {
        this.selectedCuisine = params['cuisine'];
        this.activeView.set('dishes');
      }
      if (params['view'] === 'restaurants') {
        this.activeView.set('restaurants');
      } else if (params['view'] === 'dishes') {
        this.activeView.set('dishes');
      }

      if (params['filter'] === 'featured') {
        this.activeView.set('restaurants');
        this.minRating = 4;
        this.sortBy = 'rating';
      } else if (params['filter'] === 'nearby') {
        this.activeView.set('restaurants');
        this.showOpenOnly = true;
        this.sortBy = 'delivery';
      } else if (params['filter'] === 'trending') {
        this.activeView.set('dishes');
      }

      this.loadData();
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

  loadData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      restaurants: this.restaurantService.getRestaurants(),
      menuItems: this.menuService.getMenus(),
    }).subscribe({
      next: (data) => {
        this.restaurants.set(data.restaurants);
        this.allMenuItems.set(data.menuItems);

        const cats: string[] = [...new Set(data.menuItems.map((m: MenuItem) => m.category))].filter(Boolean) as string[];
        this.cuisineCategories.set(['All', ...cats.sort()]);

        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loadError.set(err?.status === 0
          ? 'Could not reach the server. Please check your connection and try again.'
          : 'Something went wrong while loading data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  retry(): void {
    this.loadData();
  }

  setView(view: 'dishes' | 'restaurants'): void {
    this.activeView.set(view);
  }

  resetPagination(): void {
    this.visibleCount.set(this.pageSize);
    this.menuVisibleCount.set(this.menuPageSize);
    this.updateVisible();
    this.updateVisibleMenu();
  }

  updateVisible(): void {
    this.visibleRestaurants.set(this.filteredRestaurants().slice(0, this.visibleCount()));
  }

  updateVisibleMenu(): void {
    this.visibleMenuItems.set(this.filteredMenuItems().slice(0, this.menuVisibleCount()));
  }

  loadMore(): void {
    this.visibleCount.set(this.visibleCount() + this.pageSize);
    this.updateVisible();
  }

  loadMoreDishes(): void {
    this.menuVisibleCount.set(this.menuVisibleCount() + this.menuPageSize);
    this.updateVisibleMenu();
  }

  get totalRestaurantCount(): number {
    return this.restaurants().length;
  }

  get totalMenuCount(): number {
    return this.allMenuItems().length;
  }

  applyFilters(): void {
    // 1. Filter Restaurants
    let resResult = this.restaurants();

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      const matchingRestaurantIds = new Set<number>();

      for (const r of this.restaurants()) {
        if (
          r.name.toLowerCase().includes(search) ||
          r.address.toLowerCase().includes(search) ||
          r.description.toLowerCase().includes(search)
        ) {
          matchingRestaurantIds.add(r.id);
        }
      }

      for (const m of this.allMenuItems()) {
        if (
          m.name.toLowerCase().includes(search) ||
          m.category.toLowerCase().includes(search)
        ) {
          matchingRestaurantIds.add(m.restaurantId);
        }
      }

      resResult = resResult.filter(r => matchingRestaurantIds.has(r.id));
    }

    if (this.showOpenOnly) {
      resResult = resResult.filter(r => r.isOpenNow);
    }

    if (this.showClosedOnly) {
      resResult = resResult.filter(r => !r.isOpenNow);
    }

    if (this.showVegOnly) {
      const vegRestaurantIds = new Set(
        this.allMenuItems().filter(m => m.isVeg).map(m => m.restaurantId)
      );
      resResult = resResult.filter(r => vegRestaurantIds.has(r.id));
    }

    if (this.showNonVegOnly) {
      const nonVegRestaurantIds = new Set(
        this.allMenuItems().filter(m => !m.isVeg).map(m => m.restaurantId)
      );
      resResult = resResult.filter(r => nonVegRestaurantIds.has(r.id));
    }

    if (this.minRating > 0) {
      resResult = resResult.filter(r => (r.rating ?? 0) >= this.minRating);
    }

    if (this.selectedCuisine !== 'All') {
      const restaurantIdsWithCuisine = new Set(
        this.allMenuItems()
          .filter(m => m.category.toLowerCase() === this.selectedCuisine.toLowerCase())
          .map(m => m.restaurantId)
      );
      resResult = resResult.filter(r => restaurantIdsWithCuisine.has(r.id));
    }

    if (this.sortBy === 'rating') {
      resResult = [...resResult].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (this.sortBy === 'delivery' || this.sortBy === 'deliveryTime') {
      resResult = [...resResult].sort((a, b) => a.deliveryCharge - b.deliveryCharge);
    }

    this.filteredRestaurants.set(resResult);

    // 2. Filter Menu Items / Dishes
    let dishResult = this.allMenuItems();

    if (this.selectedCuisine !== 'All') {
      dishResult = dishResult.filter(
        m => m.category.toLowerCase() === this.selectedCuisine.toLowerCase()
      );
    }

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      dishResult = dishResult.filter(m =>
        m.name.toLowerCase().includes(search) ||
        m.category.toLowerCase().includes(search) ||
        (m.description && m.description.toLowerCase().includes(search)) ||
        this.getRestaurantName(m.restaurantId).toLowerCase().includes(search)
      );
    }

    if (this.showOpenOnly) {
      const openRestaurantIds = new Set(
        this.restaurants().filter(r => r.isOpenNow).map(r => r.id)
      );
      dishResult = dishResult.filter(m => openRestaurantIds.has(m.restaurantId));
    }

    if (this.showClosedOnly) {
      const closedRestaurantIds = new Set(
        this.restaurants().filter(r => !r.isOpenNow).map(r => r.id)
      );
      dishResult = dishResult.filter(m => closedRestaurantIds.has(m.restaurantId));
    }

    if (this.showVegOnly) {
      dishResult = dishResult.filter(m => m.isVeg);
    }

    if (this.showNonVegOnly) {
      dishResult = dishResult.filter(m => !m.isVeg);
    }

    if (this.sortBy === 'priceLow') {
      dishResult = [...dishResult].sort((a, b) => this.getDiscountedPrice(a) - this.getDiscountedPrice(b));
    } else if (this.sortBy === 'priceHigh') {
      dishResult = [...dishResult].sort((a, b) => this.getDiscountedPrice(b) - this.getDiscountedPrice(a));
    } else if (this.sortBy === 'rating') {
      dishResult = [...dishResult].sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    this.filteredMenuItems.set(dishResult);
    this.resetPagination();
  }

  hasMore(): boolean {
    return this.visibleCount() < this.filteredRestaurants().length;
  }

  remainingCount(): number {
    return this.filteredRestaurants().length - this.visibleCount();
  }

  hasMoreDishes(): boolean {
    return this.menuVisibleCount() < this.filteredMenuItems().length;
  }

  remainingDishesCount(): number {
    return this.filteredMenuItems().length - this.menuVisibleCount();
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilters();
  }
  get openRestaurantsCount(): number {
    return this.restaurants().filter(r => r.isOpenNow).length;
  }

  get closedRestaurantsCount(): number {
    return this.restaurants().filter(r => !r.isOpenNow).length;
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

  setAvailabilityFilter(type: 'all' | 'open' | 'closed'): void {
    if (type === 'all') {
      this.showOpenOnly = false;
      this.showClosedOnly = false;
    } else if (type === 'open') {
      this.showOpenOnly = true;
      this.showClosedOnly = false;
    } else if (type === 'closed') {
      this.showOpenOnly = false;
      this.showClosedOnly = true;
    }
    this.applyFilters();
  }

  toggleOpen(): void {
    this.showOpenOnly = !this.showOpenOnly;
    if (this.showOpenOnly) this.showClosedOnly = false;
    this.applyFilters();
  }

  toggleClosed(): void {
    this.showClosedOnly = !this.showClosedOnly;
    if (this.showClosedOnly) this.showOpenOnly = false;
    this.applyFilters();
  }

  toggleVeg(): void {
    this.showVegOnly = !this.showVegOnly;
    if (this.showVegOnly) this.showNonVegOnly = false;
    this.applyFilters();
  }

  toggleNonVeg(): void {
    this.showNonVegOnly = !this.showNonVegOnly;
    if (this.showNonVegOnly) this.showVegOnly = false;
    this.applyFilters();
  }

  setMinRating(rating: number): void {
    this.minRating = this.minRating === rating ? 0 : rating;
    this.applyFilters();
  }

  selectCuisine(cuisine: string): void {
    this.selectedCuisine = cuisine;
    if (cuisine !== 'All') {
      this.activeView.set('dishes');
    }
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleMobileFilters(): void {
    this.mobileFiltersOpen.set(!this.mobileFiltersOpen());
  }

  toggleFavorite(event: MouseEvent, restaurant: Restaurant): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(restaurant);
  }

  isFavorite(restaurantId: number): boolean {
    return this.favoritesService.isFavorite(restaurantId);
  }

  addToCart(dish: MenuItem): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Please login to add items to your cart.', 'Login Required');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.cartService.addToCart(dish);
    this.toastr.success(`${dish.name} added to cart!`);
  }

  toggleDishWishlist(event: Event, dish: MenuItem): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Please log in to save items to your wishlist.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/restaurants' } });
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

  getDiscountedPrice(item: MenuItem): number {
    if (!item.discountPercent) return item.price;
    return item.price - (item.price * item.discountPercent) / 100;
  }

  getRestaurantName(restaurantId: number): string {
    const restaurant = this.restaurants().find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : 'Restaurant';
  }

  getCardImage(restaurant: Restaurant): string {
    if (this.selectedCuisine && this.selectedCuisine !== 'All') {
      const matchingDish = this.allMenuItems().find(
        m => m.restaurantId === restaurant.id &&
             m.category.toLowerCase() === this.selectedCuisine.toLowerCase() &&
             m.imageUrl
      );
      if (matchingDish && matchingDish.imageUrl) {
        return matchingDish.imageUrl;
      }
    }
    return restaurant.imageUrl || 'assets/images/restaurants/dominos.jpg';
  }

  getRestaurantCuisines(restaurantId: number): string {
    const items = this.allMenuItems().filter(m => m.restaurantId === restaurantId);
    const cats = [...new Set(items.map(m => m.category))].filter(Boolean) as string[];
    if (this.selectedCuisine && this.selectedCuisine !== 'All' && cats.includes(this.selectedCuisine)) {
      const others = cats.filter(c => c !== this.selectedCuisine);
      return [this.selectedCuisine, ...others].slice(0, 3).join(', ');
    }
    return cats.length > 0 ? cats.slice(0, 3).join(', ') : 'Multi-cuisine';
  }

  getDeliveryLabel(charge: number): string {
    return charge === 0 ? 'Free delivery' : `₹${charge} delivery`;
  }

  getDeliveryTimeEstimate(restaurant: Restaurant): string {
    if (restaurant.deliveryCharge === 0) return '25-35 min';
    if (restaurant.deliveryCharge <= 20) return '20-30 min';
    if (restaurant.deliveryCharge <= 40) return '30-40 min';
    return '35-50 min';
  }

  resetFilters(): void {
    this.searchText = '';
    this.showOpenOnly = false;
    this.showClosedOnly = false;
    this.showVegOnly = false;
    this.showNonVegOnly = false;
    this.minRating = 0;
    this.selectedCuisine = 'All';
    this.sortBy = 'default';
    this.activeView.set('dishes');
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchText !== '' ||
      this.showOpenOnly ||
      this.showClosedOnly ||
      this.showVegOnly ||
      this.showNonVegOnly ||
      this.minRating > 0 ||
      this.selectedCuisine !== 'All' ||
      this.sortBy !== 'default';
  }

  trackById(_index: number, r: Restaurant): number {
    return r.id;
  }

  trackByDishId(_index: number, m: MenuItem): number {
    return m.id;
  }
}
