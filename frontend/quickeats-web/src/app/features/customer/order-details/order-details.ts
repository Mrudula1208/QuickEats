import { Component } from '@angular/core';
// We import Component because this file controls the Order Details page.
// Every Angular page or UI starts with a Component.

import { CommonModule } from '@angular/common';
// We import CommonModule because HTML uses Angular features like @if.

import { ActivatedRoute, Router } from '@angular/router';
// ActivatedRoute reads data from the URL.
// Router is used to move the user to another page.

import { OrderService } from '../../../core/services/order';
// We import OrderService because all order-related logic is written there.
// Components should not directly manage order data.

import { OrderModel } from '../../../core/models/order.model';
// We import OrderModel because it defines the structure of one order.

@Component({
  selector: 'app-order-details',
  // Angular uses this selector if this component is used inside another HTML page.

  standalone: true,
  // standalone:true means this component works independently.
  // We don't need to declare it inside app.module.ts.

  imports: [CommonModule],
  // We import CommonModule because HTML uses Angular directives.

  templateUrl: './order-details.html',
  // Connect this TypeScript file with order-details.html.

  styleUrl: './order-details.scss'
  // Connect this TypeScript file with order-details.scss.
})

export class OrderDetailsComponent {

  // Store one selected order.
  // Initially nothing is loaded.
  // '?' means value can be undefined.
  selectedOrder?: OrderModel;

  constructor(

    private currentRoute: ActivatedRoute,
    // Angular automatically gives ActivatedRoute object.
    // We use it to read Order Id from URL.
    // Example:
    // /order-details/101

    private orderService: OrderService,
    // Angular automatically gives OrderService object.
    // We don't create it using:
    // new OrderService()
    // Dependency Injection manages it.

    private router: Router
    // Router helps us open another page.
    // Example:
    // Order Details â†’ Delivery Tracking

  ) {

    // As soon as page opens,
    // immediately load selected order.
    this.loadSelectedOrder();

  }

  loadSelectedOrder(): void {
  // This method loads only ONE order.
  // Customer clicked one order from Orders page.
  // So we display only that order.

    const selectedOrderId =
      Number(this.currentRoute.snapshot.paramMap.get('id'));

    // Ask the Backend for that one order.
    this.orderService
      .getOrderById(selectedOrderId)
      .subscribe({

        next: (data) => {

          this.selectedOrder = data;


        },

        error: () => {}

      });

  }

  // Refresh order to see latest status.
  refreshOrder(): void {

    this.loadSelectedOrder();

  }

  // Get CSS class for status badge.
  getStatusClass(status: string): string {

    const classes: Record<string, string> = {

      'Pending': 'status-pending',

      'Confirmed': 'status-confirmed',

      'Preparing': 'status-preparing',

      'Out for Delivery': 'status-out',

      'Delivered': 'status-delivered',

      'Cancelled': 'status-cancelled'

    };

    return classes[status] || '';

  }

  // Get the status step index for timeline (0-based).
  // Returns -1 for Cancelled.
  getStatusStep(status: string): number {

    const steps = [
      'Pending',
      'Confirmed',
      'Preparing',
      'Out for Delivery',
      'Delivered'
    ];

    return steps.indexOf(status);

  }

  // Check if a timeline step is completed.
  isStepCompleted(stepIndex: number, currentStatus: string): boolean {

    if (currentStatus === 'Cancelled') return false;

    return this.getStatusStep(currentStatus) >= stepIndex;

  }

  openDeliveryTracking(): void {
  // Runs when customer clicks
  // "Track My Order" button.

    this.router.navigate([

      '/delivery',
      this.selectedOrder?.id

    ]);

    // Navigate to Delivery Tracking page
    // with the order id in the URL.

  }

  // Check if order can be cancelled.
  // Only "Pending" or "Confirmed" orders can be cancelled.
  canCancel(): boolean {
    if (!this.selectedOrder) return false;
    return this.selectedOrder.status === 'Pending' ||
           this.selectedOrder.status === 'Confirmed';
  }

  // Runs when customer clicks "Cancel Order" button.
  cancelOrder(): void {
    if (!this.selectedOrder) return;

    // Ask for confirmation before cancelling.
    const confirmed = confirm(
      `Are you sure you want to cancel order #${this.selectedOrder.id}?`
    );

    if (!confirmed) return;

    this.orderService.cancelOrder(this.selectedOrder.id).subscribe({
      next: () => {
        // Update the local status to reflect cancellation.
        if (this.selectedOrder) {
          this.selectedOrder.status = 'Cancelled';
        }
      },
      error: (err) => {
        alert(err.error || 'Failed to cancel order.');
      }
    });
  }

}
