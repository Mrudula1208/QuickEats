import { Component } from '@angular/core';
// Component.
// Controls Saved Address Page.

import { CommonModule } from '@angular/common';
// CommonModule.
// Used for @if and @for.

import { FormsModule } from '@angular/forms';
// FormsModule.
// Used for ngModel.

import { SavedAddressService } from '../../../core/services/saved-address.service';
// SavedAddressService.
// Calls Backend APIs.

import { SavedAddressModel } from '../../../core/models/saved-address.model';
// SavedAddressModel.
// Defines one Address.

@Component({

  selector: 'app-saved-address',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './saved-address.html',

  styleUrl: './saved-address.scss'

})
export class SavedAddressComponent {

  // Store Addresses.
  customerAddresses: SavedAddressModel[] = [];

  // New Address Object.
  newAddress: SavedAddressModel = {

    addressId: 0,

    customerName: '',

    phoneNumber: '',

    houseNumber: '',

    area: '',

    landmark: '',

    city: '',

    state: '',

    pincode: '',

    addressType: 'Home',

    isDefault: false

  };

  constructor(

    // Address Service.
    private savedAddressService: SavedAddressService

  ) {

    // Load Addresses.
    this.loadAddresses();

  }

  // ==========================================
  // LOAD ADDRESSES
  // ==========================================

  // loadAddresses
  // Gets all Addresses.
  //
  // ()
  // No Input.
  //
  // : void
  // Returns Nothing.
  loadAddresses(): void {

    this.savedAddressService
      .getAddresses()
      .subscribe({

        // next
        // Runs if API Success.
        next: (data: SavedAddressModel[]) => {

          // this
          // Current Component.
          //
          // customerAddresses
          // Store Addresses.
          this.customerAddresses = data;

          console.log(this.customerAddresses);

        },

        // error
        // Runs if API Fails.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

  // ==========================================
  // ADD ADDRESS
  // ==========================================

  // addNewAddress
  // Saves Address.
  //
  // (): void
  // Returns Nothing.
  addNewAddress(): void {

    this.savedAddressService
      .addAddress(this.newAddress)
      .subscribe({

        // next
        // Runs if API Success.
        next: () => {

          // Reload Addresses.
          this.loadAddresses();

          // Clear Form.
          this.newAddress = {

            addressId: 0,

            customerName: '',

            phoneNumber: '',

            houseNumber: '',

            area: '',

            landmark: '',

            city: '',

            state: '',

            pincode: '',

            addressType: 'Home',

            isDefault: false

          };

        },

        // error
        // Runs if API Fails.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

  // ==========================================
  // DELETE ADDRESS
  // ==========================================

  // deleteAddress
  // Deletes Address.
  //
  // selectedAddressId
  // Selected Address Id.
  deleteAddress(

    selectedAddressId: number

  ): void {

    this.savedAddressService
      .deleteAddress(selectedAddressId)
      .subscribe({

        // next
        // Runs if API Success.
        next: () => {

          // Reload Addresses.
          this.loadAddresses();

        },

        // error
        // Runs if API Fails.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

  // ==========================================
  // DEFAULT ADDRESS
  // ==========================================

  // makeDefault
  // Sets Default Address.
  //
  // selectedAddressId
  // Selected Address Id.
  makeDefault(

    selectedAddressId: number

  ): void {

    this.savedAddressService
      .setDefaultAddress(selectedAddressId)
      .subscribe({

        // next
        // Runs if API Success.
        next: () => {

          // Reload Addresses.
          this.loadAddresses();

        },

        // error
        // Runs if API Fails.
        error: (err: any) => {

          console.log(err);

        }

      });

  }

}