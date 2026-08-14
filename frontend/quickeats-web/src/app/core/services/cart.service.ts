import { Injectable, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { MenuItem } from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // Stores all cart items.
  cartItems = signal<CartItem[]>([]);

  // Applied coupon code.
  couponCode = signal<string>('');

  // Coupon codes and their discounts.
  // code -> discount (percent or amount)
  private coupons: { [code: string]: string } = {
    SAVE10: '10%',
    SAVE20: '20%',
    FLAT50: '50'
  };

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

  // Free delivery above ₹500, otherwise ₹40.
  getDeliveryFee(): number {

    return this.getFoodTotal() >= 500 ? 0 : 40;

  }

  // Coupon discount.
  getCouponDiscount(): number {

    const code = this.couponCode();

    const value = this.coupons[code];

    if (!value) return 0;

    if (value.endsWith('%')) {

      const percent = Number(value.replace('%', ''));

      return (this.getFoodTotal() * percent) / 100;

    }

    return Number(value);

  }

  // Grand total = food + gst + platform + delivery - coupon.
  getGrandTotal(): number {

    return this.getFoodTotal() +

      this.getGstAmount() +

      this.getPlatformFee() +

      this.getDeliveryFee() -

      this.getCouponDiscount();

  }

  // Apply a coupon code.
  // Returns true if the coupon is valid.
  applyCoupon(code: string): boolean {

    const value = this.coupons[code.trim().toUpperCase()];

    if (value) {

      this.couponCode.set(code.trim().toUpperCase());

      return true;

    }

    return false;

  }

  // Remove the applied coupon.
  removeCoupon(): void {

    this.couponCode.set('');

  }

}
