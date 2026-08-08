import { Component } from '@angular/core';
// Controls Notification Page.

import { CommonModule } from '@angular/common';
// Required for @for and @if.

import { NotificationService } from '../../../core/services/notification.service';
// Calls Notification APIs.

import { NotificationModel } from '../../../core/models/notification.model';
// Notification Structure.

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

  // Store all notifications.
  notifications: NotificationModel[] = [];

  constructor(

    // Notification Service.
    private notificationService: NotificationService

  ) {

    // Load Notifications.
    this.loadNotifications();

  }

  // Load Notifications.
  loadNotifications(): void {

    this.notificationService
      .getNotifications()
      .subscribe({

        // Success.
        next: (data: NotificationModel[]) => {

          this.notifications = data;

          console.log(this.notifications);

        },

        // Error.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

  // Mark Notification As Read.
  markAsRead(

    notificationId: number

  ): void {

    this.notificationService
      .markAsRead(notificationId)
      .subscribe({

        // Success.
        next: () => {

          console.log("Notification Read");

          // Reload Notifications.
          this.loadNotifications();

        },

        // Error.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

}