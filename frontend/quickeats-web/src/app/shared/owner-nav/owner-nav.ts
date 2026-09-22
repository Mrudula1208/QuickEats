import { Component } from '@angular/core';
// Controls the Owner Navigation bar.

import { RouterLink, RouterLinkActive, Router } from '@angular/router';
// RouterLink makes links navigate.
// RouterLinkActive highlights the current page link.
// Router moves the Owner to another page.

import { AuthService } from '../../core/services/auth.service';
// Single source of truth for logout (clears token + profile data).

import { RestaurantService } from '../../core/services/restaurant.service';
// Used to build the "Menu" quick link to the owner's first restaurant.

@Component({
  selector: 'app-owner-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './owner-nav.html',
  styleUrl: './owner-nav.scss'
})
export class OwnerNavComponent {

  menuLink = '/owner/restaurants';

  constructor(
    private router: Router,
    private authService: AuthService,
    private restaurantService: RestaurantService
  ) {
    const token = localStorage.getItem('token');
    if (token) {
      this.restaurantService.getMyRestaurants().subscribe({
        next: (restaurants) => {
          if (restaurants && restaurants.length > 0) {
            this.menuLink = `/owner/menu/${restaurants[0].id}`;
          }
        },
        error: () => { /* keep default link */ }
      });
    }
  }

  // Log out the Owner.
  logout(): void {

    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
