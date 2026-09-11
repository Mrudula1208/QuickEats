import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {

  isLoggedIn = false;
  userName = '';
  mobileMenuOpen = false;
  cartCount = 0;
  unreadCount = 0;
  isHomePage = false;
  searchQuery = '';

  private routerSub?: Subscription;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.checkAuth();
    this.checkRoute();
  }

  ngOnInit(): void {
    this.cartCount = this.cartService.cartItems().length;

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
        this.checkAuth();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private checkAuth(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.userName = localStorage.getItem('name') || '';
      this.loadUnreadCount();
    }
  }

  private checkRoute(): void {
    this.isHomePage = this.router.url === '/' || this.router.url === '/landing/page';
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count: number) => { this.unreadCount = count; },
      error: () => {}
    });
  }

  getCartCount(): number {
    return this.cartService.cartItems().length;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userName = '';
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/restaurants'], { queryParams: { search: this.searchQuery } });
      this.searchQuery = '';
      this.closeMobileMenu();
    }
  }
}
