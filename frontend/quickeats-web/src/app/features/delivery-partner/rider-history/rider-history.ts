import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeliveryService } from '../../../core/services/delivery.service';
import { OrderDeliveryResponse } from '../../../core/models/delivery.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rider-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rider-history.html',
  styleUrl: './rider-history.scss'
})
export class RiderHistoryComponent implements OnInit {
  deliveries = signal<OrderDeliveryResponse[]>([]);
  isLoading = signal(true);
  loadError = signal('');
  searchText = signal('');

  // Only delivered (completed) tasks
  completedDeliveries = computed(() => {
    let list = this.deliveries().filter(d => d.deliveryStatus.toLowerCase() === 'delivered');
    const query = this.searchText().toLowerCase().trim();

    if (query) {
      list = list.filter(d =>
        d.id.toString().includes(query) ||
        d.orderId.toString().includes(query) ||
        (d.restaurantName && d.restaurantName.toLowerCase().includes(query)) ||
        (d.customerName && d.customerName.toLowerCase().includes(query)) ||
        (d.deliveryAddress && d.deliveryAddress.toLowerCase().includes(query))
      );
    }

    // Sort by delivered date descending
    return list.sort((a, b) => {
      const timeA = a.deliveredAt ? new Date(a.deliveredAt).getTime() : new Date(a.assignedAt).getTime();
      const timeB = b.deliveredAt ? new Date(b.deliveredAt).getTime() : new Date(b.assignedAt).getTime();
      return timeB - timeA;
    });
  });

  stats = computed(() => {
    const list = this.completedDeliveries();
    const totalCount = list.length;
    const totalAmount = list.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
    return { totalCount, totalAmount };
  });

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.deliveryService.getPartnerDeliveries().subscribe({
      next: (data) => {
        this.deliveries.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load delivery history. Please check connection and try again.');
        this.toastr.error('Failed to load history');
      }
    });
  }

  retry(): void {
    this.loadHistory();
  }

  viewDelivery(deliveryId: number): void {
    this.router.navigate(['/delivery/deliveries', deliveryId]);
  }
}
