import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeliveryService } from '../../../core/services/delivery.service';
import { OrderDeliveryResponse } from '../../../core/models/delivery.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rider-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rider-profile.html',
  styleUrl: './rider-profile.scss'
})
export class RiderProfileComponent implements OnInit {
  riderName = signal(localStorage.getItem('name') || 'Delivery Partner');
  riderEmail = signal(localStorage.getItem('email') || 'rider@quickeats.com');
  riderRole = signal('Delivery Partner');
  isAvailable = signal(true);

  deliveries = signal<OrderDeliveryResponse[]>([]);
  isLoading = signal(true);

  stats = computed(() => {
    const list = this.deliveries();
    const completed = list.filter(d => d.deliveryStatus.toLowerCase() === 'delivered');
    const active = list.filter(d => ['assigned', 'picked up', 'out for delivery'].includes(d.deliveryStatus.toLowerCase()));
    const totalEarnings = completed.reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    return {
      totalTasks: list.length,
      completedCount: completed.length,
      activeCount: active.length,
      totalEarnings
    };
  });

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const status = localStorage.getItem('rider_availability');
    if (status !== null) {
      this.isAvailable.set(status === 'true');
    }

    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.deliveryService.getPartnerDeliveries().subscribe({
      next: (data) => {
        this.deliveries.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  toggleAvailability(): void {
    const nextState = !this.isAvailable();
    this.isAvailable.set(nextState);
    localStorage.setItem('rider_availability', String(nextState));

    if (nextState) {
      this.toastr.success('You are now Online & Available for orders');
    } else {
      this.toastr.info('You are now Offline');
    }
  }

  logout(): void {
    localStorage.clear();
    this.toastr.info('Logged out successfully');
    this.router.navigate(['/login']);
  }
}
