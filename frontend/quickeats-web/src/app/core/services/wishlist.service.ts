import { Injectable, signal } from '@angular/core';
// 1️⃣ Executes First.
//
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

    // ==================================================
    // EXECUTION FLOW
    // ==================================================
    //
    // 1️⃣ Angular creates WishlistService.
    //
    // 2️⃣ wishlistItems signal is created.
    //
    // 3️⃣ Component calls getWishlist().
    //
    // 4️⃣ HTML displays Wishlist.
    //
    // 5️⃣ Customer adds item.
    //
    // 6️⃣ Signal updates.
    //
    // 7️⃣ UI refreshes automatically.
    //
    // ==================================================

    wishlistItems = signal<WishlistModel[]>([]);
    // signal<WishlistModel[]>
    //
    // Means:
    // Store multiple wishlist items.
    //
    // Initially Wishlist is empty.

    constructor() {

    }
    // Constructor executes automatically.
    // No dependency is required.

    getWishlist(): WishlistModel[] {

        // (): WishlistModel[]
        //
        // Means:
        // Returns complete Wishlist.

        return this.wishlistItems();

    }

    addToWishlist(

        newItem: WishlistModel

    ): void {

        // newItem: WishlistModel
        //
        // Means:
        // Receives one Wishlist object.

        const currentWishlist =

            [...this.wishlistItems()];

        // Copy current Wishlist.

        const alreadyExists =

            currentWishlist.find(

                item =>

                item.menuId === newItem.menuId

            );

        // Check if same food already exists.

        if (alreadyExists) {

            return;

        }

        currentWishlist.push(

            newItem

        );

        // Add new item.

        this.wishlistItems.set(

            currentWishlist

        );

        // Update Signal.

        console.log("Wishlist Updated");

        console.log(this.wishlistItems());

    }

    removeFromWishlist(

        selectedMenuId: number

    ): void {

        // selectedMenuId: number
        //
        // Means:
        // Remove selected food item.

        this.wishlistItems.set(

            this.wishlistItems().filter(

                item =>

                item.menuId !== selectedMenuId

            )

        );

        console.log("Wishlist Item Removed");

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