import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss',
})
export class AdminCategories {
  categories: Category[] = [];
  newName = '';
  editId = 0;
  editName = '';

  constructor(private categoryService: CategoryService) {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  addCategory(): void {
    if (!this.newName.trim()) return;

    this.categoryService.addCategory({ name: this.newName.trim() }).subscribe({
      next: () => {
        this.newName = '';
        this.loadCategories();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  startEdit(cat: Category): void {
    this.editId = cat.id;
    this.editName = cat.name;
  }

  cancelEdit(): void {
    this.editId = 0;
    this.editName = '';
  }

  saveEdit(): void {
    if (!this.editName.trim()) return;

    this.categoryService.updateCategory(this.editId, { name: this.editName.trim() }).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadCategories();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  deleteCategory(id: number): void {
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
