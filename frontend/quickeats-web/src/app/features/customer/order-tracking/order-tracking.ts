import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order';
import { DeliveryService } from '../../../core/services/delivery.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { OrderModel } from '../../../core/models/order.model';
import { Delivery } from '../../../core/models/delivery.model';
import { Restaurant } from '../../../core/models/restaurant.model';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.scss'
})
export class OrderTrackingComponent implements OnDestroy {

  order = signal<OrderModel | null>(null);
  delivery = signal<Delivery | null>(null);
  restaurant = signal<Restaurant | null>(null);

  isLoading = signal(true);
  loadError = signal<string | null>(null);

  // Order progress steps.
  steps = ['Placed', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'];

  // Maps backend status to the friendly step name.
  private statusToStep: Record<string, string> = {
    'Pending': 'Placed',
    'Confirmed': 'Confirmed',
    'Preparing': 'Preparing',
    'Ready for Pickup': 'Ready for Pickup',
    'Ready': 'Ready for Pickup',
    'Assigned': 'Ready for Pickup',
    'Picked Up': 'Out for Delivery',
    'Out for Delivery': 'Out for Delivery',
    'OutForDelivery': 'Out for Delivery',
    'Delivered': 'Delivered',
    'Cancelled': 'Cancelled'
  };

  private orderId: number | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private orderService: OrderService,
    private deliveryService: DeliveryService,
    private restaurantService: RestaurantService,
    private route: ActivatedRoute
  ) {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  ngOnDestroy(): void {
    this.stopRefreshing();
  }

  loadData(): void {
    if (!this.orderId || this.orderId <= 0) {
      this.isLoading.set(false);
      this.loadError.set('Invalid order id. Please select a valid order.');
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(null);

    this.orderService.getOrderById(this.orderId).subscribe({
      next: (data) => {
        this.order.set(data);
        this.loadRestaurant(data.restaurantId);
        this.loadDelivery(data.id);
        this.isLoading.set(false);
        this.startRefreshing();
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 403 || err.status === 401) {
          this.loadError.set('You are not authorized to view this order.');
        } else if (err.status === 404) {
          this.loadError.set('This order could not be found.');
        } else {
          this.loadError.set('Could not load tracking information. Please try again.');
        }
      }
    });
  }

  loadRestaurant(restaurantId: number): void {
    this.restaurantService.getRestaurantById(restaurantId).subscribe({
      next: (data) => this.restaurant.set(data),
      error: () => {}
    });
  }

  loadDelivery(orderId: number): void {
    this.deliveryService.getDeliveryByOrderId(orderId).subscribe({
      next: (data) => this.delivery.set(data),
      error: () => {}
    });
  }

  // Refresh the current status periodically while the order is active.
  private startRefreshing(): void {
    if (!this.order()) return;
    const status = this.normalizedStatus(this.order()!.status);
    if (status === 'Delivered' || status === 'Cancelled') return;

    this.stopRefreshing();
    this.refreshTimer = setInterval(() => {
      if (!this.orderId) return;
      this.orderService.getOrderById(this.orderId).subscribe({
        next: (data) => {
          this.order.set(data);
          const s = this.normalizedStatus(data.status);
          if (s === 'Delivered' || s === 'Cancelled') this.stopRefreshing();
          this.loadDelivery(data.id);
        },
        error: () => {}
      });
    }, 15000);
  }

  private stopRefreshing(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  retry(): void {
    this.delivery.set(null);
    this.restaurant.set(null);
    this.order.set(null);
    this.loadData();
  }

  // Normalize the backend status to our step naming.
  normalizedStatus(status: string): string {
    return this.statusToStep[status] || status;
  }

  // Index of the current step, -1 if cancelled or unknown.
  currentStepIndex(): number {
    const order = this.order();
    if (!order) return -1;
    const step = this.normalizedStatus(order.status);
    return this.steps.indexOf(step);
  }

  isCancelled(): boolean {
    return this.order()?.status === 'Cancelled';
  }

  isDelivered(): boolean {
    return this.order()?.status === 'Delivered';
  }

  isStepCompleted(index: number): boolean {
    const ci = this.currentStepIndex();
    return ci >= 0 && index < ci;
  }

  isStepActive(index: number): boolean {
    return this.currentStepIndex() === index;
  }

  stepIcon(index: number): string {
    if (this.isStepCompleted(index)) return 'check';
    const icons: Record<number, string> = {
      0: 'receipt_long',
      1: 'check_circle_outline',
      2: 'outdoor_grill',
      3: 'inventory_2',
      4: 'delivery_dining',
      5: 'verified'
    };
    return icons[index] || 'circle';
  }

  getStatusClass(status: string): string {
    const step = this.normalizedStatus(status);
    const classes: Record<string, string> = {
      'Placed': 'status-placed',
      'Confirmed': 'status-confirmed',
      'Preparing': 'status-preparing',
      'Ready for Pickup': 'status-ready',
      'Out for Delivery': 'status-out',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled'
    };
    return classes[step] || '';
  }

  getStatusIcon(status: string): string {
    const step = this.normalizedStatus(status);
    const icons: Record<string, string> = {
      'Placed': 'receipt_long',
      'Confirmed': 'check_circle',
      'Preparing': 'outdoor_grill',
      'Ready for Pickup': 'inventory_2',
      'Out for Delivery': 'delivery_dining',
      'Delivered': 'verified',
      'Cancelled': 'cancel'
    };
    return icons[step] || 'info';
  }

  isDeliveryInTransit(): boolean {
    const d = this.delivery();
    return !!d && !['Delivered'].includes(d.deliveryStatus);
  }

  deliveryStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return 'status-delivered';
    if (s.includes('on the way') || s.includes('out') || s.includes('arrived')) return 'status-transit';
    if (s.includes('picked')) return 'status-picked';
    return 'status-assigned';
  }

  backToOrders(): void {
    window.history.back();
  }
}
