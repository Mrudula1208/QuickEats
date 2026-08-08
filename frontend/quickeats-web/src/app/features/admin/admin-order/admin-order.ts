import { Component } from '@angular/core';
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
    private orderService: OrderService

  ) {

    // Constructor runs automatically
    // when Admin Orders page opens.
    //
    // Load all orders from Backend.
    this.loadOrders();

  }


 // Load all orders.
// Load all orders.
loadOrders(): void {

  // Call OrderService.
  //
  // getAllOrders()
  // Gives us all orders directly.
  //
  // It returns:
  // OrderModel[]
  //
  // It does NOT return an Observable,
  // so we do NOT use subscribe().
  const data: OrderModel[] =
    this.orderService.getAllOrders();

  // Store all orders inside the orders array.
  this.orders = data;

  console.log(this.orders);

}// Update selected order status.
updateStatus(

  orderId: number,

  status: string

): void {

  // orderId
  // ID of the selected order.

  // status
  // New status selected from dropdown.

  this.orderService.updateOrderStatus(

    orderId,

    status

  );

  // Reload orders after updating.
  this.loadOrders();

}

}