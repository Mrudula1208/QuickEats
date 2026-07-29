import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Restaurant } from '../../../core/models/restaurant.model';
import { MenuItem } from '../../../core/models/menu.model';

import { MenuService } from '../../../core/services/menu.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.scss'
})
export class RestaurantDetailsComponent {

  // Stores all menu items.
  menus: MenuItem[] = [];

  // Stores selected restaurant.
  restaurant?: Restaurant;

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private cartService: CartService,
    private router: Router
  ) {

    // Read restaurant id from URL.
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Load restaurant from Backend API.
    this.restaurantService.getRestaurantById(id).subscribe({

      next: (data) => {
        this.restaurant = data;
        console.log("Restaurant Loaded Successfully");
      },

      error: (err) => {
        console.log("Failed to Load Restaurant");
        console.log(err);
      }

    });

    // Load menu.
    this.menus = this.menuService.getMenusByRestaurantId(id);
  }

  // Add item into cart.
  addToCart(menuItem: MenuItem): void {

    this.cartService.addToCart(menuItem);

    // Open cart page.
    this.router.navigate(['/cart']);
  }

}