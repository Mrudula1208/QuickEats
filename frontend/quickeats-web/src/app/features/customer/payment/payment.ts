import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Payment } from '../../../core/models/payment.model';
import { PaymentService } from '../../../core/services/payment.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-payment',
  imports: [CommonModule,FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class PaymentComponent {
  total=0;
  selectedMethod="Cash On Delivery";
  constructor(
    private CartService:CartService,
    private paymentService:PaymentService,
    private router:Router
  ){
this.total=this.CartService.getTotalPrice();
  }

    payNow():void{
   const payment:Payment={
       orderId: Date.now(),
    id:Date.now(),
    amount:this.total,
    method:this.selectedMethod,
    status:"Paid",
    date:new Date()
   
   } ;
   this.paymentService.savePayment(payment);
   alert("Payment Successful");
   this.router.navigate(['/orders']);
  }
}
