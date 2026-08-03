import { Component } from '@angular/core';
// Controls the Owner's Menu list page for one restaurant.

import { CommonModule } from '@angular/common';
// Required for @if and @for.

import { RouterLink } from '@angular/router';
// RouterLink makes buttons navigate.

import { ActivatedRoute } from '@angular/router';
// ActivatedRoute reads the restaurant id from the URL.

import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
// Top navigation bar.

import { MenuService } from '../../../core/services/menu.service';
// Loads and deletes menu items.

import { MenuItem } from '../../../core/models/menu.model';
// Structure of one menu item.

@Component({
  selector: 'app-owner-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, OwnerNavComponent],
  templateUrl: './owner-menu.html',
  styleUrl: './owner-menu.scss'
})
export class OwnerMenuComponent {

  // The restaurant we are managing.
  restaurantId = 0;

  // Menu items of that restaurant.
  menuItems: MenuItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService
  ) {

    // Read the restaurant id from the URL.
    this.restaurantId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadMenu();

  }

  // Load all menu items of the restaurant.
  loadMenu(): void {

    this.menuService
      .getMenuByRestaurantId(this.restaurantId)
      .subscribe({
        next: (data) => {
          this.menuItems = data;
        },
        error: (err) => {
          console.log(err);
        }
      });

  }

  // Toggle availability of a menu item (Available / Out of Stock).
  toggleAvailability(id: number): void {

    this.menuService
      .toggleAvailability(id)
      .subscribe({
        next: () => {
          this.loadMenu();
        },
        error: (err) => {
          console.log(err);
        }
      });

  }

  // Delete a menu item after confirmation.
  deleteItem(id: number, name: string): void {

    const confirmed = confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) return;

    this.menuService
      .deleteMenu(id)
      .subscribe({
        next: () => {
          this.loadMenu();
        },
        error: (err) => {
          console.log(err);
        }
      });

  }

}
