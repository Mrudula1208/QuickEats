import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import {Menu} from "../models/menu.model"


@Injectable({
  providedIn: 'root',
})
export class CartService {
   private cart: CartItem[] = [];

   getCartItems():CartItem[]{
    return this.cart;

   }
addToCart(menu:Menu):void{
  const existingItem=this.cart.find(
    item=>item.menuItem.id===menu.id);
if(existingItem){existingItem.quantity++;

}
  
else{
  this.cart.push({
    menuItem:menu,
    quantity:1
  })
}
}




removeFromCart(menu:Menu):void{
  const existingItem=this.cart.find(
    item=>item.menuItem.id===menu.id
 );
if(existingItem){
  existingItem.quantity --;
  if(existingItem.quantity===0){
    this.cart=this.cart.filter( item => item.menuItem.id !== menu.id
)
  }
}
 }
 clearCart():void{
  this.cart=[];
 }
 getTotalItem ():number{
  let total=0;
  this.cart.forEach(item=>{
     total+=item.quantity;
   });
 
 return total;
}
getTotalPrice():number{
  let total =0;
  this.cart.forEach(item =>{
    total+=item.menuItem.price * item.quantity;
  });
  return total;
}
}

