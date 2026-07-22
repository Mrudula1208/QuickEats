import { Component } from '@angular/core';
import { CommonModule ,DatePipe} from '@angular/common';
import { Payment } from '../../../core/models/payment.model';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-payment-history',
  standalone:true,
  imports: [CommonModule,DatePipe],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.scss',
})
export class PaymentHistoryComponent {
payments :Payment[]=[];
  constructor (
    private paymentService:PaymentService
  ){
    this.payments=this.paymentService.getPayments();
      console.log("Payment History");
  console.log(this.payments);

}
}