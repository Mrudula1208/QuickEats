import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryPartnerNavComponent } from '../../shared/delivery-partner-nav/delivery-partner-nav';
import { DeliveryService } from '../../core/services/delivery.service';
import { Delivery } from '../../core/models/delivery.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delivery-partner',
  standalone: true,
  imports: [CommonModule, FormsModule, DeliveryPartnerNavComponent],
  templateUrl: './delivery-partner.html',
  styleUrl: './delivery-partner.scss'
})
export class DeliveryPartnerComponent implements OnInit {

  partnerName = localStorage.getItem('name') || 'Delivery Partner';
  deliveries = signal<Delivery[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  selectedTab = signal<string>('all');
  selectedDelivery = signal<Delivery | null>(null);

  isDetailsOpen = computed(() => !!this.selectedDelivery());

  filteredDeliveries = computed(() => {
    const tab = this.selectedTab().toLowerCase();
    const list = this.deliveries();
    if (tab === 'all') return list;
    return list.filter(d => d.deliveryStatus.toLowerCase().replace(/\s+/g, '-') === tab);
  });

  stats = computed(() => {
    const all = this.deliveries();
    const active = all.filter(d => ['assigned', 'picked up', 'out for delivery'].includes(d.deliveryStatus.toLowerCase())).length;
    const completed = all.filter(d => d.deliveryStatus.toLowerCase() === 'delivered').length;

    return {
      total: all.length,
      active,
      completed
    };
  });

  constructor(
    private deliveryService: DeliveryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.deliveryService.getPartnerDeliveries().subscribe({
      next: (data) => {
        // Sort deliveries: active first, then newest
        const priority: Record<string, number> = {
          'assigned': 0,
          'picked up': 1,
          'out for delivery': 2,
          'delivered': 3
        };

        const sorted = (data || []).sort((a, b) => {
          const pA = priority[a.deliveryStatus.toLowerCase()] ?? 99;
          const pB = priority[b.deliveryStatus.toLowerCase()] ?? 99;
          if (pA !== pB) return pA - pB;
          return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
        });

        this.deliveries.set(sorted);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load deliveries. Please try again.');
        this.toastr.error('Failed to load deliveries');
      }
    });
  }

  retry(): void {
    this.loadDeliveries();
  }

  getCountForTab(tab: string): number {
    const list = this.deliveries();
    if (tab === 'all') return list.length;
    return list.filter(d => d.deliveryStatus.toLowerCase().replace(/\s+/g, '-') === tab.toLowerCase()).length;
  }

  advanceStatus(delivery: Delivery): void {
    const nextStatusMap: Record<string, string> = {
      'assigned': 'Picked Up',
      'picked up': 'Out for Delivery',
      'out for delivery': 'Delivered'
    };

    const cur = delivery.deliveryStatus.toLowerCase();
    const nextStatus = nextStatusMap[cur];
    if (!nextStatus) return;

    this.deliveryService.updateDeliveryStatus(delivery.id, nextStatus).subscribe({
      next: () => {
        this.toastr.success(`Delivery #${delivery.id} updated to "${nextStatus}"`);
        this.loadDeliveries();
        if (this.selectedDelivery()?.id === delivery.id) {
          this.selectedDelivery.set({
            ...delivery,
            deliveryStatus: nextStatus
          });
        }
      },
      error: (err: any) => {
        const msg = err.error?.message || err.error || 'Failed to update delivery status';
        this.toastr.error(msg);
      }
    });
  }

  getNextActionText(status: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'assigned': return 'Mark Picked Up';
      case 'picked up': return 'Start Delivery';
      case 'out for delivery': return 'Complete Delivery';
      default: return '';
    }
  }

  getNextActionIcon(status: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'assigned': return 'shopping_bag';
      case 'picked up': return 'electric_moped';
      case 'out for delivery': return 'done_all';
      default: return 'check';
    }
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'assigned': return 'status-assigned';
      case 'picked up': return 'status-picked';
      case 'out for delivery': return 'status-transit';
      case 'delivered': return 'status-delivered';
      default: return 'status-default';
    }
  }

  getStatusBadgeClass(status: string): string {
    return this.getStatusClass(status);
  }

  getStatusIcon(status: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'assigned': return 'assignment_ind';
      case 'picked up': return 'storefront';
      case 'out for delivery': return 'local_shipping';
      case 'delivered': return 'check_circle';
      default: return 'info';
    }
  }

  viewDetails(delivery: Delivery): void {
    this.selectedDelivery.set(delivery);
  }

  closeDetails(): void {
    this.selectedDelivery.set(null);
  }
}
