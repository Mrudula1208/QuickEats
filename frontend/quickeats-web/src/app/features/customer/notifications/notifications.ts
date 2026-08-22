import { Component } from '@angular/core';
// Import Component because this is an Angular Component.

import { CommonModule } from '@angular/common';
// Import CommonModule because HTML uses @if and @for.

import { NotificationService } from '../../../core/services/notification.service';
// Used to call Notification APIs.

import { NotificationModel } from '../../../core/models/notification.model';
// NotificationModel stores one notification.

import { ToastrService } from 'ngx-toastr';
// Used to show success/error notifications.

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})

export class NotificationsComponent {

  // Store all Notifications.
  notifications: NotificationModel[] = [];

  // Number of unread Notifications.
  unreadCount = 0;

  constructor(

    private notificationService: NotificationService,

    private toastr: ToastrService

  ) {

    this.loadNotifications();

    this.loadUnreadCount();

  }

  // Load all Notifications.
  loadNotifications(): void {

    this.notificationService
      .getNotifications()
      .subscribe({

        // API Success.
        next: (data: NotificationModel[]) => {

          this.notifications = data;

        },

        // API Failed.
        error: () => {}

      });

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

  // Mark one Notification as Read.
  markAsRead(notificationId: number): void {

    this.notificationService
      .markAsRead(notificationId)
      .subscribe({

        // API Success.
        next: () => {

          this.loadNotifications();
          this.loadUnreadCount();
          this.toastr.success('Marked as read');

        },

        // API Failed.
        error: () => {}

      });

  }

  // Mark all Notifications as Read.
  markAllAsRead(): void {

    this.notificationService
      .markAllAsRead()
      .subscribe({

        // API Success.
        next: () => {

          this.loadNotifications();
          this.loadUnreadCount();
          this.toastr.success('All marked as read');

        },

        // API Failed.
        error: () => {}

      });

  }

  // Delete one Notification.
  deleteNotification(notificationId: number): void {

    this.notificationService
      .deleteNotification(notificationId)
      .subscribe({

        // API Success.
        next: () => {

          this.loadNotifications();
          this.loadUnreadCount();
          this.toastr.success('Notification deleted');

        },

        // API Failed.
        error: () => {}

      });

  }

  // Clear all Notifications.
  clearAll(): void {

    this.notificationService
      .clearAll()
      .subscribe({

        // API Success.
        next: () => {

          this.notifications = [];
          this.unreadCount = 0;
          this.toastr.success('All notifications cleared');

        },

        // API Failed.
        error: () => {}

      });

  }

  // Return icon based on Notification title.
  // Order notifications get a package icon.
  // Other notifications get a bell icon.
  getNotificationIcon(notification: NotificationModel): string {

    const title = notification.title.toLowerCase();

    if (title.includes('order')) {

      return 'ðŸ“¦';

    }

    if (title.includes('cancelled')) {

      return 'âŒ';

    }

    return 'ðŸ””';

  }

}
