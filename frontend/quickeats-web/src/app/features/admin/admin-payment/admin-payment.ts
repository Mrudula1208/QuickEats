import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models/payment.model';
import { AdminNavComponent } from '../../../shared/admin-nav/admin-nav';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminNavComponent
  ],
  templateUrl: './admin-payment.html',
  styleUrl: './admin-payment.scss'
})
export class AdminPayment implements OnInit {
  payments = signal<Payment[]>([]);
  filteredPayments = signal<Payment[]>([]);
  isLoading = signal(true);
  loadError = signal('');

  // Filter & Search state
  searchQuery = '';
  selectedStatus = 'All';
  selectedMethod = 'All';
  sortBy = 'newest';

  // Stats
  totalAmount = signal(0);
  successfulCount = signal(0);
  pendingCount = signal(0);
  failedCount = signal(0);

  constructor(
    private paymentService: PaymentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.paymentService.getPayments().subscribe({
      next: (data: Payment[]) => {
        this.payments.set(Array.isArray(data) ? data : []);
        this.calculateStats();
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load payments. Please try again.');
        this.toastr.error('Could not load payments. Please try again.');
      }
    });
  }

  calculateStats(): void {
    let total = 0;
    let success = 0;
    let pending = 0;
    let failed = 0;

    for (const p of this.payments()) {
      if (p.paymentStatus === 'Success' || p.paymentStatus === 'Completed') {
        total += (p.amount || 0);
        success++;
      } else if (p.paymentStatus === 'Pending') {
        pending++;
      } else {
        failed++;
      }
    }

    this.totalAmount.set(total);
    this.successfulCount.set(success);
    this.pendingCount.set(pending);
    this.failedCount.set(failed);
  }

  applyFilters(): void {
    let list = [...this.payments()];

    // Search query (Order ID, Payment ID, Payment Method)
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        (p.id && p.id.toString().includes(q)) ||
        (p.orderId && p.orderId.toString().includes(q)) ||
        (p.paymentMethod && p.paymentMethod.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (this.selectedStatus !== 'All') {
      list = list.filter(p => p.paymentStatus === this.selectedStatus);
    }

    // Method filter
    if (this.selectedMethod !== 'All') {
      list = list.filter(p => p.paymentMethod === this.selectedMethod);
    }

    // Sort
    list.sort((a, b) => {
      const dateA = a.paidAt ? new Date(a.paidAt).getTime() : 0;
      const dateB = b.paidAt ? new Date(b.paidAt).getTime() : 0;

      if (this.sortBy === 'newest') return dateB - dateA;
      if (this.sortBy === 'oldest') return dateA - dateB;
      if (this.sortBy === 'highest') return (b.amount || 0) - (a.amount || 0);
      if (this.sortBy === 'lowest') return (a.amount || 0) - (b.amount || 0);
      return 0;
    });

    this.filteredPayments.set(list);
  }

  updatePaymentStatus(paymentId: number, newStatus: string): void {
    this.paymentService.updatePaymentStatus(paymentId, newStatus).subscribe({
      next: () => {
        this.toastr.success(`Payment #${paymentId} updated to ${newStatus}`);
        this.loadPayments();
      },
      error: () => this.toastr.error('Failed to update payment status')
    });
  }

  deletePayment(paymentId: number): void {
    if (!confirm(`Delete payment transaction #${paymentId}? This cannot be undone.`)) return;

    this.paymentService.deletePayment(paymentId).subscribe({
      next: () => {
        this.toastr.success('Payment deleted successfully');
        this.payments.set(this.payments().filter(p => p.id !== paymentId));
        this.calculateStats();
        this.applyFilters();
      },
      error: () => this.toastr.error('Failed to delete payment')
    });
  }

  retry(): void {
    this.loadPayments();
  }
}
