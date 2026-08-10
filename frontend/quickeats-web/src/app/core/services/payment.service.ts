import { Injectable } from '@angular/core';
// Injectable
// Tells Angular that this file is a Service
// and Angular can create this Service automatically.

import { HttpClient } from '@angular/common/http';
// HttpClient
// Used to send HTTP requests to the ASP.NET Core Backend.
//
// We use:
// GET    → read data
// POST   → create data
// PUT    → update data
// DELETE → delete data

import { Observable } from 'rxjs';
// Observable
// Represents data that will come from the Backend later.
//
// API calls take time,
// so the result does not come immediately.

import { Payment } from '../models/payment.model';
// Payment
// Defines the structure of one Payment object.


@Injectable({

  // providedIn
  // Tells Angular where this Service should be available.

  // 'root'
  // Makes one shared instance of PaymentService
  // available throughout the application.

  providedIn: 'root'

})


export class PaymentService {


  // Backend API URL.
  //
  // private
  // Means this variable is used only
  // inside PaymentService.
  //
  // apiUrl
  // Variable name.
  //
  // =
  // Assigns the Backend URL to the variable.

  private apiUrl =
    'https://localhost:7278/api/Payment';


  constructor(

    // private
    // Creates a private variable named http.

    // http
    // Variable name.

    // :
    // Separates variable name and type.

    // HttpClient
    // Type of the injected object.

    private http: HttpClient

  ) { }


  // Get all payments from Backend.
  getPayments(): Observable<Payment[]> {

    // this
    // Refers to the current PaymentService.

    // http
    // Our HttpClient object.

    // get()
    // Sends an HTTP GET request.

    // <Payment[]>
    // Tells TypeScript:
    // "Backend should return an array of Payment objects."

    // this.apiUrl
    // Sends the request to:
    // https://localhost:7278/api/Payment

    return this.http.get<Payment[]>(
      this.apiUrl
    );

  }


  // Update Payment Status.
  updatePaymentStatus(

    // ID of the payment we want to update.
    paymentId: number,

    // New status of the payment.
    newStatus: string

  ): Observable<any> {

    // Create the object that Backend expects.
    //
    // status
    // Must match the property expected
    // by UpdatePaymentStatusDto.

    const data = {

      PaymentStatus: newStatus

    };


    // Send PUT request to Backend.
    //
    // `${}`
    // Template literal.
    //
    // Allows us to insert paymentId
    // directly into the URL.
    //
    // Example:
    // paymentId = 5
    //
    // URL becomes:
    // /api/Payment/5

    return this.http.put(

      `${this.apiUrl}/${paymentId}`,

      data

    );

  }


  // Delete Payment.
  deletePayment(

    // ID of payment to delete.
    paymentId: number

  ): Observable<any> {

    // Send DELETE request to Backend.
    //
    // Example:
    // paymentId = 5
    //
    // Backend URL:
    // /api/Payment/5

    return this.http.delete(

      `${this.apiUrl}/${paymentId}`

    );

  }

}