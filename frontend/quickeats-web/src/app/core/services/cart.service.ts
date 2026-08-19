import { Injectable, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { MenuItem } from '../models/menu.model';
import { CouponService } from './coupon.service';
import { CouponModel } from '../models/coupon.model';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // Stores all cart items.
  cartItems = signal<CartItem[]>([]);

  // Applied coupon code.
  couponCode = signal<string>('');

  // Applied coupon details.
  appliedCoupon = signal<CouponModel | null>(null);

  // Delivery charge from the restaurant (default 40).
  deliveryCharge = signal<number>(40);

  // Free delivery threshold per restaurant.
  freeDeliveryThreshold = signal<number>(500);

  // Minimum order amount per restaurant.
  minimumOrder = signal<number>(0);

  constructor(
    private couponService: CouponService
  ) { }

  // Set restaurant delivery settings.
  setDeliverySettings(charge: number, freeThreshold: number, minOrder: number): void {
    this.deliveryCharge.set(charge);
    this.freeDeliveryThreshold.set(freeThreshold);
    this.minimumOrder.set(minOrder);
  }

  // Check if cart meets minimum order.
  isBelowMinimumOrder(): boolean {
    return this.getFoodTotal() < this.minimumOrder() && this.minimumOrder() > 0;
  }

  // Add food into cart.
  addToCart(menu: MenuItem): void {

    // Copy current cart items.
    const items = [...this.cartItems()];

    // Find if item already exists.
    const existingItem = items.find(x => x.menu.id === menu.id);

    if (existingItem) {

      // Increase quantity.
      existingItem.quantity++;

    }
    else {

      // Add new item.
      items.push({

        menu: menu,

        quantity: 1

      });

    }

    // Update Signal.
    this.cartItems.set(items);

    console.log("Cart Updated");

    console.log(this.cartItems());

  }

  // Remove item from cart.
  removeItem(menuId: number): void {

    this.cartItems.set(

      this.cartItems().filter(x => x.menu.id !== menuId)

    );

  }

  // Increase quantity.
  increaseQuantity(menuId: number): void {

    const items = [...this.cartItems()];

    const item = items.find(x => x.menu.id === menuId);

    if (item) {

      item.quantity++;

    }

    this.cartItems.set(items);

  }

  // Decrease quantity.
  decreaseQuantity(menuId: number): void {

    const items = [...this.cartItems()];

    const item = items.find(x => x.menu.id === menuId);

    if (!item) return;

    if (item.quantity > 1) {

      item.quantity--;

    }
    else {

      this.removeItem(menuId);

      return;

    }

    this.cartItems.set(items);

  }

  // Empty the whole cart.
  clearCart(): void {

    this.cartItems.set([]);

    this.couponCode.set('');

    this.appliedCoupon.set(null);

  }

  // =============================================
  // Bill Calculations
  // =============================================

  // Food total (before taxes and fees).
  getSubTotal(): number {

    return this.cartItems().reduce(

      (total, item) => total + (item.menu.price * item.quantity),

      0

    );

  }

  // Discounted food total after menu discounts.
  getFoodTotal(): number {

    return this.cartItems().reduce(

      (total, item) => {

        const price = item.menu.price;

        const discount = (price * (item.menu.discountPercent || 0)) / 100;

        return total + ((price - discount) * item.quantity);

      },

      0

    );

  }

  // GST = 5%.
  getGstAmount(): number {

    return this.getFoodTotal() * 0.05;

  }

  // Platform fee is always ₹10.
  getPlatformFee(): number {

    return 10;

  }

  // Delivery fee: free if food total >= threshold, otherwise restaurant's charge.
  getDeliveryFee(): number {

    return this.getFoodTotal() >= this.freeDeliveryThreshold() ? 0 : this.deliveryCharge();

  }

  // Coupon discount.
  getCouponDiscount(): number {

    const coupon = this.appliedCoupon();

    if (!coupon) return 0;

    return coupon.discountAmount;

  }

  // Get the applied coupon code.
  getCouponCode(): string {

    return this.couponCode();

  }

  // Grand total = food + gst + platform + delivery - coupon.
  getGrandTotal(): number {

    const total = this.getFoodTotal() +

      this.getGstAmount() +

      this.getPlatformFee() +

      this.getDeliveryFee() -

      this.getCouponDiscount();

    // Ensure total never goes below zero.
    return total < 0 ? 0 : total;

  }

  // Apply a coupon code.
  // Checks the coupon with the Backend.
  // Returns empty string on success, error message on failure.
  applyCoupon(code: string): Observable<string> {

    if (!code || code.trim() === '') {

      return of('Please enter a coupon code.');

    }

    return this.couponService
      .getCouponByCode(code)
      .pipe(
        map((coupon) => {

          if (!coupon.isActive) {

            return 'This coupon is no longer active.';

          }

          const now = new Date();

          if (new Date(coupon.expiryDate) < now) {

            return 'This coupon has expired.';

          }

          if (this.getFoodTotal() < coupon.minimumOrderAmount) {

            return `Minimum order of ₹${coupon.minimumOrderAmount} required. Your cart total is ₹${this.getFoodTotal().toFixed(2)}.`;

          }

          if (coupon.discountAmount >= this.getFoodTotal()) {

            return 'Discount cannot be greater than or equal to the cart total.';

          }

          this.couponCode.set(coupon.couponCode);

          this.appliedCoupon.set(coupon);

          return '';

        }),
        catchError(() => {

          return of('Invalid coupon code. Please check and try again.');

        })
      );

  }

  // Remove the applied coupon.
  removeCoupon(): void {

    this.couponCode.set('');

    this.appliedCoupon.set(null);

  }

}
