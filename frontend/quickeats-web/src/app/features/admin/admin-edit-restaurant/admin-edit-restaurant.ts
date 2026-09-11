import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { RestaurantService } from '../../../core/services/restaurant.service';
import { ImageService } from '../../../core/services/image.service';
import { Restaurant } from '../../../core/models/restaurant.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-edit-restaurant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminNavComponent
  ],
  templateUrl: './admin-edit-restaurant.html',
  styleUrl: './admin-edit-restaurant.scss'
})
export class AdminEditRestaurant {

  restaurant!: Restaurant;

  // File selected for upload.
  selectedFile: File | null = null;

  // Preview URL for new image.
  imagePreview: string = '';

  // Is file currently uploading.
  isUploading = false;

  // True while the restaurant is loading.
  isLoading = true;

  // Holds the error message if loading fails.
  loadError: string | null = null;

  constructor(

    private route: ActivatedRoute,

    private restaurantService: RestaurantService,

    private imageService: ImageService,

    private router: Router,

    private toastr: ToastrService

  ) {

    this.loadRestaurant();

  }

  loadRestaurant(): void {

    this.isLoading = true;
    this.loadError = null;

    const id = Number(

      this.route.snapshot.paramMap.get('id')

    );

    this.restaurantService
      .getRestaurantById(id)
      .subscribe({

        next: (data: Restaurant) => {

          this.restaurant = data;
          this.isLoading = false;

        },

        error: () => {
          this.isLoading = false;
          this.loadError = 'Failed to load restaurant';
          this.toastr.error('Failed to load restaurant');
        }

      });

  }

  retry(): void {
    this.loadRestaurant();
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

  updateRestaurant(): void {

    // If a file is selected, upload it first.
    if (this.selectedFile) {
      this.isUploading = true;

      this.imageService.uploadImage(this.selectedFile, 'restaurants').subscribe({
        next: (response) => {
          this.restaurant.imageUrl = response.imageUrl;
          this.isUploading = false;
          this.saveRestaurant();
        },
        error: () => {
          this.isUploading = false;
          this.toastr.error('Failed to upload image');
        }
      });
    } else {
      this.saveRestaurant();
    }

  }

  private saveRestaurant(): void {
    this.restaurantService
      .updateRestaurant(this.restaurant)
      .subscribe({

        next: () => {

          this.toastr.success('Restaurant updated successfully');

          this.router.navigate(

            ['/admin/restaurants']

          );

        },

        error: () => this.toastr.error('Failed to update restaurant')

      });
  }

}
