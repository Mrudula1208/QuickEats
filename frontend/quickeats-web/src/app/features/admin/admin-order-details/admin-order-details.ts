import { Component } from '@angular/core';
// Component
// Tells Angular that this file is a Component.
// This Component controls the Admin Order Details page.

import { CommonModule } from '@angular/common';
// CommonModule
// Gives Angular common features used by the HTML.
// We need it for @if and @for.

import { ActivatedRoute } from '@angular/router';
// ActivatedRoute
// Used to read the Order ID from the URL.
//
// Example:
// /admin/order-details/101
//
// We can read:
// id = 101

import { OrderService } from '../../../core/services/order';
// OrderService
// Contains the order data and order-related methods.

import { OrderModel } from '../../../core/models/order.model';
// OrderModel
// Defines the structure of one Order object.


@Component({

  selector: 'app-admin-order-details',
  // selector
  // Name used to identify this Component.

  standalone: true,
  // standalone
  // Means this Component works independently.

  imports: [
    CommonModule
  ],
  // imports
  // Lists the Angular modules required by this Component.

  templateUrl: './admin-order-details.html',
  // Connects this TypeScript file
  // with admin-order-details.html.

  styleUrl: './admin-order-details.scss'
  // Connects the SCSS file.
  // We won't work on SCSS now.

})


export class AdminOrderDetails {

  // Store the selected Order.
  //
  // OrderModel
  // Means the object follows OrderModel structure.
  //
  // !
  // Definite assignment operator.
  //
  // It tells TypeScript:
  // "This variable will receive a value later."
  order!: OrderModel;


  constructor(

    // ActivatedRoute
    // Angular gives us the current URL information.

    // route
    // Variable name used to access that URL information.

    private route: ActivatedRoute,

    // OrderService
    // Gives us access to order data.

    private orderService: OrderService

  ) {

    // Read Order ID from URL.
    //
    // Example URL:
    // /admin/order-details/101
    //
    // snapshot
    // Gets the current URL information.
    //
    // paramMap
    // Contains parameters from the URL.
    //
    // get('id')
    // Gets the parameter named "id".
    //
    // Number()
    // Converts the URL value from text
    // into a number.

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );


    // Get all orders from OrderService.
    //
    // getAllOrders()
    // Returns OrderModel[].

    const orders =
      this.orderService.getAllOrders();


    // Find the order whose ID
    // matches the ID from the URL.
    //
    // find()
    // Searches the array for one matching order.
    //
    // order
    // Represents one order while searching.

    this.order =
      orders.find(

        order =>
          order.id === id

      )!;

  }

}