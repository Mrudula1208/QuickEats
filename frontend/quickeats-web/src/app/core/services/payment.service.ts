import { Injectable } from "@angular/core";
import { Payment } from "../models/payment.model";
@Injectable({
    providedIn:'root'
})
export class PaymentService{
    private payments:Payment[]=[];
    savePayment(payment:Payment):void{
 console.log("Saving Payment...");
  console.log(payment);

  this.payments.push(payment);

  console.log(this.payments);    }
    getPayments():Payment[]{
        return this.payments;
    }
}