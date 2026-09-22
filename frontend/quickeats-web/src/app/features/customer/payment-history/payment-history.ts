import { Component, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Payment } from '../../../core/models/payment.model';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.scss',
})
export class PaymentHistoryComponent {

  payments = signal<Payment[]>([]);
  isLoading = signal(true);
  loadError = signal('');

  constructor(
    private paymentService: PaymentService,
    private toastr: ToastrService
  ) {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.paymentService.getUserPayments(Number(localStorage.getItem('userId'))).subscribe({
      next: (data) => {
        this.payments.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load payment history. Please try again.');
        this.toastr.error('Failed to load payment history');
      }
    });
  }

  retry(): void {
    this.loadPayments();
  }
}