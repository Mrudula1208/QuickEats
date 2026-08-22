import { Component } from '@angular/core';
// Controls the Owner's Restaurant list page.

import { CommonModule } from '@angular/common';
// Required for @if and @for.

import { RouterLink } from '@angular/router';
// RouterLink makes buttons navigate.

import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
// Top navigation bar.

import { RestaurantService } from '../../../core/services/restaurant.service';
// Loads and deletes restaurants.

import { Restaurant } from '../../../core/models/restaurant.model';
// Structure of one restaurant.

@Component({
  selector: 'app-owner-restaurants',
  standalone: true,
  imports: [CommonModule, RouterLink, OwnerNavComponent],
  templateUrl: './owner-restaurants.html',
  styleUrl: './owner-restaurants.scss'
})
export class OwnerRestaurantsComponent {

  // My restaurants.
  restaurants: Restaurant[] = [];

  constructor(
    private restaurantService: RestaurantService
  ) {

    this.loadRestaurants();

  }

  // Load only my restaurants.
  loadRestaurants(): void {

    this.restaurantService
      .getMyRestaurants()
      .subscribe({
        next: (data) => {
          this.restaurants = data;
        },
        error: () => {}
      });

  }

  // Delete one of my restaurants.
  deleteRestaurant(id: number): void {

    this.restaurantService
      .deleteRestaurant(id)
      .subscribe({
        next: () => {
          this.loadRestaurants();
        },
        error: () => {}
      });

  }

  // Toggle restaurant active status.
  toggleStatus(id: number): void {
    this.restaurantService.toggleStatus(id).subscribe({
      next: () => {
        this.loadRestaurants();
      },
      error: () => {}
    });
  }

}
