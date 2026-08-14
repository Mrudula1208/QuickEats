import { Component } from '@angular/core';
// Controls Dashboard Page.

import { CommonModule } from '@angular/common';
// Required for Angular HTML.

import { DashboardService } from '../../../core/services/dashboard.service';
// Calls Dashboard APIs.

import { DashboardModel } from '../../../core/models/dashboard.model';
// Dashboard Structure.

import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
// Top navigation bar for the Admin Panel.

@Component({
  selector: 'app-admin-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    AdminNavComponent
  ],

  templateUrl: './admin-dashboard.html',

  styleUrl: './admin-dashboard.scss'
})

export class AdminDashboard {

  // Create dashboard variable.
  // Backend data will be stored here.
  dashboard!: DashboardModel;

  constructor(

    // Dashboard Service.
    // Calls Backend APIs.
    private dashboardService: DashboardService

  ) {

    // Load Dashboard.
    this.loadDashboard();

  }

  // Load Dashboard.
  // Get data from Backend.
  loadDashboard(): void {

    this.dashboardService
      .getDashboard()
      .subscribe({

        // Backend Success.
        next: (data: DashboardModel) => {

          // Store Backend Data.
          this.dashboard = data;

          console.log(this.dashboard);

        },

        // Backend Error.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

}