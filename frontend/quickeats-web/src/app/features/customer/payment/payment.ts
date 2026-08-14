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

// Order service.
import { OrderService } from '../../../core/services/order';

// Payment service.
import { PaymentService } from '../../../core/services/payment.service';

// Cart service.
import { CartService } from '../../../core/services/cart.service';

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
    private router: Router

  ) {

    // Read total amount from Checkout.
    this.amount = this.checkoutData.total;

  }

  // Runs when user clicks "Pay Now".
  payNow(): void {

    // Take the restaurant id from the first cart item.
    const restaurantId =
      this.checkoutData.cartItems[0].menu.restaurantId;

    // Build the order items the Backend expects.
    // Property names must match CreateOrderDto
    // and OrderItemDto in C#.
    const items =
      this.checkoutData.cartItems.map(item => ({
        MenuItemId: item.menu.id,
        Quantity: item.quantity
      }));

    // Create the Order on the Backend.
    // The Backend returns the new order id.
    this.orderService
      .createOrder({

        RestaurantId: restaurantId,

        DeliveryAddress: this.checkoutData.address,

        PhoneNumber: this.checkoutData.phone,

        PaymentMethod: this.paymentMethod,

        Items: items

      })
      .subscribe({

        // Order created successfully.
        next: (orderId: number) => {

          // Create the Payment on the Backend.
          this.placePayment(orderId);

        },

        // Order creation failed.
        error: (err) => {

          console.log(err);

        }

      });

  }

  // Create the Payment for the order.
  placePayment(orderId: number): void {

    this.paymentService
      .addPayment(orderId, this.paymentMethod)
      .subscribe({

        // Payment saved.
        next: () => {

          // Empty cart.
          this.cartService.clearCart();

          // Success message.
          alert("✅ Payment Successful");

          // Navigate.
          this.router.navigate(['/orders']);

        },

        // Payment failed.
        error: (err) => {

          console.log(err);

        }

      });

  }

}
