import { Component } from '@angular/core';
// Import Component because this file controls Notification Page.

import { CommonModule } from '@angular/common';
// Import CommonModule because HTML uses @if and @for.

import { NotificationService } from '../../../core/services/notification.service';
// Import NotificationService because all notification logic is written there.

import { NotificationModel } from '../../../core/models/notification.model';
// Import NotificationModel because it defines one notification object.

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

    // Angular automatically injects NotificationService.
    private notificationService: NotificationService

  ) {

    // Load notifications immediately.
    this.loadNotifications();

  }

  // Load all notifications.
  loadNotifications(): void {
      this.notificationService.getNotifications().subscribe({
        next:(data:NotificationModel[])=> {
          this.notifications = data;
          console.log(this.notifications);
        }
    ,
  error:(err:any)=> {
    console.error( err);
  

  // Runs when customer opens notification.



      }});
  }
}