import { Component } from '@angular/core';
// 1️⃣ Executes First.
// Import Component because every Angular page starts with Component.

import { CommonModule } from '@angular/common';
// Import CommonModule.
// Required because HTML uses @for and @if.

import { Router } from '@angular/router';
// Import Router.
// Used to open Restaurant Details page.

import { WishlistService } from '../../../core/services/wishlist.service';
// Import WishlistService.
// All wishlist logic is written inside this service.

import { WishlistModel } from '../../../core/models/wishlist.model';
// Import WishlistModel.
// Defines the structure of one wishlist item.

@Component({

  selector: 'app-wishlist',
  // HTML selector.

  standalone: true,
  // Standalone component.
  // No AppModule registration required.

  imports: [

    CommonModule

  ],

  templateUrl: './wishlist.html',
  // Connect HTML file.

  styleUrl: './wishlist.scss'
  // Connect CSS file.

})

export class WishlistComponent {

  // ===============================================
  // EXECUTION FLOW
  // ===============================================
  //
  // 1️⃣ Angular creates WishlistComponent.
  //
  // 2️⃣ Constructor executes automatically.
  //
  // 3️⃣ loadWishlist() executes.
  //
  // 4️⃣ Service returns all wishlist items.
  //
  // 5️⃣ HTML displays Wishlist.
  //
  // 6️⃣ Customer clicks Remove.
  //
  // 7️⃣ Service removes item.
  //
  // 8️⃣ HTML refreshes automatically.
  //
  // ===============================================

  wishlistItems: WishlistModel[] = [];
  // WishlistModel[]
  //
  // Means:
  // Store multiple wishlist items.

  constructor(

    private wishlistService: WishlistService,
    // Angular automatically gives WishlistService object.

    private router: Router
    // Router is used for navigation.

  ) {

    // Constructor runs automatically
    // when page opens.

    this.loadWishlist();

  }

  loadWishlist(): void {

    // (): void
    //
    // Means:
    // This method returns nothing.
    // It only loads data.


      this.wishlistService.getWishlist().subscribe({
        next :(data :WishlistModel[]) => {
          this.wishlistItems=data;
        },

            error: (err: any) => {

                console.log(err);

            }
      });
    
    

  }
removeWishlistItem(
    selectedMenuId: number
): void {

    this.wishlistService
        .removeFromWishlist(selectedMenuId)
        .subscribe({

            next: () => {

                this.loadWishlist();

            },

            error: (err: any) => {

                console.log(err);

            }

        });

}
  openRestaurant(

    selectedRestaurantId: number

  ): void {

    // Open Restaurant Details page.

    this.router.navigate([

      '/restaurant',

      selectedRestaurantId

    ]);

  }

}

/*

WHY DO WE WRITE THIS FILE?

This component controls

✔ View Wishlist

✔ Remove Wishlist Item

✔ Open Restaurant

Flow

Wishlist Page Opens

↓

Constructor Executes

↓

loadWishlist()

↓

Wishlist Service

↓

Wishlist Items

↓

HTML Displays Cards

↓

Customer Removes Item

↓

Service Updates

↓

HTML Refreshes

*/