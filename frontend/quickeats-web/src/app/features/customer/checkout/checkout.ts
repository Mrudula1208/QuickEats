// Import Component decorator.
import { Component } from '@angular/core';
import { Router } from '@angular/router';

// Import CommonModule.
import { CommonModule } from '@angular/common';

// Import Cart Service.
import { CartService } from '../../../core/services/cart.service';

// Import CartItem model.
import { CartItem } from '../../../core/models/cart-item.model';
import { FormsModule } from '@angular/forms';

// Import Order model.
import { Order } from '../../../core/models/order';import { OrderService } from '../../../core/services/order';
// Import Order Service.
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent {

  // Stores all cart items.
  cartItems: CartItem[] = [];

  // Stores total bill.
  total = 0;

  // Stores delivery address.
  address = '';

  // Stores phone number.
  phone = '';

  constructor(

    // Used to access cart items.
    private cartService: CartService,

    // Used to save orders.
    private orderService: OrderService,
    private router:Router

  ) {

    // Load cart items.
    this.cartItems = this.cartService.getCartItems();

    // Load total price.
    this.total = this.cartService.getTotalPrice();

  }

  // Runs when Place Order button is clicked.
  PlaceOrder(): void {

 const order: Order = {
  id: Date.now(),
  address: this.address,
  phone: this.phone,

  items: this.cartItems.map(item => ({
    menuItem: item.menuItem,
    quantity: item.quantity
  })),

  total: this.total,
  date: new Date()
};

console.log(this.cartItems);
console.log(order);

this.orderService.PlaceOrder(order);

  this.cartService.clearCart();

  alert("🎉 Order Placed Successfully!");

  this.router.navigate(['/orders']);

}

/*
WHY DO WE WRITE THIS FILE?

CheckoutComponent is the bridge between
Cart and Orders.

Flow:

Restaurant
   ↓
Cart
   ↓
Checkout (THIS FILE)
   ↓
OrderService
   ↓
Order History

This component:
1. Reads cart items.
2. Shows total price.
3. Takes address.
4. Takes phone number.
5. Creates an Order object.
6. Sends the order to OrderService.
7. Clears the cart.
*/}