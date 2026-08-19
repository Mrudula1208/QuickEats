import { Component } from '@angular/core';
// Controls the Add / Edit Restaurant form.
// The same page is used for both:
//   /owner/restaurants/new            -> Add
//   /owner/restaurants/:id/edit       -> Edit

import { CommonModule } from '@angular/common';
// Required for Angular directives.

import { FormsModule } from '@angular/forms';
// Required for [(ngModel)].

import { ActivatedRoute, Router } from '@angular/router';
// ActivatedRoute reads the restaurant id from the URL.
// Router navigates back to the list.

import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
// Top navigation bar.

import { RestaurantService } from '../../../core/services/restaurant.service';
// Saves the restaurant.

import { ImageService } from '../../../core/services/image.service';
// Handles image upload.

import { Restaurant } from '../../../core/models/restaurant.model';
// Structure of one restaurant.

@Component({
  selector: 'app-owner-restaurant-form',
  standalone: true,
  imports: [CommonModule, FormsModule, OwnerNavComponent],
  templateUrl: './owner-restaurant-form.html',
  styleUrl: './owner-restaurant-form.scss'
})
export class OwnerRestaurantFormComponent {

  // Edit mode when true, Add mode when false.
  isEdit = false;

  // Restaurant being added or edited.
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
    createdAt: '',
    deliveryCharge: 40,
    minimumOrder: 0
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
    private restaurantService: RestaurantService,
    private imageService: ImageService
  ) {

    // Check the URL to decide Add or Edit.
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      // Edit mode.
      this.isEdit = true;

      // Load the current restaurant data.
      this.restaurantService
        .getRestaurantById(Number(id))
        .subscribe({
          next: (data) => {
            this.restaurant = data;
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

  // Save the restaurant (Add or Edit).
  saveRestaurant(): void {

    // If a file is selected, upload it first.
    if (this.selectedFile) {
      this.isUploading = true;

      this.imageService.uploadImage(this.selectedFile, 'restaurants').subscribe({
        next: (response) => {
          this.restaurant.imageUrl = response.imageUrl;
          this.isUploading = false;
          this.submitRestaurant();
        },
        error: (err) => {
          console.log(err);
          this.isUploading = false;
        }
      });
    } else {
      this.submitRestaurant();
    }

  }

  private submitRestaurant(): void {
    if (this.isEdit) {

      // Update existing restaurant.
      this.restaurantService
        .updateRestaurant(this.restaurant)
        .subscribe({
          next: () => {
            this.router.navigate(['/owner/restaurants']);
          },
          error: (err) => {
            console.log(err);
          }
        });

    }
    else {

      // Create a new restaurant.
      this.restaurantService
        .addRestaurant(this.restaurant)
        .subscribe({
          next: () => {
            this.router.navigate(['/owner/restaurants']);
          },
          error: (err) => {
            console.log(err);
          }
        });

    }
  }

}
