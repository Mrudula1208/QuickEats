import { Component } from '@angular/core';
// Import Component because this is an Angular Component.

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

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.scss'
})

export class RestaurantDetailsComponent {

  // Store restaurant details.
  restaurant?: Restaurant;

  // Store menu items.
  menus: MenuItem[] = [];

  // Angular injects all required services.
  constructor(

    private route: ActivatedRoute,

    private restaurantService: RestaurantService,

    private menuService: MenuService,

    private cartService: CartService,

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

          console.log(this.menus);

        },

        // API Failed.
        error: (err) => {

          console.log(err);

        }

      });

  }



  // Runs when Add To Cart button is clicked.
  addToCart(menuItem: MenuItem): void {

    // Add selected food into cart.
    this.cartService.addToCart(menuItem);

    // Open Cart Page.
    this.router.navigate(['/cart']);

  }

}

