import { Injectable, signal } from '@angular/core';
// 1️⃣ Executes First.
//
// Injectable
// Means Angular creates this service.
//
// signal
// Stores live Coupon data.
// Whenever coupons change,
// UI updates automatically.

import { CouponModel } from '../models/coupon.model';
// 2️⃣ Import CouponModel.
// Service stores Coupon objects.

@Injectable({

    providedIn: 'root'
    // Angular creates only ONE object
    // of this service.

})

export class CouponService {

    // ==========================================
    // EXECUTION FLOW
    // ==========================================
    //
    // 1️⃣ Angular creates CouponService.
    //
    // 2️⃣ coupons signal is created.
    //
    // 3️⃣ Component calls getCoupons().
    //
    // 4️⃣ Coupons are returned.
    //
    // 5️⃣ HTML displays coupons.
    //
    // 6️⃣ Customer selects one coupon.
    //
    // ==========================================

    coupons = signal<CouponModel[]>([

        {

            couponId: 1,

            couponCode: 'WELCOME50',

            description: 'Flat ₹50 OFF',

            minimumOrderAmount: 299,

            discountAmount: 50,

            expiryDate: new Date('2026-12-31'),

            isActive: true

        },

        {

            couponId: 2,

            couponCode: 'SAVE100',

            description: 'Flat ₹100 OFF',

            minimumOrderAmount: 599,

            discountAmount: 100,

            expiryDate: new Date('2026-12-31'),

            isActive: true

        },

        {

            couponId: 3,

            couponCode: 'FOOD20',

            description: '20% OFF',

            minimumOrderAmount: 799,

            discountAmount: 150,

            expiryDate: new Date('2026-12-31'),

            isActive: true

        }

    ]);

    // signal<CouponModel[]>
    //
    // Means:
    // Store multiple coupons.
    //
    // Later these coupons
    // will come from ASP.NET Backend.

    constructor() {

    }
    // Constructor runs automatically.

    getCoupons(): CouponModel[] {

        // (): CouponModel[]
        //
        // Means:
        // Return all coupons.

        return this.coupons();

    }

    getCouponByCode(

        enteredCouponCode: string

    ): CouponModel | undefined {

        // enteredCouponCode: string
        //
        // Customer enters
        // coupon code.

        return this.coupons().find(

            coupon =>

            coupon.couponCode === enteredCouponCode

            &&

            coupon.isActive

        );

    }

}

/*

WHY DO WE WRITE THIS FILE?

This service manages

✔ Get Coupons

✔ Search Coupon

✔ Validate Coupon

Flow

Coupon Page

↓

Coupon Service

↓

Coupon Data

↓

HTML

Later

Backend API

↓

Coupon Service

↓

Coupon Page

*/