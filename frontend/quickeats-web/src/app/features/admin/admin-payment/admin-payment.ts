// Import Component because this file controls
// the Admin Payment page.
import { Component } from '@angular/core';

// Import CommonModule because the HTML
// will use Angular features such as @if and @for.
import { CommonModule } from '@angular/common';

// Import PaymentService because
// PaymentService contains the payment data.
import { PaymentService } from '../../../core/services/payment.service';

// Import Payment because it defines
// the structure of one payment object.
import { Payment } from '../../../core/models/payment.model';


@Component({

  // selector
  // Name used by Angular to identify this component.
  selector: 'app-admin-payment',

  // standalone
  // Means this component does not need
  // to be declared inside an NgModule.
  standalone: true,

  // imports
  // Lists modules required by this component.
  imports: [
    CommonModule
  ],

  // Connect this TypeScript file
  // with the HTML file.
  templateUrl: './admin-payment.html',

  // Connect the SCSS file.
  styleUrl: './admin-payment.scss'

})


export class AdminPayment {

  // Store all payments.
  //
  // Payment
  // Means one Payment object.
  //
  // []
  // Means multiple Payment objects.
  //
  // =
  // Assigns an empty array initially.
  payments: Payment[] = [];


  constructor(

    // paymentService
    // Variable name used to access PaymentService.
    //
    // :
    // Separates variable name from its type.
    //
    // PaymentService
    // Type of the injected service.
    //
    // private
    // This variable can be used only inside
    // this AdminPayment component.
    private paymentService: PaymentService

  ) {

    // Load payments when the Admin Payment
    // page opens.
    this.loadPayments();

  }


  // Load all payments.
  loadPayments(): void {

    // Call getPayments() from PaymentService.
    //
    // getPayments()
    // Returns all payments.
    //
    // this
    // Refers to the current AdminPayment component.
    //
    // paymentService
    // Our injected PaymentService.
    //
    // =
    // Stores the returned data.
    this.payments =
      this.paymentService.getPayments();


    // Display payments in browser console
    // so we can check the returned data.
    console.log(this.payments);

  }
// Update Payment Status.
updatePaymentStatus(

  // paymentId
  // Variable name.
  //
  // : number
  // Means paymentId stores a number.
  //
  // This is the ID of the payment
  // selected by the Admin.
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
  // Send the Payment ID
  // and new status to PaymentService.
  //
  // this
  // Refers to the current AdminPayment Component.
  //
  // paymentService
  // Our injected PaymentService.
  //
  // updatePaymentStatus()
  // Calls the Service method.
  this.paymentService.updatePaymentStatus(

    paymentId,

    newStatus

  );


  // STEP 2
  // Load the updated payment data again.
  //
  // This keeps the Component data
  // synchronized with the Service.
  this.loadPayments();


  console.log(
    "Payment Status Updated"
  );

}
deletepayment(paymentId: number): void {
  this.paymentService.deletePayment(paymentId);
  this.loadPayments();
  console.log("Payment Deleted");
}