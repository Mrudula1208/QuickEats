// Service Annotation.
// Makes this file an Angular Service.
import { Injectable } from '@angular/core';

// Backend Caller.
// Calls ASP.NET Core APIs.
import { HttpClient } from '@angular/common/http';

// Wait for Backend.
// Receives API response later.
import { Observable } from 'rxjs';

// Address Structure.
// Defines one Address object.
import { SavedAddressModel } from '../models/saved-address.model';

@Injectable({

  // One Service Instance.
  // Used everywhere.
  providedIn: 'root'

})
export class SavedAddressService {

  // API URL Variable.
  // Stores Backend Address.
  private apiUrl = 'https://localhost:7278/api/SavedAddress';

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
  // GET ALL ADDRESSES
  // ==========================================

  // getAddresses
  // Gets all Addresses.
  //
  // ()
  // No Input.
  //
  // :
  // Return Type Starts.
  //
  // Observable<SavedAddressModel[]>
  // Wait and return Addresses.
  getAddresses(): Observable<SavedAddressModel[]> {

    // Go to Backend.
    // Get Addresses.
    return this.http.get<SavedAddressModel[]>(this.apiUrl);

  }

  // ==========================================
  // ADD ADDRESS
  // ==========================================

  // addAddress
  // Saves Address.
  //
  // newAddress
  // New Address Object.
  //
  // Observable<SavedAddressModel>
  // Wait and return saved Address.
  addAddress(

    newAddress: SavedAddressModel

  ): Observable<SavedAddressModel> {

    // Go to Backend.
    // Save Address.
    return this.http.post<SavedAddressModel>(
      this.apiUrl,
      newAddress
    );

  }

  // ==========================================
  // DELETE ADDRESS
  // ==========================================

  // deleteAddress
  // Deletes Address.
  //
  // selectedAddressId
  // Address Id.
  //
  // Observable<any>
  // Wait for response.
  deleteAddress(

    selectedAddressId: number

  ): Observable<any> {

    // Go to Backend.
    // Delete Address.
    return this.http.delete(

      `${this.apiUrl}/${selectedAddressId}`

    );

  }

  // ==========================================
  // SET DEFAULT ADDRESS
  // ==========================================

  // setDefaultAddress
  // Updates Default Address.
  //
  // selectedAddressId
  // Address Id.
  //
  // Observable<any>
  // Wait for response.
  setDefaultAddress(

    selectedAddressId: number

  ): Observable<any> {

    // Go to Backend.
    // Update Default Address.
    return this.http.put(

      `${this.apiUrl}/default/${selectedAddressId}`,

      {}

    );

  }

}
