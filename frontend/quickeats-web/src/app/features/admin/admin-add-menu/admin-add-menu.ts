import { Component } from '@angular/core';
// Controls Add Menu Page.

import { CommonModule } from '@angular/common';
// Required for Angular directives.

import { FormsModule } from '@angular/forms';
// Required for [(ngModel)].

import { Router } from '@angular/router';
// Used for Navigation.

import { MenuService } from '../../../core/services/menu.service';
// Calls Menu APIs.

import { MenuItem } from '../../../core/models/menu.model';
// Menu Structure.

@Component({
  selector: 'app-admin-add-menu',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admin-add-menu.html',

  styleUrl: './admin-add-menu.scss'
})

export class AdminAddMenu {

  // Store Menu Form.
  menu: MenuItem = {

    id: 0,

    restaurantId: 0,

    name: '',

    description: '',

    price: 0,

    imageUrl: '',

    isAvailable: true

  };

  constructor(

    // Menu API.
    private menuService: MenuService,

    // Navigation.
    private router: Router

  ) { }

  // Save Menu.
  saveMenu(): void {

    this.menuService
      .addMenu(this.menu)
      .subscribe({

        // Success.
        next: () => {

          console.log("Menu Added");

          this.router.navigate(

            ['/admin/menu']

          );

        },

        // Error.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

}