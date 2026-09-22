import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
    RouterLink,
    AdminNavComponent
  ],
  templateUrl: './admin-edit-restaurant.html',
  styleUrl: './admin-edit-restaurant.scss'
})
export class AdminEditRestaurant implements OnInit {
  restaurant = signal<Restaurant | null>(null);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string>('');
  isUploading = signal(false);
  isSaving = signal(false);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  restaurantId = signal<number>(0);

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private imageService: ImageService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id || isNaN(id) || id <= 0) {
        this.isLoading.set(false);
        this.loadError.set('Invalid restaurant ID provided.');
        return;
      }
      this.restaurantId.set(id);
      this.loadRestaurant(id);
    });
  }

  loadRestaurant(id: number): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.restaurantService.getRestaurantById(id).subscribe({
      next: (data: Restaurant) => {
        if (!data) {
          this.loadError.set('Restaurant not found.');
          this.isLoading.set(false);
          return;
        }
        // Ensure default values if null
        data.openingTime = data.openingTime || '09:00';
        data.closingTime = data.closingTime || '22:00';
        data.deliveryCharge = data.deliveryCharge ?? 40;
        data.minimumOrder = data.minimumOrder ?? 0;
        this.restaurant.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err?.status === 404) {
          this.loadError.set('The requested restaurant does not exist.');
        } else {
          this.loadError.set('Failed to load restaurant details from backend.');
        }
      }
    });
  }

  retry(): void {
    if (this.restaurantId() > 0) {
      this.loadRestaurant(this.restaurantId());
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  updateRestaurant(): void {
    const rest = this.restaurant();
    if (!rest) return;

    if (this.selectedFile()) {
      this.isUploading.set(true);
      this.imageService.uploadImage(this.selectedFile()!, 'restaurants').subscribe({
        next: (response) => {
          rest.imageUrl = response.imageUrl;
          this.isUploading.set(false);
          this.saveRestaurant(rest);
        },
        error: () => {
          this.isUploading.set(false);
          this.toastr.error('Failed to upload image. Saving details without new image.');
          this.saveRestaurant(rest);
        }
      });
    } else {
      this.saveRestaurant(rest);
    }
  }

  private saveRestaurant(rest: Restaurant): void {
    this.isSaving.set(true);
    this.restaurantService.updateRestaurant(rest).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toastr.success(`Restaurant "${rest.name}" updated successfully!`, 'Changes Saved');
        this.router.navigate(['/admin/restaurants']);
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : 'Failed to update restaurant.');
        this.toastr.error(msg, 'Update Failed');
      }
    });
  }
}
