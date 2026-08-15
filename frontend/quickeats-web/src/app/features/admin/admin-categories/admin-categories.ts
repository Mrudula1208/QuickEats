import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../core/services/menu.service';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
@Component({
  selector: 'app-admin-categories',
  imports: [CommonModule, AdminNavComponent],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss',
})
export class AdminCategories {
  categories: { name: string; count: number }[] = [];
  constructor(private menuService: MenuService) {
    this.loadCategories();
  }

  loadCategories(): void {
    this.menuService.getCategories().subscribe({
      next: (data: string[]) => {
        this.menuService.getMenus().subscribe({
          next: (menus: any[]) => {
            this.categories = data.map(c => ({
              name: c,
              count: menus.filter(m => m.category === c).length
            }));
            console.log(this.categories);
          },
          error: (err: any) => {
            console.error(err);
          }
        });
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }
}
