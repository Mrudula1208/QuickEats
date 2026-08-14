import { Component } from '@angular/core';
// Controls the Delivery Partner Navigation bar.

import { RouterLink, RouterLinkActive } from '@angular/router';
// RouterLink makes links navigate.
// RouterLinkActive highlights the current page link.

import { Router } from '@angular/router';
// Router moves the Delivery Partner to another page.

@Component({
  selector: 'app-delivery-partner-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './delivery-partner-nav.html',
  styleUrl: './delivery-partner-nav.scss'
})
export class DeliveryPartnerNavComponent {

  constructor(private router: Router) { }

  // Log out the Delivery Partner.
  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }

}
