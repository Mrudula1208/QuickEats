// Import Component decorator.
import { Component } from '@angular/core';

// Import ActivatedRoute.
import { ActivatedRoute } from '@angular/router';

// Import Router.
import { Router } from '@angular/router';

// Import Menu model.

// Import Restaurant model.
import { Restaurant } from '../../../core/models/restaurant.model';

// Import Menu Service.
import { MenuService } from '../../../core/services/menu.service';

// Import Restaurant Service.
import { RestaurantService } from '../../../core/services/restaurant.service';

// Import Cart Service.
import { CartService } from '../../../core/services/cart.service';

// Import MenuItem model.
import { MenuItem } from '../../../core/models/menu.model';

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

  // Only ONE constructor.
  constructor(

    // Gets menu data.
    private menuService: MenuService,

    // Reads id from URL.
    private route: ActivatedRoute,

    // Gets restaurant details.
    private restaurantService: RestaurantService,

    // Adds items into cart.
    private cartService: CartService,

    // Used to navigate pages.
    private router: Router

  ) {

    // Read restaurant id from URL.
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    // Load restaurant.
    this.restaurant =
      this.restaurantService.getRestaurantById(id);

    // Load menu.
    this.menus =
      this.menuService.getMenusByRestaurantId(id);

  }

  // Add item into cart.
  addToCart(menuItem: MenuItem): void {

    this.cartService.addToCart(menuItem);

    // Open cart page.
    this.router.navigate(['/cart']);

  }

}