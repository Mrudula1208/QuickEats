import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { CouponService } from '../../../core/services/coupon.service';
import { CouponModel } from '../../../core/models/coupon.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-coupons.html',
  styleUrl: './admin-coupons.scss'
})
export class AdminCoupons {

  coupons = signal<CouponModel[]>([]);
  isLoading = signal(true);
  searchText = signal('');
  showForm = signal(false);
  isEditing = signal(false);
  editingId = 0;

  couponCode = '';
  description = '';
  minimumOrderAmount = 100;
  discountAmount = 10;
  expiryDate = '';
  isActive = true;

  filteredCoupons = computed(() => {
    const list = this.coupons();
    const search = this.searchText();
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(c =>
      c.couponCode.toLowerCase().includes(s) ||
      c.description.toLowerCase().includes(s)
    );
  });

  counts = computed(() => {
    const all = this.coupons();
    const now = new Date();
    return {
      total: all.length,
      active: all.filter(c => c.isActive && new Date(c.expiryDate) > now).length,
      expired: all.filter(c => !c.isActive || new Date(c.expiryDate) <= now).length
    };
  });

  constructor(
    private couponService: CouponService,
    private toastr: ToastrService
  ) {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.isLoading.set(true);
    this.couponService.getCoupons().subscribe({
      next: (data) => {
        this.coupons.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastr.error('Failed to load coupons');
      }
    });
  }

  openAddForm(): void {
    this.resetForm();
    this.isEditing.set(false);
    this.showForm.set(true);
  }

  openEditForm(coupon: CouponModel): void {
    this.isEditing.set(true);
    this.editingId = coupon.couponId;
    this.couponCode = coupon.couponCode;
    this.description = coupon.description;
    this.minimumOrderAmount = coupon.minimumOrderAmount;
    this.discountAmount = coupon.discountAmount;
    this.expiryDate = coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '';
    this.isActive = coupon.isActive;
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.couponCode = '';
    this.description = '';
    this.minimumOrderAmount = 100;
    this.discountAmount = 10;
    this.expiryDate = '';
    this.isActive = true;
    this.editingId = 0;
  }

  saveCoupon(): void {
    const dto = {
      couponCode: this.couponCode.toUpperCase(),
      description: this.description,
      minimumOrderAmount: this.minimumOrderAmount,
      discountAmount: this.discountAmount,
      expiryDate: this.expiryDate,
      isActive: this.isActive
    };

    if (this.isEditing()) {
      this.couponService.updateCoupon(this.editingId, dto).subscribe({
        next: () => {
          this.toastr.success('Coupon updated');
          this.closeForm();
          this.loadCoupons();
        },
        error: (err) => this.toastr.error(err.error || 'Failed to update coupon')
      });
    } else {
      this.couponService.createCoupon(dto).subscribe({
        next: () => {
          this.toastr.success('Coupon created');
          this.closeForm();
          this.loadCoupons();
        },
        error: (err) => this.toastr.error(err.error || 'Failed to create coupon')
      });
    }
  }

  deleteCoupon(coupon: CouponModel): void {
    if (!confirm(`Delete coupon "${coupon.couponCode}"?`)) return;
    this.couponService.deleteCoupon(coupon.couponId).subscribe({
      next: () => {
        this.coupons.update(list => list.filter(c => c.couponId !== coupon.couponId));
        this.toastr.success(`${coupon.couponCode} deleted`);
      },
      error: () => this.toastr.error('Failed to delete coupon')
    });
  }

  isExpired(coupon: CouponModel): boolean {
    return !coupon.isActive || new Date(coupon.expiryDate) <= new Date();
  }
}
