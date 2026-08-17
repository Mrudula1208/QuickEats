import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationModel } from '../../../core/models/notification.model';

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

  notifications: NotificationModel[] = [];
  unreadCount: number = 0;

  constructor(
    private notificationService: NotificationService
  ) {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data: NotificationModel[]) => {
        this.notifications = data;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count: number) => {
        this.unreadCount = count;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.loadNotifications();
        this.loadUnreadCount();
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.loadNotifications();
        this.loadUnreadCount();
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  deleteNotification(notificationId: number): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.loadNotifications();
        this.loadUnreadCount();
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  clearAll(): void {
    this.notificationService.clearAll().subscribe({
      next: () => {
        this.notifications = [];
        this.unreadCount = 0;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

}
