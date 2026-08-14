import { Component } from '@angular/core';
// Import Component because this is an Angular Component.

import { FormsModule } from '@angular/forms';
// Required for ngModel (search box and veg toggle).

import { ActivatedRoute, Router } from '@angular/router';
// ActivatedRoute reads restaurant id from URL.
// Router opens another page.

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

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.scss'
})

export class RestaurantDetailsComponent {

  // Store restaurant details.
  restaurant?: Restaurant;

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

  // Store quantity of every menu item.
  // Key = menu id, Value = quantity.
  quantities: { [id: number]: number } = {};

  // List of available categories.
  categories: string[] = [];

  // Angular injects all required services.
  constructor(

    private route: ActivatedRoute,

    private restaurantService: RestaurantService,

    private menuService: MenuService,

    private cartService: CartService,

    private wishlistService: WishlistService,

    private router: Router

  ) {

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

          console.log(this.restaurant);

        },

        // API Failed.
        error: (err) => {

          console.log(err);

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

        },

        // API Failed.
        error: (err) => {

          console.log(err);

        }

      });

  }

  // Filter menus by search text, category and veg only.
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
