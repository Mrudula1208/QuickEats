import { Component } from '@angular/core';
// Controls the Owner's Orders list page.
// Shows orders for the Owner's own restaurants.

import { CommonModule } from '@angular/common';
// Required for @if and @for.

import { FormsModule } from '@angular/forms';
// Required for [(ngModel)] on the status dropdown.

import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
// Top navigation bar.

import { OrderService } from '../../../core/services/order';
// Loads and updates orders.

import { OrderModel } from '../../../core/models/order.model';
// Structure of one order.

@Component({
  selector: 'app-owner-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, OwnerNavComponent],
  templateUrl: './owner-orders.html',
  styleUrl: './owner-orders.scss'
})
export class OwnerOrdersComponent {

  // Orders of my restaurants.
  orders: OrderModel[] = [];

  constructor(
    private orderService: OrderService
  ) {

    this.loadOrders();

  }

  // Load my orders.
  loadOrders(): void {

    this.orderService
      .getOwnerOrders()
      .subscribe({
        next: (data) => {
          // Sort: Pending first, then Confirmed, then rest by date.
          this.orders = data.sort((a, b) => {
            const priority: Record<string, number> = {
              'Pending': 0,
              'Confirmed': 1,
              'Preparing': 2,
              'Out for Delivery': 3,
              'Delivered': 4,
              'Cancelled': 5
            };
            const aVal = priority[a.status] ?? 3;
            const bVal = priority[b.status] ?? 3;
            if (aVal !== bVal) return aVal - bVal;
            return new Date(b.createdAt).getTime() -
                   new Date(a.createdAt).getTime();
          });
        },
        error: () => {}
      });

  }

  // Update the status of one order.
  updateStatus(order: OrderModel): void {

    this.orderService
      .updateOrderStatusApi(order.id, order.status)
      .subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          alert(err.error || 'Failed to update status.');
          this.loadOrders();
        }
      });

  }

  // Quick advance to next status.
  // Pending â†’ Confirmed â†’ Preparing â†’ Out for Delivery â†’ Delivered
  getNextStatus(current: string): string {
    const flow: Record<string, string> = {
      'Pending': 'Confirmed',
      'Confirmed': 'Preparing',
      'Preparing': 'Out for Delivery',
      'Out for Delivery': 'Delivered'
    };
    return flow[current] || '';
  }

  // Get label for the next status button.
  getNextStatusLabel(current: string): string {
    const next = this.getNextStatus(current);
    if (!next) return '';
    return 'â†’ ' + next;
  }

  // Advance order to next status.
  advanceStatus(order: OrderModel): void {
    const next = this.getNextStatus(order.status);
    if (!next) return;

    this.orderService
      .updateOrderStatusApi(order.id, next)
      .subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          alert(err.error || 'Failed to update status.');
        }
      });

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

}
