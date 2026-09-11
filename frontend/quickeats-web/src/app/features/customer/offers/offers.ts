import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CouponService } from '../../../core/services/coupon.service';
import { CouponModel } from '../../../core/models/coupon.model';
import { CartService } from '../../../core/services/cart.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './offers.html',
  styleUrl: './offers.scss',
})
export class OffersComponent implements OnInit {
  coupons = signal<CouponModel[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  copiedCode = signal('');

  constructor(
    private couponService: CouponService,
    private cartService: CartService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.couponService.getCoupons().subscribe({
      next: (data: CouponModel[]) => {
        this.coupons.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  getActiveCoupons(): CouponModel[] {
    return this.coupons().filter((c) => c.isActive && !this.isExpired(c));
  }

  getExpiredCoupons(): CouponModel[] {
    return this.coupons().filter((c) => !c.isActive || this.isExpired(c));
  }

  copyCouponCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCode.set(code);
      this.toastr.success(`Coupon code "${code}" copied!`, 'Copied');
      setTimeout(() => this.copiedCode.set(''), 2500);
    });
  }

  isExpired(coupon: CouponModel): boolean {
    return new Date(coupon.expiryDate) < new Date();
  }

  getDaysRemaining(coupon: CouponModel): number {
    const expiry = new Date(coupon.expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  applyCoupon(coupon: CouponModel): void {
    if (this.cartService.cartItems().length === 0) {
      this.toastr.warning('Your cart is empty. Add items before applying a coupon.');
      return;
    }

    if (!coupon.isActive) {
      this.toastr.error('This coupon is no longer active.');
      return;
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      this.toastr.error('This coupon has expired.');
      return;
    }

    const foodTotal = this.cartService.getFoodTotal();
    if (foodTotal < coupon.minimumOrderAmount) {
      this.toastr.error(
        `Minimum order of ₹${coupon.minimumOrderAmount} required. Your cart total is ₹${foodTotal.toFixed(2)}.`,
      );
      return;
    }

    if (coupon.discountAmount >= foodTotal) {
      this.toastr.error('Discount cannot be greater than or equal to the cart total.');
      return;
    }

    this.cartService.couponCode.set(coupon.couponCode);
    this.cartService.appliedCoupon.set(coupon);
    this.toastr.success(`Coupon '${coupon.couponCode}' applied! You save ₹${coupon.discountAmount}.`);
    this.router.navigate(['/checkout']);
  }
}
