import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FavoriteService } from './favorite.service';
import { AuthService } from './auth.service';
import { FavoriteModel } from '../models/favorite.model';
import { ToastrService } from 'ngx-toastr';

// Shared helper for the "favorite restaurant" heart used on
// Home, Restaurants and Restaurant Details cards.
// It keeps a restaurantId -> favoriteId map so the heart can
// both add AND remove favorites using the existing Favorite API.
@Injectable({ providedIn: 'root' })
export class RestaurantFavoritesService {

  private favoriteMap = new Map<number, number>();

  constructor(
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  // Load the logged in user's favorites (no-op for guests).
  load(): void {
    if (!this.authService.isLoggedIn()) return;

    this.favoriteService.getFavorites().subscribe({
      next: (data: FavoriteModel[]) => {
        this.favoriteMap = new Map(data.map(f => [f.restaurantId, f.favoriteId]));
      },
      error: () => {}
    });
  }

  // Hearts stay untouched for guests.
  isFavorite(restaurantId: number): boolean {
    return this.favoriteMap.has(restaurantId);
  }

  // Toggle a restaurant heart.
  // Guests are sent to Login and redirected back here afterwards.
  toggle(restaurant: { id: number; name: string; imageUrl: string; address: string }): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Login to save your favorite restaurants.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const favoriteId = this.favoriteMap.get(restaurant.id);

    if (favoriteId) {
      this.favoriteService.removeFavorite(favoriteId).subscribe({
        next: () => {
          this.favoriteMap.delete(restaurant.id);
          this.toastr.success(`${restaurant.name} removed from favorites`);
        },
        error: () => this.toastr.error('Could not remove from favorites. Please try again.')
      });
      return;
    }

    const favorite: FavoriteModel = {
      favoriteId: 0,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantImage: restaurant.imageUrl,
      restaurantLocation: restaurant.address
    };

    this.favoriteService.addFavorite(favorite).subscribe({
      next: () => {
        // Refresh to learn the newly created favoriteId.
        this.load();
        this.toastr.success(`${restaurant.name} added to favorites`);
      },
      error: () => this.toastr.error('Could not add to favorites. Please try again.')
    });
  }
}