import { Component } from '@angular/core';
// Controls the Owner Navigation bar.

import { RouterLink, RouterLinkActive } from '@angular/router';
// RouterLink makes links navigate.
// RouterLinkActive highlights the current page link.

import { Router } from '@angular/router';
// Router moves the Owner to another page.

@Component({
  selector: 'app-owner-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './owner-nav.html',
  styleUrl: './owner-nav.scss'
})
export class OwnerNavComponent {

  constructor(private router: Router) { }

  // Log out the Owner.
  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('profileImageUrl');

    this.router.navigate(['/login']);
  }

}
