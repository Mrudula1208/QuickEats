import { Component, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order';
import { DeliveryService } from '../../../core/services/delivery.service';
import { OrderModel } from '../../../core/models/order.model';
import { DeliveryPartnerSummary } from '../../../core/models/delivery.model';
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
  deliveryPartners = signal<DeliveryPartnerSummary[]>([]);
  isLoading = signal(true);
  loadError = signal('');
  searchText = signal('');
  selectedStatus = signal('all');

  // Assign / Reassign modal state
  isAssignModalOpen = signal(false);
  assignTargetOrder = signal<OrderModel | null>(null);
  assignPartnerId = signal<number | null>(null);
  isSubmittingAssign = signal(false);

  // Admin override modal state
  isOverrideModalOpen = signal(false);
  overrideTargetOrder = signal<OrderModel | null>(null);
  overrideStatus = signal('');
  overrideReason = signal('');
  overrideStatuses = [
    'Confirmed',
    'Preparing',
    'Ready for Pickup',
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
        (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(query)) ||
        (o.deliveryPartnerName && o.deliveryPartnerName.toLowerCase().includes(query))
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
    const pending = list.filter(o => ['pending', 'confirmed', 'preparing', 'ready for pickup', 'assigned', 'picked up', 'out for delivery'].includes(o.status.toLowerCase())).length;
    const delivered = list.filter(o => o.status.toLowerCase() === 'delivered').length;
    const revenue = list
      .filter(o => o.status.toLowerCase() !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { total, pending, delivered, revenue };
  });

  activePartners = computed(() => this.deliveryPartners().filter(p => p.isActive));

  constructor(
    private orderService: OrderService,
    private deliveryService: DeliveryService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadDeliveryPartners();
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

  loadDeliveryPartners(): void {
    this.deliveryService.getDeliveryPartners().subscribe({
      next: (partners) => this.deliveryPartners.set(partners || []),
      error: () => this.deliveryPartners.set([])
    });
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/admin/order-details', orderId]);
  }

  // ------------------------------------------------------------------
  // Admin actions
  // ------------------------------------------------------------------

  // An order is available to (re)assign when it is awaiting a delivery partner.
  canAssign(order: OrderModel): boolean {
    const s = order.status.toLowerCase();
    return s === 'ready for pickup' || s === 'assigned';
  }

  isReassign(order: OrderModel): boolean {
    return !!order.deliveryPartnerName && order.status.toLowerCase() === 'assigned';
  }

  // Admin may cancel Pending/Confirmed orders.
  canCancel(order: OrderModel): boolean {
    const s = order.status.toLowerCase();
    return s === 'pending' || s === 'confirmed';
  }

  openAssignModal(order: OrderModel): void {
    if (this.activePartners().length === 0) {
      this.toastr.warning('No active delivery partners available. Add one first.');
      return;
    }
    this.assignTargetOrder.set(order);
    this.assignPartnerId.set(null);
    this.isAssignModalOpen.set(true);
  }

  closeAssignModal(): void {
    this.isAssignModalOpen.set(false);
    this.assignTargetOrder.set(null);
    this.assignPartnerId.set(null);
    this.isSubmittingAssign.set(false);
  }

  submitAssignment(): void {
    const order = this.assignTargetOrder();
    const partnerId = this.assignPartnerId();

    if (!order) return;
    if (!partnerId) {
      this.toastr.warning('Please select a delivery partner');
      return;
    }

    this.isSubmittingAssign.set(true);
    this.deliveryService.assignDeliveryPartner(order.id, Number(partnerId)).subscribe({
      next: () => {
        this.isSubmittingAssign.set(false);
        this.toastr.success(`Order #${order.id} assigned to delivery partner`);
        this.closeAssignModal();
        this.loadOrders();
      },
      error: (err) => {
        this.isSubmittingAssign.set(false);
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : 'Failed to assign delivery partner');
        this.toastr.error(msg);
      }
    });
  }

  adminCancelOrder(order: OrderModel): void {
    if (!confirm(`Cancel Order #${order.id}? Only Pending or Confirmed orders can be cancelled.`)) {
      return;
    }

    this.orderService.adminCancelOrder(order.id).subscribe({
      next: () => {
        this.toastr.warning(`Order #${order.id} cancelled`);
        this.loadOrders();
      },
      error: (err) => {
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : 'Failed to cancel order');
        this.toastr.error(msg);
      }
    });
  }

  // Admin override - separate audited action (never the normal status dropdown).
  openOverrideModal(order: OrderModel): void {
    this.overrideTargetOrder.set(order);
    this.overrideStatus.set('Cancelled');
    this.overrideReason.set('');
    this.isOverrideModalOpen.set(true);
  }

  closeOverrideModal(): void {
    this.isOverrideModalOpen.set(false);
    this.overrideTargetOrder.set(null);
    this.overrideStatus.set('');
    this.overrideReason.set('');
  }

  submitOverride(): void {
    const order = this.overrideTargetOrder();
    if (!order) return;

    const status = this.overrideStatus();
    const reason = this.overrideReason();

    if (!status) {
      this.toastr.warning('Please select the target status');
      return;
    }
    if (!reason || reason.trim().length < 5) {
      this.toastr.warning('Please provide a reason (at least 5 characters)');
      return;
    }

    this.orderService.adminOverride(order.id, status, reason.trim()).subscribe({
      next: () => {
        this.toastr.success(`Order #${order.id} overridden to "${status}"`);
        this.closeOverrideModal();
        this.loadOrders();
      },
      error: (err) => {
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : 'Failed to override order status');
        this.toastr.error(msg);
      }
    });
  }

  deleteOrder(orderId: number): void {
    if (!confirm(`Delete Order #${orderId}? This action cannot be undone.`)) return;

    this.orderService.deleteOrderApi(orderId).subscribe({
      next: () => {
        this.orders.update(list => list.filter(o => o.id !== orderId));
        this.toastr.success(`Order #${orderId} deleted`);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to delete order';
        this.toastr.error(msg);
      }
    });
  }

  // ------------------------------------------------------------------
  // Display helpers
  // ------------------------------------------------------------------

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'out for delivery': return 'status-out';
      case 'preparing': return 'status-preparing';
      case 'ready for pickup': return 'status-ready';
      case 'assigned': return 'status-assigned';
      case 'picked up': return 'status-picked';
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  orderStatusIcon(status: string): string {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered') return 'task_alt';
    if (s === 'out for delivery') return 'delivery_dining';
    if (s === 'preparing') return 'outdoor_grill';
    if (s === 'ready for pickup') return 'inventory_2';
    if (s === 'assigned') return 'sports_motorsports';
    if (s === 'picked up') return 'shopping_bag';
    if (s === 'confirmed') return 'check_circle';
    if (s === 'pending') return 'schedule';
    if (s === 'cancelled') return 'cancel';
    return 'receipt_long';
  }

  getPaymentClass(paymentStatus?: string): string {
    const s = (paymentStatus || 'pending').toLowerCase();
    if (s === 'paid' || s === 'success') return 'paid';
    if (s === 'failed') return 'failed';
    if (s === 'refunded') return 'refunded';
    return 'pending';
  }

  // Backend stores online payments as "Success"; show readable Payment Status.
  formatPaymentStatus(paymentStatus?: string): string {
    if (!paymentStatus) return 'Pending';
    const s = paymentStatus.toLowerCase();
    if (s === 'success') return 'Paid';
    return paymentStatus;
  }

  getTotalItems(order: OrderModel): number {
    return order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  }
}