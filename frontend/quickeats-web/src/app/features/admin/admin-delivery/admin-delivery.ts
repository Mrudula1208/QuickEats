import { Component } from '@angular/core';
// Component
// Tells Angular that this file controls the Admin Delivery page.

import { CommonModule } from '@angular/common';
// CommonModule
// Required for Angular features such as @if and @for.

import { DeliveryService } from '../../../core/services/delivery.service';
// DeliveryService
// Used to call Delivery APIs.

import { OrderDeliveryResponse } from '../../../core/models/delivery.model';
// OrderDeliveryResponse
// Defines the structure of delivery data coming from Backend.

import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
// Top navigation bar for the Admin Panel.


@Component({

  selector: 'app-admin-delivery',
  // selector
  // Name used by Angular to identify this Component.

  standalone: true,
  // standalone
  // Means this Component works independently.

  imports: [
    CommonModule,
    AdminNavComponent
  ],
  // imports
  // Lists modules required by this Component.

  templateUrl: './admin-delivery.html',
  // Connects this TypeScript file to the HTML file.

  styleUrl: './admin-delivery.scss'
  // Connects the SCSS file.
  // We are not working on SCSS now.

})


export class AdminDelivery {

  // Store all deliveries.
  //
  // OrderDeliveryResponse
  // Means one delivery follows this structure.
  //
  // []
  // Means multiple deliveries.
  //
  // =
  // Starts with an empty array.

  deliveries: OrderDeliveryResponse[] = [];


  constructor(

    // deliveryService
    // Variable used to access DeliveryService.
    //
    // private
    // Can be used only inside this Component.
    //
    // :
    // Separates variable name from its type.
    //
    // DeliveryService
    // Type of the injected Service.

    private deliveryService: DeliveryService

  ) {

    // Constructor runs automatically
    // when Admin Delivery page opens.
    //
    // Load all deliveries immediately.

    this.loadDeliveries();

  }


  // Load all deliveries.
  loadDeliveries(): void {

    // STEP 1
    // Call DeliveryService.
    //
    // getDeliveries()
    // Sends GET request to Backend.

    this.deliveryService
      .getDeliveries()

      // STEP 2
      // subscribe()
      // Waits for Backend response.

      .subscribe({

        // Backend successfully returned data.

        next: (data: OrderDeliveryResponse[]) => {

          // Store Backend data
          // inside deliveries array.

          this.deliveries = data;

        },


        // Backend/API request failed.

        error: () => {}

      });

  }
// Update Delivery Status.
updateDeliveryStatus(

  // ID of the delivery we want to update.
  deliveryId: number,

  // New status we want to give the delivery.
  newStatus: string

): void {

  // STEP 1
  // Call DeliveryService.
  //
  // updateDeliveryStatus()
  // Sends PUT request to Backend.

  this.deliveryService
    .updateDeliveryStatus(
      deliveryId,
      newStatus
    )

    // STEP 2
    // Wait for Backend response.

    .subscribe({

      // Backend successfully updated delivery.

      next: () => {

        // STEP 3
        // Load latest delivery data
        // from Backend.

        this.loadDeliveries();

      },

      // Backend/API error.

      error: () => {}

    });

}// Delete Delivery.
deleteDelivery(

  // ID of the delivery we want to delete.
  deliveryId: number

): void {

  // STEP 1
  // Call DeliveryService.
  //
  // deleteDelivery()
  // Sends DELETE request to Backend.

  this.deliveryService
    .deleteDelivery(deliveryId)

    // STEP 2
    // Wait for Backend response.

    .subscribe({

      // Backend successfully deleted delivery.

      next: () => {

        // STEP 3
        // Load the latest delivery list
        // from Backend.

        this.loadDeliveries();

      },

      // Backend/API error.

      error: () => {}

    });

}
}
