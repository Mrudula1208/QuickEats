import { Component } from '@angular/core';
// Controls Admin Menu Page.

import { CommonModule } from '@angular/common';
// Required for @for and @if.

import { MenuService } from '../../../core/services/menu.service';
// Calls Menu APIs.

import { MenuItem } from '../../../core/models/menu.model';
// Defines the structure of one Menu item.

import { Router } from '@angular/router';
// Used for page navigation.

import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
// Top navigation bar for the Admin Panel.

@Component({

  selector: 'app-admin-menu',

  standalone: true,

  imports: [
    CommonModule,
    AdminNavComponent
  ],

  templateUrl: './admin-menu.html',

  styleUrl: './admin-menu.scss'

})
export class AdminMenu {

  // Store multiple Menu Items.
  //
  // MenuItem
  // Means one Menu object.
  //
  // []
  // Means multiple Menu objects.
  menus: MenuItem[] = [];


  constructor(

    // Menu API Service.
    private menuService: MenuService,

    // Navigation.
    private router: Router

  ) {

    // Constructor runs automatically
    // when Admin Menu page opens.
    //
    // Load all menus.
    this.loadMenus();

  }


  // Load all Menu Items.
  loadMenus(): void {

    // Call Menu API.
    this.menuService
      .getMenus()
      .subscribe({

        // Backend successfully returned data.
        //
        // data: MenuItem[]
        // Means data contains
        // multiple Menu objects.
        next: (data: MenuItem[]) => {

          // Store Backend data.
          this.menus = data;

          console.log(this.menus);

        },

        // Backend/API error.
        error: (err: any) => {

          console.log(err);

        }

      });

  }


  // Open Add Menu Page.
  addMenu(): void {

    this.router.navigate([

      '/admin/add-menu'

    ]);

  }


  // Open Edit Menu Page.
  //
  // menu: MenuItem
  // Receives the selected Menu object.
  editMenu(menu: MenuItem): void {

    this.router.navigate([

      '/admin/edit-menu',

      menu.id

    ]);

  }


  // Delete Menu.
  //
  // id: number
  // Receives the Menu Id
  // that we want to delete.
  deleteMenu(

    id: number

  ): void {

    this.menuService

      .deleteMenu(id)

      .subscribe({

        // Delete successful.
        next: () => {

          console.log("Menu Deleted");

          // Load updated menu list.
          this.loadMenus();

        },

        // Delete failed.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

}