// Import Component decorator.
import { Component } from '@angular/core';

// Import CommonModule.
import { CommonModule } from '@angular/common';

// Import Cart Service.
import { CartService } from '../../../core/services/cart.service';

// Import Cart Item model.
import { CartItem } from '../../../core/models/cart-item.model';
import { RouterLink } from '@angular/router';

@Component({

  selector: 'app-cart',

  standalone: true,

  imports: [CommonModule, RouterLink],

  templateUrl: './cart.html',

  styleUrl: './cart.scss'

})

export class CartComponent {

  // Stores all cart items.
  cartItems: CartItem[] = [];

  constructor(

    // Access cart data.
    private cartService: CartService

  ) {

    // Load cart items.
    this.cartItems = this.cartService.getCartItems();

  }

  // Returns total price.
  getTotalPrice(): number {

    return this.cartService.getTotalPrice();

  }

}