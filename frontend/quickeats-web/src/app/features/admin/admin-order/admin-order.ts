import { Component } from '@angular/core';
import {Router} from '@angular/router';
// Controls the Admin Orders Page.

import { CommonModule } from '@angular/common';import { FormsModule } from '@angular/forms';
// Required for @for and @if in the HTML.

import { OrderService } from '../../../core/services/order';
// Calls Order APIs from the Backend.

import { OrderModel } from '../../../core/models/order.model';
// Defines the structure of one Order.

@Component({

  selector: 'app-admin-orders',

  standalone: true,

  imports: [
    CommonModule,FormsModule
  ],

  templateUrl: './admin-order.html',

  styleUrl: './admin-order.scss'

})
export class AdminOrders {

  // Store multiple orders.
  //
  // Order
  // Means one Order object.
  //
  // []
  // Means multiple Order objects.
  //
  // = []
  // Initially the list is empty.
  orders: OrderModel[] = [];


  constructor(

    // Order API Service.
    //
    // Angular automatically creates
    // the OrderService object and gives it here.
    private orderService: OrderService,
    private router: Router

  ) {

    // Constructor runs automatically
    // when Admin Orders page opens.
    //
    // Load all orders from Backend.
    this.loadOrders();

  }


 // Load all orders from the Backend.
loadOrders(): void {

  // The Backend returns an Observable,
  // so we use subscribe().
  this.orderService
    .getAllOrdersApi()
    .subscribe({

      next: (data) => {

        // Store all orders inside the orders array.
        this.orders = data;

        console.log(this.orders);

      },

      error: (err) => {

        console.log(err);

      }

    });

}

// Update selected order status on the Backend.
updateStatus(

  orderId: number,

  status: string

): void {

  // orderId
  // ID of the selected order.

  // status
  // New status selected from dropdown.

  this.orderService
    .updateOrderStatusApi(orderId, status)
    .subscribe({

      next: () => {

        // Reload orders after updating.
        this.loadOrders();

      },

      error: (err) => {

        console.log(err);

      }

    });

}
viewOrder(orderId: number): void {

  // Navigate to the order details page.
  this.router.navigate(['/admin/order-details', orderId]);
}
// Delete selected order from the Backend.
deleteOrder(

  // orderId
  // ID of the order we want to delete.
  orderId: number

): void {

  // Send the Order ID to OrderService.
  this.orderService
    .deleteOrderApi(orderId)
    .subscribe({

      next: () => {

        // Reload the order list
        // after deletion.
        this.loadOrders();

      },

      error: (err) => {

        console.log(err);

      }

    });

}
}
