import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { ProfileModel } from '../../../core/models/profile.model';
import { SavedAddressService } from '../../../core/services/saved-address.service';
import { SavedAddressModel } from '../../../core/models/saved-address.model';
import { ImageService } from '../../../core/services/image.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order';
import { OrderModel } from '../../../core/models/order.model';
import { FavoriteService } from '../../../core/services/favorite.service';
import { FavoriteModel } from '../../../core/models/favorite.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  profile: ProfileModel;
  isEditing = signal(false);
  selectedFile: File | null = null;
  imagePreview = '';
  isUploading = signal(false);
  isSaving = signal(false);
  isLoadingProfile = signal(true);

  addresses = signal<SavedAddressModel[]>([]);
  isLoadingAddresses = signal(true);
  showAddressForm = signal(false);
  isSavingAddress = signal(false);
  editingAddressId = signal<number | null>(null);

  recentOrders = signal<OrderModel[]>([]);
  isLoadingOrders = signal(true);

  favorites = signal<FavoriteModel[]>([]);
  isLoadingFavorites = signal(true);

  showPasswordSection = signal(false);
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  userName = '';
  userRole = '';
  userImage = '';
  userEmail = '';

  newAddress: SavedAddressModel = {
    addressId: 0,
    customerName: '',
    phoneNumber: '',
    houseNumber: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
    isDefault: false,
  };

  private editBackup: ProfileModel | null = null;

  constructor(
    private profileService: ProfileService,
    private addressService: SavedAddressService,
    private imageService: ImageService,
    private authService: AuthService,
    private orderService: OrderService,
    private favoriteService: FavoriteService,
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.profile = this.profileService.getProfile();
    this.userName = localStorage.getItem('name') || this.profile.fullName;
    this.userRole = localStorage.getItem('role') || 'Customer';
    this.userImage = localStorage.getItem('profileImageUrl') || this.profile.profileImage;
    this.userEmail = localStorage.getItem('email') || this.profile.email;
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadAddresses();
    this.loadRecentOrders();
    this.loadFavorites();
  }

  loadProfile(): void {
    this.isLoadingProfile.set(true);
    this.profile = this.profileService.getProfile();
    this.userName = localStorage.getItem('name') || this.profile.fullName;
    this.userEmail = localStorage.getItem('email') || this.profile.email;
    this.userImage = localStorage.getItem('profileImageUrl') || this.profile.profileImage;
    this.isLoadingProfile.set(false);
  }

  loadAddresses(): void {
    this.isLoadingAddresses.set(true);
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        this.addresses.set(data);
        this.isLoadingAddresses.set(false);
      },
      error: () => {
        this.isLoadingAddresses.set(false);
      },
    });
  }

  loadRecentOrders(): void {
    this.isLoadingOrders.set(true);
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.isLoadingOrders.set(false);
      return;
    }
    this.orderService.getUserOrders(Number(userId)).subscribe({
      next: (orders) => {
        const sorted = orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        this.recentOrders.set(sorted.slice(0, 5));
        this.isLoadingOrders.set(false);
      },
      error: () => {
        this.isLoadingOrders.set(false);
      },
    });
  }

  loadFavorites(): void {
    this.isLoadingFavorites.set(true);
    this.favoriteService.getFavorites().subscribe({
      next: (favs) => {
        this.favorites.set(favs.slice(0, 6));
        this.isLoadingFavorites.set(false);
      },
      error: () => {
        this.isLoadingFavorites.set(false);
      },
    });
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      if (this.editBackup) {
        this.profile = { ...this.editBackup };
        this.editBackup = null;
      }
      this.selectedFile = null;
      this.imagePreview = '';
      this.isEditing.set(false);
    } else {
      this.editBackup = { ...this.profile };
      this.isEditing.set(true);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Image must be under 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.toastr.error('Only JPG, PNG, WebP images are allowed');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveProfile(): void {
    if (!this.profile.fullName || !this.profile.fullName.trim()) {
      this.toastr.error('Name is required');
      return;
    }
    if (this.profile.phoneNumber && !/^\d{10}$/.test(this.profile.phoneNumber)) {
      this.toastr.error('Please enter a valid 10-digit phone number');
      return;
    }

    this.isSaving.set(true);

    if (this.selectedFile) {
      this.isUploading.set(true);
      this.imageService.uploadImage(this.selectedFile, 'profile').subscribe({
        next: (response) => {
          this.profile.profileImage = response.imageUrl;
          localStorage.setItem('profileImageUrl', response.imageUrl);
          this.userImage = response.imageUrl;
          this.isUploading.set(false);
          this.persistProfile();
        },
        error: () => {
          this.isUploading.set(false);
          this.isSaving.set(false);
          this.toastr.error('Failed to upload image');
        },
      });
    } else {
      this.persistProfile();
    }
  }

  private persistProfile(): void {
    this.profileService.updateProfile(this.profile);
    this.userName = this.profile.fullName;
    this.userEmail = this.profile.email;
    this.isEditing.set(false);
    this.isSaving.set(false);
    this.selectedFile = null;
    this.imagePreview = '';
    this.editBackup = null;
    this.toastr.success('Profile updated successfully');
  }

  openAddressForm(): void {
    this.editingAddressId.set(null);
    this.newAddress = {
      addressId: 0,
      customerName: this.profile.fullName,
      phoneNumber: this.profile.phoneNumber,
      houseNumber: '',
      area: '',
      landmark: '',
      city: this.profile.city,
      state: this.profile.state,
      pincode: '',
      addressType: 'Home',
      isDefault: this.addresses().length === 0,
    };
    this.showAddressForm.set(true);
  }

  editAddress(addr: SavedAddressModel): void {
    this.editingAddressId.set(addr.addressId);
    this.newAddress = { ...addr };
    this.showAddressForm.set(true);
  }

  cancelAddressForm(): void {
    this.showAddressForm.set(false);
    this.editingAddressId.set(null);
  }

  saveAddress(): void {
    if (!this.newAddress.houseNumber?.trim() || !this.newAddress.area?.trim() || !this.newAddress.city?.trim() || !this.newAddress.pincode?.trim()) {
      this.toastr.error('Please fill in all required fields');
      return;
    }
    if (!/^\d{6}$/.test(this.newAddress.pincode)) {
      this.toastr.error('Please enter a valid 6-digit pincode');
      return;
    }

    this.isSavingAddress.set(true);
    this.addressService.addAddress(this.newAddress).subscribe({
      next: () => {
        this.toastr.success(this.editingAddressId() ? 'Address updated successfully' : 'Address saved successfully');
        this.showAddressForm.set(false);
        this.editingAddressId.set(null);
        this.isSavingAddress.set(false);
        this.loadAddresses();
      },
      error: () => {
        this.isSavingAddress.set(false);
        this.toastr.error('Failed to save address');
      },
    });
  }

  deleteAddress(addressId: number): void {
    this.addressService.deleteAddress(addressId).subscribe({
      next: () => {
        this.toastr.success('Address deleted');
        this.loadAddresses();
      },
      error: () => {
        this.toastr.error('Failed to delete address');
      },
    });
  }

  setDefault(addressId: number): void {
    this.addressService.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.toastr.success('Default address updated');
        this.loadAddresses();
      },
      error: () => {
        this.toastr.error('Failed to update default address');
      },
    });
  }

  changePassword(): void {
    if (!this.currentPassword) {
      this.toastr.error('Please enter your current password');
      return;
    }
    if (!this.newPassword || this.newPassword.length < 6) {
      this.toastr.error('New password must be at least 6 characters');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }
    if (this.currentPassword === this.newPassword) {
      this.toastr.error('New password must be different from current password');
      return;
    }

    this.toastr.info('Password change is not supported by the current backend. Please contact support.');
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showPasswordSection.set(false);
  }

  getAddressIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'home':
        return 'home';
      case 'office':
        return 'work';
      default:
        return 'location_on';
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'preparing':
        return 'status-preparing';
      case 'out for delivery':
        return 'status-out';
      default:
        return 'status-default';
    }
  }

  logout(): void {
    this.authService.logout();
    this.toastr.success('You have been logged out');
    this.router.navigate(['/']);
  }
}
