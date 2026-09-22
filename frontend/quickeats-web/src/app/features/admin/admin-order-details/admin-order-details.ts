import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order';
import { DeliveryService } from '../../../core/services/delivery.service';
import { OrderModel } from '../../../core/models/order.model';
import { DeliveryPartnerSummary } from '../../../core/models/delivery.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-order-details',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-order-details.html',
  styleUrl: './admin-order-details.scss'
})
export class AdminOrderDetails {

  order = signal<OrderModel | undefined>(undefined);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  deliveryPartners = signal<DeliveryPartnerSummary[]>([]);

  // Assign modal
  isAssignModalOpen = signal(false);
  assignPartnerId = signal<number | null>(null);
  isSubmittingAssign = signal(false);

  // Override modal
  isOverrideModalOpen = signal(false);
  overrideStatus = signal('');
  overrideReason = signal('');

  activePartners = computed(() => this.deliveryPartners().filter(p => p.isActive));

  overrideStatuses = ['Confirmed', 'Preparing', 'Ready for Pickup', 'Cancelled'];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private deliveryService: DeliveryService,
    private toastr: ToastrService
  ) {
    this.loadOrder();
    this.loadDeliveryPartners();
  }

  loadOrder(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Failed to load order details');
        this.toastr.error('Failed to load order details');
      }
    });
  }

  loadDeliveryPartners(): void {
    this.deliveryService.getDeliveryPartners().subscribe({
      next: (partners) => this.deliveryPartners.set(partners || []),
      error: () => this.deliveryPartners.set([])
    });
  }

  retry(): void {
    this.loadOrder();
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  canAssign(order: OrderModel): boolean {
    const s = order.status.toLowerCase();
    return s === 'ready for pickup' || s === 'assigned';
  }

  isReassign(order: OrderModel): boolean {
    return !!order.deliveryPartnerName && order.status.toLowerCase() === 'assigned';
  }

  canCancel(order: OrderModel): boolean {
    const s = order.status.toLowerCase();
    return s === 'pending' || s === 'confirmed';
  }

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

  formatPaymentStatus(paymentStatus?: string): string {
    if (!paymentStatus) return 'Pending';
    return paymentStatus.toLowerCase() === 'success' ? 'Paid' : paymentStatus;
  }

  getTotalItems(order: OrderModel): number {
    return order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  }

  // ------------------------------------------------------------------
  // Admin actions
  // ------------------------------------------------------------------

  openAssignModal(): void {
    const order = this.order();
    if (!order) return;
    if (this.activePartners().length === 0) {
      this.toastr.warning('No active delivery partners available.');
      return;
    }
    this.assignPartnerId.set(null);
    this.isAssignModalOpen.set(true);
  }

  closeAssignModal(): void {
    this.isAssignModalOpen.set(false);
    this.assignPartnerId.set(null);
    this.isSubmittingAssign.set(false);
  }

  submitAssignment(): void {
    const order = this.order();
    const partnerId = this.assignPartnerId();
    if (!order || !partnerId) {
      this.toastr.warning('Please select a delivery partner');
      return;
    }

    this.isSubmittingAssign.set(true);
    this.deliveryService.assignDeliveryPartner(order.id, Number(partnerId)).subscribe({
      next: () => {
        this.isSubmittingAssign.set(false);
        this.toastr.success(`Delivery partner assigned to Order #${order.id}`);
        this.closeAssignModal();
        this.loadOrder();
      },
      error: (err) => {
        this.isSubmittingAssign.set(false);
        const msg = err?.error?.message || 'Failed to assign delivery partner';
        this.toastr.error(msg);
      }
    });
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;
    if (!confirm(`Cancel Order #${order.id}? Only Pending or Confirmed orders can be cancelled.`)) return;

    this.orderService.adminCancelOrder(order.id).subscribe({
      next: () => {
        this.toastr.warning(`Order #${order.id} cancelled`);
        this.loadOrder();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to cancel order';
        this.toastr.error(msg);
      }
    });
  }

  openOverrideModal(): void {
    this.overrideStatus.set('Cancelled');
    this.overrideReason.set('');
    this.isOverrideModalOpen.set(true);
  }

  closeOverrideModal(): void {
    this.isOverrideModalOpen.set(false);
    this.overrideStatus.set('');
    this.overrideReason.set('');
  }

  submitOverride(): void {
    const order = this.order();
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
        this.loadOrder();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to override order status';
        this.toastr.error(msg);
      }
    });
  }
}