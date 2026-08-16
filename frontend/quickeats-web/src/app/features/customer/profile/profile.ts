import { Component } from '@angular/core';
// 1 Executes First.
// Import Component because every Angular page starts with @Component.

import { CommonModule } from '@angular/common';
// 2 Import CommonModule because HTML uses Angular directives.

import { FormsModule } from '@angular/forms';
// 3 Import FormsModule because Edit Profile uses ngModel.

import { ProfileService } from '../../../core/services/profile.service';
// 4 Import ProfileService.
// Service manages customer profile.

import { ImageService } from '../../../core/services/image.service';
// Handles image upload.

import { ProfileModel } from '../../../core/models/profile.model';
// 5 Import ProfileModel.
// Defines structure of customer profile.

import { ToastrService } from 'ngx-toastr';

@Component({

  selector: 'app-profile',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule

  ],

  templateUrl: './profile.html',

  styleUrl: './profile.scss'

})

export class ProfileComponent {

  profile: ProfileModel;

  // File selected for upload.
  selectedFile: File | null = null;

  // Preview URL for new image.
  imagePreview: string = '';

  // Is file currently uploading.
  isUploading = false;

  constructor(

    private profileService: ProfileService,

    private imageService: ImageService,

    private toastr: ToastrService

  ) {

    this.profile =

      this.profileService.getProfile();

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

  saveProfile(): void {

    // If a file is selected, upload it first.
    if (this.selectedFile) {
      this.isUploading = true;

      this.imageService.uploadImage(this.selectedFile, 'profile').subscribe({
        next: (response) => {
          this.profile.profileImage = response.imageUrl;
          this.isUploading = false;
          this.updateProfile();
        },
        error: (err) => {
          console.log(err);
          this.isUploading = false;
          this.toastr.error('Failed to upload image');
        }
      });
    } else {
      this.updateProfile();
    }

  }

  private updateProfile(): void {
    this.profileService.updateProfile(this.profile);
    this.toastr.success('Profile Updated Successfully');
  }

}
