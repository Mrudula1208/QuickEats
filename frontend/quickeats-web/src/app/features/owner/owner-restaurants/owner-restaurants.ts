import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { Restaurant } from '../../../core/models/restaurant.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-owner-restaurants',
  standalone: true,
  imports: [CommonModule, RouterLink, OwnerNavComponent],
  templateUrl: './owner-restaurants.html',
  styleUrl: './owner-restaurants.scss'
})
export class OwnerRestaurantsComponent {

  restaurants = signal<Restaurant[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  constructor(
    private restaurantService: RestaurantService,
    private toastr: ToastrService
  ) {
    this.loadRestaurants();
  }

  // One owner = one restaurant. The primary restaurant is the first one.
  get restaurant(): Restaurant | undefined {
    return this.restaurants()[0];
  }

  loadRestaurants(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.restaurantService.getMyRestaurants().subscribe({
      next: (data) => {
        this.restaurants.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load your restaurant. Please try again.');
      }
    });
  }

  retry(): void {
    this.loadRestaurants();
  }

  toggleStatus(id: number): void {
    this.restaurantService.toggleStatus(id).subscribe({
      next: () => {
        this.toastr.success('Status updated');
        this.loadRestaurants();
      },
      error: () => this.toastr.error('Failed to update status')
    });
  }
}
