import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerNavComponent } from '../../../shared/owner-nav/owner-nav';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserModel } from '../../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ImageService } from '../../../core/services/image.service';

@Component({
  selector: 'app-owner-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, OwnerNavComponent],
  templateUrl: './owner-profile.html',
  styleUrl: './owner-profile.scss'
})
export class OwnerProfileComponent implements OnInit {

  profile = signal<UserModel | null>(null);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  // Editable fields (profile image upload handled separately).
  savingImage = signal(false);

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private imageService: ImageService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.profile.set(user);
        this.isLoading.set(false);

        // Keep localStorage in sync so the nav greeting stays current.
        localStorage.setItem('name', user.name || '');
        localStorage.setItem('email', user.email || '');
        localStorage.setItem('profileImageUrl', user.profileImageUrl || '');
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load your profile. Please try again.');
      }
    });
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getRoleLabel(role: string): string {
    if (!role) return 'Owner';
    const map: Record<string, string> = {
      Owner: 'Restaurant Owner',
      Admin: 'Administrator',
      Customer: 'Customer',
      DeliveryPartner: 'Delivery Partner'
    };
    return map[role] || role;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    this.savingImage.set(true);
    this.imageService.uploadImage(file, 'profile').subscribe({
      next: (res) => {
        this.userService.updateProfileImage(res.imageUrl).subscribe({
          next: () => {
            this.profile.update(p => p ? { ...p, profileImageUrl: res.imageUrl } : p);
            localStorage.setItem('profileImageUrl', res.imageUrl);
            this.savingImage.set(false);
            this.toastr.success('Profile photo updated');
          },
          error: () => {
            this.savingImage.set(false);
            this.toastr.error('Could not save profile photo');
          }
        });
      },
      error: () => {
        this.savingImage.set(false);
        this.toastr.error('Could not upload photo');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.toastr.info('Logged out successfully');
    this.router.navigate(['/login']);
  }
}