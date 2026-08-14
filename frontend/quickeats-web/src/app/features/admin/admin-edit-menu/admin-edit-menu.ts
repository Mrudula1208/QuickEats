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

    // Send only the editable fields.
    // Property names must match
    // UpdateMenuDto in C#.
    const dto = {

      Name: this.menu.name,
      Description: this.menu.description,
      Price: this.menu.price,
      ImageUrl: this.menu.imageUrl,
      IsAvailable: this.menu.isAvailable,
      Category: this.menu.category,
      IsVeg: this.menu.isVeg,
      IsBestseller: this.menu.isBestseller,
      DiscountPercent: this.menu.discountPercent

    };

    this.menuService
      .updateMenuData(this.menu.id, dto)
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