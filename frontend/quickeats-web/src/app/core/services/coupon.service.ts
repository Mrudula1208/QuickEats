// Service Annotation.
// Makes this file an Angular Service.
import { Injectable } from '@angular/core';

// Backend Caller.
// Calls ASP.NET Core APIs.
import { HttpClient } from '@angular/common/http';

// Wait for Backend.
// Receives API response later.
import { Observable } from 'rxjs';

// Coupon Structure.
// Defines one Coupon object.
import { CouponModel } from '../models/coupon.model';

@Injectable({

  // One Service Instance.
  // Used everywhere.
  providedIn: 'root'

})
export class CouponService {

  // API URL Variable.
  // Stores Backend Address.
  private apiUrl = 'https://localhost:7278/api/Coupon';

  constructor(

    // private
    // Used only inside Service.
    //
    // http
    // HttpClient variable.
    //
    // HttpClient
    // Calls Backend APIs.
    private http: HttpClient

  ) { }

  // ==========================================
  // GET ALL COUPONS
  // ==========================================

  // getCoupons
  // Gets all Coupons.
  //
  // ()
  // No Input.
  //
  // :
  // Return Type Starts.
  //
  // Observable<CouponModel[]>
  // Wait and return all Coupons.
  getCoupons(): Observable<CouponModel[]> {

    // Go to Backend.
    // Get Coupons.
    return this.http.get<CouponModel[]>(this.apiUrl);

  }

  // ==========================================
  // GET COUPON BY CODE
  // ==========================================

  // getCouponByCode
  // Gets one Coupon.
  //
  // enteredCouponCode
  // Coupon Code.
  //
  // :
  // Return Type Starts.
  //
  // Observable<CouponModel>
  // Wait and return Coupon.
  getCouponByCode(

    enteredCouponCode: string

  ): Observable<CouponModel> {

    // Go to Backend.
    // Search Coupon.
    return this.http.get<CouponModel>(

      `${this.apiUrl}/${enteredCouponCode}`

    );

  }

}