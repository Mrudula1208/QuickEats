import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { RestaurantService } from '../../../core/services/restaurant.service';
import { Restaurant } from '../../../core/models/restaurant.model';

@Component({
  selector: 'app-admin-edit-restaurant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './admin-edit-restaurant.html',
  styleUrl: './admin-edit-restaurant.scss'
})
export class AdminEditRestaurant {

  restaurant!: Restaurant;

  constructor(

    private route: ActivatedRoute,

    private restaurantService: RestaurantService,

    private router: Router

  ) {

    const id = Number(

      this.route.snapshot.paramMap.get('id')

    );

    this.restaurantService
      .getRestaurantById(id)
      .subscribe({

        next: (data: Restaurant) => {

          this.restaurant = data;

        },

        error: (err: any) => {

          console.log(err);

        }

      });

  }

  updateRestaurant(): void {

    this.restaurantService
      .updateRestaurant(this.restaurant)
      .subscribe({

        next: () => {

          console.log("Restaurant Updated");

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