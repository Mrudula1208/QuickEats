import { Component } from '@angular/core';

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

  totalOrders = 0;
  wishlistItems = 0;
  savedAddresses = 0;
  availableCoupons = 0;
  unreadNotifications = 0;

  isLoading = true;

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
    this.isLoading = true;

    if (!this.userId) {
      this.isLoading = false;
      return;
    }

    this.orderService.getUserOrders(this.userId).subscribe({
      next: (orders) => {
        this.totalOrders = orders.length;
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
        this.wishlistItems = items.length;
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
        this.savedAddresses = addresses.length;
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
        this.availableCoupons = coupons.filter(c => c.isActive && new Date(c.expiryDate) >= now).length;
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
        this.unreadNotifications = count;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
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