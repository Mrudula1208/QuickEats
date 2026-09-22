import { Component, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { CouponService } from '../../../core/services/coupon.service';

import { CouponModel } from '../../../core/models/coupon.model';

import { CartService } from '../../../core/services/cart.service';

import { ToastrService } from 'ngx-toastr';

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
  coupons = signal<CouponModel[]>([]);

  // Loading state.
  isLoading = signal(true);

  // Error state.
  loadError = signal('');

  constructor(
    private couponService: CouponService,
    private cartService: CartService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loadCoupons();
  }

  // ==========================================
  // LOAD COUPONS
  // ==========================================
  loadCoupons(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.couponService
      .getCoupons()
      .subscribe({
        next: (data: CouponModel[]) => {
          this.coupons.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set('Could not load coupons. Please try again.');
          this.toastr.error('Failed to load coupons');
        }
      });
  }

  retry(): void {
    this.loadCoupons();
  }

  // ==========================================
  // APPLY COUPON
  // ==========================================
  applyCoupon(selectedCoupon: CouponModel): void {

    // Check if cart is empty.
    if (this.cartService.cartItems().length === 0) {
      this.toastr.warning('Your cart is empty. Add items before applying a coupon.');
      return;
    }

    // Check if coupon is active.
    if (!selectedCoupon.isActive) {
      this.toastr.error('This coupon is no longer active.');
      return;
    }

    // Check if coupon is expired.
    const now = new Date();
    if (new Date(selectedCoupon.expiryDate) < now) {
      this.toastr.error('This coupon has expired.');
      return;
    }

    // Check if order meets minimum amount.
    const foodTotal = this.cartService.getFoodTotal();
    if (foodTotal < selectedCoupon.minimumOrderAmount) {
      this.toastr.error(
        `Minimum order of ₹${selectedCoupon.minimumOrderAmount} required. Your cart total is ₹${foodTotal.toFixed(2)}.`
      );
      return;
    }

    // Check if discount exceeds food total.
    if (selectedCoupon.discountAmount >= foodTotal) {
      this.toastr.error('Discount cannot be greater than or equal to the cart total.');
      return;
    }

    // Apply the coupon to cart.
    this.cartService.couponCode.set(selectedCoupon.couponCode);
    this.cartService.appliedCoupon.set(selectedCoupon);

    // Show success message.
    this.toastr.success(`Coupon '${selectedCoupon.couponCode}' applied! You save ₹${selectedCoupon.discountAmount}.`);

    // Navigate to Checkout Page.
    this.router.navigate(['/checkout']);
  }

}