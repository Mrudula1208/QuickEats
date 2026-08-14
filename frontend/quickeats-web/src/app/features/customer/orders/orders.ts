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

  // Open selected order details page.
  openOrderDetails(selectedOrderId: number): void {

    this.router.navigate([
      '/order-details',
      selectedOrderId
    ]);

  }

}