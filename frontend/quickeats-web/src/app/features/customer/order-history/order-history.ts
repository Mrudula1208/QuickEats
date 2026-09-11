import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderModel } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order';
import { MenuService } from '../../../core/services/menu.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss'
})
export class OrderHistoryComponent {

  orders = signal<OrderModel[]>([]);
  filteredOrders = signal<OrderModel[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  activeFilter = signal('all');
  reorderingId = signal<number | null>(null);

  // Restaurant image cache keyed by restaurant id.
  restaurantImages = new Map<number, string>();

  constructor(
    private orderService: OrderService,
    private menuService: MenuService,
    private restaurantService: RestaurantService,
    private cartService: CartService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    const userId = Number(localStorage.getItem('userId') || 1);

    this.orderService.getUserOrders(userId).subscribe({
      next: (data) => {
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.orders.set(sorted);
        this.loadRestaurantImages(sorted);
        this.applyFilter(this.activeFilter());
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load your orders. Please check your connection and try again.');
      }
    });
  }

  // Fetch each restaurant image once and cache it.
  loadRestaurantImages(orders: OrderModel[]): void {
    const uniqueIds = [...new Set(orders.map(o => o.restaurantId))];

    uniqueIds.forEach(id => {
      if (this.restaurantImages.has(id)) return;

      this.restaurantService.getRestaurantById(id).subscribe({
        next: (restaurant) => {
          this.restaurantImages.set(id, restaurant.imageUrl);
        },
        error: () => {}
      });
    });
  }

  getRestaurantImage(restaurantId: number): string {
    return this.restaurantImages.get(restaurantId) || '';
  }

  retry(): void {
    this.loadOrders();
  }

  reorder(order: OrderModel): void {
    if (this.reorderingId() !== null) return;

    if (order.status === 'Cancelled') {
      this.toastr.warning('Cancelled orders cannot be reordered.');
      return;
    }

    this.reorderingId.set(order.id);
    this.toastr.info('Adding items to your cart...');

    // Clear the current cart before reordering.
    this.cartService.clearCart();

    // Add items one at a time so each quantity is respected.
    let index = 0;
    const processNext = () => {
      if (index >= order.items.length) {
        this.reorderingId.set(null);
        this.toastr.success('Items added to your cart. You can adjust quantities before checking out.');
        this.router.navigate(['/cart']);
        return;
      }

      const orderedItem = order.items[index];
      this.menuService.getMenuById(orderedItem.menuItemId).subscribe({
        next: (menu) => {
          for (let i = 0; i < orderedItem.quantity; i++) {
            this.cartService.addToCart(menu);
          }
          index++;
          processNext();
        },
        error: () => {
          this.reorderingId.set(null);
          this.toastr.error(`Could not reorder "${orderedItem.name}". It may no longer be available.`);
        }
      });
    };

    processNext();
  }

  applyFilter(filter: string): void {
    this.activeFilter.set(filter);
    const all = this.orders();

    switch (filter) {
      case 'active':
        this.filteredOrders.set(
          all.filter(o => ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(o.status))
        );
        break;
      case 'delivered':
        this.filteredOrders.set(all.filter(o => o.status === 'Delivered'));
        break;
      case 'cancelled':
        this.filteredOrders.set(all.filter(o => o.status === 'Cancelled'));
        break;
      default:
        this.filteredOrders.set(all);
    }
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'Pending': 'hourglass_empty',
      'Confirmed': 'check_circle',
      'Preparing': 'skillet',
      'Out for Delivery': 'delivery_dining',
      'Delivered': 'check_circle',
      'Cancelled': 'cancel'
    };
    return icons[status] || 'info';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Pending': 'status-pending',
      'Confirmed': 'status-confirmed',
      'Preparing': 'status-preparing',
      'Out for Delivery': 'status-out',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled'
    };
    return classes[status] || '';
  }

  canCancel(status: string): boolean {
    return status === 'Pending' || status === 'Confirmed';
  }

  cancelOrder(orderId: number): void {
    this.toastr.info('Cancelling order...');
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        this.toastr.success('Order cancelled successfully');
        this.loadOrders();
      },
      error: () => { this.toastr.error('Failed to cancel order'); }
    });
  }
}
