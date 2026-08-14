import { Component } from '@angular/core';
// Import Component because this file controls the Favorites page.

import { CommonModule } from '@angular/common';
// CommonModule is required because HTML uses @for and @if.

import { Router } from '@angular/router';
// Router is used to open the Restaurant Details page.

import { FavoriteService } from '../../../core/services/favorite.service';
// FavoriteService stores all favorite restaurants.

import { FavoriteModel } from '../../../core/models/favorite.model';
// FavoriteModel defines one favorite restaurant.

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss'
})

export class FavoritesComponent {

  // Store all favorite restaurants.
  customerFavorites: FavoriteModel[] = [];

  constructor(

    // Angular automatically creates FavoriteService.
    private favoriteService: FavoriteService,

    // Router is used to open another page.
    private router: Router

  ) {

    // As soon as page opens,
    // immediately load favorites.
    this.loadFavorites();

  }

  // Get all favorite restaurants.
  loadFavorites(): void {

    this.favoriteService.getFavorites().subscribe({
      next: (data: FavoriteModel[]) => {
        this.customerFavorites = data;
      },
      // Runs if API Fails.
      error: (err: any) => {

        console.log(err);

      }
    });

  }

  // Open the Restaurant Details page.
  openRestaurant(
    selectedRestaurantId: number
  ): void {

    this.router.navigate([

      '/restaurant',

      selectedRestaurantId

    ]);

  }

}

// Backend sends data

// ↓

// next runs

// ↓

// Store data into customerFavorites

// ↓

// Print customerFavorites



// next: (data) => {