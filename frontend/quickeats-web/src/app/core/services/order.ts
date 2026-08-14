import { Injectable } from '@angular/core';
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

  // Create a new order on the Backend.
  // The Backend returns the new order id.
  createOrder(dto: any): Observable<number> {

    // POST
    // Sends the order to ASP.NET Core.
    return this.http.post<number>(this.apiUrl, dto);

  }

  // Get all orders of one customer.
  getUserOrders(userId: number): Observable<OrderModel[]> {

    return this.http.get<OrderModel[]>(`${this.apiUrl}/user/${userId}`);

  }

  // Get one order by id.
  getOrderById(id: number): Observable<OrderModel> {

    return this.http.get<OrderModel>(`${this.apiUrl}/${id}`);

  }

  // Get all orders (used by Admin / Owner).
  getAllOrdersApi(): Observable<OrderModel[]> {

    return this.http.get<OrderModel[]>(this.apiUrl);

  }

  // Get orders for the Owner's own restaurants.
  getOwnerOrders(): Observable<OrderModel[]> {

    return this.http.get<OrderModel[]>(`${this.apiUrl}/owner`);

  }

  // Update the status of one order (used by Admin / Owner).
  updateOrderStatusApi(id: number, status: string): Observable<any> {

    return this.http.put(`${this.apiUrl}/${id}`, { status: status });

  }

  // Delete one order (used by Admin).
  deleteOrderApi(id: number): Observable<any> {

    return this.http.delete(`${this.apiUrl}/${id}`);

  }

}
