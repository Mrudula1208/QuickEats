import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { OrderService } from '../../../core/services/order';
import { Restaurant } from '../../../core/models/restaurant.model';
import { OrderModel } from '../../../core/models/order.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, OwnerNavComponent],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.scss'
})
export class OwnerDashboardComponent {

  ownerName = localStorage.getItem('name') || 'Owner';

  restaurants = signal<Restaurant[]>([]);
  orders = signal<OrderModel[]>([]);

  totalRestaurants = 0;
  totalOrders = 0;
  todayOrders = 0;
  pendingOrders = 0;
  revenue = 0;
  activeRestaurants = 0;

  recentOrders = signal<OrderModel[]>([]);
  popularItems: { name: string; count: number; restaurant: string }[] = [];

  isLoading = signal(true);
  loadError = signal<string | null>(null);

  constructor(
    private restaurantService: RestaurantService,
    private orderService: OrderService,
    private toastr: ToastrService
  ) {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    let restaurantDone = false;
    let ordersDone = false;

    const markDone = () => {
      if (restaurantDone && ordersDone) {
        this.isLoading.set(false);
      }
    };

    this.restaurantService.getMyRestaurants().subscribe({
      next: (data) => {
        this.restaurants.set(data);
        this.totalRestaurants = data.length;
        this.activeRestaurants = data.filter(r => r.isOpenNow).length;
        restaurantDone = true;
        markDone();
      },
      error: () => {
        this.loadError.set('Could not load your restaurant. Please try again.');
        restaurantDone = true;
        markDone();
      }
    });

    this.orderService.getOwnerOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.totalOrders = data.length;
        this.revenue = data.reduce((sum, o) => sum + o.totalAmount, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.todayOrders = data.filter(o => new Date(o.createdAt) >= today).length;
        this.pendingOrders = data.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length;

        const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.recentOrders.set(sorted.slice(0, 5));

        this.computePopularItems(data);
        ordersDone = true;
        markDone();
      },
      error: () => {
        this.loadError.set('Could not load your orders. Please try again.');
        ordersDone = true;
        markDone();
      }
    });
  }

  retry(): void {
    this.loadData();
  }

  // Primary restaurant associated with this owner (one owner = one restaurant).
  get mainRestaurant(): Restaurant | undefined {
    return this.restaurants()[0];
  }

  get mainRestaurantMenuLink(): string {
    const r = this.mainRestaurant;
    return r ? `/owner/menu/${r.id}` : '/owner/restaurants';
  }

  computePopularItems(orders: OrderModel[]): void {
    const itemCounts: { [key: string]: { count: number; restaurant: string } } = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        const key = item.name;
        if (!itemCounts[key]) {
          itemCounts[key] = { count: 0, restaurant: order.restaurantName };
        }
        itemCounts[key].count += item.quantity;
      });
    });
    this.popularItems = Object.entries(itemCounts)
      .map(([name, val]) => ({ name, count: val.count, restaurant: val.restaurant }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'preparing': return 'status-preparing';
      case 'out for delivery': case 'ondelivery': return 'status-out';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }
}
