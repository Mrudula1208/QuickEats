import { Component } from '@angular/core';
// We import Component because this file controls the Order Details page.
// Every Angular page or UI starts with a Component.

import { CommonModule } from '@angular/common';
// We import CommonModule because HTML uses Angular features like @if.

import { ActivatedRoute, Router } from '@angular/router';
// ActivatedRoute reads data from the URL.
// Router is used to move the user to another page.

import { OrderService } from '../../../core/services/order';
// We import OrderService because all order-related logic is written there.
// Components should not directly manage order data.

import { OrderModel } from '../../../core/models/order.model';
// We import OrderModel because it defines the structure of one order.

@Component({
  selector: 'app-order-details',
  // Angular uses this selector if this component is used inside another HTML page.

  standalone: true,
  // standalone:true means this component works independently.
  // We don't need to declare it inside app.module.ts.

  imports: [CommonModule],
  // We import CommonModule because HTML uses Angular directives.

  templateUrl: './order-details.html',
  // Connect this TypeScript file with order-details.html.

  styleUrl: './order-details.scss'
  // Connect this TypeScript file with order-details.scss.
})

export class OrderDetailsComponent {

  // Store one selected order.
  // Initially nothing is loaded.
  // '?' means value can be undefined.
  selectedOrder?: OrderModel;

  constructor(

    private currentRoute: ActivatedRoute,
    // Angular automatically gives ActivatedRoute object.
    // We use it to read Order Id from URL.
    // Example:
    // /order-details/101

    private orderService: OrderService,
    // Angular automatically gives OrderService object.
    // We don't create it using:
    // new OrderService()
    // Dependency Injection manages it.

    private router: Router
    // Router helps us open another page.
    // Example:
    // Order Details → Delivery Tracking

  ) {

    // As soon as page opens,
    // immediately load selected order.
    this.loadSelectedOrder();

  }

  loadSelectedOrder(): void {
  // This method loads only ONE order.
  // Customer clicked one order from Orders page.
  // So we display only that order.

    const selectedOrderId =
      Number(this.currentRoute.snapshot.paramMap.get('id'));

    // Read Order Id from URL.
    // paramMap.get('id') always returns string.
    // Number() converts string into integer.
    // Example:
    // URL:
    // /orders/105
    // selectedOrderId = 105

    // Ask the Backend for that one order.
    this.orderService
      .getOrderById(selectedOrderId)
      .subscribe({

        next: (data) => {

          this.selectedOrder = data;

          console.log(this.selectedOrder);

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  openDeliveryTracking(): void {
  // Runs when customer clicks
  // "Track My Order" button.

    this.router.navigate([

      '/delivery',
      this.selectedOrder?.id

    ]);

    // Navigate to Delivery Tracking page
    // with the order id in the URL.

  }

}
