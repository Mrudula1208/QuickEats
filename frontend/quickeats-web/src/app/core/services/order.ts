import { Injectable, signal } from '@angular/core';
import { OrderModel } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // Store all customer orders.
  customerOrders = signal<OrderModel[]>([]);

  // Save newly placed order.
  placeOrder(newOrder: OrderModel): void {

    const currentOrders = [...this.customerOrders()];

    currentOrders.push(newOrder);

    this.customerOrders.set(currentOrders);

    console.log("Order Placed Successfully");

    console.log(this.customerOrders());

  }

  // Return all customer orders.
  getAllOrders(): OrderModel[] {

    return this.customerOrders();

  }

}