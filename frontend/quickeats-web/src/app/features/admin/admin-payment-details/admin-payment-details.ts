import { Component } from '@angular/core';
// Component
// Tells Angular that this file controls a Component/page.

import { CommonModule } from '@angular/common';
// CommonModule
// Gives the HTML common Angular features such as @if and interpolation.

import { ActivatedRoute } from '@angular/router';
// ActivatedRoute
// Used to read the payment ID from the URL.
//
// Example:
// /admin/payment-details/5
//
// Here:
// id = 5

import { PaymentService } from '../../../core/services/payment.service';
// PaymentService
// Gives us access to payment data.

import { Payment } from '../../../core/models/payment.model';
// Payment
// Defines the structure of one payment object.

import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';

import { ToastrService } from 'ngx-toastr';


@Component({

  // selector
  // Name used by Angular to identify this Component.
  selector: 'app-admin-payment-details',

  // standalone
  // Means this Component works independently.
  standalone: true,

  // imports
  // Lists modules required by this Component.
  imports: [
    CommonModule,
    AdminNavComponent
  ],

  // Connects this TypeScript file
  // to the HTML file.
  templateUrl: './admin-payment-details.html',

  // Connects the SCSS file.
  styleUrl: './admin-payment-details.scss'

})


export class AdminPaymentDetails {

  // Store the selected payment.
  //
  // Payment
  // Means this variable will contain
  // one Payment object.
  //
  // !
  // Definite assignment operator.
  //
  // Means:
  // "The value is not available right now,
  // but it will be assigned later."
  payment!: Payment;

  // True while the payment is being fetched.
  isLoading = true;

  // Holds the error message if loading fails.
  loadError: string | null = null;


  constructor(

    // route
    // Variable name used to access URL information.
    //
    // private
    // Can be used inside this Component.
    //
    // ActivatedRoute
    // Type that provides information
    // about the current route.

    private route: ActivatedRoute,

    // paymentService
    // Variable name used to access PaymentService.
    private paymentService: PaymentService,

    // ToastrService
    // Shows toast notifications.
    private toastr: ToastrService

  ) {

    this.loadPayment();

  }

  loadPayment(): void {

    this.isLoading = true;
    this.loadError = null;

    // STEP 1
    // Get the Payment ID from the URL.
    //
    // snapshot
    // Gets the current URL information.
    //
    // paramMap
    // Contains parameters from the URL.
    //
    // get('id')
    // Gets the parameter named "id".
    //
    // Number()
    // Converts the URL value from string
    // into a number.

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );


    // STEP 2
    // Get all payments from PaymentService.
    //
    // getPayments()
    // Returns Observable<Payment[]>.
    // The API takes time, so we subscribe()
    // and wait for the response.

    this.paymentService
      .getPayments()
      .subscribe({

        // STEP 3
        // API Success.
        // Find the payment whose ID
        // matches the ID from the URL.
        //
        // find()
        // Searches the array and returns
        // the matching payment.

        next: (payments) => {

          this.payment =
            payments.find(
              payment =>
                payment.id === id
            )!;

          this.isLoading = false;

        },

        // API Failed.
        error: () => {
          this.isLoading = false;
          this.loadError = 'Failed to load payment details';
          this.toastr.error('Failed to load payment details');
        }

      });

  }

  retry(): void {
    this.loadPayment();
  }

}
