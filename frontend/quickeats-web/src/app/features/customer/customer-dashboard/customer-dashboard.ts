import { Component } from '@angular/core';
// 1ï¸âƒ£ Executes First.
// Import Component because every Angular page is a Component.

import { CommonModule } from '@angular/common';
// 2ï¸âƒ£ Executes Second.
// CommonModule allows HTML to use Angular directives like @if and @for.

import { Router } from '@angular/router';
// 3ï¸âƒ£ Executes Third.
// Router is used to open another page.

import { ToastrService } from 'ngx-toastr';

// Component Configuration
@Component({

  selector: 'app-customer-dashboard',
  // HTML tag name of this component.

  standalone: true,
  // Means this component works independently.
  // No need to register inside AppModule.

  imports: [
    CommonModule
  ],
  // Import CommonModule for Angular directives.

  templateUrl: './customer-dashboard.html',
  // Connect HTML file.

  styleUrl: './customer-dashboard.scss'
  // Connect CSS file.

})

export class CustomerDashboardComponent {

  // ====================================================
  // EXECUTION FLOW
  // ====================================================
  //
  // 1ï¸âƒ£ Angular loads this component.
  //
  // 2ï¸âƒ£ Variables are created.
  //
  // 3ï¸âƒ£ Constructor executes automatically.
  //
  // 4ï¸âƒ£ HTML receives all variables.
  //
  // 5ï¸âƒ£ User clicks a card.
  //
  // 6ï¸âƒ£ Corresponding method executes.
  //
  // ====================================================

  // dashboardHeading: string
  //
  // string means this variable stores text.

  dashboardHeading: string = "Welcome Back";

  // customerName stores logged in customer name.

  customerName: string = "Mrudula";

  // rewardPoints stores total earned reward points.

  rewardPoints: number = 245;

  // number means integer or decimal values.

  totalOrders: number = 12;

  favouriteRestaurants: number = 6;

  savedAddresses: number = 3;

  availableCoupons: number = 8;

  constructor(

    private router: Router,

    private toastr: ToastrService

    // private
    // Means only this class can use Router.
    //
    // Router
    // Angular automatically creates Router object.
    //
    // We never write:
    // new Router()

  ) {

    // Constructor currently doesn't need logic.
    // It automatically runs whenever
    // Customer Dashboard opens.

  }

  openOrders(): void {

    // (): void
    //
    // Means this method returns nothing.
    // It only performs work.

    this.router.navigate([
      '/orders'
    ]);

  }

  openWishlist(): void {

    this.router.navigate([
      '/wishlist'
    ]);

  }

  openAddresses(): void {

    this.router.navigate([
      '/saved-address'
    ]);

  }

  openCoupons(): void {

    this.router.navigate([
      '/coupons'
    ]);

  }

  openNotifications(): void {

    this.router.navigate([
      '/notifications'
    ]);

  }

  openProfile(): void {

    this.router.navigate([
      '/profile'
    ]);

  }

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    this.toastr.success('Logged out successfully');

    this.router.navigate(['/']);

  }

}

/*

WHY DO WE WRITE THIS FILE?

This file controls the complete Dashboard.

Dashboard is the first screen
after customer login.

Flow

Login

â†“

Dashboard Opens

â†“

Variables Created

â†“

HTML Displays Data

â†“

Customer Clicks Card

â†“

Method Executes

â†“

Router Opens New Page

*/
