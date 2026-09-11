import { Component, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order';
import { OrderModel } from '../../../core/models/order.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-order.html',
  styleUrl: './admin-order.scss'
})
export class AdminOrders implements OnInit {
  orders = signal<OrderModel[]>([]);
  isLoading = signal(true);
  loadError = signal('');
  searchText = signal('');
  selectedStatus = signal('all');

  statusList = [
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready',
    'OutForDelivery',
    'Delivered',
    'Cancelled'
  ];

  filteredOrders = computed(() => {
    let list = this.orders();
    const query = this.searchText().toLowerCase().trim();
    const status = this.selectedStatus();

    if (query) {
      list = list.filter(o =>
        o.id.toString().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        (o.restaurantName && o.restaurantName.toLowerCase().includes(query)) ||
        (o.phoneNumber && o.phoneNumber.includes(query)) ||
        (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(query))
      );
    }

    if (status !== 'all') {
      list = list.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    return list;
  });

  // Pagination / Limit State
  pageSize = 10;
  visibleLimit = signal(10);
  showAll = signal(false);

  displayedOrders = computed(() => {
    if (this.showAll()) {
      return this.filteredOrders();
    }
    return this.filteredOrders().slice(0, this.visibleLimit());
  });

  hasMore = computed(() => {
    return !this.showAll() && this.visibleLimit() < this.filteredOrders().length;
  });

  showMore(): void {
    this.visibleLimit.update(v => v + this.pageSize);
  }

  toggleShowAll(): void {
    if (this.showAll()) {
      this.showAll.set(false);
      this.visibleLimit.set(this.pageSize);
    } else {
      this.showAll.set(true);
    }
  }

  stats = computed(() => {
    const list = this.orders();
    const total = list.length;
    const pending = list.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status.toLowerCase())).length;
    const delivered = list.filter(o => o.status.toLowerCase() === 'delivered').length;
    const revenue = list
      .filter(o => o.status.toLowerCase() !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { total, pending, delivered, revenue };
  });

  constructor(
    private orderService: OrderService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.orderService.getAllOrdersApi().subscribe({
      next: (data) => {
        this.orders.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load orders from backend.');
        this.toastr.error('Failed to load orders');
      }
    });
  }

  updateStatus(orderId: number, status: string): void {
    this.orderService.updateOrderStatusApi(orderId, status).subscribe({
      next: () => {
        this.orders.update(list =>
          list.map(o => o.id === orderId ? { ...o, status } : o)
        );
        this.toastr.success(`Order #${orderId} status updated to ${status}`);
      },
      error: () => this.toastr.error('Failed to update order status')
    });
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/admin/order-details', orderId]);
  }

  deleteOrder(orderId: number): void {
    if (!confirm(`Delete Order #${orderId}? This action cannot be undone.`)) return;

    this.orderService.deleteOrderApi(orderId).subscribe({
      next: () => {
        this.orders.update(list => list.filter(o => o.id !== orderId));
        this.toastr.success(`Order #${orderId} deleted`);
      },
      error: () => this.toastr.error('Failed to delete order')
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'outfordelivery': return 'status-out';
      case 'preparing':
      case 'ready': return 'status-preparing';
      case 'confirmed':
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}
