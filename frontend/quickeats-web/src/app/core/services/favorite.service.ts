import { Injectable, signal } from '@angular/core';
// Injectable creates Angular Service.
// signal stores live Favorite data.

import { FavoriteModel } from '../models/favorite.model';
// Import Favorite Model.

@Injectable({

providedIn:'root'

})

export class FavoriteService{

// Store all favorite restaurants.
favoriteRestaurants =

signal<FavoriteModel[]>([]);

constructor(){

}

// Return all favorites.
getFavorites():FavoriteModel[]{

return this.favoriteRestaurants();

}

// Add restaurant into favorites.
addFavorite(

favorite:FavoriteModel

):void{

const favorites=[

...this.favoriteRestaurants()

];

favorites.push(

favorite

);

this.favoriteRestaurants.set(

favorites

);

console.log("Favorite Added");

console.log(this.favoriteRestaurants());

}

}