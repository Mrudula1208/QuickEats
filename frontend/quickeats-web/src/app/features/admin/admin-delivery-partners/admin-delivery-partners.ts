import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../../core/services/delivery.service';
import { DeliveryPartnerSummary, CreateDeliveryPartnerDto } from '../../../core/models/delivery.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-delivery-partners',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-delivery-partners.html',
  styleUrl: './admin-delivery-partners.scss'
})
export class AdminDeliveryPartners implements OnInit {
  partners = signal<DeliveryPartnerSummary[]>([]);
  isLoading = signal(true);
  loadError = signal('');
  searchText = signal('');
  selectedFilter = signal<'all' | 'active' | 'inactive'>('all');

  // Modal State
  isAddModalOpen = signal(false);
  isSubmitting = signal(false);

  // New Partner Form Model
  newPartner: CreateDeliveryPartnerDto = {
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  };

  // Filtered Delivery Partners
  filteredPartners = computed(() => {
    let list = this.partners();
    const query = this.searchText().toLowerCase().trim();
    const filter = this.selectedFilter();

    if (query) {
      list = list.filter(p =>
        p.id.toString().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        (p.phone && p.phone.includes(query)) ||
        (p.address && p.address.toLowerCase().includes(query))
      );
    }

    if (filter === 'active') {
      list = list.filter(p => p.isActive);
    } else if (filter === 'inactive') {
      list = list.filter(p => !p.isActive);
    }

    return list;
  });

  // KPI Statistics
  stats = computed(() => {
    const list = this.partners();
    const total = list.length;
    const active = list.filter(p => p.isActive).length;
    const inactive = list.filter(p => !p.isActive).length;
    const totalCompleted = list.reduce((sum, p) => sum + (p.completedDeliveriesCount || 0), 0);
    const totalActiveDeliveries = list.reduce((sum, p) => sum + (p.activeDeliveriesCount || 0), 0);

    return { total, active, inactive, totalCompleted, totalActiveDeliveries };
  });

  constructor(
    private deliveryService: DeliveryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPartners();
  }

  loadPartners(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.deliveryService.getDeliveryPartners().subscribe({
      next: (data) => {
        this.partners.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load delivery partners.');
        this.toastr.error('Failed to load delivery partners');
      }
    });
  }

  retry(): void {
    this.loadPartners();
  }

  // Toggle Active / Inactive Status
  toggleStatus(partner: DeliveryPartnerSummary): void {
    const action = partner.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${partner.name}?`)) return;

    this.deliveryService.toggleUserStatus(partner.id).subscribe({
      next: (res) => {
        const newStatus = res.isActive ?? !partner.isActive;
        this.partners.update(list =>
          list.map(p => p.id === partner.id ? { ...p, isActive: newStatus } : p)
        );
        this.toastr.success(`${partner.name} is now ${newStatus ? 'Active' : 'Inactive'}`);
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to toggle status';
        this.toastr.error(msg);
      }
    });
  }

  // Open Add Modal
  openAddModal(): void {
    this.newPartner = {
      name: '',
      email: '',
      password: '',
      phone: '',
      address: ''
    };
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  // Submit Add Partner Form
  submitAddPartner(): void {
    if (!this.newPartner.name.trim() || !this.newPartner.email.trim() || !this.newPartner.password.trim() || !this.newPartner.phone.trim()) {
      this.toastr.warning('Please fill in all required fields');
      return;
    }

    if (this.newPartner.password.length < 6) {
      this.toastr.warning('Password must be at least 6 characters long');
      return;
    }

    this.isSubmitting.set(true);
    this.deliveryService.createDeliveryPartner(this.newPartner).subscribe({
      next: () => {
        this.toastr.success(`Delivery Partner ${this.newPartner.name} registered successfully`);
        this.isSubmitting.set(false);
        this.closeAddModal();
        this.loadPartners();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Failed to create delivery partner';
        this.toastr.error(msg);
      }
    });
  }
}
