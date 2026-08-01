// Import Component decorator.
import { Component } from '@angular/core';
import { signal } from '@angular/core';

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

 cartItems = signal<CartItem[]>([]);

constructor(private cartService: CartService){

    this.cartItems = this.cartService.cartItems;

}
  increaseQuantity(menuId:number):void {
    this.cartService.increaseQuantity(menuId);
  }

  decreaseQuantity(menuId:number):void {
    this.cartService.decreaseQuantity(menuId);
  }
  removeItem(menuId:number):void {
    this.cartService.removeItem(menuId)
  }
  getTotalPrice():number {
    return this.cartService.getTotalPrice();
  }

}