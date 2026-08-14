import { Component } from '@angular/core';
// Controls the Admin Navigation bar.

import { RouterLink, RouterLinkActive } from '@angular/router';
// RouterLink makes links navigate.
// RouterLinkActive highlights the current page link.

import { Router } from '@angular/router';
// Router moves the Admin to another page.

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-nav.html',
  styleUrl: './admin-nav.scss'
})
export class AdminNavComponent {

  constructor(private router: Router) { }

  // Log out the Admin.
  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }

}
