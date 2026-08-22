// coupon.model.ts

// WHY DO WE WRITE THIS FILE?
//
// This file defines the structure of one Coupon.
//
// Every coupon inside the application
// must follow this structure.
//
// Flow
//
// Database
//      â†“
// Backend API
//      â†“
// Coupon Model
//      â†“
// Coupon Service
//      â†“
// Coupon Component

export interface CouponModel {

    // Unique Coupon Id.
    couponId: number;

    // Coupon Code.
    // Example:
    // WELCOME50
    couponCode: string;

    // Coupon Description.
    description: string;

    // Minimum order amount required.
    minimumOrderAmount: number;

    // Discount amount.
    discountAmount: number;

    // Expiry Date.
    expiryDate: Date;

    // Coupon Status.
    // true = Active
    // false = Expired
    isActive: boolean;

}
