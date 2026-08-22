// wishlist.model.ts

// WHY DO WE WRITE THIS FILE?
//
// This file defines the structure
// of one Wishlist Item.
//
// Every item stored inside Wishlist
// must follow this structure.
//
// Flow
//
// Restaurant
//      â†“
// Menu Item
//      â†“
// Wishlist Model
//      â†“
// Wishlist Service
//      â†“
// Wishlist Component

export interface WishlistModel {

    // Unique Wishlist Id.
    wishlistId: number;

    // Food Item Id.
    menuId: number;

    // Restaurant Id.
    restaurantId: number;

    // Restaurant Name.
    restaurantName: string;

    // Food Name.
    foodName: string;

    // Food Image.
    imageUrl: string;

    // Food Price.
    price: number;

    // Food Category.
    category: string;

}
