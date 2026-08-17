import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeaturedRestaurantsComponent } from '../components/featured-restaurants/featured-restaurants';
import { Restaurant } from '../../../core/models/restaurant.model';
import { RestaurantService } from '../../../core/services/restaurant.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FeaturedRestaurantsComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  restaurants = signal<Restaurant[]>([]);
  filteredRestaurants = signal<Restaurant[]>([]);

  searchText = '';
  showOpenOnly = false;
  showClosedOnly = false;
  minRating = 0;

  constructor(
    private restaurantService: RestaurantService
  ) {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants.set(data);
        this.applyFilters();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  applyFilters(): void {
    let result = this.restaurants();

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(search) ||
        r.address.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search)
      );
    }

    if (this.showOpenOnly) {
      result = result.filter(r => r.isActive);
    }

    if (this.showClosedOnly) {
      result = result.filter(r => !r.isActive);
    }

    if (this.minRating > 0) {
      result = result.filter(r => (r.rating ?? 0) >= this.minRating);
    }

    this.filteredRestaurants.set(result);
  }

  onSearch(): void {
    this.applyFilters();
  }

  toggleOpen(): void {
    this.showOpenOnly = !this.showOpenOnly;
    if (this.showOpenOnly) {
      this.showClosedOnly = false;
    }
    this.applyFilters();
  }

  toggleClosed(): void {
    this.showClosedOnly = !this.showClosedOnly;
    if (this.showClosedOnly) {
      this.showOpenOnly = false;
    }
    this.applyFilters();
  }

  setMinRating(rating: number): void {
    this.minRating = this.minRating === rating ? 0 : rating;
    this.applyFilters();
  }

}
