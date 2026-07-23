import { Injectable } from '@angular/core';
import { Order } from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orders: Order[] = [];

  constructor() {

    const data = localStorage.getItem('orders');

    if (data) {
      this.orders = JSON.parse(data);
    }

  }

  PlaceOrder(order: Order): void {

    this.orders.push(order);

    localStorage.setItem(
      'orders',
      JSON.stringify(this.orders)
    );

  }

  getOrders(): Order[] {

    return this.orders;

  }

  getOrderById(id: number): Order | undefined {

    return this.orders.find(order => order.id === id);

  }

}