import { Component } from '@angular/core';
// Component.
// Controls Coupon Page.

import { CommonModule } from '@angular/common';
// CommonModule.
// Used for @if and @for.

import { Router } from '@angular/router';
// Router.
// Opens another page.

import { CouponService } from '../../../core/services/coupon.service';
// CouponService.
// Calls Coupon APIs.

import { CouponModel } from '../../../core/models/coupon.model';
// CouponModel.
// Defines one Coupon.

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

  // Store Coupons.
  coupons: CouponModel[] = [];

  constructor(

    // Coupon Service.
    private couponService: CouponService,

    // Router.
    private router: Router

  ) {

    // Load Coupons.
    this.loadCoupons();

  }

  // ==========================================
  // LOAD COUPONS
  // ==========================================

  // loadCoupons
  // Gets all Coupons.
  //
  // ()
  // No Input.
  //
  // : void
  // Returns Nothing.
  loadCoupons(): void {

    this.couponService
      .getCoupons()
      .subscribe({

        //
        // next
        // Runs if API Success.
        //
        next: (data: CouponModel[]) => {

          //
          // this
          // Current Component.
          //
          // coupons
          // Store Coupons.
          //
          // =
          // Assign Value.
          //
          // data
          // Backend Response.
          //
          this.coupons = data;

          console.log(this.coupons);

        },

        //
        // error
        // Runs if API Fails.
        //
        error: (err: any) => {

          console.log(err);

        }

      });

  }

  // ==========================================
  // APPLY COUPON
  // ==========================================

  // applyCoupon
  // Applies Coupon.
  //
  // selectedCoupon
  // Selected Coupon.
  //
  // : void
  // Returns Nothing.
  applyCoupon(

    selectedCoupon: CouponModel

  ): void {

    //
    // selectedCoupon
    // Coupon selected by customer.
    //
    console.log(selectedCoupon);

    //
    // this
    // Current Component.
    //
    // router
    // Router Object.
    //
    // navigate()
    // Open another page.
    //
    this.router.navigate([

      '/checkout'

    ]);

  }

}