import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DeliveryService } from '../../../core/services/delivery.service';
import { OrderDeliveryResponse } from '../../../core/models/delivery.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rider-delivery-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rider-delivery-details.html',
  styleUrl: './rider-delivery-details.scss'
})
export class RiderDeliveryDetailsComponent implements OnInit {
  deliveryId: number | null = null;
  delivery = signal<OrderDeliveryResponse | null>(null);
  isLoading = signal(true);
  loadError = signal('');
  isUpdating = signal(false);
  showConfirmModal = signal(false);

  steps = ['Assigned', 'Picked Up', 'Out for Delivery', 'Delivered'];

  // Current milestone step index (0 to 3)
  currentStepIndex = computed(() => {
    const d = this.delivery();
    if (!d) return 0;
    const s = d.deliveryStatus.toLowerCase();
    if (s === 'assigned') return 0;
    if (s === 'picked up') return 1;
    if (s === 'out for delivery') return 2;
    if (s === 'delivered') return 3;
    return 0;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.deliveryId = Number(idParam);
      this.loadDelivery();
    } else {
      this.isLoading.set(false);
      this.loadError.set('Invalid delivery ID provided.');
    }
  }

  loadDelivery(): void {
    if (!this.deliveryId) return;

    this.isLoading.set(true);
    this.loadError.set('');

    this.deliveryService.getDeliveryById(this.deliveryId).subscribe({
      next: (data) => {
        this.delivery.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        if (err.status === 403) {
          this.loadError.set('Access Denied: This delivery is not assigned to your account.');
        } else if (err.status === 404) {
          this.loadError.set('Delivery task not found.');
        } else {
          this.loadError.set('Could not load delivery details. Please try again.');
        }
      }
    });
  }

  retry(): void {
    this.loadDelivery();
  }

  copyAddress(text?: string, label: string = 'Address'): void {
    if (!text) {
      this.toastr.warning('No address text available to copy');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.toastr.success(`${label} copied to clipboard!`);
    }).catch(() => {
      this.toastr.info(text, 'Address');
    });
  }

  getNextActionText(status: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'assigned': return 'Mark as Picked Up';
      case 'picked up': return 'Start Delivery';
      case 'out for delivery': return 'Mark as Delivered';
      default: return 'Completed';
    }
  }

  getNextActionIcon(status: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'assigned': return 'shopping_bag';
      case 'picked up': return 'directions_bike';
      case 'out for delivery': return 'task_alt';
      default: return 'verified';
    }
  }

  requestAdvanceStatus(): void {
    const d = this.delivery();
    if (!d || this.isUpdating()) return;

    const cur = d.deliveryStatus.toLowerCase();
    if (cur === 'out for delivery') {
      // Show confirmation dialog before final delivery
      this.showConfirmModal.set(true);
    } else {
      this.executeAdvanceStatus();
    }
  }

  confirmDelivered(): void {
    this.showConfirmModal.set(false);
    this.executeAdvanceStatus();
  }

  cancelConfirmModal(): void {
    this.showConfirmModal.set(false);
  }

  private executeAdvanceStatus(): void {
    const d = this.delivery();
    if (!d || !this.deliveryId) return;

    const nextStatusMap: Record<string, string> = {
      'assigned': 'Picked Up',
      'picked up': 'Out for Delivery',
      'out for delivery': 'Delivered'
    };

    const nextStatus = nextStatusMap[d.deliveryStatus.toLowerCase()];
    if (!nextStatus) return;

    this.isUpdating.set(true);
    this.deliveryService.updateDeliveryStatus(this.deliveryId, nextStatus).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.toastr.success(`Order #${d.orderId} updated to "${nextStatus}"`);
        this.loadDelivery();
      },
      error: (err: any) => {
        this.isUpdating.set(false);
        const msg = err.error?.message || err.error || 'Failed to update delivery status';
        this.toastr.error(msg);
      }
    });
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

  backToDeliveries(): void {
    this.router.navigate(['/delivery/deliveries']);
  }
}
