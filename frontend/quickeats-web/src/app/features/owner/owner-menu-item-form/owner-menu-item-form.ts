import { Component } from '@angular/core';
// Controls the Add / Edit Menu Item form.
// The same page is used for both:
//   /owner/menu/:restaurantId/new                    -> Add
//   /owner/menu/:restaurantId/:itemId/edit           -> Edit

import { CommonModule } from '@angular/common';
// Required for Angular directives.

import { FormsModule } from '@angular/forms';
// Required for [(ngModel)].

import { ActivatedRoute, Router } from '@angular/router';
// ActivatedRoute reads ids from the URL.
// Router navigates back to the menu.

import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
// Top navigation bar.

import { MenuService } from '../../../core/services/menu.service';
// Saves menu items.

import { ImageService } from '../../../core/services/image.service';
// Handles image upload.

import { MenuItem } from '../../../core/models/menu.model';
// Structure of one menu item.

@Component({
  selector: 'app-owner-menu-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule, OwnerNavComponent],
  templateUrl: './owner-menu-item-form.html',
  styleUrl: './owner-menu-item-form.scss'
})
export class OwnerMenuItemFormComponent {

  // Edit mode when true, Add mode when false.
  isEdit = false;

  // Restaurant this item belongs to.
  restaurantId = 0;

  // Menu item being added or edited.
  item: MenuItem = {
    id: 0,
    restaurantId: 0,
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    isAvailable: true,
    category: 'Main Course',
    isVeg: true,
    isBestseller: false,
    discountPercent: 0
  };

  // File selected for upload.
  selectedFile: File | null = null;

  // Preview URL for selected image.
  imagePreview: string = '';

  // Is file currently uploading.
  isUploading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private imageService: ImageService
  ) {

    // Read the restaurant id and the menu item id from the URL.
    this.restaurantId = Number(
      this.route.snapshot.paramMap.get('restaurantId')
    );

    const itemId = this.route.snapshot.paramMap.get('itemId');

    if (itemId) {

      // Edit mode.
      this.isEdit = true;

      // Load the current menu item data.
      this.menuService
        .getMenuById(Number(itemId))
        .subscribe({
          next: (data) => {
            this.item = data;
          },
          error: (err) => {
            console.log(err);
          }
        });

    }

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

  // Save the menu item (Add or Edit).
  saveItem(): void {

    // If a file is selected, upload it first.
    if (this.selectedFile) {
      this.isUploading = true;

      this.imageService.uploadImage(this.selectedFile, 'menu').subscribe({
        next: (response) => {
          this.item.imageUrl = response.imageUrl;
          this.isUploading = false;
          this.submitItem();
        },
        error: (err) => {
          console.log(err);
          this.isUploading = false;
        }
      });
    } else {
      this.submitItem();
    }

  }

  private submitItem(): void {
    if (this.isEdit) {

      // Build the DTO that matches UpdateMenuDto in C#.
      const dto = {
        name: this.item.name,
        description: this.item.description,
        price: this.item.price,
        imageUrl: this.item.imageUrl,
        isAvailable: this.item.isAvailable,
        category: this.item.category,
        isVeg: this.item.isVeg,
        isBestseller: this.item.isBestseller,
        discountPercent: this.item.discountPercent
      };

      this.menuService
        .updateMenuData(this.item.id, dto)
        .subscribe({
          next: () => {
            this.router.navigate(['/owner/menu', this.restaurantId]);
          },
          error: (err) => {
            console.log(err);
          }
        });

    }
    else {

      // Add mode.
      // Tell the item which restaurant it belongs to.
      this.item.restaurantId = this.restaurantId;

      this.menuService
        .addMenu(this.item)
        .subscribe({
          next: () => {
            this.router.navigate(['/owner/menu', this.restaurantId]);
          },
          error: (err) => {
            console.log(err);
          }
        });

    }
  }

}
