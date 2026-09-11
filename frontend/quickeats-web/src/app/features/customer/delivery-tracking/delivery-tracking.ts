import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DeliveryService } from '../../../core/services/delivery.service';
import { OrderService } from '../../../core/services/order';
import { Delivery } from '../../../core/models/delivery.model';
import { OrderModel } from '../../../core/models/order.model';

@Component({
  selector: 'app-delivery-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './delivery-tracking.html',
  styleUrl: './delivery-tracking.scss'
})
export class DeliveryTrackingComponent {

  currentDelivery = signal<Delivery | null>(null);
  order = signal<OrderModel | null>(null);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  orderSteps = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'];
  deliverySteps = ['Assigned', 'Picked Up', 'Out for Delivery', 'Delivered'];

  constructor(
    private deliveryService: DeliveryService,
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));

    if (!orderId) {
      this.isLoading.set(false);
      this.loadError.set('Invalid order id. Please select a valid order.');
      return;
    }

    this.orderService.getOrderById(orderId).subscribe({
      next: (data) => {
        this.order.set(data);
        this.loadDelivery(orderId);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set(
          err.status === 403
            ? 'You are not authorized to view this order.'
            : 'Could not load tracking information. Please try again.'
        );
      }
    });
  }

  loadDelivery(orderId: number): void {
    this.deliveryService.getDeliveryByOrderId(orderId).subscribe({
      next: (data) => {
        this.currentDelivery.set(data);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  retry(): void {
    this.currentDelivery.set(null);
    this.order.set(null);
    this.loadData();
  }

  getOrderStepIndex(status: string): number {
    const s = (status || '').toLowerCase().replace(/\s+/g, '');
    const map: Record<string, number> = {
      'pending': 0,
      'confirmed': 1,
      'preparing': 2,
      'readyforpickup': 3,
      'ready': 3,
      'assigned': 3,
      'pickedup': 4,
      'outfordelivery': 4,
      'delivered': 5
    };
    return map[s] ?? -1;
  }

  isOrderStepCompleted(stepIndex: number): boolean {
    const order = this.order();
    if (!order || order.status === 'Cancelled') return false;
    return this.getOrderStepIndex(order.status) >= stepIndex;
  }

  isOrderStepActive(stepIndex: number): boolean {
    const order = this.order();
    if (!order || order.status === 'Cancelled') return false;
    return this.getOrderStepIndex(order.status) === stepIndex;
  }

  getOrderIcon(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('pending')) return 'hourglass_empty';
    if (s.includes('confirmed')) return 'check_circle';
    if (s.includes('preparing')) return 'outdoor_grill';
    if (s.includes('ready')) return 'inventory_2';
    if (s.includes('out') || s.includes('picked')) return 'two_wheeler';
    if (s.includes('delivered')) return 'verified';
    return 'info';
  }

  getDeliveryStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 'status-delivered';
    if (s.includes('on the way') || s.includes('out')) return 'status-transit';
    if (s.includes('picked')) return 'status-picked';
    return 'status-assigned';
  }

  backToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
