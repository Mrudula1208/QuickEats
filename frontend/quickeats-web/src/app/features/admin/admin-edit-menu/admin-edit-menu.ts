import { Component } from '@angular/core';
// Controls Edit Menu Page.

import { CommonModule } from '@angular/common';
// Used for Angular Directives.

import { FormsModule } from '@angular/forms';
// Used for ngModel.

import { ActivatedRoute, Router } from '@angular/router';
// Reads Menu Id and Navigates.

import { MenuService } from '../../../core/services/menu.service';
import { CategoryService } from '../../../core/services/category.service';
import { ImageService } from '../../../core/services/image.service';
import { MenuItem } from '../../../core/models/menu.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-edit-menu',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admin-edit-menu.html',

  styleUrl: './admin-edit-menu.scss'
})

export class AdminEditMenu {

  menu!: MenuItem;

  // File selected for upload.
  selectedFile: File | null = null;

  // Preview URL for new image.
  imagePreview: string = '';

  // Is file currently uploading.
  isUploading = false;

  // Available categories from backend.
  categories: Category[] = [];

  constructor(

    // Read URL Id.
    private route: ActivatedRoute,

    // Menu API.
    private menuService: MenuService,

    // Category API.
    private categoryService: CategoryService,

    // Image upload API.
    private imageService: ImageService,

    // Navigation.
    private router: Router

  ) {
    // Load categories from backend.
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.log(err)
    });

    const id = Number(

      this.route.snapshot.paramMap.get('id')

    );

    this.menuService
      .getMenuById(id)
      .subscribe({

        next: (data: MenuItem) => {

          this.menu = data;

        },

        error: (err: any) => {

          console.log(err);

        }

      });

  }

  // When user selects a file.
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  updateMenu(): void {

    // If a file is selected, upload it first.
    if (this.selectedFile) {
      this.isUploading = true;

      this.imageService.uploadImage(this.selectedFile, 'menu').subscribe({
        next: (response) => {
          this.menu.imageUrl = response.imageUrl;
          this.isUploading = false;
          this.saveMenu();
        },
        error: (err) => {
          console.log(err);
          this.isUploading = false;
        }
      });
    } else {
      this.saveMenu();
    }

  }

  private saveMenu(): void {
    // Send only the editable fields.
    // Property names must match
    // UpdateMenuDto in C#.
    const dto = {

      Name: this.menu.name,
      Description: this.menu.description,
      Price: this.menu.price,
      ImageUrl: this.menu.imageUrl,
      IsAvailable: this.menu.isAvailable,
      Category: this.menu.category,
      IsVeg: this.menu.isVeg,
      IsBestseller: this.menu.isBestseller,
      DiscountPercent: this.menu.discountPercent

    };

    this.menuService
      .updateMenuData(this.menu.id, dto)
      .subscribe({

        next: () => {

          console.log("Menu Updated");

          this.router.navigate(

            ['/admin/menu']

          );

        },

        error: (err: any) => {

          console.log(err);

        }

      });
  }

}
