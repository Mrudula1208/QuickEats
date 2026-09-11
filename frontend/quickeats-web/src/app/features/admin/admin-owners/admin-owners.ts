import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { UserModel } from '../../../core/models/user.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-owners',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-owners.html',
  styleUrl: './admin-owners.scss'
})
export class AdminOwners implements OnInit {
  owners = signal<UserModel[]>([]);
  isLoading = signal(true);
  searchQuery = signal<string>('');

  filteredOwners = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.owners();
    return this.owners().filter(o =>
      o.name.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      (o.phoneNumber && o.phoneNumber.includes(q))
    );
  });

  // Pagination / Limit State
  pageSize = 10;
  visibleLimit = signal(10);
  showAll = signal(false);

  displayedOwners = computed(() => {
    if (this.showAll()) {
      return this.filteredOwners();
    }
    return this.filteredOwners().slice(0, this.visibleLimit());
  });

  hasMore = computed(() => {
    return !this.showAll() && this.visibleLimit() < this.filteredOwners().length;
  });

  showMore(): void {
    this.visibleLimit.update(v => v + this.pageSize);
  }

  toggleShowAll(): void {
    if (this.showAll()) {
      this.showAll.set(false);
      this.visibleLimit.set(this.pageSize);
    } else {
      this.showAll.set(true);
    }
  }

  constructor(
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadOwners();
  }

  loadOwners(): void {
    this.isLoading.set(true);

    this.userService.getUsers().subscribe({
      next: (users: UserModel[]) => {
        const ownerUsers = users.filter(u => u.role === 'Owner');
        this.owners.set(ownerUsers);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastr.error('Failed to load owner data');
      }
    });
  }
}
