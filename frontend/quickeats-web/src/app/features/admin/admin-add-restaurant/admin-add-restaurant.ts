import { Component } from '@angular/core';
// Controls Add Restaurant Page.

import { CommonModule } from '@angular/common';
// Required for Angular directives.

import { FormsModule } from '@angular/forms';
// Required for [(ngModel)].

import { Router } from '@angular/router';
// Used to navigate.

import { RestaurantService } from '../../../core/services/restaurant.service';
// Calls Restaurant APIs.

import { Restaurant } from '../../../core/models/restaurant.model';
// Restaurant structure.

@Component({
  selector: 'app-admin-add-restaurant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './admin-add-restaurant.html',
  styleUrl: './admin-add-restaurant.scss'
})

export class AdminAddRestaurant {

  // Store Restaurant Form.
  restaurant: Restaurant = {

    id: 0,

    name: '',

    description: '',

    address: '',

    phoneNumber: '',

    imageUrl: '',

    isActive: true,

    createdAt: ''

  };

  constructor(

    // Restaurant API.
    private restaurantService: RestaurantService,

    // Navigation.
    private router: Router

  ) { }

  // Save Restaurant.
  saveRestaurant(): void {

    this.restaurantService
      .addRestaurant(this.restaurant)
      .subscribe({

        next: () => {

          console.log("Restaurant Added");

          this.router.navigate(

            ['/admin/restaurants']

          );

        },

        error: (err: any) => {

          console.log(err);

        }

      });

  }

}