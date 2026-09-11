import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
import { MenuService } from '../../../core/services/menu.service';
import { CategoryService } from '../../../core/services/category.service';
import { ImageService } from '../../../core/services/image.service';
import { MenuItem } from '../../../core/models/menu.model';
import { Category } from '../../../core/models/category.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-owner-menu-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, OwnerNavComponent],
  templateUrl: './owner-menu-item-form.html',
  styleUrl: './owner-menu-item-form.scss'
})
export class OwnerMenuItemFormComponent {

  isEdit = false;
  restaurantId = 0;
  isSaving = false;

  item: MenuItem = {
    id: 0, restaurantId: 0, name: '', description: '', price: 0,
    imageUrl: '', isAvailable: true, category: 'Main Course',
    isVeg: true, isBestseller: false, discountPercent: 0
  };

  selectedFile: File | null = null;
  imagePreview = '';
  isUploading = false;
  categories: Category[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private categoryService: CategoryService,
    private imageService: ImageService,
    private toastr: ToastrService
  ) {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('restaurantId'));
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: () => {}
    });

    const itemId = this.route.snapshot.paramMap.get('itemId');
    if (itemId) {
      this.isEdit = true;
      this.menuService.getMenuById(Number(itemId)).subscribe({
        next: (data) => this.item = data,
        error: () => this.toastr.error('Failed to load menu item')
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveItem(): void {
    if (this.selectedFile) {
      this.isUploading = true;
      this.imageService.uploadImage(this.selectedFile, 'menu').subscribe({
        next: (response) => {
          this.item.imageUrl = response.imageUrl;
          this.isUploading = false;
          this.submitItem();
        },
        error: () => {
          this.isUploading = false;
          this.toastr.error('Failed to upload image');
        }
      });
    } else {
      this.submitItem();
    }
  }

  private submitItem(): void {
    this.isSaving = true;
    if (this.isEdit) {
      const dto = {
        name: this.item.name, description: this.item.description,
        price: this.item.price, imageUrl: this.item.imageUrl,
        isAvailable: this.item.isAvailable, category: this.item.category,
        isVeg: this.item.isVeg, isBestseller: this.item.isBestseller,
        discountPercent: this.item.discountPercent
      };
      this.menuService.updateMenuData(this.item.id, dto).subscribe({
        next: () => {
          this.toastr.success('Menu item updated');
          this.router.navigate(['/owner/menu', this.restaurantId]);
        },
        error: () => { this.isSaving = false; this.toastr.error('Failed to update item'); }
      });
    } else {
      this.item.restaurantId = this.restaurantId;
      this.menuService.addMenu(this.item).subscribe({
        next: () => {
          this.toastr.success('Menu item created');
          this.router.navigate(['/owner/menu', this.restaurantId]);
        },
        error: () => { this.isSaving = false; this.toastr.error('Failed to create item'); }
      });
    }
  }
}
