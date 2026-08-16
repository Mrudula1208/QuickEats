import { Component } from '@angular/core';
// Controls Add Menu Page.

import { CommonModule } from '@angular/common';
// Required for Angular directives.

import { FormsModule } from '@angular/forms';
// Required for [(ngModel)].

import { Router } from '@angular/router';
// Used for Navigation.

import { MenuService } from '../../../core/services/menu.service';
// Calls Menu APIs.

import { ImageService } from '../../../core/services/image.service';
// Handles image upload.

import { MenuItem } from '../../../core/models/menu.model';
// Menu Structure.

@Component({
  selector: 'app-admin-add-menu',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admin-add-menu.html',

  styleUrl: './admin-add-menu.scss'
})

export class AdminAddMenu {

  // Store Menu Form.
  menu: MenuItem = {

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

    // Menu API.
    private menuService: MenuService,

    // Image upload API.
    private imageService: ImageService,

    // Navigation.
    private router: Router

  ) { }

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

  // Save Menu.
  saveMenu(): void {

    // If a file is selected, upload it first.
    if (this.selectedFile) {
      this.isUploading = true;

      this.imageService.uploadImage(this.selectedFile, 'menu').subscribe({
        next: (response) => {
          this.menu.imageUrl = response.imageUrl;
          this.isUploading = false;
          this.createMenu();
        },
        error: (err) => {
          console.log(err);
          this.isUploading = false;
        }
      });
    } else {
      this.createMenu();
    }

  }

  private createMenu(): void {
    this.menuService
      .addMenu(this.menu)
      .subscribe({

        next: () => {

          console.log("Menu Added");

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
