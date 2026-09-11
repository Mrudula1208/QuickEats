import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { UserService } from '../../../core/services/user.service';
import { UserModel } from '../../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss'
})
export class AdminUsers {

  users = signal<UserModel[]>([]);
  isLoading = signal(true);
  searchText = signal('');
  selectedRole = signal('All');
  selectedUser = signal<UserModel | null>(null);

  roleTabs = ['All', 'Customer', 'Owner', 'Admin'];

  filteredUsers = computed(() => {
    let list = this.users();
    const role = this.selectedRole();
    if (role !== 'All') {
      list = list.filter(u => u.role === role);
    }
    const search = this.searchText();
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        (u.phoneNumber ?? '').toLowerCase().includes(s)
      );
    }
    return list;
  });

  counts = computed(() => {
    const all = this.users();
    return {
      total: all.length,
      customers: all.filter(u => u.role === 'Customer').length,
      owners: all.filter(u => u.role === 'Owner').length,
      admins: all.filter(u => u.role === 'Admin').length
    };
  });

  // Pagination / Limit State
  pageSize = 10;
  visibleLimit = signal(10);
  showAll = signal(false);

  displayedUsers = computed(() => {
    if (this.showAll()) {
      return this.filteredUsers();
    }
    return this.filteredUsers().slice(0, this.visibleLimit());
  });

  hasMore = computed(() => {
    return !this.showAll() && this.visibleLimit() < this.filteredUsers().length;
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
  ) {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastr.error('Failed to load users');
      }
    });
  }

  viewUser(user: UserModel): void {
    this.selectedUser.set(user);
  }

  closeDetail(): void {
    this.selectedUser.set(null);
  }

  deleteUser(user: UserModel): void {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== user.id));
        this.toastr.success(`${user.name} deleted`);
        if (this.selectedUser()?.id === user.id) this.selectedUser.set(null);
      },
      error: () => this.toastr.error('Failed to delete user')
    });
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      'Customer': 'role-customer',
      'Owner': 'role-owner',
      'Admin': 'role-admin'
    };
    return classes[role] || 'role-default';
  }
}
