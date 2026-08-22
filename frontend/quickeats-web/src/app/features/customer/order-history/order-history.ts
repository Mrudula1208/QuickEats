// Import Component decorator.
import { Component } from '@angular/core';

// Import CommonModule.
import { CommonModule } from '@angular/common';

// Import Order model.
import { OrderModel } from '../../../core/models/order.model';

// Import Order Service.
import { OrderService } from '../../../core/services/order';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss'
})
export class OrderHistoryComponent {

  // Stores all placed orders.
  orders: OrderModel[] = [];

  constructor(

    // Reads all saved orders.
    private orderService: OrderService

  ) {

    // Load all orders from the Backend.
    this.loadOrders();

  }

  // Fetch orders of the logged in customer.
  loadOrders(): void {

    const userId = Number(localStorage.getItem('userId') || 1);

    this.orderService
      .getUserOrders(userId)
      .subscribe({

        next: (data) => {

          // Show the newest order first.
          this.orders = data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );

        },

        error: () => {}

      });

  }

  // Refresh orders to see latest status.
  refreshOrders(): void {

    this.loadOrders();

  }

  // Get CSS class for status badge.
  getStatusClass(status: string): string {

    const classes: Record<string, string> = {

      'Pending': 'status-pending',

      'Confirmed': 'status-confirmed',

      'Preparing': 'status-preparing',

      'Out for Delivery': 'status-out',

      'Delivered': 'status-delivered',

      'Cancelled': 'status-cancelled'

    };

    return classes[status] || '';

  }

  // Check if order can be cancelled.
  canCancel(status: string): boolean {
    return status === 'Pending' || status === 'Confirmed';
  }

  // Cancel an order after confirmation.
  cancelOrder(orderId: number): void {

    const confirmed = confirm(
      `Are you sure you want to cancel order #${orderId}?`
    );

    if (!confirmed) return;

    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        // Reload orders to reflect updated status.
        this.loadOrders();
      },
      error: (err) => {
        alert(err.error || 'Failed to cancel order.');
      }
    });

  }

}
