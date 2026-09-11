import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MenuService } from '../../../core/services/menu.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { CategoryService } from '../../../core/services/category.service';
import { ImageService } from '../../../core/services/image.service';
import { MenuItem } from '../../../core/models/menu.model';
import { Restaurant } from '../../../core/models/restaurant.model';
import { Category } from '../../../core/models/category.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-edit-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminNavComponent],
  templateUrl: './admin-edit-menu.html',
  styleUrl: '../admin-add-menu/admin-add-menu.scss'
})
export class AdminEditMenu implements OnInit {
  menuId = 0;
  menu: MenuItem = {
    id: 0,
    restaurantId: 0,
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    isAvailable: true,
    category: '',
    isVeg: true,
    isBestseller: false,
    discountPercent: 0
  };

  restaurants = signal<Restaurant[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  loadError = signal('');
  isSubmitting = signal(false);

  // Image Upload state
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string>('');
  isDragging = signal(false);
  isUploadingImage = signal(false);
  imageError = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService,
    private restaurantService: RestaurantService,
    private categoryService: CategoryService,
    private imageService: ImageService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.menuId = Number(idParam);

    if (!this.menuId || isNaN(this.menuId)) {
      this.loadError.set('Invalid menu item ID.');
      this.isLoading.set(false);
      return;
    }

    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    forkJoin({
      menu: this.menuService.getMenuById(this.menuId),
      restaurants: this.restaurantService.getRestaurants(),
      categories: this.categoryService.getCategories()
    }).subscribe({
      next: ({ menu, restaurants, categories }) => {
        this.menu = { ...menu };
        this.restaurants.set(restaurants || []);
        this.categories.set(categories || []);

        if (menu.imageUrl) {
          this.imagePreview.set(menu.imageUrl);
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Failed to load menu item details.');
        this.toastr.error('Failed to load menu item');
      }
    });
  }

  get finalPrice(): number {
    if (this.menu.price > 0 && this.menu.discountPercent > 0) {
      return this.menu.price - (this.menu.price * this.menu.discountPercent / 100);
    }
    return this.menu.price;
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.validateAndSetFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  private validateAndSetFile(file: File): void {
    this.imageError.set('');

    if (file.size > 5 * 1024 * 1024) {
      this.imageError.set('File size exceeds 5 MB. Please choose a smaller image.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      this.imageError.set('Only JPG, PNG, WebP, or GIF image formats are supported.');
      return;
    }

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set('');
    this.menu.imageUrl = '';
    this.imageError.set('');
  }

  saveMenu(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.toastr.warning('Please fill in all required fields properly.');
      return;
    }

    if (!this.menu.restaurantId || this.menu.restaurantId <= 0) {
      this.toastr.warning('Please select a valid restaurant.');
      return;
    }

    if (this.menu.price <= 0) {
      this.toastr.warning('Price must be greater than 0.');
      return;
    }

    this.isSubmitting.set(true);

    const file = this.selectedFile();
    if (file) {
      this.isUploadingImage.set(true);
      this.imageService.uploadImage(file, 'menu').subscribe({
        next: (res) => {
          this.menu.imageUrl = res.imageUrl;
          this.isUploadingImage.set(false);
          this.submitUpdateMenu();
        },
        error: () => {
          this.isUploadingImage.set(false);
          this.isSubmitting.set(false);
          this.toastr.error('Failed to upload new image. Saving other changes...');
          this.submitUpdateMenu();
        }
      });
    } else {
      this.submitUpdateMenu();
    }
  }

  private submitUpdateMenu(): void {
    this.menuService.updateMenu(this.menu).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toastr.success(`"${this.menu.name}" updated successfully!`);
        this.router.navigate(['/admin/menu']);
      },
      error: () => {
        // Fallback to updateMenuData
        this.menuService.updateMenuData(this.menu.id, this.menu).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toastr.success(`"${this.menu.name}" updated successfully!`);
            this.router.navigate(['/admin/menu']);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.toastr.error('Failed to update menu item. Please try again.');
          }
        });
      }
    });
  }
}
