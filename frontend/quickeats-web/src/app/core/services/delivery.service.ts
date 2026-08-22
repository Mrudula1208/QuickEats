import { Injectable } from '@angular/core';
// Injectable
// Makes this file an Angular Service.

import { HttpClient } from '@angular/common/http';
// HttpClient
// Sends HTTP requests to ASP.NET Core Backend.

import { Observable } from 'rxjs';
// Observable
// Represents the response that will come
// from the Backend.

import { Delivery } from '../models/delivery.model';
// Delivery
// Defines the structure of one delivery.


@Injectable({
  // root
  // Creates one shared instance
  // of this Service.
  providedIn: 'root'
})


export class DeliveryService {

  // Backend Delivery API URL.
  private apiUrl =
    'https://localhost:7278/api/OrderDelivery';


  constructor(

    // http
    // Variable used to call Backend APIs.

    // HttpClient
    // Type of the http variable.

    private http: HttpClient

  ) { }


  // Get all deliveries.
  getDeliveries(): Observable<Delivery[]> {

    // GET
    // Reads all deliveries from Backend.

    return this.http.get<Delivery[]>(
      this.apiUrl
    );

  }

  // Get deliveries assigned to the logged in Delivery Partner.
  getPartnerDeliveries(): Observable<Delivery[]> {

    // GET
    // Reads only my deliveries from Backend.

    return this.http.get<Delivery[]>(
      `${this.apiUrl}/partner`
    );

  }


  // Get delivery by order ID.
  getDeliveryByOrderId(orderId: number): Observable<Delivery> {
    return this.http.get<Delivery>(`${this.apiUrl}/order/${orderId}`);
  }


  // Update delivery status.
  updateDeliveryStatus(

    // ID of delivery to update.
    deliveryId: number,

    // New delivery status.
    newStatus: string

  ): Observable<any> {

    // Object sent to Backend.
    //
    // DeliveryStatus
    // Must match UpdateDeliveryStatusDto
    // property in your C# Backend.

    const data = {

      DeliveryStatus: newStatus

    };


    // PUT
    // Updates existing delivery.

    return this.http.put(

      `${this.apiUrl}/${deliveryId}`,

      data

    );

  }


  // Delete delivery.
  deleteDelivery(
    deliveryId: number
  ): Observable<any> {

    // DELETE
    // Removes the delivery from Backend.

    return this.http.delete(

      `${this.apiUrl}/${deliveryId}`

    );

  }

}
