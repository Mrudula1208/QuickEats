// Import Component decorator.
import { Component } from '@angular/core';

// Import CommonModule.
import { CommonModule } from '@angular/common';

// Required for ngModel.
import { FormsModule } from '@angular/forms';

// Used for page navigation.
import { Router } from '@angular/router';

// Checkout data service.
import { CheckoutDataService } from '../../../core/services/checkout-data.service';

// Order model.
import { Order } from '../../../core/models/order';

// Order service.
import { OrderService } from '../../../core/services/order';

// Payment model.
import { Payment } from '../../../core/models/payment.model';

// Payment service.
import { PaymentService } from '../../../core/services/payment.service';

// Cart service.
import { CartService } from '../../../core/services/cart.service';
import { Delivery } from '../../../core/models/delivery.model';

import { DeliveryService } from '../../../core/services/delivery.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})

export class PaymentComponent {

  // Stores total amount to display on screen.
  amount = 0;

  // Stores selected payment method.
  paymentMethod = 'Cash On Delivery';

  constructor(

    // Reads data entered on Checkout page.
    private checkoutData: CheckoutDataService,

    // Saves completed orders.
    private orderService: OrderService,

    // Clears cart after successful payment.
    private cartService: CartService,

    // Saves payment information.
    private paymentService: PaymentService,

    // Used for page navigation.
    private router: Router,
    private deliveryService: DeliveryService,

  ) {

    // Read total amount from Checkout.
    this.amount = this.checkoutData.total;

  }

  // Runs when user clicks "Pay Now".
  payNow(): void {

    // Create one unique id.
    // We use the same id for both
    // Order and Payment.
    const orderId = Date.now();

    // Create Order object.
    const order: Order = {

      id: orderId,

      address: this.checkoutData.address,

      phone: this.checkoutData.phone,

      items: this.checkoutData.cartItems,

      total: this.checkoutData.total,

      date: new Date()

    };

    // Save order into OrderService.
    this.orderService.PlaceOrder(order);

    // Create Payment object.
    const payment: Payment = {

      // Payment Id.
      id: orderId,

      // Connected Order Id.
      orderId: orderId,

      // Total amount paid.
      amount: order.total,

      // Selected payment method.
      method: this.paymentMethod,

      // Payment status.
      status: 'Paid',

      // Payment date.
      date: new Date()

    };

    // Save payment into PaymentService.
  // Save payment.
this.paymentService.savePayment(payment);

// Create Delivery object.
const delivery: Delivery = {

  id: orderId,

  orderId: orderId,

  partnerName: "Rahul Sharma",

  partnerPhone: "9876543210",

  bikeNumber: "MH12AB1234",

  estimatedTime: "30 Minutes",

  status: "Preparing"

};

// Save Delivery.
this.deliveryService.saveDelivery(delivery);

// ===== DEBUG =====
console.log("Delivery Saved");
console.log(delivery);

console.log("All Deliveries");
console.log(this.deliveryService.getDeliveries());

// Empty cart.
this.cartService.clearCart();

// Success message.
alert("✅ Payment Successful");

// Navigate.
this.router.navigate(['/payments']);
  }
}
/*

WHY DO WE WRITE THIS FILE?

This component performs the complete
payment process.

Flow

Cart
   ↓

Checkout
   ↓

CheckoutDataService
   ↓

Payment (THIS FILE)
   ↓

Create Order Object
   ↓

Save Order
   ↓

Create Payment Object
   ↓

Save Payment
   ↓

Clear Cart
   ↓

Payment History

This component:

1. Reads Checkout data.
2. Displays total amount.
3. Lets user select payment method.
4. Creates an Order object.
5. Saves the Order.
6. Creates a Payment object.
7. Saves the Payment.
8. Clears the shopping cart.
9. Opens Payment History.

*/