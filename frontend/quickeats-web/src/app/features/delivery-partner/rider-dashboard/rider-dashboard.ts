import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DeliveryService } from '../../../core/services/delivery.service';
import { OrderDeliveryResponse } from '../../../core/models/delivery.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rider-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rider-dashboard.html',
  styleUrl: './rider-dashboard.scss'
})
export class RiderDashboardComponent implements OnInit {
  riderName = signal('Delivery Partner');
  deliveries = signal<OrderDeliveryResponse[]>([]);
  isLoading = signal(true);
  loadError = signal('');
  isUpdating = signal(false);

  isAvailable = signal(true);

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  // Current Active Delivery (Assigned, Picked Up, or Out for Delivery)
  currentActiveDelivery = computed(() => {
    const active = this.deliveries().filter(d =>
      ['assigned', 'picked up', 'out for delivery'].includes(d.deliveryStatus.toLowerCase())
    );

    if (active.length === 0) return null;

    // Prioritize Out for Delivery > Picked Up > Assigned
    const priority: Record<string, number> = {
      'out for delivery': 0,
      'picked up': 1,
      'assigned': 2
    };

    return active.sort((a, b) => {
      const pA = priority[a.deliveryStatus.toLowerCase()] ?? 3;
      const pB = priority[b.deliveryStatus.toLowerCase()] ?? 3;
      return pA - pB;
    })[0];
  });

  // Real-time Today's Statistics
  stats = computed(() => {
    const list = this.deliveries();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (dateStr?: Date | string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= today;
    };

    const assigned = list.filter(d => d.deliveryStatus.toLowerCase() === 'assigned').length;
    const pickedUp = list.filter(d => d.deliveryStatus.toLowerCase() === 'picked up').length;
    const outForDelivery = list.filter(d => d.deliveryStatus.toLowerCase() === 'out for delivery').length;
    const delivered = list.filter(d => d.deliveryStatus.toLowerCase() === 'delivered').length;
    const todayDeliveries = list.filter(d => isToday(d.assignedAt) || isToday(d.deliveredAt)).length || list.length;

    return {
      todayDeliveries,
      assigned,
      pickedUp,
      outForDelivery,
      delivered
    };
  });

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const storedName = localStorage.getItem('name');
    if (storedName) {
      this.riderName.set(storedName);
    }
    const storedStatus = localStorage.getItem('rider_availability');
    if (storedStatus !== null) {
      this.isAvailable.set(storedStatus === 'true');
    }

    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.deliveryService.getPartnerDeliveries().subscribe({
      next: (data) => {
        this.deliveries.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load deliveries. Please check connection and try again.');
        this.toastr.error('Failed to load dashboard deliveries');
      }
    });
  }

  retry(): void {
    this.loadDeliveries();
  }

  toggleAvailability(): void {
    const nextState = !this.isAvailable();
    this.isAvailable.set(nextState);
    localStorage.setItem('rider_availability', String(nextState));

    if (nextState) {
      this.toastr.success('You are now Available for new deliveries', 'Status Updated');
    } else {
      this.toastr.info('You are now Offline', 'Status Updated');
    }
  }

  viewDelivery(deliveryId: number): void {
    this.router.navigate(['/delivery/deliveries', deliveryId]);
  }

  advanceStatus(delivery: OrderDeliveryResponse): void {
    const nextStatusMap: Record<string, string> = {
      'assigned': 'Picked Up',
      'picked up': 'Out for Delivery',
      'out for delivery': 'Delivered'
    };

    const cur = delivery.deliveryStatus.toLowerCase();
    const nextStatus = nextStatusMap[cur];
    if (!nextStatus) return;

    if (nextStatus === 'Delivered') {
      if (!confirm(`Mark Order #${delivery.orderId} as Delivered to ${delivery.customerName}?`)) {
        return;
      }
    }

    this.isUpdating.set(true);
    this.deliveryService.updateDeliveryStatus(delivery.id, nextStatus).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.toastr.success(`Status updated to "${nextStatus}"`);
        this.loadDeliveries();
      },
      error: (err: any) => {
        this.isUpdating.set(false);
        const msg = err.error?.message || err.error || 'Failed to update delivery status';
        this.toastr.error(msg);
      }
    });
  }

  getNextActionText(status: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'assigned': return 'Mark as Picked Up';
      case 'picked up': return 'Start Delivery';
      case 'out for delivery': return 'Mark as Delivered';
      default: return 'View Delivery';
    }
  }

  getNextActionIcon(status: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'assigned': return 'shopping_bag';
      case 'picked up': return 'directions_bike';
      case 'out for delivery': return 'task_alt';
      default: return 'visibility';
    }
  }

  getStatusBadgeClass(status: string): string {
    const s = (status || '').toLowerCase().replace(/\s+/g, '-');
    switch (s) {
      case 'assigned': return 'badge-assigned';
      case 'picked-up': return 'badge-picked';
      case 'out-for-delivery': return 'badge-transit';
      case 'delivered': return 'badge-delivered';
      default: return 'badge-default';
    }
  }
}
