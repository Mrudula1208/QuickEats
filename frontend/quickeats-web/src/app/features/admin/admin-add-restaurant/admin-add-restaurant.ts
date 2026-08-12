import { Component } from '@angular/core';
// Controls Add Restaurant Page.

import { CommonModule } from '@angular/common';
// Required for Angular directives.

import { FormsModule } from '@angular/forms';
// Required for [(ngModel)].

import { Router } from '@angular/router';
// Used to navigate.

import { RestaurantService } from '../../../core/services/restaurant.service';
// Calls Restaurant APIs.

import { ImageService } from '../../../core/services/image.service';
// Handles image upload.

import { Restaurant } from '../../../core/models/restaurant.model';
// Restaurant structure.

@Component({
  selector: 'app-admin-add-restaurant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './admin-add-restaurant.html',
  styleUrl: './admin-add-restaurant.scss'
})

export class AdminAddRestaurant {

  // Store Restaurant Form.
  restaurant: Restaurant = {

    id: 0,

    name: '',

    description: '',

    address: '',

    phoneNumber: '',

    imageUrl: '',

    isActive: true,

    openingTime: '09:00',

    closingTime: '22:00',

    isOpenNow: true,

    createdAt: ''

  };

  // File selected for upload.
  selectedFile: File | null = null;

  // Preview URL for selected image.
  imagePreview: string = '';

  // Is file currently uploading.
  isUploading = false;

  constructor(

    // Restaurant API.
    private restaurantService: RestaurantService,

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

      // Show preview.
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Save Restaurant.
  saveRestaurant(): void {

    // If a file is selected, upload it first.
    if (this.selectedFile) {
      this.isUploading = true;

      this.imageService.uploadImage(this.selectedFile, 'restaurants').subscribe({
        next: (response) => {
          // Set the uploaded image URL.
          this.restaurant.imageUrl = response.imageUrl;
          this.isUploading = false;
          this.createRestaurant();
        },
        error: (err) => {
          console.log(err);
          this.isUploading = false;
        }
      });
    } else {
      // No file selected, save directly.
      this.createRestaurant();
    }

  }

  // Create restaurant after image upload (or without image).
  private createRestaurant(): void {
    this.restaurantService
      .addRestaurant(this.restaurant)
      .subscribe({

        next: () => {

          console.log("Restaurant Added");

          this.router.navigate(

            ['/admin/restaurants']

          );

        },

        error: (err: any) => {

          console.log(err);

        }

      });
  }

}
