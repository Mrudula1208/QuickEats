import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Menu } from '../../../core/models/menu.model';
import { MenuService } from '../../../core/services/menu.service';
import { Restaurant } from '../../../core/models/restaurant.model';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { CartService } from '../../../core/services/cart.service';
@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.scss'
})
export class RestaurantDetailsComponent {
menus: Menu[] = [];
  restaurant?: Restaurant;

 constructor(

  
  private route: ActivatedRoute,

  // Used to load restaurant details.
  private restaurantService: RestaurantService,

  // Used to load menu items.
  private menuService: MenuService,
  private CartService:CartService

) {

  // Read restaurant id
  // from URL.
  const id = Number(

    this.route.snapshot.paramMap.get('id')

  );

  this.restaurant =

    this.restaurantService.getRestaurantById(id);


  this.menus =

    this.menuService.getMenusByRestaurantId(id);

}
addToCart(menuItem: Menu): void {

  // Send selected menu item
  // to CartService.
  this.CartService.addToCart(menuItem);

  // Temporary confirmation.
  //
  // Later we'll replace this
  // with a Snackbar.
  alert(menuItem.name + ' added to cart.');

}

}