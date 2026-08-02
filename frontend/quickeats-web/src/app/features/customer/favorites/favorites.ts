import { Component } from '@angular/core';
// Import Component because this file controls the Favorites page.

import { CommonModule } from '@angular/common';
// CommonModule is required because HTML uses @for and @if.

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
    private favoriteService: FavoriteService

  ) {

    // As soon as page opens,
    // immediately load favorites.
    this.loadFavorites();

  }

  // Get all favorite restaurants.
  loadFavorites(): void {

    this.customerFavorites =
      this.favoriteService.getFavorites();

    console.log("Favorite Restaurants");

    console.log(this.customerFavorites);

  }

}