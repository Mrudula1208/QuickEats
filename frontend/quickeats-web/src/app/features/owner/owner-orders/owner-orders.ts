import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
import { OrderService } from '../../../core/services/order';
import { OrderModel } from '../../../core/models/order.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-owner-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, OwnerNavComponent],
  templateUrl: './owner-orders.html',
  styleUrl: './owner-orders.scss'
})
export class OwnerOrdersComponent {

  orders = signal<OrderModel[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  selectedFilter = signal('All');

  filterTabs = [
    'All',
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready for Pickup',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  filteredOrders = computed(() => {
    const filter = this.selectedFilter().toLowerCase();
    if (filter === 'all') return this.orders();
    return this.orders().filter(o => 
      o.status.toLowerCase().replace(/\s+/g, '') === filter.replace(/\s+/g, '')
    );
  });

  counts = computed(() => {
    const all = this.orders();
    const isStatus = (st: string) => all.filter(o => o.status.toLowerCase().replace(/\s+/g, '') === st.toLowerCase().replace(/\s+/g, '')).length;
    return {
      total: all.length,
      pending: isStatus('Pending'),
      confirmed: isStatus('Confirmed'),
      preparing: isStatus('Preparing'),
      ready: isStatus('Ready for Pickup') + isStatus('Ready'),
      out: isStatus('Out for Delivery') + isStatus('OutForDelivery') + isStatus('Assigned') + isStatus('Picked Up'),
      delivered: isStatus('Delivered'),
      cancelled: isStatus('Cancelled')
    };
  });

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService
  ) {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.orderService.getOwnerOrders().subscribe({
      next: (data) => {
        this.orders.set(data.sort((a, b) => {
          const priority: Record<string, number> = {
            'pending': 0, 'confirmed': 1, 'preparing': 2,
            'ready for pickup': 3, 'ready': 3, 'assigned': 4,
            'picked up': 4, 'out for delivery': 4, 'delivered': 5, 'cancelled': 6
          };
          const aKey = a.status.toLowerCase();
          const bKey = b.status.toLowerCase();
          const aVal = priority[aKey] ?? 4;
          const bVal = priority[bKey] ?? 4;
          if (aVal !== bVal) return aVal - bVal;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load orders. Please try again.');
        this.toastr.error('Failed to load orders');
      }
    });
  }

  retry(): void {
    this.loadOrders();
  }

  // Owner action: Confirm order
  confirmOrder(order: OrderModel): void {
    this.orderService.updateOrderStatusApi(order.id, 'Confirmed').subscribe({
      next: () => {
        this.toastr.success(`Order #${order.id} confirmed`);
        this.loadOrders();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to confirm order';
        this.toastr.error(msg);
      }
    });
  }

  // Owner action: Start preparing
  startPreparing(order: OrderModel): void {
    this.orderService.updateOrderStatusApi(order.id, 'Preparing').subscribe({
      next: () => {
        this.toastr.success(`Order #${order.id} is now being prepared`);
        this.loadOrders();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to update order status';
        this.toastr.error(msg);
      }
    });
  }

  // Owner action: Mark ready for pickup
  markReadyForPickup(order: OrderModel): void {
    this.orderService.updateOrderStatusApi(order.id, 'Ready for Pickup').subscribe({
      next: () => {
        this.toastr.success(`Order #${order.id} is ready for pickup! Dispatch rider notified.`);
        this.loadOrders();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to mark order ready';
        this.toastr.error(msg);
      }
    });
  }

  // Owner action: Cancel order (only if Pending or Confirmed)
  cancelOrder(order: OrderModel): void {
    if (!confirm(`Cancel Order #${order.id}? This will notify the customer.`)) return;

    this.orderService.updateOrderStatusApi(order.id, 'Cancelled').subscribe({
      next: () => {
        this.toastr.warning(`Order #${order.id} cancelled`);
        this.loadOrders();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to cancel order';
        this.toastr.error(msg);
      }
    });
  }

  getStatusIcon(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('pending')) return 'hourglass_empty';
    if (s.includes('confirmed')) return 'check_circle';
    if (s.includes('preparing')) return 'outdoor_grill';
    if (s.includes('ready')) return 'inventory_2';
    if (s.includes('assigned')) return 'badge';
    if (s.includes('picked')) return 'delivery_dining';
    if (s.includes('out')) return 'two_wheeler';
    if (s.includes('delivered')) return 'done_all';
    if (s.includes('cancelled')) return 'cancel';
    return 'receipt';
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase().replace(/\s+/g, '-');
    return 'os-' + s;
  }

  getTotalItems(order: OrderModel): number {
    return order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  }
}
