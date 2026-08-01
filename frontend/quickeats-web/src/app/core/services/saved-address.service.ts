import { Injectable, signal } from '@angular/core';
// 1️⃣ Executes First.
//
// Injectable
// Means Angular can create this service.
//
// signal
// Stores live address data.
// Whenever signal changes,
// UI automatically refreshes.

import { SavedAddressModel } from '../models/saved-address.model';
// 2️⃣ Import Address Model.
// Service stores objects of this type.

@Injectable({

    providedIn: 'root'

    // Angular creates only ONE object
    // of this service.
    // Every component shares the same object.

})

export class SavedAddressService {

    // =====================================================
    // EXECUTION FLOW
    // =====================================================
    //
    // 1️⃣ Angular creates SavedAddressService.
    //
    // 2️⃣ savedAddresses signal is created.
    //
    // 3️⃣ Component calls getAddresses().
    //
    // 4️⃣ HTML displays all addresses.
    //
    // 5️⃣ User adds new address.
    //
    // 6️⃣ Signal updates.
    //
    // 7️⃣ UI refreshes automatically.
    //
    // =====================================================

    savedAddresses = signal<SavedAddressModel[]>([

        {

            addressId: 1,

            customerName: "Mrudula More",

            phoneNumber: "9876543210",

            houseNumber: "A-302",

            area: "Borivali West",

            landmark: "Near Metro Station",

            city: "Mumbai",

            state: "Maharashtra",

            pincode: "400092",

            addressType: "Home",

            isDefault: true

        }

    ]);

    // signal<SavedAddressModel[]>
    //
    // Means:
    //
    // signal stores live array.
    //
    // [] means multiple addresses.

    constructor() {

    }

    getAddresses(): SavedAddressModel[] {

        // (): SavedAddressModel[]
        //
        // Returns complete address list.

        return this.savedAddresses();

    }

    addAddress(

        newAddress: SavedAddressModel

    ): void {

        // newAddress
        // New address entered by customer.

        const currentAddresses =

            [...this.savedAddresses()];

        currentAddresses.push(

            newAddress

        );

        this.savedAddresses.set(

            currentAddresses

        );

        console.log("Address Added");

        console.log(this.savedAddresses());

    }

    deleteAddress(

        selectedAddressId: number

    ): void {

        this.savedAddresses.set(

            this.savedAddresses().filter(

                address =>

                address.addressId !== selectedAddressId

            )

        );

        console.log("Address Deleted");

    }

    setDefaultAddress(

        selectedAddressId: number

    ): void {

        const currentAddresses =

            [...this.savedAddresses()];

        currentAddresses.forEach(address => {

            address.isDefault =

                address.addressId === selectedAddressId;

        });

        this.savedAddresses.set(

            currentAddresses

        );

        console.log("Default Address Updated");

    }

}

/*

WHY DO WE WRITE THIS FILE?

This service manages

✔ Add Address

✔ Delete Address

✔ Default Address

✔ Return All Addresses

Flow

Saved Address Component

↓

Saved Address Service

↓

Signal

↓

HTML

Later

Backend API

↓

Saved Address Service

↓

Component

↓

HTML

*/