// Import Component decorator.
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/cart-item.model';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],

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

  // Loading and error states for restaurant info.
  isLoadingRestaurant = true;
  restaurantLoadError: string | null = null;

  // Applied coupon code (used to disable input while one is applied).
  isApplyingCoupon = false;

  constructor(
    private cartService: CartService,
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private router: Router
  ) {

    this.cartItems = this.cartService.cartItems;

    this.loadRestaurantName();

  }

  // Load the restaurant name from the first cart item.
  loadRestaurantName(): void {

    const firstItem = this.cartItems()[0];

    if (!firstItem) {
      this.isLoadingRestaurant = false;
      return;
    }

    this.isLoadingRestaurant = true;
    this.restaurantLoadError = null;

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

          this.isLoadingRestaurant = false;

        },

        error: () => {
          this.isLoadingRestaurant = false;
          this.restaurantLoadError = 'Could not load the restaurant details. Delivery charges may not be accurate.';
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

    if (!this.couponInput.trim()) {
      this.couponMessage = 'Please enter a coupon code.';
      return;
    }

    this.isApplyingCoupon = true;
    this.couponMessage = '';

    this.cartService
      .applyCoupon(this.couponInput)
      .subscribe({
        next: (errorMsg) => {

          this.isApplyingCoupon = false;

          if (errorMsg === '') {

            this.couponMessage = '';
            this.couponInput = '';

          }
          else {

            this.couponMessage = errorMsg;

          }

        },
        error: () => {

          this.isApplyingCoupon = false;
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
  // If the customer is not logged in, redirect to Login
  // (Checkout requires authentication).
  goToCheckout(): void {

    if (!this.authService.isLoggedIn()) {

      this.router.navigate(['/login'], {

        queryParams: { returnUrl: '/checkout' }

      });

      return;

    }

    this.router.navigate(['/checkout']);

  }

}
