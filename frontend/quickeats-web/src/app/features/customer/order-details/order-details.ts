import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Order } from '../../../core/models/order';
import { OrderService } from '../../../core/services/order';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-order-details',
  standalone:true,
  imports: [CommonModule,RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss',
})
export class OrderDetailsComponent {
  order?:Order;
  constructor(
    private route :ActivatedRoute,
    private orderService:OrderService

  ){
    const id=Number(
      this.route.snapshot.paramMap.get('id')
    );
    this.order=this.orderService.getOrders().find(order=>order.id==id);
  }
}
