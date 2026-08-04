import { Injectable} from '@angular/core';
// 1️⃣ Executes First.
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
// Injectable
// Means Angular can create this service.
//
// signal
// Stores live Wishlist data.
// Whenever Wishlist changes,
// UI updates automatically.

import { WishlistModel } from '../models/wishlist.model';
// 2️⃣ Import Wishlist Model.
// Service stores objects of this type.

@Injectable({

    providedIn: 'root'

    // Angular creates only ONE object
    // of this service.

})

export class WishlistService {

   
private apiUrl = 'https://localhost:7278/api/Wishlist';

    constructor(private http: HttpClient) {
    }
    // Constructor executes automatically.
    // No dependency is required.

    getWishlist(): Observable<WishlistModel[]> {

        // (): WishlistModel[]
        //
        // Means:
        // Returns complete Wishlist.

        return this.http.get<WishlistModel[]>(this.apiUrl);

    }

    addToWishlist(

        newItem: WishlistModel

    ): Observable<WishlistModel> {

        // newItem: WishlistModel
        //
        // Means:
        // Receives one Wishlist object.
return this.http.post<WishlistModel>(this.apiUrl, newItem);
        // Check if same food already exists.

    );
}  

    removeFromWishlist(

        selectedMenuId: number):Observable<any> {

   return this.http.delete(
        `${this.apiUrl}/${selectedMenuId}`
    );

}

    clearWishlist(): void {

        // (): void
        //
        // Means:
        // Returns nothing.
        // Clears Wishlist.

        this.wishlistItems.set([]);

    }

}

/*

WHY DO WE WRITE THIS FILE?

This service manages

✔ Add Wishlist Item

✔ Remove Wishlist Item

✔ View Wishlist

✔ Clear Wishlist

Flow

Restaurant

↓

Wishlist Button

↓

Wishlist Service

↓

Signal

↓

Wishlist Component

↓

HTML

Later

Backend API

↓

Wishlist Service

↓

Component

↓

HTML

*/