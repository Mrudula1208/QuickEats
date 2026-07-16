// Import Component decorator.
import { Component } from '@angular/core';

// Import Featured Restaurants Component.
import { FeaturedRestaurantsComponent } from '../components/featured-restaurants/featured-restaurants';

// Import Restaurant Model.
import { Restaurant } from '../../../core/models/restaurant.model';

// Import Restaurant Service.
import { RestaurantService } from '../../../core/services/restaurant.service';

@Component({

  // HTML selector.
  selector: 'app-home',

  // Components used inside home.html.
  imports: [
    FeaturedRestaurantsComponent
  ],

  // HTML file.
  templateUrl: './home.html',

  // SCSS file.
  styleUrl: './home.scss'

})

export class Home {

  // Stores all restaurants.
  //
  // Initially this list is empty.
  restaurants: Restaurant[] = [];

  // Dependency Injection.
  //
  // Angular automatically creates
  // RestaurantService object.
  constructor(

    private restaurantService: RestaurantService

  ) {

    // Load all restaurants
    // from the service.
    this.restaurants = this.restaurantService.getRestaurants();

  }

}