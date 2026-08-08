import { Injectable } from '@angular/core';
// Makes this file an Angular Service.

import { HttpClient } from '@angular/common/http';
// Calls Backend APIs.

import { Observable } from 'rxjs';
// Waits for Backend Response.

import { WishlistModel } from '../models/wishlist.model';
// Wishlist Structure.

@Injectable({

  // One Service Instance.
  providedIn: 'root'

})
export class WishlistService {

  // Backend API URL.
  private apiUrl = 'https://localhost:7278/api/Wishlist';

  constructor(

    // HttpClient Object.
    // Calls Backend APIs.
    private http: HttpClient

  ) { }

  // Get Wishlist.
  // Read all Wishlist Items.
  getWishlist(): Observable<WishlistModel[]> {

    // Go to Backend.
    // Read Wishlist.
    return this.http.get<WishlistModel[]>(this.apiUrl);

  }

  // Add Wishlist Item.
  addToWishlist(

    newItem: WishlistModel

  ): Observable<WishlistModel> {

    // Go to Backend.
    // Save Wishlist Item.
    return this.http.post<WishlistModel>(

      this.apiUrl,

      newItem

    );

  }

  // Remove Wishlist Item.
  removeFromWishlist(

    selectedMenuId: number

  ): Observable<any> {

    // Go to Backend.
    // Delete Wishlist Item.
    return this.http.delete(

      `${this.apiUrl}/${selectedMenuId}`

    );

  }

  // Clear Wishlist.
  clearWishlist(): Observable<any> {

    // Go to Backend.
    // Delete All Wishlist Items.
    return this.http.delete(

      `${this.apiUrl}/clear`

    );

  }

}
