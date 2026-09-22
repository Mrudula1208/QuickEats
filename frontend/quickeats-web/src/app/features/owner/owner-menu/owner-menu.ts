import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
import { MenuService } from '../../../core/services/menu.service';
import { MenuItem } from '../../../core/models/menu.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-owner-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, OwnerNavComponent],
  templateUrl: './owner-menu.html',
  styleUrl: './owner-menu.scss'
})
export class OwnerMenuComponent {

  restaurantId = 0;
  menuItems = signal<MenuItem[]>([]);
  isLoading = signal(true);
  loadError = signal(false);
  searchText = '';
  selectedCategory = signal('All');

  categories = computed(() => {
    const cats = this.menuItems().map(m => m.category).filter((v, i, a) => a.indexOf(v) === i);
    return ['All', ...cats];
  });

  filteredItems = computed(() => {
    let items = this.menuItems();
    if (this.searchText) {
      const s = this.searchText.toLowerCase();
      items = items.filter(m =>
        (m.name || '').toLowerCase().includes(s) ||
        (m.description || '').toLowerCase().includes(s)
      );
    }
    const cat = this.selectedCategory();
    if (cat !== 'All') {
      items = items.filter(m => m.category === cat);
    }
    return items;
  });

  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService,
    private toastr: ToastrService
  ) {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMenu();
  }

  loadMenu(): void {
    this.isLoading.set(true);
    this.loadError.set(false);
    this.menuService.getMenuByRestaurantId(this.restaurantId).subscribe({
      next: (data) => {
        this.menuItems.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set(true);
        this.toastr.error('Failed to load menu items');
      }
    });
  }

  retry(): void {
    this.loadMenu();
  }

  toggleAvailability(id: number): void {
    this.menuService.toggleAvailability(id).subscribe({
      next: () => {
        this.menuItems.update(list =>
          list.map(m => m.id === id ? { ...m, isAvailable: !m.isAvailable } : m)
        );
        this.toastr.success('Availability updated');
      },
      error: () => this.toastr.error('Failed to update availability')
    });
  }

  deleteItem(id: number, name: string): void {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    this.menuService.deleteMenu(id).subscribe({
      next: () => {
        this.menuItems.update(list => list.filter(m => m.id !== id));
        this.toastr.success(`${name} deleted`);
      },
      error: () => this.toastr.error('Failed to delete item')
    });
  }

  getSalePrice(item: MenuItem): number {
    if (item.discountPercent > 0) {
      return item.price - (item.price * item.discountPercent) / 100;
    }
    return item.price;
  }
}
