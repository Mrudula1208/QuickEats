import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Register } from '../../../core/models/register.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  user: Register = {
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'Customer',
  };

  confirmPassword = '';
  agreeTerms = false;

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  apiError = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  register(): void {
    if (!this.user.name || !this.user.email || !this.user.password || !this.user.phoneNumber) {
      this.apiError.set('Please fill in all required fields.');
      return;
    }

    if (this.user.password.length < 6) {
      this.apiError.set('Password must be at least 6 characters long.');
      return;
    }

    if (this.user.password !== this.confirmPassword) {
      this.apiError.set('Passwords do not match.');
      return;
    }

    if (!this.agreeTerms) {
      this.apiError.set('Please agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    if (!/^\d{10}$/.test(this.user.phoneNumber)) {
      this.apiError.set('Please enter a valid 10-digit phone number.');
      return;
    }

    this.isLoading.set(true);
    this.apiError.set('');

    this.authService.register(this.user).subscribe({
      next: () => {
        // Auto-login upon successful registration
        this.authService.login({ email: this.user.email, password: this.user.password }).subscribe({
          next: (response) => {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', String(response.id));
            localStorage.setItem('name', response.name);
            localStorage.setItem('email', response.email);
            localStorage.setItem('role', response.role);
            localStorage.setItem('profileImageUrl', response.profileImageUrl || '');

            this.isLoading.set(false);
            this.toastr.success(`Account created successfully! Welcome, ${response.name}!`, 'Welcome to QuickEats');

            const role = response.role;
            if (role === 'Owner') {
              this.router.navigate(['/owner']);
            } else if (role === 'Admin') {
              this.router.navigate(['/admin/dashboard']);
            } else if (role === 'DeliveryPartner' || role === 'Delivery Partner') {
              this.router.navigate(['/delivery/dashboard']);
            } else {
              this.router.navigate(['/home']);
            }
          },
          error: () => {
            this.isLoading.set(false);
            this.toastr.success('Account created successfully! Please sign in.', 'Welcome to QuickEats');
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg =
          err?.error && typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || 'Registration failed. Please try again with different details.';
        this.apiError.set(msg);
      },
    });
  }
}
