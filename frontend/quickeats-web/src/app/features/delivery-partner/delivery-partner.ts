import { Component } from '@angular/core';
// Controls the Delivery Partner's deliveries page.

import { CommonModule } from '@angular/common';
// Required for @if and @for.

import { FormsModule } from '@angular/forms';
// Required for [(ngModel)] on the status dropdown.

import { DeliveryPartnerNavComponent } from '../../shared/delivery-partner-nav/delivery-partner-nav';
// Top navigation bar.

import { DeliveryService } from '../../core/services/delivery.service';
// Loads and updates deliveries.

import { Delivery } from '../../core/models/delivery.model';
// Structure of one delivery.

@Component({
  selector: 'app-delivery-partner',
  standalone: true,
  imports: [CommonModule, FormsModule, DeliveryPartnerNavComponent],
  templateUrl: './delivery-partner.html',
  styleUrl: './delivery-partner.scss'
})
export class DeliveryPartnerComponent {

  // Deliveries assigned to me.
  deliveries: Delivery[] = [];

  constructor(
    private deliveryService: DeliveryService
  ) {

    this.loadDeliveries();

  }

  // Load only my deliveries.
  loadDeliveries(): void {

    this.deliveryService
      .getPartnerDeliveries()
      .subscribe({
        next: (data) => {
          this.deliveries = data;
        },
        error: (err) => {
          console.log(err);
        }
      });

  }

  // Update the delivery status.
  updateStatus(delivery: Delivery): void {

    this.deliveryService
      .updateDeliveryStatus(delivery.id, delivery.deliveryStatus)
      .subscribe({
        next: () => {
          console.log('Delivery status updated');
        },
        error: (err) => {
          console.log(err);
        }
      });

  }

}
