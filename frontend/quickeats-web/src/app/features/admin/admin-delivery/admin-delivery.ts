import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../../core/services/delivery.service';
import { OrderService } from '../../../core/services/order';
import { OrderDeliveryResponse, DeliveryPartnerSummary } from '../../../core/models/delivery.model';
import { OrderModel } from '../../../core/models/order.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-delivery.html',
  styleUrl: './admin-delivery.scss'
})
export class AdminDelivery implements OnInit {
  deliveries = signal<OrderDeliveryResponse[]>([]);
  deliveryPartners = signal<DeliveryPartnerSummary[]>([]);
  readyOrders = signal<OrderModel[]>([]);
  
  isLoading = signal(true);
  loadError = signal('');
  searchText = signal('');
  selectedStatus = signal('all');

  // Modals state
  isAssignModalOpen = signal(false);
  isNewAssignModalOpen = signal(false);
  isDetailsModalOpen = signal(false);
  isSubmitting = signal(false);

  selectedDelivery = signal<OrderDeliveryResponse | null>(null);
  targetPartnerId = signal<number | null>(null);
  
  // New assignment form state
  newAssignmentOrderId = signal<number | null>(null);
  newAssignmentPartnerId = signal<number | null>(null);

  // Status list for filter
  statusList = [
    'Assigned',
    'Picked Up',
    'Out for Delivery',
    'Delivered'
  ];

  filteredDeliveries = computed(() => {
    let list = this.deliveries();
    const query = this.searchText().toLowerCase().trim();
    const status = this.selectedStatus().toLowerCase();

    if (query) {
      list = list.filter(d =>
        d.id.toString().includes(query) ||
        d.orderId.toString().includes(query) ||
        (d.deliveryPartnerName && d.deliveryPartnerName.toLowerCase().includes(query)) ||
        (d.customerName && d.customerName.toLowerCase().includes(query)) ||
        (d.restaurantName && d.restaurantName.toLowerCase().includes(query)) ||
        (d.deliveryAddress && d.deliveryAddress.toLowerCase().includes(query))
      );
    }

    if (status !== 'all') {
      list = list.filter(d => d.deliveryStatus.toLowerCase().replace(/\s+/g, '') === status.replace(/\s+/g, ''));
    }

    return list;
  });

  // KPI Statistics
  stats = computed(() => {
    const list = this.deliveries();
    const total = list.length;
    const active = list.filter(d => 
      ['assigned', 'picked up', 'out for delivery'].includes(d.deliveryStatus.toLowerCase())
    ).length;
    const completed = list.filter(d => d.deliveryStatus.toLowerCase() === 'delivered').length;
    const activePartnersCount = this.deliveryPartners().filter(p => p.isActive).length;

    return { total, active, completed, activePartnersCount };
  });

  // Active delivery partners only
  activePartners = computed(() => {
    return this.deliveryPartners().filter(p => p.isActive);
  });

  constructor(
    private deliveryService: DeliveryService,
    private orderService: OrderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.deliveryService.getDeliveries().subscribe({
      next: (deliveries) => {
        this.deliveries.set(deliveries || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load deliveries. Please try again.');
        this.toastr.error('Failed to load deliveries');
      }
    });

    this.loadDeliveryPartners();
    this.loadReadyOrders();
  }

  loadDeliveryPartners(): void {
    this.deliveryService.getDeliveryPartners().subscribe({
      next: (partners) => {
        this.deliveryPartners.set(partners || []);
      },
      error: (err: any) => console.error('Failed to load delivery partners', err)
    });
  }

  loadReadyOrders(): void {
    this.orderService.getAllOrdersApi().subscribe({
      next: (orders) => {
        // Assignment is only allowed after the kitchen marks the order Ready for Pickup.
        const ready = (orders || []).filter(o =>
          ['ready for pickup', 'ready'].includes(o.status.toLowerCase())
        );
        this.readyOrders.set(ready);
      },
      error: (err: any) => console.error('Failed to load ready orders', err)
    });
  }

  retry(): void {
    this.loadAllData();
  }

  // Open modal to reassign partner for an existing delivery
  openReassignModal(delivery: OrderDeliveryResponse): void {
    this.selectedDelivery.set(delivery);
    this.targetPartnerId.set(delivery.deliveryPartnerId);
    this.isAssignModalOpen.set(true);
  }

  closeAssignModal(): void {
    this.isAssignModalOpen.set(false);
    this.selectedDelivery.set(null);
    this.targetPartnerId.set(null);
  }

  // Submit Reassignment
  submitReassignment(): void {
    const delivery = this.selectedDelivery();
    const partnerId = this.targetPartnerId();

    if (!delivery || !partnerId) {
      this.toastr.warning('Please select a delivery partner');
      return;
    }

    this.isSubmitting.set(true);
    this.deliveryService.assignDeliveryPartner(delivery.orderId, partnerId).subscribe({
      next: () => {
        this.toastr.success(`Delivery Partner reassigned for Order #${delivery.orderId}`);
        this.isSubmitting.set(false);
        this.closeAssignModal();
        this.loadAllData();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Failed to reassign delivery partner';
        this.toastr.error(msg);
      }
    });
  }

  // Open New Assignment Modal
  openNewAssignModal(): void {
    this.newAssignmentOrderId.set(null);
    this.newAssignmentPartnerId.set(null);
    this.loadReadyOrders();
    this.isNewAssignModalOpen.set(true);
  }

  closeNewAssignModal(): void {
    this.isNewAssignModalOpen.set(false);
    this.newAssignmentOrderId.set(null);
    this.newAssignmentPartnerId.set(null);
  }

  // Submit New Assignment
  submitNewAssignment(): void {
    const orderId = this.newAssignmentOrderId();
    const partnerId = this.newAssignmentPartnerId();

    if (!orderId) {
      this.toastr.warning('Please select an order to assign');
      return;
    }
    if (!partnerId) {
      this.toastr.warning('Please select a delivery partner');
      return;
    }

    this.isSubmitting.set(true);
    this.deliveryService.createDelivery({
      orderId: Number(orderId),
      deliveryPartnerId: Number(partnerId)
    }).subscribe({
      next: () => {
        this.toastr.success(`Order #${orderId} assigned to delivery partner successfully`);
        this.isSubmitting.set(false);
        this.closeNewAssignModal();
        this.loadAllData();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Failed to assign order';
        this.toastr.error(msg);
      }
    });
  }

  // View Details Modal
  viewDetails(delivery: OrderDeliveryResponse): void {
    this.selectedDelivery.set(delivery);
    this.isDetailsModalOpen.set(true);
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen.set(false);
    this.selectedDelivery.set(null);
  }

  // Delivery status is controlled by the Delivery Partner via their own portal.
  // Admin only assigns/reassigns partners - they never advance the delivery status.

  // Delete Delivery
  deleteDelivery(deliveryId: number): void {
    if (!confirm('Are you sure you want to delete this delivery record? This cannot be undone.')) return;

    this.deliveryService.deleteDelivery(deliveryId).subscribe({
      next: () => {
        this.toastr.success('Delivery record deleted');
        this.deliveries.update(list => list.filter(d => d.id !== deliveryId));
      },
      error: () => this.toastr.error('Failed to delete delivery')
    });
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase().replace(/\s+/g, '');
    switch (s) {
      case 'delivered': return 'status-delivered';
      case 'outfordelivery': return 'status-out';
      case 'pickedup': return 'status-picked';
      case 'assigned': return 'status-assigned';
      default: return 'status-pending';
    }
  }
}
