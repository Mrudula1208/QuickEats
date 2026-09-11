import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delivery-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './delivery-layout.html',
  styleUrl: './delivery-layout.scss',
})
export class DeliveryLayout implements OnInit {
  riderName = signal('Delivery Partner');
  isAvailable = signal(true);

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const storedName = localStorage.getItem('name');
    if (storedName) {
      this.riderName.set(storedName);
    }

    const storedStatus = localStorage.getItem('rider_availability');
    if (storedStatus !== null) {
      this.isAvailable.set(storedStatus === 'true');
    }
  }

  toggleAvailability(): void {
    const nextState = !this.isAvailable();
    this.isAvailable.set(nextState);
    localStorage.setItem('rider_availability', String(nextState));

    if (nextState) {
      this.toastr.success('You are now Online & Available for orders', 'Status Updated');
    } else {
      this.toastr.info('You are now Offline', 'Status Updated');
    }
  }

  logout(): void {
    localStorage.clear();
    this.toastr.info('Logged out successfully');
    this.router.navigate(['/login']);
  }
}
