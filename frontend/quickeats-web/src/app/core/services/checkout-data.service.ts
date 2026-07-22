import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutDataService {

  address = '';

  phone = '';

  cartItems: CartItem[] = [];

  total = 0;

}