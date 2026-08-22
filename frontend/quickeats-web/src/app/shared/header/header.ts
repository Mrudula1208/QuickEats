import { Component } from '@angular/core';
// Import Component because this is an Angular Component.

import { CommonModule } from '@angular/common';
// Import CommonModule because HTML uses @if.

import { RouterLink } from '@angular/router';
// RouterLink makes routerLink work in HTML.

import { NotificationService } from '../../core/services/notification.service';
// Used to load unread count.

import { AuthService } from '../../core/services/auth.service';
// Used to check whether the Customer is logged in.

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})

export class HeaderComponent {

  // Number of unread Notifications.
  unreadCount = 0;

  // true = Customer is logged in.
  isLoggedIn = false;

  constructor(

    private notificationService: NotificationService,

    private authService: AuthService

  ) {

    // Check login status.
    this.isLoggedIn = this.authService.isLoggedIn();

    // Load unread count if logged in.
    if (this.isLoggedIn) {

      this.loadUnreadCount();

    }

  }

  // Load unread Notification count.
  loadUnreadCount(): void {

    this.notificationService
      .getUnreadCount()
      .subscribe({

        // API Success.
        next: (count: number) => {

          this.unreadCount = count;

        },

        // API Failed.
        error: () => {}

      });

  }

}
