// Import Component decorator.
import { Component, signal } from '@angular/core';

// Import CommonModule.
import { CommonModule } from '@angular/common';

// Import FormsModule for the coupon box.
import { FormsModule } from '@angular/forms';

// Import Cart Service.
import { CartService } from '../../../core/services/cart.service';

// Import Cart Item model.
import { CartItem } from '../../../core/models/cart-item.model';

// Import Restaurant Service to show restaurant name.
import { RestaurantService } from '../../../core/services/restaurant.service';

// Import Router for page navigation.
import { Router } from '@angular/router';

@Component({

  selector: 'app-cart',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './cart.html',

  styleUrl: './cart.scss'

})

export class CartComponent {

  cartItems = signal<CartItem[]>([]);

  // Restaurant name of the current order.
  restaurantName = '';

  // Restaurant delivery settings.
  deliveryCharge = 0;
  minimumOrder = 0;

  // Coupon code typed by the customer.
  couponInput = '';

  // Message after applying a coupon.
  couponMessage = '';

  constructor(
    private cartService: CartService,
    private restaurantService: RestaurantService,
    private router: Router
  ) {

    this.cartItems = this.cartService.cartItems;

    this.loadRestaurantName();

  }

  // Load the restaurant name from the first cart item.
  loadRestaurantName(): void {

    const firstItem = this.cartItems()[0];

    if (!firstItem) return;

    this.restaurantService
      .getRestaurantById(firstItem.menu.restaurantId)
      .subscribe({

        next: (data) => {

          this.restaurantName = data.name;
          this.deliveryCharge = data.deliveryCharge;
          this.minimumOrder = data.minimumOrder;

          // Pass delivery settings to CartService.
          this.cartService.setDeliverySettings(
            data.deliveryCharge,
            500,
            data.minimumOrder
          );

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  increaseQuantity(menuId: number): void {
    this.cartService.increaseQuantity(menuId);
  }

  decreaseQuantity(menuId: number): void {
    this.cartService.decreaseQuantity(menuId);
  }

  removeItem(menuId: number): void {
    this.cartService.removeItem(menuId);
  }

  // Empty the whole cart.
  emptyCart(): void {
    this.cartService.clearCart();
    this.restaurantName = '';
  }

  // Apply the coupon code.
  applyCoupon(): void {

    this.cartService
      .applyCoupon(this.couponInput)
      .subscribe({
        next: (errorMsg) => {

          if (errorMsg === '') {

            this.couponMessage = '';
            this.couponInput = '';

          }
          else {

            this.couponMessage = errorMsg;

          }

        },
        error: (err) => {

          console.log(err);

          this.couponMessage = 'Coupon not available.';

        }
      });

  }

  // Remove the applied coupon.
  removeCoupon(): void {

    this.cartService.removeCoupon();
    this.couponMessage = '';

  }

  // Get the applied coupon code.
  getCouponCode(): string {

    return this.cartService.getCouponCode();

  }

  // Bill values from CartService.
  getSubTotal(): number { return this.cartService.getSubTotal(); }
  getFoodTotal(): number { return this.cartService.getFoodTotal(); }
  getGstAmount(): number { return this.cartService.getGstAmount(); }
  getPlatformFee(): number { return this.cartService.getPlatformFee(); }
  getDeliveryFee(): number { return this.cartService.getDeliveryFee(); }
  getCouponDiscount(): number { return this.cartService.getCouponDiscount(); }
  getGrandTotal(): number { return this.cartService.getGrandTotal(); }
  isBelowMinimumOrder(): boolean { return this.cartService.isBelowMinimumOrder(); }

  // Open the Checkout page.
  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

}
