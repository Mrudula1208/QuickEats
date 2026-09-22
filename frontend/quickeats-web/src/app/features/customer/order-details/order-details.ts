import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order';
import { DeliveryService } from '../../../core/services/delivery.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { OrderModel } from '../../../core/models/order.model';
import { Delivery } from '../../../core/models/delivery.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss'
})
export class OrderDetailsComponent {

  selectedOrder = signal<OrderModel | undefined>(undefined);
  delivery = signal<Delivery | null>(null);
  isLoading = signal(true);

  timelineSteps = ['Placed', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'];

  // Maps the backend status to the friendly step shown to the customer.
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

  private normalize(status: string): string {
    return this.statusToStep[status] || status;
  }

  constructor(
    private currentRoute: ActivatedRoute,
    private orderService: OrderService,
    private deliveryService: DeliveryService,
    private wishlistService: WishlistService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loadSelectedOrder();
  }

  loadSelectedOrder(): void {
    this.isLoading.set(true);
    const id = Number(this.currentRoute.snapshot.paramMap.get('id'));

    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.selectedOrder.set(data);
        this.loadDelivery(id);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  loadDelivery(orderId: number): void {
    this.deliveryService.getDeliveryByOrderId(orderId).subscribe({
      next: (data) => { this.delivery.set(data); },
      error: () => {}
    });
  }

  refreshOrder(): void {
    this.loadSelectedOrder();
  }

  getStatusClass(status: string): string {
    const step = this.normalize(status);
    const classes: Record<string, string> = {
      'Placed': 'status-pending',
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
    const step = this.normalize(status);
    const icons: Record<string, string> = {
      'Placed': 'hourglass_empty',
      'Confirmed': 'check_circle',
      'Preparing': 'skillet',
      'Ready for Pickup': 'inventory_2',
      'Out for Delivery': 'delivery_dining',
      'Delivered': 'check_circle',
      'Cancelled': 'cancel'
    };
    return icons[step] || 'info';
  }

  getStepIndex(status: string): number {
    return this.timelineSteps.indexOf(this.normalize(status));
  }

  isStepCompleted(stepIndex: number, currentStatus: string): boolean {
    if (currentStatus === 'Cancelled') return false;
    return this.getStepIndex(currentStatus) >= stepIndex;
  }

  isStepActive(stepIndex: number, currentStatus: string): boolean {
    if (currentStatus === 'Cancelled') return false;
    return this.getStepIndex(currentStatus) === stepIndex;
  }

  canCancel(): boolean {
    const order = this.selectedOrder();
    if (!order) return false;
    return order.status === 'Pending' || order.status === 'Confirmed';
  }

  cancelOrder(): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.orderService.cancelOrder(order.id).subscribe({
      next: () => {
        this.selectedOrder.set({ ...order, status: 'Cancelled' });
        this.toastr.success('Order cancelled successfully');
      },
      error: () => { this.toastr.error('Failed to cancel order'); }
    });
  }

  canTrack(): boolean {
    const order = this.selectedOrder();
    if (!order) return false;
    return order.status !== 'Cancelled' && order.status !== 'Delivered';
  }

  trackOrder(): void {
    const order = this.selectedOrder();
    if (order) {
      this.router.navigate(['/orders', order.id, 'track']);
    }
  }

  addOrderToWishlist(): void {
    const order = this.selectedOrder();
    if (!order || !order.items || order.items.length === 0) return;

    const uniqueItems = order.items.filter(
      (item, index, self) => self.findIndex(i => i.menuItemId === item.menuItemId) === index
    );

    const restaurantId = order.restaurantId;
    const restaurantName = order.restaurantName;

    uniqueItems.forEach(item => {
      this.wishlistService.addToWishlist({
        wishlistId: 0,
        menuId: item.menuItemId,
        restaurantId,
        restaurantName,
        foodName: item.name,
        imageUrl: '',
        price: item.unitPrice,
        category: 'Saved from order'
      }).subscribe({
        error: () => {}
      });
    });

    this.toastr.success('Items added to your wishlist');
    this.router.navigate(['/wishlist']);
  }
}
