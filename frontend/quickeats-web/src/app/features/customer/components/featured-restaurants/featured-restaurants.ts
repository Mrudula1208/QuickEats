import { Component, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Restaurant } from '../../../../core/models/restaurant.model';

@Component({
  selector: 'app-featured-restaurants',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-restaurants.html',
  styleUrls: ['./featured-restaurants.scss']
})
export class FeaturedRestaurantsComponent {

  restaurants = input<Restaurant[]>([]);

  constructor() {
    effect(() => {
      console.log("Child Received:");
      console.log(this.restaurants());
    });
  }

}