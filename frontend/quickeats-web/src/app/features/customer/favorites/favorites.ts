import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FavoriteService } from '../../../core/services/favorite.service';
import { FavoriteModel } from '../../../core/models/favorite.model';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { Restaurant } from '../../../core/models/restaurant.model';
import { ToastrService } from 'ngx-toastr';

export interface FavoriteWithRestaurant extends FavoriteModel {
  rating: number;
  isOpenNow: boolean;
  openingTime: string;
  closingTime: string;
  deliveryCharge: number;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss'
})
export class FavoritesComponent {

  favorites = signal<FavoriteWithRestaurant[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  constructor(
    private favoriteService: FavoriteService,
    private restaurantService: RestaurantService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.favoriteService.getFavorites().subscribe({
      next: (favorites) => {
        this.enrichFavorites(favorites);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load your favorites. Please try again.');
      }
    });
  }

  private enrichFavorites(favorites: FavoriteModel[]): void {
    const enriched: FavoriteWithRestaurant[] = [];
    let pending = favorites.length;

    const finish = () => {
      this.favorites.set(enriched);
      this.isLoading.set(false);
    };

    if (pending === 0) {
      finish();
      return;
    }

    favorites.forEach((fav) => {
      this.restaurantService.getRestaurantById(fav.restaurantId).subscribe({
        next: (restaurant: Restaurant) => {
          enriched.push({
            ...fav,
            rating: restaurant.rating ?? 0,
            isOpenNow: restaurant.isOpenNow,
            openingTime: restaurant.openingTime,
            closingTime: restaurant.closingTime,
            deliveryCharge: restaurant.deliveryCharge
          });
          pending--;
          if (pending === 0) finish();
        },
        error: () => {
          enriched.push({
            ...fav,
            rating: 0,
            isOpenNow: false,
            openingTime: '',
            closingTime: '',
            deliveryCharge: 0
          });
          pending--;
          if (pending === 0) finish();
        }
      });
    });
  }

  retry(): void {
    this.loadFavorites();
  }

  removeFavorite(fav: FavoriteWithRestaurant, event: Event): void {
    event.stopPropagation();
    this.favoriteService.removeFavorite(fav.favoriteId).subscribe({
      next: () => {
        this.favorites.update(list => list.filter(f => f.favoriteId !== fav.favoriteId));
        this.toastr.success(`${fav.restaurantName} removed from favorites`);
      },
      error: () => {
        this.toastr.error('Failed to remove favorite');
      }
    });
  }

  openRestaurant(id: number): void {
    this.router.navigate(['/restaurants', id]);
  }
}
