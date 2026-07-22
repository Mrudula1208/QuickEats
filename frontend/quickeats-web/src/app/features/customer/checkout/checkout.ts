// Import Component decorator.
import { Component } from '@angular/core';

// Used for page navigation.
import { Router } from '@angular/router';

// Stores checkout information.
import { CheckoutDataService } from '../../../core/services/checkout-data.service';

// Import CommonModule.
import { CommonModule } from '@angular/common';

// Import Cart Service.
import { CartService } from '../../../core/services/cart.service';

// Import CartItem model.
import { CartItem } from '../../../core/models/cart-item.model';

// Required for [(ngModel)].
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
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

    // Reads cart items.
    private cartService: CartService,

    // Stores checkout information
    // temporarily until payment.
    private checkoutData: CheckoutDataService,

    // Used for page navigation.
    private router: Router

  ) {

    // Load cart items.
    this.cartItems = this.cartService.getCartItems();

    // Load total amount.
    this.total = this.cartService.getTotalPrice();

  }

  // Runs when user clicks
  // Proceed To Payment.
  PlaceOrder(): void {

    // Save delivery address.
    this.checkoutData.address = this.address;

    // Save phone number.
    this.checkoutData.phone = this.phone;

    // Save cart items.
    this.checkoutData.cartItems = this.cartItems.map(item => ({
      menuItem: item.menuItem,
      quantity: item.quantity
    }));

    // Save total amount.
    this.checkoutData.total = this.total;

    // Open Payment page.
    this.router.navigate(['/payment']);

  }

}

/*

WHY DO WE WRITE THIS FILE?

CheckoutComponent collects
customer information before payment.

Flow

Restaurant
      ↓
Cart
      ↓
Checkout (THIS FILE)
      ↓
CheckoutDataService
      ↓
Payment

This component:

1. Reads cart items.
2. Calculates total amount.
3. Takes delivery address.
4. Takes phone number.
5. Saves checkout information.
6. Opens Payment page.

*/