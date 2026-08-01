// saved-address.model.ts

// WHY DO WE WRITE THIS FILE?
//
// This file defines the structure of one Saved Address.
//
// Every address inside the application
// must follow this structure.
//
// Flow
//
// Database
//      ↓
// Backend API
//      ↓
// Address Model
//      ↓
// Address Service
//      ↓
// Address Component
//      ↓
// HTML

export interface SavedAddressModel {

    // Unique Address Id.
    // Every address should have different Id.
    addressId: number;

    // Customer Name.
    customerName: string;

    // Mobile Number.
    phoneNumber: string;

    // House / Flat Number.
    houseNumber: string;

    // Area / Street.
    area: string;

    // Landmark.
    landmark: string;

    // City.
    city: string;

    // State.
    state: string;

    // Pincode.
    pincode: string;

    // Address Type.
    // Example:
    // Home
    // Office
    // Other
    addressType: string;

    // Default Address.
    // true = Default
    // false = Not Default
    isDefault: boolean;

}