import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Login } from '../../../core/models/login.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  loginUser: Login = {
    email: '',
    password: '',
  };

  showPassword = signal(false);
  isLoading = signal(false);
  apiError = signal('');
  forgotMode = signal(false);

  forgotEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) {}

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  login(): void {
    if (!this.loginUser.email || !this.loginUser.password) {
      this.apiError.set('Please enter both email and password.');
      return;
    }
    if (!this.isValidEmail(this.loginUser.email)) {
      this.apiError.set('Please enter a valid email address.');
      return;
    }

    this.isLoading.set(true);
    this.apiError.set('');

    this.authService.login(this.loginUser).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', String(response.id));
        localStorage.setItem('name', response.name);
        localStorage.setItem('email', response.email);
        localStorage.setItem('role', response.role);
        localStorage.setItem('profileImageUrl', response.profileImageUrl || '');

        this.isLoading.set(false);
        this.toastr.success('Login Successful', 'Welcome Back');

        const role = response.role;

        // Only customers should be redirected to a protected page they were trying to reach.
        if (role === 'Customer') {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          if (returnUrl && this.isSafeReturnUrl(returnUrl)) {
            this.router.navigateByUrl(returnUrl);
            return;
          }
        }

        if (role === 'Owner') {
          this.router.navigate(['/owner']);
        } else if (role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'DeliveryPartner' || role === 'Delivery Partner') {
          this.router.navigate(['/delivery/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const message =
          err?.error && typeof err?.error === 'object' && err.error?.message
            ? err.error.message
            : 'Login failed. Please check your credentials and try again.';
        this.apiError.set(message);
        if (typeof err === 'string') {
          this.apiError.set(err);
        }
      },
    });
  }

  forgotPassword(): void {
    this.toastr.info('Password recovery is not currently supported. Please contact support.');
  }

  setForgotMode(): void {
    this.forgotMode.set(true);
  }

  backToLogin(): void {
    this.forgotMode.set(false);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isSafeReturnUrl(url: string): boolean {
    return !url.startsWith('http') && !url.startsWith('//') && url.startsWith('/');
  }
}
