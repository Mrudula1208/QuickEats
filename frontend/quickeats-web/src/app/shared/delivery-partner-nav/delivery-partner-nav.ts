import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delivery-partner-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './delivery-partner-nav.html',
  styleUrl: './delivery-partner-nav.scss'
})
export class DeliveryPartnerNavComponent {
  partnerName = localStorage.getItem('name') || 'Rider';

  constructor(private router: Router) { }

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
