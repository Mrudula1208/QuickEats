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

  // Track if user clicked Add Address.
  submitted = false;

  // Per-field error messages.
  errors: { [key: string]: string } = {};

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
  // VALIDATE FORM
  // ==========================================

  // validateForm
  // Checks every required field.
  // Returns true if all fields are valid.
  validateForm(): boolean {

    // Clear old errors.
    this.errors = {};

    // Customer Name
    if (!this.newAddress.customerName.trim()) {

      this.errors['customerName'] = 'Customer name is required.';

    } else if (this.newAddress.customerName.trim().length < 2) {

      this.errors['customerName'] = 'Customer name must be at least 2 characters.';

    }

    // Phone Number
    if (!this.newAddress.phoneNumber.trim()) {

      this.errors['phoneNumber'] = 'Phone number is required.';

    } else if (!/^\d{10,15}$/.test(this.newAddress.phoneNumber.trim())) {

      this.errors['phoneNumber'] = 'Please enter a valid 10 to 15 digit phone number.';

    }

    // House Number
    if (!this.newAddress.houseNumber.trim()) {

      this.errors['houseNumber'] = 'House number is required.';

    }

    // Area
    if (!this.newAddress.area.trim()) {

      this.errors['area'] = 'Area is required.';

    } else if (this.newAddress.area.trim().length < 2) {

      this.errors['area'] = 'Area must be at least 2 characters.';

    }

    // City
    if (!this.newAddress.city.trim()) {

      this.errors['city'] = 'City is required.';

    }

    // State
    if (!this.newAddress.state.trim()) {

      this.errors['state'] = 'State is required.';

    }

    // Pincode
    if (!this.newAddress.pincode.trim()) {

      this.errors['pincode'] = 'Pincode is required.';

    } else if (!/^\d{6}$/.test(this.newAddress.pincode.trim())) {

      this.errors['pincode'] = 'Pincode must be exactly 6 digits.';

    }

    // Address Type
    if (!this.newAddress.addressType) {

      this.errors['addressType'] = 'Address type is required.';

    }

    // Return true if no errors.
    return Object.keys(this.errors).length === 0;

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


        },

        // error
        // Runs if API Fails.
        error: () => {}

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

    // Mark form as submitted.
    this.submitted = true;

    // Validate all fields.
    if (!this.validateForm()) {

      return;

    }

    this.savedAddressService
      .addAddress(this.newAddress)
      .subscribe({

        // next
        // Runs if API Success.
        next: () => {

          // Reload Addresses.
          this.loadAddresses();

          // Reset submitted flag.
          this.submitted = false;

          // Clear errors.
          this.errors = {};

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
        error: () => {}

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
        error: () => {}

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
        error: () => {}

      });

  }

}
