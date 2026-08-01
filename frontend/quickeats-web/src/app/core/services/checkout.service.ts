import { Injectable, signal } from '@angular/core';
import { CheckoutModel } from '../models/checkout.model';

@Injectable({
    providedIn: 'root'
})
export class CheckoutService {

    // Signal stores the latest checkout information.
    // Initially no checkout data is available.
    checkoutDetails = signal<CheckoutModel | null>(null);

    // Save checkout information.
    // This method is called before placing the order.
    saveCheckoutDetails(checkout: CheckoutModel): void {

        this.checkoutDetails.set(checkout);

        console.log("Checkout Details Saved");

        console.log(this.checkoutDetails());

    }

    // Return current checkout information.
    // Used by Checkout Page and Payment Page.
    getCheckoutDetails(): CheckoutModel | null {

        return this.checkoutDetails();

    }

    // Remove checkout information.
    // Used after successful order placement.
    clearCheckout(): void {

        this.checkoutDetails.set(null);

    }

}