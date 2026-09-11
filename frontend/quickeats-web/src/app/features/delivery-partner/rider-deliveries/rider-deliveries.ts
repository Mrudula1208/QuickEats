import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeliveryService } from '../../../core/services/delivery.service';
import { OrderDeliveryResponse } from '../../../core/models/delivery.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rider-deliveries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rider-deliveries.html',
  styleUrl: './rider-deliveries.scss'
})
export class RiderDeliveriesComponent implements OnInit {
  deliveries = signal<OrderDeliveryResponse[]>([]);
  isLoading = signal(true);
  loadError = signal('');
  selectedTab = signal<string>('all');
  isUpdating = signal<number | null>(null);

  // Active deliveries only for this operational page (or tabs for specific stages)
  filteredDeliveries = computed(() => {
    const tab = this.selectedTab().toLowerCase();
    const list = this.deliveries().filter(d => d.deliveryStatus.toLowerCase() !== 'delivered');

    if (tab === 'all') return list;
    return list.filter(d => d.deliveryStatus.toLowerCase().replace(/\s+/g, '-') === tab);
  });

  stats = computed(() => {
    const list = this.deliveries();
    return {
      all: list.filter(d => d.deliveryStatus.toLowerCase() !== 'delivered').length,
      assigned: list.filter(d => d.deliveryStatus.toLowerCase() === 'assigned').length,
      pickedUp: list.filter(d => d.deliveryStatus.toLowerCase() === 'picked up').length,
      outForDelivery: list.filter(d => d.deliveryStatus.toLowerCase() === 'out for delivery').length
    };
  });

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.deliveryService.getPartnerDeliveries().subscribe({
      next: (data) => {
        // Sort: active tasks first, then by assigned time descending
        const priority: Record<string, number> = {
          'out for delivery': 0,
          'picked up': 1,
          'assigned': 2,
          'delivered': 3
        };

        const sorted = (data || []).sort((a, b) => {
          const pA = priority[a.deliveryStatus.toLowerCase()] ?? 9;
          const pB = priority[b.deliveryStatus.toLowerCase()] ?? 9;
          if (pA !== pB) return pA - pB;
          return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
        });

        this.deliveries.set(sorted);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load deliveries. Please check connection and try again.');
        this.toastr.error('Failed to load deliveries');
      }
    });
  }

  retry(): void {
    this.loadDeliveries();
  }

  viewDelivery(deliveryId: number): void {
    this.router.navigate(['/delivery/deliveries', deliveryId]);
  }

  advanceStatus(delivery: OrderDeliveryResponse, event: Event): void {
    event.stopPropagation();

    const nextStatusMap: Record<string, string> = {
      'assigned': 'Picked Up',
      'picked up': 'Out for Delivery',
      'out for delivery': 'Delivered'
    };

    const cur = delivery.deliveryStatus.toLowerCase();
    const nextStatus = nextStatusMap[cur];
    if (!nextStatus) return;

    if (nextStatus === 'Delivered') {
      if (!confirm(`Confirm delivery completed for Order #${delivery.orderId}?`)) {
        return;
      }
    }

    this.isUpdating.set(delivery.id);
    this.deliveryService.updateDeliveryStatus(delivery.id, nextStatus).subscribe({
      next: () => {
        this.isUpdating.set(null);
        this.toastr.success(`Delivery #${delivery.id} status updated to "${nextStatus}"`);
        this.loadDeliveries();
      },
      error: (err: any) => {
        this.isUpdating.set(null);
        const msg = err.error?.message || err.error || 'Failed to update status';
        this.toastr.error(msg);
      }
    });
  }

  getNextActionText(status: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'assigned': return 'Mark Picked Up';
      case 'picked up': return 'Start Delivery';
      case 'out for delivery': return 'Mark Delivered';
      default: return 'View';
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
