import { Injectable, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { MenuItem } from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // Stores all cart items.
  cartItems = signal<CartItem[]>([]);

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

  // Calculate grand total.
  getTotalPrice(): number {

    return this.cartItems().reduce(

      (total, item) => total + (item.menu.price * item.quantity),

      0

    );

  }

}