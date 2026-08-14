import { Component } from '@angular/core';
// 1️⃣ Executes First.
// Import Component because this file controls the Delivery Tracking page.
// Every Angular page starts with a Component.

import { CommonModule } from '@angular/common';
// 2️⃣ Executes Second.
// Import CommonModule because HTML uses Angular features like @if and @for.

import { Router, ActivatedRoute } from '@angular/router';
// 3️⃣ Executes Third.
// Router helps move the user to another page.

import { DeliveryService } from '../../../core/services/delivery.service';
// 4️⃣ Executes Fourth.
// Import DeliveryService because it stores current delivery information.

import { Delivery } from '../../../core/models/delivery.model';
// 5️⃣ Executes Fifth.
// Import Delivery model because it defines the structure of delivery data.

@Component({
  selector: 'app-delivery-tracking',
  // Angular uses this selector when rendering this component.

  standalone: true,
  // Means this component works independently.
  // No need to declare it inside AppModule.

  imports: [CommonModule],
  // CommonModule is required because HTML uses Angular directives.

  templateUrl: './delivery-tracking.html',
  // Connect this TS file with delivery-tracking.html.

  styleUrl: './delivery-tracking.scss'
  // Connect this TS file with delivery-tracking.scss.
})

export class DeliveryTrackingComponent {

  // ==========================================================
  // EXECUTION FLOW
  // ==========================================================
  //
  // 1️⃣ Angular creates DeliveryTrackingComponent.
  // 2️⃣ Variables are created.
  // 3️⃣ Constructor runs automatically.
  // 4️⃣ Delivery information is loaded.
  // 5️⃣ HTML automatically shows delivery details.
  // 6️⃣ User clicks Back button.
  // 7️⃣ Router opens Orders page.
  //
  // ==========================================================

  currentDelivery: Delivery | null = null;
  // 6️⃣ Executes Sixth.
  //
  // Delivery | null
  // Means:
  // This variable can store either:
  // • Delivery object
  // • null
  //
  // Initially no value is loaded.

  constructor(

    private deliveryService: DeliveryService,
    // 7️⃣ Angular automatically injects DeliveryService.
    // We never create it using new DeliveryService().

    private router: Router,
    // 8️⃣ Angular injects Router.
    // Router helps move between pages.

    private route: ActivatedRoute
    // 8️⃣ Angular injects ActivatedRoute.
    // ActivatedRoute helps read URL parameters.

  ) {

    // 9️⃣ Constructor executes automatically.
    // Load current delivery immediately.

    this.loadCurrentDelivery();

  }

  loadCurrentDelivery(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    if (!orderId) {
      console.error("No orderId parameter in URL");
      return;
    }

    this.deliveryService.getDeliveryByOrderId(orderId).subscribe({
      next: (data) => {
        this.currentDelivery = data;
        console.log("Loaded current delivery:", this.currentDelivery);
      },
      error: (err) => {
        console.error("Failed to load delivery info", err);
      }
    });

  }

  backToOrders(): void {
  // Executes only when user clicks
  // "Back To Orders" button.

    this.router.navigate([
      '/orders'
    ]);

    // Router opens Orders page.

  }

}