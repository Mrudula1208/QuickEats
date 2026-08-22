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

import { CartService } from '../../../core/services/cart.service';
// CartService.
// Applies coupon to cart.

import { ToastrService } from 'ngx-toastr';
// ToastrService.
// Shows success or error messages.

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

    // Cart Service.
    private cartService: CartService,

    // Router.
    private router: Router,

    // Toast notifications.
    private toastr: ToastrService

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


        },

        //
        // error
        // Runs if API Fails.
        //
        error: () => {}

      });

  }

  // ==========================================
  // APPLY COUPON
  // ==========================================

  // applyCoupon
  // Applies Coupon and navigates to checkout.
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
    // Check if cart is empty.
    //
    if (this.cartService.cartItems().length === 0) {

      this.toastr.warning('Your cart is empty. Add items before applying a coupon.');

      return;

    }

    //
    // Check if coupon is active.
    //
    if (!selectedCoupon.isActive) {

      this.toastr.error('This coupon is no longer active.');

      return;

    }

    //
    // Check if coupon is expired.
    //
    const now = new Date();

    if (new Date(selectedCoupon.expiryDate) < now) {

      this.toastr.error('This coupon has expired.');

      return;

    }

    //
    // Check if order meets minimum amount.
    //
    const foodTotal = this.cartService.getFoodTotal();

    if (foodTotal < selectedCoupon.minimumOrderAmount) {

      this.toastr.error(
        `Minimum order of â‚¹${selectedCoupon.minimumOrderAmount} required. Your cart total is â‚¹${foodTotal.toFixed(2)}.`
      );

      return;

    }

    //
    // Check if discount exceeds food total.
    //
    if (selectedCoupon.discountAmount >= foodTotal) {

      this.toastr.error('Discount cannot be greater than or equal to the cart total.');

      return;

    }

    //
    // Apply the coupon to cart.
    //
    this.cartService.couponCode.set(selectedCoupon.couponCode);

    this.cartService.appliedCoupon.set(selectedCoupon);

    //
    // Show success message.
    //
    this.toastr.success(`Coupon '${selectedCoupon.couponCode}' applied! You save â‚¹${selectedCoupon.discountAmount}.`);

    //
    // Navigate to Checkout Page.
    //
    this.router.navigate(['/checkout']);

  }

}
