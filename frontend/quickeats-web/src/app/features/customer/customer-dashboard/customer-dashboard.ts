import { Component, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { OrderService } from '../../../core/services/order';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SavedAddressService } from '../../../core/services/saved-address.service';
import { CouponService } from '../../../core/services/coupon.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({

  selector: 'app-customer-dashboard',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './customer-dashboard.html',

  styleUrl: './customer-dashboard.scss'

})

export class CustomerDashboardComponent {

  customerName: string = 'there';

  totalOrders = signal(0);
  wishlistItems = signal(0);
  savedAddresses = signal(0);
  availableCoupons = signal(0);
  unreadNotifications = signal(0);

  isLoading = signal(true);

  private readonly userId: number = Number(localStorage.getItem('userId') || 0);

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private orderService: OrderService,
    private wishlistService: WishlistService,
    private savedAddressService: SavedAddressService,
    private couponService: CouponService,
    private notificationService: NotificationService
  ) {
    const storedName = localStorage.getItem('name');
    if (storedName) {
      this.customerName = storedName;
    }
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);

    if (!this.userId) {
      this.isLoading.set(false);
      return;
    }

    this.orderService.getUserOrders(this.userId).subscribe({
      next: (orders) => {
        this.totalOrders.set(orders.length);
        this.trackWishlist();
      },
      error: () => {
        this.trackWishlist();
      }
    });
  }

  private trackWishlist(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (items) => {
        this.wishlistItems.set(items.length);
        this.trackAddresses();
      },
      error: () => {
        this.trackAddresses();
      }
    });
  }

  private trackAddresses(): void {
    this.savedAddressService.getAddresses().subscribe({
      next: (addresses) => {
        this.savedAddresses.set(addresses.length);
        this.trackCoupons();
      },
      error: () => {
        this.trackCoupons();
      }
    });
  }

  private trackCoupons(): void {
    this.couponService.getCoupons().subscribe({
      next: (coupons) => {
        const now = new Date();
        this.availableCoupons.set(coupons.filter(c => c.isActive && new Date(c.expiryDate) >= now).length);
        this.trackNotifications();
      },
      error: () => {
        this.trackNotifications();
      }
    });
  }

  private trackNotifications(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadNotifications.set(count);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  openOrders(): void {
    this.router.navigate(['/orders']);
  }

  openWishlist(): void {
    this.router.navigate(['/wishlist']);
  }

  openAddresses(): void {
    this.router.navigate(['/saved-address']);
  }

  openCoupons(): void {
    this.router.navigate(['/coupons']);
  }

  openNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  openProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('profileImageUrl');

    this.toastr.success('Logged out successfully');

    this.router.navigate(['/']);
  }

}