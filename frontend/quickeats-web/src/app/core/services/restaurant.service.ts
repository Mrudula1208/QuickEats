
import { Injectable } from '@angular/core';

import { Restaurant } from '../models/restaurant.model';



@Injectable({

  providedIn: 'root'

})

export class RestaurantService {

  
  restaurants: Restaurant[] = [

    {

      id: 1,

      name: 'Pizza Palace',

      image: 'assets/images/restaurants/pizza-palace.jpg',

      rating: 4.5,

      deliveryTime: '25 min',

      location: 'Andheri',

      priceForTwo: 400,

      discount: '20% OFF',

      freeDelivery: true

    }

  ];



  // This function returns
  // all restaurants.
  //
  // Later instead of returning
  // an array,
  // it will call Backend API.
  getRestaurants(): Restaurant[] {

    return this.restaurants;

  }

}