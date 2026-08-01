import { Component } from '@angular/core';
// 1️⃣ Executes First.
// Import Component because every Angular page starts with Component.

import { CommonModule } from '@angular/common';
// 2️⃣ Import CommonModule.
// Required because HTML uses Angular directives like @for and @if.

import { FormsModule } from '@angular/forms';
// 3️⃣ Import FormsModule.
// Required because we use [(ngModel)] for two-way data binding.

import { SavedAddressService } from '../../../core/services/saved-address.service';
// 4️⃣ Import SavedAddressService.
// This service stores and manages all customer addresses.

import { SavedAddressModel } from '../../../core/models/saved-address.model';
// 5️⃣ Import SavedAddressModel.
// This model defines the structure of one address.

@Component({

  selector: 'app-saved-address',
  // HTML selector of this component.

  standalone: true,
  // Means this component works independently.
  // No need to register inside AppModule.

  imports: [

    CommonModule,

    FormsModule

  ],
  // Import required Angular modules.

  templateUrl: './saved-address.html',
  // Connect HTML file.

  styleUrl: './saved-address.scss'
  // Connect CSS file.

})

export class SavedAddressComponent {

  // =====================================================
  // EXECUTION FLOW
  // =====================================================
  //
  // 1️⃣ Angular creates this component.
  //
  // 2️⃣ Variables are created.
  //
  // 3️⃣ Constructor executes automatically.
  //
  // 4️⃣ loadAddresses() executes.
  //
  // 5️⃣ Address list comes from Service.
  //
  // 6️⃣ HTML displays addresses.
  //
  // 7️⃣ Customer adds or deletes address.
  //
  // 8️⃣ Service updates Signal.
  //
  // 9️⃣ UI refreshes automatically.
  //
  // =====================================================

  customerAddresses: SavedAddressModel[] = [];
  // SavedAddressModel[]
  //
  // Means:
  // This variable stores multiple addresses.
  //
  // [] indicates an array.

  newAddress: SavedAddressModel = {

    // Default empty object.
    // Customer fills this form.

    addressId: 0,

    customerName: "",

    phoneNumber: "",

    houseNumber: "",

    area: "",

    landmark: "",

    city: "",

    state: "",

    pincode: "",

    addressType: "Home",

    isDefault: false

  };

  constructor(

    private savedAddressService: SavedAddressService

    // private
    // Means only this class can use this service.
    //
    // Angular automatically creates
    // SavedAddressService object.
    //
    // We NEVER write:
    //
    // new SavedAddressService()

  ) {

    // Constructor runs automatically
    // when page opens.

    this.loadAddresses();

  }

  loadAddresses(): void {

    // (): void
    //
    // Means:
    // This method returns nothing.
    // It only performs work.

    this.customerAddresses =

      this.savedAddressService.getAddresses();

    // getAddresses()
    //
    // Returns complete address list.
    //
    // Store that list inside
    // customerAddresses.
    //
    // HTML automatically displays it.

  }

  addNewAddress(): void {

    // Generate unique Address Id.

    this.newAddress.addressId =

      Date.now();

    // Date.now()
    //
    // Returns current timestamp.
    //
    // Used as unique Id.

    this.savedAddressService.addAddress(

      this.newAddress

    );

    // Send new address
    // to Service.

    this.loadAddresses();

    // Refresh Address List.

    this.newAddress = {

      // Clear form.

      addressId: 0,

      customerName: "",

      phoneNumber: "",

      houseNumber: "",

      area: "",

      landmark: "",

      city: "",

      state: "",

      pincode: "",

      addressType: "Home",

      isDefault: false

    };

  }

  deleteAddress(

    selectedAddressId: number

  ): void {

    // selectedAddressId: number
    //
    // Means:
    // Receives Address Id.
    //
    // number because Address Id
    // is numeric.

    this.savedAddressService.deleteAddress(

      selectedAddressId

    );

    // Delete selected address.

    this.loadAddresses();

    // Refresh UI.

  }

  makeDefault(

    selectedAddressId: number

  ): void {

    // Make one address default.

    this.savedAddressService.setDefaultAddress(

      selectedAddressId

    );

    this.loadAddresses();

  }

}

/*

WHY DO WE WRITE THIS FILE?

This component controls
everything related to Saved Address.

Flow

Dashboard

↓

Saved Address Page Opens

↓

Constructor Executes

↓

loadAddresses()

↓

Address List Comes

↓

HTML Displays Addresses

↓

Customer Adds Address

↓

Service Saves Address

↓

Signal Updates

↓

UI Refreshes

↓

Customer Selects Default Address

↓

Checkout Uses Default Address

*/