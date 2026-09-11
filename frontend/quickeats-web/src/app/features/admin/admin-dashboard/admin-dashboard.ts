import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { DashboardService } from '../../../core/services/dashboard.service';
import { OrderService } from '../../../core/services/order';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { UserService } from '../../../core/services/user.service';
import { DashboardModel } from '../../../core/models/dashboard.model';
import { OrderModel } from '../../../core/models/order.model';
import { Restaurant } from '../../../core/models/restaurant.model';
import { UserModel } from '../../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminNavComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {

  dashboard = signal<DashboardModel | null>(null);
  recentOrders = signal<OrderModel[]>([]);
  recentRestaurants = signal<Restaurant[]>([]);
  recentUsers = signal<UserModel[]>([]);
  totalOwners = signal<number>(0);
  isLoading = signal(true);

  constructor(
    private dashboardService: DashboardService,
    private orderService: OrderService,
    private restaurantService: RestaurantService,
    private userService: UserService,
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
      users: this.userService.getUsers()
    }).subscribe({
      next: ({ dashboard, orders, restaurants, users }) => {
        this.dashboard.set(dashboard);
        this.recentOrders.set(orders.slice(0, 5));
        this.recentRestaurants.set(restaurants.slice(0, 4));
        this.recentUsers.set(users.slice(0, 5));
        this.totalOwners.set(users.filter((u: UserModel) => u.role === 'Owner').length);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback to basic dashboard if forkJoin partially fails
        this.dashboardService.getDashboard().subscribe({
          next: (d) => {
            this.dashboard.set(d);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
            this.toastr.error('Failed to load dashboard data');
          }
        });
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
      case 'ready':
      case 'outfordelivery':
        return 'status-badge--info';
      case 'cancelled':
        return 'status-badge--danger';
      default:
        return 'status-badge--default';
    }
  }
}
