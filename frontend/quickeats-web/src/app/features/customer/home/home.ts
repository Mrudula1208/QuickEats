// Import Component decorator and signal.
import { Component, signal } from '@angular/core';

// Import Featured Restaurants Component.
import { FeaturedRestaurantsComponent } from '../components/featured-restaurants/featured-restaurants';

// Import Restaurant Model.
import { Restaurant } from '../../../core/models/restaurant.model';

// Import Restaurant Service.
import { RestaurantService } from '../../../core/services/restaurant.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FeaturedRestaurantsComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})

export class Home {

  // Stores all restaurants as a reactive signal.
  //
  // Initially this list is empty.
  restaurants = signal<Restaurant[]>([]);

  // Dependency Injection.
  //
  // Angular automatically creates
  // RestaurantService object.
  constructor(

    private restaurantService: RestaurantService

  ) {
    this.loadRestaurants();
  }
    loadRestaurants(): void {

    // Call Restaurant API.
    this.restaurantService.getRestaurants().subscribe({

      // API Success
      next: (data) => {

        // Store API data
        // inside restaurants signal.
        this.restaurants.set(data);

        console.log("Restaurants Loaded Successfully");
        console.log(this.restaurants());
      },

      // API Failed
      error: (err) => {

        console.log("Failed to Load Restaurants");
        console.log(err);

      }

    });

  }

}