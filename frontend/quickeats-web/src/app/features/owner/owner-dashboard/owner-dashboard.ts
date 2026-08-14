import { Component } from '@angular/core';
// Controls the Owner Dashboard page.

import { CommonModule } from '@angular/common';
// Required for @if and @for.

import { RouterLink } from '@angular/router';
// RouterLink makes quick links navigate without reloading.

import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
// Top navigation bar for the Owner Portal.

import { RestaurantService } from '../../../core/services/restaurant.service';
// Loads the Owner's restaurants.

import { OrderService } from '../../../core/services/order';
// Loads the Owner's orders.

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, OwnerNavComponent],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.scss'
})
export class OwnerDashboardComponent {

  // Owner's name from login.
  ownerName = localStorage.getItem('name') || 'Owner';

  // Number of my restaurants.
  restaurantCount = 0;

  // Number of incoming orders.
  orderCount = 0;

  // Total money earned.
  revenue = 0;

  constructor(
    private restaurantService: RestaurantService,
    private orderService: OrderService
  ) {

    // Load everything when the page opens.
    this.loadRestaurants();
    this.loadOrders();

  }

  // Load my restaurants.
  loadRestaurants(): void {

    this.restaurantService
      .getMyRestaurants()
      .subscribe({
        next: (data) => {
          this.restaurantCount = data.length;
        },
        error: (err) => {
          console.log(err);
        }
      });

  }

  // Load my orders and calculate revenue.
  loadOrders(): void {

    this.orderService
      .getOwnerOrders()
      .subscribe({
        next: (data) => {
          this.orderCount = data.length;
          this.revenue = data.reduce(
            (total, order) => total + order.totalAmount,
            0
          );
        },
        error: (err) => {
          console.log(err);
        }
      });

  }

}
