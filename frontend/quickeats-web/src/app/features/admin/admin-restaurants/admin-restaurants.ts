import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { Restaurant } from '../../../core/models/restaurant.model';
@Component({
  selector: 'app-admin-restaurants',
  imports: [CommonModule],
  templateUrl: './admin-restaurants.html',
  styleUrl: './admin-restaurants.scss',
})
export class AdminRestaurants {
  restaurants: Restaurant[] = [];
  constructor(private restaurantService: RestaurantService, private router: Router) {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (data: Restaurant[]) => {
        this.restaurants = data;
        console.log(this.restaurants);
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }
deleteRestaurant(
  id: number
): void {

  this.restaurantService
    .deleteRestaurant(id)
    .subscribe({

      // Success.
      next: () => {

        console.log("Restaurant Deleted");

        // Reload Data.
        this.loadRestaurants();

      },

      // Error.
      error: (err: any) => {

        console.log(err);

      }

    });

}

// addRestaurant
// Open Add Restaurant Page.
addRestaurant():void{

this.router.navigate(

['/admin/add-restaurant']

);

}
// ======================================
// EDIT RESTAURANT
// ======================================

editRestaurant(

  // restaurant
  // Selected Restaurant.
  restaurant: Restaurant

): void {

  // Open Edit Page.
  this.router.navigate(

    [

      '/admin/edit-restaurant',

      restaurant.id

    ]

  );


}

  }
