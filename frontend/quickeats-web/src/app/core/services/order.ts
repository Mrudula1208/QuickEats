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

  }// Update the status of one order.
updateOrderStatus(

  selectedOrderId: number,

  newStatus: string

): void {

  // selectedOrderId: number
  // Receives the ID of the order
  // that the Admin wants to update.
  //
  // Example:
  // selectedOrderId = 101

  // newStatus: string
  // Receives the new status.
  //
  // Example:
  // "Preparing"
  // "Out for Delivery"
  // "Delivered"

  // Create a copy of the current orders.
  //
  // this.customerOrders()
  // Gets the current array from the signal.
  //
  // [...]
  // Creates a new array.
  const currentOrders =
    [...this.customerOrders()];


  // Find the selected order.
  //
  // find()
  // Searches the array.
  //
  // order => order.id === selectedOrderId
  // Means:
  // Find the order whose ID
  // is equal to the selected ID.

  const selectedOrder =
    currentOrders.find(

      order =>
        order.id === selectedOrderId

    );


  // Check whether the order exists.

  if (selectedOrder) {

    // Change the status of that order.

    selectedOrder.status =
      newStatus;

  }


  // Update the signal.

  this.customerOrders.set(
    currentOrders
  );


  console.log("Order Status Updated");

}

}