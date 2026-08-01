import { Component } from '@angular/core';
// Import Component because this file controls the Coupons page.

import { CommonModule } from '@angular/common';
// Import CommonModule because HTML uses @if and @for.

import { Router } from '@angular/router';
// Router is used to navigate back to Checkout page.

import { CouponService } from '../../../core/services/coupon.service';
// CouponService contains all coupon logic.

import { CouponModel } from '../../../core/models/coupon.model';
// CouponModel defines one coupon structure.

@Component({

  selector: 'app-coupons',

  standalone: true,

  imports: [

    CommonModule

  ],

  templateUrl: './coupons.html',

  styleUrl: './coupons.scss'

})

export class CouponsComponent {

  // =====================================
  // EXECUTION FLOW
  // =====================================
  //
  // 1. Angular creates CouponsComponent.
  //
  // 2. Constructor executes.
  //
  // 3. loadCoupons() executes.
  //
  // 4. CouponService returns all coupons.
  //
  // 5. Coupons are displayed in HTML.
  //
  // 6. Customer clicks Apply Coupon.
  //
  // 7. applyCoupon() executes.
  //
  // 8. Selected coupon is sent to Checkout.
  //
  // =====================================

  coupons: CouponModel[] = [];
  // CouponModel[]
  // Means:
  // Store multiple coupon objects.

  constructor(

    private couponService: CouponService,
    // Angular automatically injects CouponService.

    private router: Router
    // Router is used for page navigation.

  ) {

    // Constructor runs automatically
    // when page opens.

    this.loadCoupons();

  }

  loadCoupons(): void {

    // (): void
    // Means:
    // This method returns nothing.
    // It only loads coupons.

    this.coupons =

      this.couponService.getCoupons();

    // Read all coupons
    // from CouponService.

    console.log(this.coupons);

  }

  applyCoupon(

    selectedCoupon: CouponModel

  ): void {

    // selectedCoupon: CouponModel
    // Means:
    // Receive one coupon object
    // when customer clicks Apply.

    console.log(

      "Coupon Applied"

    );

    console.log(

      selectedCoupon

    );

    // Later
    // CheckoutService will receive
    // this coupon.

    this.router.navigate([

      '/checkout'

    ]);

  }

}

/*

WHY DO WE WRITE THIS FILE?

This component controls

✔ Display Coupons

✔ Apply Coupon

✔ Navigate Back to Checkout

Flow

Coupons Page Opens

↓

Constructor

↓

loadCoupons()

↓

Coupon Service

↓

Coupons Loaded

↓

HTML

↓

Customer Clicks Apply

↓

applyCoupon()

↓

Checkout Page

*/