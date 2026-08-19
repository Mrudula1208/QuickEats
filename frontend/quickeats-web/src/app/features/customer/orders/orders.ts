import { Component } from '@angular/core';
// Import Component because this is an Angular Component.

import { CommonModule } from '@angular/common';
// Import CommonModule because HTML uses @for and @if.

import { Router } from '@angular/router';
// Router opens Order Details page.

import { OrderService } from '../../../core/services/order';
// OrderService provides all customer orders.

import { OrderModel } from '../../../core/models/order.model';
// OrderModel defines one order object.

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})

export class OrdersComponent {

  // Store all customer orders.
  customerOrders: OrderModel[] = [];

  // Angular injects required services.
  constructor(

    private orderService: OrderService,

    private router: Router

  ) {

    // Load all customer orders.
    this.loadCustomerOrders();

  }

  // Get all orders from the Backend.
  loadCustomerOrders(): void {

    const userId = Number(localStorage.getItem('userId') || 1);

    this.orderService
      .getUserOrders(userId)
      .subscribe({

        next: (data) => {

          this.customerOrders = data;

          console.log(this.customerOrders);

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  // Refresh orders to see latest status.
  refreshOrders(): void {

    this.loadCustomerOrders();

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

  // Open selected order details page.
  openOrderDetails(selectedOrderId: number): void {

    this.router.navigate([
      '/order-details',
      selectedOrderId
    ]);

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
        this.loadCustomerOrders();
      },
      error: (err) => {
        console.log(err);
        alert(err.error || 'Failed to cancel order.');
      }
    });

  }

}