import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Delivery } from '../../../core/models/delivery.model';
import { DeliveryService } from '../../../core/services/delivery.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delivery-tracking',
  imports: [CommonModule],
  templateUrl: './delivery-tracking.html',
  styleUrl: './delivery-tracking.scss',
})
export class DeliveryTrackingComponent {
  delivery ?:Delivery;
  constructor(
    private route :ActivatedRoute,
    private deliveryService:DeliveryService
  ){
    const orderId =Number(
      this.route.snapshot.paramMap.get('id')
    )
    // )"Give me Delivery whose OrderId is 101."
    this.delivery=this.deliveryService.getDeliveryByOrderId(orderId);

  }

  
}
// 1. app.routes.ts
//         ↓
// 2. DeliveryTrackingComponent created
//         ↓
// 3. delivery variable created
//         ↓
// 4. Constructor runs
//         ↓
// 5. Read id from URL
//         ↓
// 6. Call DeliveryService
//         ↓
// 7. DeliveryService searches deliveries[]
//         ↓
// 8. Matching Delivery returned
//         ↓
// 9. Store inside delivery variable
//         ↓
// 10. HTML executes
//         ↓
// 11. HTML displays partner name,
//     phone, bike number, status