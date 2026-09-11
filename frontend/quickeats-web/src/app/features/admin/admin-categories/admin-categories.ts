import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss'
})
export class AdminCategories {

  categories = signal<Category[]>([]);
  isLoading = signal(true);
  newName = '';
  editId = 0;
  editName = '';
  searchText = signal('');

  filteredCategories = computed(() => {
    const list = this.categories();
    const search = this.searchText();
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(c => c.name.toLowerCase().includes(s));
  });

  constructor(
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastr.error('Failed to load categories');
      }
    });
  }

  addCategory(): void {
    if (!this.newName.trim()) return;
    this.categoryService.addCategory({ name: this.newName.trim() }).subscribe({
      next: () => {
        this.newName = '';
        this.toastr.success('Category added');
        this.loadCategories();
      },
      error: (err) => this.toastr.error(err.error || 'Failed to add category')
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
        this.toastr.success('Category updated');
        this.loadCategories();
      },
      error: (err) => this.toastr.error(err.error || 'Failed to update category')
    });
  }

  deleteCategory(cat: Category): void {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    this.categoryService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.categories.update(list => list.filter(c => c.id !== cat.id));
        this.toastr.success(`${cat.name} deleted`);
      },
      error: (err) => this.toastr.error(err.error || 'Failed to delete category')
    });
  }
}
