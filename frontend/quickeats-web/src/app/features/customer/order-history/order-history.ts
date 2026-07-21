// Import Component decorator.
import { Component } from '@angular/core';

// Import CommonModule.
import { CommonModule } from '@angular/common';

// Import Order model.
import { Order } from '../../../core/models/order';

// Import Order Service.
import { OrderService } from '../../../core/services/order';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule,RouterLink
    
  ],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss'
})
export class OrderHistoryComponent {

  // Stores all placed orders.
  orders: Order[] = [];

  constructor(

    // Reads all saved orders.
    private orderService: OrderService

  ) {

    // Load all orders.
    this.orders = this.orderService.getOrders();

  }

}

/*
WHY DO WE WRITE THIS FILE?

This component displays every order
placed by the customer.

Flow

Restaurant
 ↓
Cart
 ↓
Checkout
 ↓
OrderService
 ↓
Order History (THIS FILE)

This component:
1. Gets all saved orders.
2. Stores them in 'orders'.
3. Sends them to HTML for display.
*/