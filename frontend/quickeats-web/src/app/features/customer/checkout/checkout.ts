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

import { CheckoutDataService } from '../../../core/services/checkout-data.service';
// CheckoutDataService passes simple data to the Payment page.

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

  // Track if user clicked Place Order.
  submitted = false;

  // Per-field error messages.
  errors: { [key: string]: string } = {};

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private checkoutData: CheckoutDataService,
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

  // ==========================================
  // VALIDATE FORM
  // ==========================================

  // validateForm
  // Checks delivery address and phone number.
  // Returns true if all fields are valid.
  validateForm(): boolean {

    // Clear old errors.
    this.errors = {};

    // Delivery Address
    if (!this.customerCheckout.deliveryAddress.trim()) {

      this.errors['deliveryAddress'] = 'Delivery address is required.';

    } else if (this.customerCheckout.deliveryAddress.trim().length < 5) {

      this.errors['deliveryAddress'] = 'Delivery address must be at least 5 characters.';

    } else if (this.customerCheckout.deliveryAddress.trim().length > 500) {

      this.errors['deliveryAddress'] = 'Delivery address cannot exceed 500 characters.';

    }

    // Phone Number
    if (!this.customerCheckout.phoneNumber.trim()) {

      this.errors['phoneNumber'] = 'Phone number is required.';

    } else if (!/^\d{10,15}$/.test(this.customerCheckout.phoneNumber.trim())) {

      this.errors['phoneNumber'] = 'Please enter a valid 10 to 15 digit phone number.';

    }

    // Return true if no errors.
    return Object.keys(this.errors).length === 0;

  }

  // Calculate complete bill.
  calculateBill(): void {

    // Food total after menu discounts.
    this.customerCheckout.subTotal =
      this.cartService.getFoodTotal();

    // GST = 5%
    this.customerCheckout.gstAmount =
      this.cartService.getGstAmount();

    // Platform fee.
    this.customerCheckout.platformFee =
      this.cartService.getPlatformFee();

    // Free delivery above ₹500.
    this.customerCheckout.deliveryCharge =
      this.cartService.getDeliveryFee();

    // Coupon discount.
    this.customerCheckout.discountAmount =
      this.cartService.getCouponDiscount();

    // Coupon code.
    this.customerCheckout.couponCode =
      this.cartService.getCouponCode();

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

    // Mark form as submitted.
    this.submitted = true;

    // Validate delivery address and phone.
    if (!this.validateForm()) {

      return;

    }

    // Save checkout information.
    this.checkoutService
      .saveCheckoutDetails(this.customerCheckout);

    // Pass simple data to the Payment page.
    this.checkoutData.address =
      this.customerCheckout.deliveryAddress +
      (this.customerCheckout.landmark ?
        ", " + this.customerCheckout.landmark : "");

    this.checkoutData.phone =
      this.customerCheckout.phoneNumber;

    this.checkoutData.cartItems =
      this.cartService.cartItems();

    this.checkoutData.total =
      this.customerCheckout.grandTotal;

    // Pass bill breakdown to Payment page.
    this.checkoutData.foodTotal =
      this.customerCheckout.subTotal;

    this.checkoutData.gstAmount =
      this.customerCheckout.gstAmount;

    this.checkoutData.deliveryFee =
      this.customerCheckout.deliveryCharge;

    this.checkoutData.platformFee =
      this.customerCheckout.platformFee;

    this.checkoutData.couponDiscount =
      this.customerCheckout.discountAmount;

    // Open Payment Page.
    this.router.navigate(['/payment']);

  }

}