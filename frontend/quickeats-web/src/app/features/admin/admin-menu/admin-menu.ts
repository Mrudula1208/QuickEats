import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MenuService } from '../../../core/services/menu.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { CategoryService } from '../../../core/services/category.service';
import { MenuItem } from '../../../core/models/menu.model';
import { Restaurant } from '../../../core/models/restaurant.model';
import { Category } from '../../../core/models/category.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminNavComponent],
  templateUrl: './admin-menu.html',
  styleUrl: './admin-menu.scss'
})
export class AdminMenu implements OnInit {
  menus = signal<MenuItem[]>([]);
  restaurants = signal<Restaurant[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  loadError = signal('');

  // Search and Filters
  searchText = signal('');
  selectedStatus = signal<'all' | 'available' | 'unavailable'>('all');
  selectedRestaurantId = signal<number | 'all'>('all');
  selectedCategory = signal<string>('all');
  selectedType = signal<'all' | 'veg' | 'non-veg'>('all');

  // Delete modal state
  itemToDelete = signal<MenuItem | null>(null);
  isDeleting = signal(false);

  // Toggling availability tracking
  togglingId = signal<number | null>(null);

  // Computed filtered list
  filteredMenus = computed(() => {
    let list = this.menus();
    const query = this.searchText().toLowerCase().trim();
    const status = this.selectedStatus();
    const restId = this.selectedRestaurantId();
    const cat = this.selectedCategory();
    const type = this.selectedType();

    if (query) {
      list = list.filter(m =>
        m.name.toLowerCase().includes(query) ||
        (m.description && m.description.toLowerCase().includes(query)) ||
        (m.category && m.category.toLowerCase().includes(query)) ||
        this.getRestaurantName(m.restaurantId).toLowerCase().includes(query)
      );
    }

    if (status === 'available') {
      list = list.filter(m => m.isAvailable);
    } else if (status === 'unavailable') {
      list = list.filter(m => !m.isAvailable);
    }

    if (restId !== 'all') {
      list = list.filter(m => m.restaurantId === Number(restId));
    }

    if (cat !== 'all') {
      list = list.filter(m => m.category === cat);
    }

    if (type === 'veg') {
      list = list.filter(m => m.isVeg);
    } else if (type === 'non-veg') {
      list = list.filter(m => !m.isVeg);
    }

    return list;
  });

  // Pagination / Limit State
  pageSize = 10;
  visibleLimit = signal(10);
  showAll = signal(false);

  displayedMenus = computed(() => {
    if (this.showAll()) {
      return this.filteredMenus();
    }
    return this.filteredMenus().slice(0, this.visibleLimit());
  });

  hasMore = computed(() => {
    return !this.showAll() && this.visibleLimit() < this.filteredMenus().length;
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

  // Dynamic Statistics
  stats = computed(() => {
    const list = this.menus();
    const total = list.length;
    const available = list.filter(m => m.isAvailable).length;
    const unavailable = total - available;
    const uniqueCategories = new Set(list.map(m => m.category).filter(Boolean)).size;
    const avgPrice = total > 0 ? Math.round(list.reduce((acc, m) => acc + m.price, 0) / total) : 0;

    return {
      total,
      available,
      unavailable,
      uniqueCategories,
      avgPrice
    };
  });

  constructor(
    private menuService: MenuService,
    private restaurantService: RestaurantService,
    private categoryService: CategoryService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    forkJoin({
      menus: this.menuService.getMenus(),
      restaurants: this.restaurantService.getRestaurants(),
      categories: this.categoryService.getCategories()
    }).subscribe({
      next: ({ menus, restaurants, categories }) => {
        this.menus.set(menus || []);
        this.restaurants.set(restaurants || []);
        this.categories.set(categories || []);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback: Try loading menus alone
        this.menuService.getMenus().subscribe({
          next: (menus) => {
            this.menus.set(menus || []);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
            this.loadError.set('Could not connect to server or load menu items.');
            this.toastr.error('Failed to load menu items. Please check backend connection.');
          }
        });
      }
    });
  }

  getRestaurantName(restaurantId: number): string {
    const r = this.restaurants().find(x => x.id === restaurantId);
    return r ? r.name : `Restaurant #${restaurantId}`;
  }

  getFinalPrice(menu: MenuItem): number {
    if (menu.discountPercent && menu.discountPercent > 0) {
      return menu.price - (menu.price * menu.discountPercent / 100);
    }
    return menu.price;
  }

  toggleAvailability(menu: MenuItem, event: Event): void {
    event.stopPropagation();
    this.togglingId.set(menu.id);
    const newStatus = !menu.isAvailable;

    this.menuService.toggleAvailability(menu.id).subscribe({
      next: () => {
        this.menus.update(list =>
          list.map(m => m.id === menu.id ? { ...m, isAvailable: newStatus } : m)
        );
        this.togglingId.set(null);
        this.toastr.success(`"${menu.name}" marked as ${newStatus ? 'Available' : 'Unavailable'}`);
      },
      error: () => {
        // Fallback to updateMenuData if toggle patch isn't supported
        this.menuService.updateMenuData(menu.id, { ...menu, isAvailable: newStatus }).subscribe({
          next: () => {
            this.menus.update(list =>
              list.map(m => m.id === menu.id ? { ...m, isAvailable: newStatus } : m)
            );
            this.togglingId.set(null);
            this.toastr.success(`"${menu.name}" marked as ${newStatus ? 'Available' : 'Unavailable'}`);
          },
          error: () => {
            this.togglingId.set(null);
            this.toastr.error('Failed to update availability status.');
          }
        });
      }
    });
  }

  openDeleteModal(menu: MenuItem, event: Event): void {
    event.stopPropagation();
    this.itemToDelete.set(menu);
  }

  closeDeleteModal(): void {
    if (this.isDeleting()) return;
    this.itemToDelete.set(null);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.isDeleting.set(true);
    this.menuService.deleteMenu(item.id).subscribe({
      next: () => {
        this.menus.update(list => list.filter(m => m.id !== item.id));
        this.isDeleting.set(false);
        this.itemToDelete.set(null);
        this.toastr.success(`"${item.name}" deleted successfully.`);
      },
      error: () => {
        this.isDeleting.set(false);
        this.toastr.error('Failed to delete menu item.');
      }
    });
  }

  resetFilters(): void {
    this.searchText.set('');
    this.selectedStatus.set('all');
    this.selectedRestaurantId.set('all');
    this.selectedCategory.set('all');
    this.selectedType.set('all');
  }

  hasActiveFilters(): boolean {
    return (
      this.searchText() !== '' ||
      this.selectedStatus() !== 'all' ||
      this.selectedRestaurantId() !== 'all' ||
      this.selectedCategory() !== 'all' ||
      this.selectedType() !== 'all'
    );
  }
}
