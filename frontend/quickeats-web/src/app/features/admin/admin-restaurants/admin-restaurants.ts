import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { Restaurant } from '../../../core/models/restaurant.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent, RouterLink],
  templateUrl: './admin-restaurants.html',
  styleUrl: './admin-restaurants.scss'
})
export class AdminRestaurants {

  restaurants = signal<Restaurant[]>([]);
  isLoading = signal(true);
  searchText = signal('');
  selectedStatus = signal('All');

  statusTabs = ['All', 'Active', 'Inactive'];

  filteredRestaurants = computed(() => {
    let list = this.restaurants();
    const status = this.selectedStatus();
    if (status === 'Active') list = list.filter(r => r.isActive);
    else if (status === 'Inactive') list = list.filter(r => !r.isActive);
    const search = this.searchText();
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(s) ||
        r.address.toLowerCase().includes(s) ||
        r.phoneNumber.includes(s)
      );
    }
    return list;
  });

  counts = computed(() => {
    const all = this.restaurants();
    return {
      total: all.length,
      active: all.filter(r => r.isActive).length,
      inactive: all.filter(r => !r.isActive).length
    };
  });

  // Pagination / Limit State
  pageSize = 10;
  visibleLimit = signal(10);
  showAll = signal(false);

  displayedRestaurants = computed(() => {
    if (this.showAll()) {
      return this.filteredRestaurants();
    }
    return this.filteredRestaurants().slice(0, this.visibleLimit());
  });

  hasMore = computed(() => {
    return !this.showAll() && this.visibleLimit() < this.filteredRestaurants().length;
  });

  showMore(): void {
    this.visibleLimit.update(v => v + this.pageSize);
  }

  toggleShowAll(): void {
    if (this.showAll()) {
      this.showAll.set(false);
      this.visibleLimit.set(this.pageSize);
    } else {
      this.showAll.set(true);
    }
  }

  constructor(
    private restaurantService: RestaurantService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.isLoading.set(true);
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastr.error('Failed to load restaurants');
      }
    });
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

  deleteRestaurant(r: Restaurant): void {
    if (!confirm(`Delete restaurant "${r.name}"? This will also remove its menu items.`)) return;
    this.restaurantService.deleteRestaurant(r.id).subscribe({
      next: () => {
        this.restaurants.update(list => list.filter(x => x.id !== r.id));
        this.toastr.success(`${r.name} deleted`);
      },
      error: () => this.toastr.error('Failed to delete restaurant')
    });
  }

  addRestaurant(): void {
    this.router.navigate(['/admin/add-restaurant']);
  }

  editRestaurant(r: Restaurant): void {
    this.router.navigate(['/admin/edit-restaurant', r.id]);
  }

  formatTime(timeStr?: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hour = parseInt(parts[0], 10);
    const min = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${min} ${ampm}`;
  }
}
