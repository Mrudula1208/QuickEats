import { Component } from '@angular/core';
// Import Component because this file controls the Checkout page.

import { CommonModule } from '@angular/common';
// Import CommonModule because we use Angular directives inside HTML.

import { FormsModule } from '@angular/forms';
// Import FormsModule because checkout form uses ngModel.

import { Router } from '@angular/router';
// Router helps us navigate to another page after placing an order.

import { CheckoutService } from '../../../core/services/checkout.service';
// CheckoutService stores checkout information.

import { CartService } from '../../../core/services/cart.service';
// CartService gives all cart items and total amount.

import { CheckoutModel } from '../../../core/models/checkout.model';
import { signal } from '@angular/core';
import { CartItem } from '../../../core/models/cart-item.model';
// CheckoutModel defines the structure of checkout data.

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

  // Get all food items added into the cart.
customerCartItems = signal<CartItem[]>([]);

constructor(
  private cartService: CartService,
  private checkoutService: CheckoutService,
  private router: Router
) {

  this.customerCartItems = this.cartService.cartItems;

  this.calculateBill();

}
  // Create Checkout object.
  // Default values are shown when page opens.
  customerCheckout: CheckoutModel = {

    deliveryAddress: '',

    landmark: '',

    phoneNumber: '',

    deliveryInstruction: '',

    paymentMethod: 'Cash On Delivery',

    couponCode: '',

    subTotal: 0,

    gstAmount: 0,

    deliveryCharge: 0,

    platformFee: 10,

    discountAmount: 0,

    grandTotal: 0,

    rewardPoints: 0

  };

  // Angular automatically injects required services.


  // Calculate complete bill.
  calculateBill(): void {

    // Total food amount.
    this.customerCheckout.subTotal =
      this.cartService.getTotalPrice();

    // GST = 5%
    this.customerCheckout.gstAmount =
      this.customerCheckout.subTotal * 0.05;

    // Free delivery above ₹500.
    this.customerCheckout.deliveryCharge =
      this.customerCheckout.subTotal >= 500 ? 0 : 40;

    // Reward points.
    this.customerCheckout.rewardPoints =
      Math.floor(this.customerCheckout.subTotal / 100);

    // Grand Total.
    this.customerCheckout.grandTotal =

      this.customerCheckout.subTotal +

      this.customerCheckout.gstAmount +

      this.customerCheckout.deliveryCharge +

      this.customerCheckout.platformFee -

      this.customerCheckout.discountAmount;

  }

  // Save checkout details and move to payment page.
  placeOrder(): void {

    // Save checkout information.
    this.checkoutService
      .saveCheckoutDetails(this.customerCheckout);

    // Open Payment Page.
    this.router.navigate(['/payment']);

  }

}