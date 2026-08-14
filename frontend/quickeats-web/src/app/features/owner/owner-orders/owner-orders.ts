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
          this.orders = data;
        },
        error: (err) => {
          console.log(err);
        }
      });

  }

  // Update the status of one order.
  updateStatus(order: OrderModel): void {

    this.orderService
      .updateOrderStatusApi(order.id, order.status)
      .subscribe({
        next: () => {
          console.log('Status updated');
        },
        error: (err) => {
          console.log(err);
        }
      });

  }

}
