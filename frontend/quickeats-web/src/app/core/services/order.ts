import { Injectable } from '@angular/core';
import { Order } from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orders: Order[] = [];

  constructor() {

    // Only browser has localStorage
    if (typeof window !== 'undefined') {

      const data = localStorage.getItem('orders');

      if (data) {
        this.orders = JSON.parse(data);
      }

    }

  }

  PlaceOrder(order: Order): void {

    this.orders.push(order);

    // Save only in browser
    if (typeof window !== 'undefined') {

      localStorage.setItem(
        'orders',
        JSON.stringify(this.orders)
      );

    }

  }

  getOrders(): Order[] {
    return this.orders;
  }

  getOrderById(id: number): Order | undefined {

    return this.orders.find(
      order => order.id === id
    );

  }

}