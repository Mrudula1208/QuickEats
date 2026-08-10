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
    }// Update the status of one payment.
updatePaymentStatus(

  // paymentId
  // Variable name.
  //
  // : number
  // Means paymentId stores a number.
  paymentId: number,

  // newStatus
  // Variable name.
  //
  // : string
  // Means newStatus stores text.
  //
  // Example:
  // "Success"
  // "Failed"
  // "Refunded"
  newStatus: string

): void {

  // STEP 1
  // Find the payment whose ID
  // matches paymentId.
  //
  // find()
  // Searches the payments array.
  //
  // payment
  // Represents one payment
  // during the search.
  const selectedPayment =
    this.payments.find(

      payment =>
        payment.id === paymentId

    );


  // STEP 2
  // Check whether the payment was found.
  //
  // if
  // Checks a condition.
  //
  // selectedPayment
  // Means the payment exists.
  if (selectedPayment) {

    // STEP 3
    // Change the payment status.
    //
    // selectedPayment
    // The payment we found.
    //
    // .
    // Accesses a property.
    //
    // status
    // Property we want to change.
    //
    // =
    // Assigns the new value.
    selectedPayment.status =
      newStatus;

  }


  console.log(
    "Payment Status Updated"
  );

}
}