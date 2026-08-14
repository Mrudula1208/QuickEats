import { Injectable, signal } from '@angular/core';
import { OrderModel } from '../models/order.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // Backend Order API URL.
  private apiUrl = 'https://localhost:7278/api/Order';

  constructor(private http: HttpClient) { }

  // Store all customer orders.
  customerOrders = signal<OrderModel[]>([]);

  // Create a new order on the Backend.
  createOrder(dto: any): Observable<any> {

    // POST
    // Sends the order to ASP.NET Core.
    return this.http.post(this.apiUrl, dto);

  }

  // Get all orders of one customer.
  getUserOrders(userId: number): Observable<OrderModel[]> {

    return this.http.get<OrderModel[]>(`${this.apiUrl}/user/${userId}`);

  }

  // Get one order by id.
  getOrderById(id: number): Observable<OrderModel> {

    return this.http.get<OrderModel>(`${this.apiUrl}/${id}`);

  }

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
deleteOrder(orderId: number): void {

  // Create a copy of the current orders.
  const currentOrders = [...this.customerOrders()];

  // Filter out the order to be deleted.
  const updatedOrders = currentOrders.filter(
    order => order.id !== orderId
  );
  this.customerOrders.set(updatedOrders);
  console.log("order deleted successfully");
}
}