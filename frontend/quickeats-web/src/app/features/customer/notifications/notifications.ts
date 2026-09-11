import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationModel } from '../../../core/models/notification.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class NotificationsComponent {

  notifications = signal<NotificationModel[]>([]);
  unreadCount = signal(0);
  isLoading = signal(true);

  constructor(
    private notificationService: NotificationService,
    private toastr: ToastrService
  ) {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastr.error('Failed to load notifications');
      }
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount.set(count),
      error: () => {}
    });
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
        this.toastr.success('Marked as read');
      },
      error: () => {}
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
        this.toastr.success('All notifications marked as read');
      },
      error: () => {}
    });
  }

  deleteNotification(notificationId: number): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        const wasUnread = this.notifications().find(n => n.notificationId === notificationId && !n.isRead);
        this.notifications.update(list => list.filter(n => n.notificationId !== notificationId));
        if (wasUnread) this.unreadCount.update(c => Math.max(0, c - 1));
        this.toastr.success('Notification deleted');
      },
      error: () => {}
    });
  }

  clearAll(): void {
    this.notificationService.clearAll().subscribe({
      next: () => {
        this.notifications.set([]);
        this.unreadCount.set(0);
        this.toastr.success('All notifications cleared');
      },
      error: () => {}
    });
  }

  getNotificationIcon(notification: NotificationModel): string {
    const title = notification.title.toLowerCase();
    if (title.includes('cancel')) return 'cancel';
    if (title.includes('deliver')) return 'local_shipping';
    if (title.includes('order')) return 'receipt_long';
    if (title.includes('payment')) return 'payment';
    if (title.includes('promo') || title.includes('offer')) return 'local_offer';
    return 'notifications';
  }

  getIconClass(notification: NotificationModel): string {
    const title = notification.title.toLowerCase();
    if (title.includes('cancel')) return 'icon-cancel';
    if (title.includes('deliver')) return 'icon-delivery';
    if (title.includes('order')) return 'icon-order';
    if (title.includes('payment')) return 'icon-payment';
    if (title.includes('promo') || title.includes('offer')) return 'icon-promo';
    return 'icon-default';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
}
