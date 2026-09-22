import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { DashboardService } from '../../../core/services/dashboard.service';
import { OrderService } from '../../../core/services/order';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { UserService } from '../../../core/services/user.service';
import { MenuService } from '../../../core/services/menu.service';
import { DashboardModel } from '../../../core/models/dashboard.model';
import { OrderModel } from '../../../core/models/order.model';
import { Restaurant } from '../../../core/models/restaurant.model';
import { UserModel } from '../../../core/models/user.model';
import { MenuItem } from '../../../core/models/menu.model';
import { ToastrService } from 'ngx-toastr';

interface TopRestaurant {
  id: number;
  name: string;
  orderCount: number;
  revenue: number;
  rating: number;
  imageUrl: string;
}

interface TopDish {
  name: string;
  orderCount: number;
  revenue: number;
  restaurantName: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminNavComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  dashboard = signal<DashboardModel | null>(null);
  orders = signal<OrderModel[]>([]);
  restaurants = signal<Restaurant[]>([]);
  users = signal<UserModel[]>([]);
  menus = signal<MenuItem[]>([]);
  isLoading = signal(true);

  // Derived summaries
  totalCustomers = computed(() => {
    return this.users().filter(u => !u.role || u.role.toLowerCase() === 'customer').length;
  });

  totalOwners = computed(() => {
    return this.users().filter(u => u.role?.toLowerCase() === 'owner').length;
  });

  totalDeliveryPartners = computed(() => {
    return this.users().filter(u => u.role?.toLowerCase().includes('delivery') || u.role?.toLowerCase().includes('rider')).length;
  });

  totalRevenue = computed(() => {
    return this.orders()
      .filter(o => o.status?.toLowerCase() !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  });

  statusBreakdown = computed(() => {
    const list = this.orders();
    return {
      pending: list.filter(o => o.status?.toLowerCase() === 'pending').length,
      confirmed: list.filter(o => o.status?.toLowerCase() === 'confirmed').length,
      preparing: list.filter(o => o.status?.toLowerCase() === 'preparing').length,
      ready: list.filter(o => o.status?.toLowerCase().includes('ready')).length,
      outForDelivery: list.filter(o => o.status?.toLowerCase().includes('out') || o.status?.toLowerCase().includes('delivery')).length,
      delivered: list.filter(o => o.status?.toLowerCase() === 'delivered').length,
      cancelled: list.filter(o => o.status?.toLowerCase() === 'cancelled').length,
    };
  });

  recentOrders = computed(() => {
    return this.orders().slice(0, 6);
  });

  topRestaurants = computed(() => {
    const ordersList = this.orders();
    const restMap = new Map<number, { count: number; revenue: number }>();

    ordersList.forEach(o => {
      if (o.status?.toLowerCase() !== 'cancelled') {
        const cur = restMap.get(o.restaurantId) || { count: 0, revenue: 0 };
        cur.count++;
        cur.revenue += o.totalAmount || 0;
        restMap.set(o.restaurantId, cur);
      }
    });

    const list: TopRestaurant[] = [];
    this.restaurants().forEach(r => {
      const stats = restMap.get(r.id) || { count: 0, revenue: 0 };
      list.push({
        id: r.id,
        name: r.name,
        orderCount: stats.count,
        revenue: stats.revenue,
        rating: r.rating || 4.5,
        imageUrl: r.imageUrl || '/assets/images/restaurant-placeholder.jpg'
      });
    });

    return list.sort((a, b) => b.orderCount - a.orderCount || b.revenue - a.revenue).slice(0, 5);
  });

  topDishes = computed(() => {
    const itemMap = new Map<string, { count: number; revenue: number; restName: string }>();

    this.orders().forEach(o => {
      if (o.status?.toLowerCase() !== 'cancelled' && o.items) {
        o.items.forEach(item => {
          const name = item.name || `Item #${item.menuItemId}`;
          const cur = itemMap.get(name) || { count: 0, revenue: 0, restName: o.restaurantName || '' };
          cur.count += item.quantity || 1;
          cur.revenue += (item.totalPrice || item.unitPrice * item.quantity || 0);
          itemMap.set(name, cur);
        });
      }
    });

    const list: TopDish[] = [];
    itemMap.forEach((val, name) => {
      list.push({
        name,
        orderCount: val.count,
        revenue: val.revenue,
        restaurantName: val.restName
      });
    });

    return list.sort((a, b) => b.orderCount - a.orderCount).slice(0, 5);
  });

  constructor(
    private dashboardService: DashboardService,
    private orderService: OrderService,
    private restaurantService: RestaurantService,
    private userService: UserService,
    private menuService: MenuService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    forkJoin({
      dashboard: this.dashboardService.getDashboard(),
      orders: this.orderService.getAllOrdersApi(),
      restaurants: this.restaurantService.getRestaurants(),
      users: this.userService.getUsers(),
      menus: this.menuService.getMenus()
    }).subscribe({
      next: ({ dashboard, orders, restaurants, users, menus }) => {
        this.dashboard.set(dashboard);
        this.orders.set(orders || []);
        this.restaurants.set(restaurants || []);
        this.users.set(users || []);
        this.menus.set(menus || []);
        this.isLoading.set(false);
      },
      error: () => {
        // Graceful fallback for individual endpoint failures
        this.orderService.getAllOrdersApi().subscribe({
          next: (o) => this.orders.set(o || []),
          error: () => {}
        });
        this.restaurantService.getRestaurants().subscribe({
          next: (r) => this.restaurants.set(r || []),
          error: () => {}
        });
        this.userService.getUsers().subscribe({
          next: (u) => this.users.set(u || []),
          error: () => {}
        });
        this.isLoading.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'status-badge--success';
      case 'pending':
      case 'placed':
        return 'status-badge--warning';
      case 'preparing':
      case 'confirmed':
        return 'status-badge--info';
      case 'ready for pickup':
      case 'ready':
      case 'out for delivery':
      case 'outfordelivery':
        return 'status-badge--purple';
      case 'cancelled':
        return 'status-badge--danger';
      default:
        return 'status-badge--default';
    }
  }
}
