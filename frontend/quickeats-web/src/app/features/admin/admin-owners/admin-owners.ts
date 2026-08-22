import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { UserModel } from '../../../core/models/user.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
@Component({
  selector: 'app-admin-owners',
  imports: [CommonModule, AdminNavComponent],
  templateUrl: './admin-owners.html',
  styleUrl: './admin-owners.scss',
})
export class AdminOwners {
  owners: UserModel[] = [];
  constructor(private userService: UserService) {
    this.loadOwners();
  }

  loadOwners(): void {
    this.userService.getUsers().subscribe({
      next: (data: UserModel[]) => {
        this.owners = data.filter(u => u.role === 'Owner');
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }
}
