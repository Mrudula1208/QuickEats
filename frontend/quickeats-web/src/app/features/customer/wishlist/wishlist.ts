import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { WishlistModel } from '../../../core/models/wishlist.model';
import { CartService } from '../../../core/services/cart.service';
import { MenuService } from '../../../core/services/menu.service';
import { MenuItem } from '../../../core/models/menu.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class WishlistComponent {

  wishlistItems = signal<WishlistModel[]>([]);
  isLoading = signal(true);

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private menuService: MenuService,
    private toastr: ToastrService
  ) {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading.set(true);
    this.wishlistService.getWishlist().subscribe({
      next: (data) => {
        this.wishlistItems.set(data);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  removeItem(menuId: number): void {
    this.wishlistService.removeFromWishlist(menuId).subscribe({
      next: () => {
        this.wishlistItems.set(this.wishlistItems().filter(i => i.menuId !== menuId));
        this.toastr.success('Removed from wishlist');
      },
      error: () => { this.toastr.error('Failed to remove item'); }
    });
  }

  addToCart(item: WishlistModel): void {
    this.menuService.getMenuByRestaurantId(item.restaurantId).subscribe({
      next: (menus: MenuItem[]) => {
        const menuItem = menus.find(m => m.id === item.menuId);
        if (menuItem) {
          this.cartService.addToCart(menuItem);
          this.toastr.success(`${item.foodName} added to cart`);
        } else {
          this.toastr.error('Item not available');
        }
      },
      error: () => { this.toastr.error('Failed to add to cart'); }
    });
  }
}
