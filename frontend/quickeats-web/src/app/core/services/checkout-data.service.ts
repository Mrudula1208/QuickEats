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

  // Bill breakdown for Payment page.
  foodTotal = 0;

  gstAmount = 0;

  deliveryFee = 0;

  platformFee = 0;

  couponDiscount = 0;

}