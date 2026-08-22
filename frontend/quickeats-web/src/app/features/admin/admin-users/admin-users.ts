import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { UserModel } from '../../../core/models/user.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, AdminNavComponent],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers {
  users: UserModel[] = [];
  constructor(private userService: UserService) {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data: UserModel[]) => {
        this.users = data.filter(u => u.role === 'Customer');
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }
}
