import { Injectable } from '@angular/core';
import { Order } from '../models/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orders:Order[]=[];

PlaceOrder(order:Order):void{
  this.orders.push(order)
}
getOrders():Order[]{
  return this.orders;
}
}
