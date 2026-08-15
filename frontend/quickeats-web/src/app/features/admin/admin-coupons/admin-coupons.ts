import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../../../core/services/coupon.service';
import { CouponModel } from '../../../core/models/coupon.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
@Component({
  selector: 'app-admin-coupons',
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-coupons.html',
  styleUrl: './admin-coupons.scss',
})
export class AdminCoupons {
  coupons: CouponModel[] = [];
  couponCode: string = '';
  description: string = '';
  minimumOrderAmount: number = 0;
  discountAmount: number = 0;
  expiryDate: string = '';
  isActive: boolean = true;

  constructor(private couponService: CouponService) {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.couponService.getCoupons().subscribe({
      next: (data: CouponModel[]) => {
        this.coupons = data;
        console.log(this.coupons);
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  createCoupon(): void {
    const coupon = {
      couponCode: this.couponCode,
      description: this.description,
      minimumOrderAmount: this.minimumOrderAmount,
      discountAmount: this.discountAmount,
      expiryDate: this.expiryDate,
      isActive: this.isActive
    };

    this.couponService.createCoupon(coupon).subscribe({
      next: () => {
        console.log('Coupon Created');
        this.couponCode = '';
        this.description = '';
        this.minimumOrderAmount = 0;
        this.discountAmount = 0;
        this.expiryDate = '';
        this.isActive = true;
        this.loadCoupons();
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  deleteCoupon(id: number): void {
    this.couponService.deleteCoupon(id).subscribe({
      next: () => {
        console.log('Coupon Deleted');
        this.loadCoupons();
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }
}
