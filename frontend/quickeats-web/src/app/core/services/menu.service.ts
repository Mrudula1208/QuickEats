import { Injectable } from '@angular/core';
import { Menu } from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  menus: Menu[] = [

    {
      id: 1,
      restaurantId: 1,
      name: 'Veg Pizza',
      price: 299,
      image: 'assets/images/menu/veg-pizza.png',
      category: 'Pizza',
      isVeg: true
    },

    {
      id: 2,
      restaurantId: 1,
      name: 'Cheese Burst Pizza',
      price: 399,
      image: 'assets/images/menu/cheese-pizza.png',
      category: 'Pizza',
      isVeg: true
    },

    {
      id: 3,
      restaurantId: 2,
      name: 'Chicken Burger',
      price: 249,
      image: 'assets/images/menu/chicken-burger.png',
      category: 'Burger',
      isVeg: false
    },

    {
      id: 4,
      restaurantId: 2,
      name: 'Veg Burger',
      price: 199,
      image: 'assets/images/menu/veg-burger.png',
      category: 'Burger',
      isVeg: true
    }

  ];

  getMenus(): Menu[] {
    return this.menus;
  }
getMenusByRestaurantId(restaurantId: number): Menu[] {

  return this.menus.filter(

    menu => menu.restaurantId === restaurantId

  );

}
}