
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

      image: 'assets/images/restaurants/pizza-palace.png',

      rating: 4.5,

      deliveryTime: '25 min',

      location: 'Andheri',

      priceForTwo: 400,

      discount: '20% OFF',

      freeDelivery: true

    },
  {
    id: 2,
    name: 'Burger House',
    image: 'assets/images/restaurants/burger.png',
    rating: 4.7,
    deliveryTime: '20 min',
    location: 'Bandra',
    priceForTwo: 350,
    discount: '30% OFF',
    freeDelivery: false
  },{
  id: 3,
  name: 'Biryani King',
  image: 'assets/images/restaurants/biryani.png',
  rating: 4.8,
  deliveryTime: '35 min',
  location: 'Powai',
  priceForTwo: 500,
  discount: '15% OFF',
  freeDelivery: true
},

{
  id: 4,
  name: 'Fresh Drinks',
  image: 'assets/images/restaurants/drinks.png',
  rating: 4.4,
  deliveryTime: '15 min',
  location: 'Juhu',
  priceForTwo: 200,
  discount: '10% OFF',
  freeDelivery: true
}


,{
  id: 5,
  name: 'Spicy Tandoor',
  image: 'assets/images/restaurants/tandoor.png',
  rating: 4.9,
  deliveryTime: '30 min',
  location: 'Malad',
  priceForTwo: 550,
  discount: '25% OFF',
  freeDelivery: true
},

{
  id: 6,
  name: 'Sweet Delights',
  image: 'assets/images/restaurants/dessert.png',
  rating: 4.6,
  deliveryTime: '18 min',
  location: 'Goregaon',
  priceForTwo: 300,
  discount: 'Buy 1 Get 1',
  freeDelivery: false
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