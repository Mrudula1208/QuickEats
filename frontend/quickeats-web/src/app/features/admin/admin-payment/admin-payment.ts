// Import Component because this file controls
// the Admin Payment page.
import { Component } from '@angular/core';

// Import CommonModule because the HTML
// will use Angular features such as @if and @for.
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

// Import PaymentService because
// PaymentService contains the payment data.
import { PaymentService } from '../../../core/services/payment.service';

// Import Payment because it defines
// the structure of one payment object.
import { Payment } from '../../../core/models/payment.model';

import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
// Top navigation bar for the Admin Panel.


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
    CommonModule,
    FormsModule,
    AdminNavComponent
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
  // Load all payments from Backend.
loadPayments(): void {

  // STEP 1
  // Call PaymentService.
  //
  // getPayments()
  // Sends GET request to Backend.
  this.paymentService
    .getPayments()

    // STEP 2
    // subscribe()
    // Waits for Backend response.

    .subscribe({

      // Backend successfully returned payments.
      next: (data: Payment[]) => {

        // Store Backend data
        // inside the Component variable.
        this.payments = data;

        console.log(
          this.payments
        );

      },

      // Backend/API request failed.
      error: (err: any) => {

        console.log(err);

      }

    });

}
// Update Payment Status.
// Update Payment Status.
updatePaymentStatus(

  // ID of the payment we want to update.
  //
  // paymentId
  // Variable name.
  //
  // : number
  // Means paymentId stores a number.
  paymentId: number,

  // New status we want to give the payment.
  //
  // newStatus
  // Variable name.
  //
  // : string
  // Means newStatus stores text.
  newStatus: string

): void {

  // STEP 1
  // Call the PaymentService.
  //
  // this
  // Refers to the current AdminPayment Component.
  //
  // paymentService
  // Our injected PaymentService.
  //
  // updatePaymentStatus()
  // Calls the Service method.
  //
  // The Service sends the PUT request
  // to the ASP.NET Core Backend.

  this.paymentService
    .updatePaymentStatus(
      paymentId,
      newStatus
    )

    // STEP 2
    // subscribe()
    // Waits for the Backend response.
    //
    // next
    // Runs when the Backend successfully
    // updates the payment.

    .subscribe({

      next: () => {

        console.log(
          "Payment Status Updated"
        );

        // STEP 3
        // Load payments again.
        //
        // This gets the latest data
        // from the Backend.

        this.loadPayments();

      },

      // error
      // Runs when the Backend request fails.

      error: (err: any) => {

        console.log(err);

      }

    });

}// Delete Payment.
deletePayment(

  // ID of the payment we want to delete.
  paymentId: number

): void {

  // STEP 1
  // Call PaymentService.
  //
  // deletePayment()
  // Sends DELETE request to ASP.NET Core.
  this.paymentService
    .deletePayment(paymentId)

    // STEP 2
    // Wait for Backend response.
    .subscribe({

      // Backend successfully deleted payment.
      next: () => {

        console.log(
          "Payment Deleted Successfully"
        );

        // STEP 3
        // Reload payments from Backend.
        this.loadPayments();

      },

      // Backend/API error.
      error: (err: any) => {

        console.log(err);

      }

    });

}}