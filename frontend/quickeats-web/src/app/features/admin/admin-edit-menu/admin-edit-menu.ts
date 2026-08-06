import { Component } from '@angular/core';
// Controls Edit Menu Page.

import { CommonModule } from '@angular/common';
// Used for Angular Directives.

import { FormsModule } from '@angular/forms';
// Used for ngModel.

import { ActivatedRoute, Router } from '@angular/router';
// Reads Menu Id and Navigates.

import { MenuService } from '../../../core/services/menu.service';
// Calls Menu APIs.

import { MenuItem } from '../../../core/models/menu.model';
// Menu Structure.

@Component({
  selector: 'app-admin-edit-menu',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admin-edit-menu.html',

  styleUrl: './admin-edit-menu.scss'
})

export class AdminEditMenu {

  menu!: MenuItem;

  constructor(

    // Read URL Id.
    private route: ActivatedRoute,

    // Menu API.
    private menuService: MenuService,

    // Navigation.
    private router: Router

  ) {

    const id = Number(

      this.route.snapshot.paramMap.get('id')

    );

    this.menuService
      .getMenuById(id)
      .subscribe({

        next: (data: MenuItem) => {

          this.menu = data;

        },

        error: (err: any) => {

          console.log(err);

        }

      });

  }

  updateMenu(): void {

    this.menuService
      .updateMenu(this.menu)
      .subscribe({

        next: () => {

          console.log("Menu Updated");

          this.router.navigate(

            ['/admin/menu']

          );

        },

        error: (err: any) => {

          console.log(err);

        }

      });

  }

}