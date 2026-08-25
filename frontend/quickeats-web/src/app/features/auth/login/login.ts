// Import Component decorator.
import { Component } from '@angular/core';

// Common Angular directives.
import { CommonModule } from '@angular/common';

// For ngModel.
import { FormsModule } from '@angular/forms';

// Used to navigate pages.
import { Router } from '@angular/router';

// Login model.
import { Login } from '../../../core/models/login.model';

// Auth Service.
import { AuthService } from '../../../core/services/auth.service';

// Toast notifications.
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class LoginComponent {

  // Object that stores user input.
  loginUser: Login = {

    email: '',

    password: ''

  };

  constructor(

    // Used to call Login API.
    private authService: AuthService,

    // Used to move to another page.
    private router: Router,

    // Toast notifications.
    private toastr: ToastrService

  ) { }

  // Runs when Login button is clicked.
  login(): void {

    // Call Backend Login API.
  this.authService.login(this.loginUser).subscribe({
  next: (response) => {

    // Save user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', String(response.id));
    localStorage.setItem('name', response.name);
    localStorage.setItem('email', response.email);
    localStorage.setItem('role', response.role);
    localStorage.setItem('profileImageUrl', response.profileImageUrl || '');

    this.toastr.success('Login Successful', 'Welcome Back');

    const role = response.role;
    if (role === 'Owner') {
      this.router.navigate(['/owner']);
    } else if (role === 'Admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  },

  error: () => {

    // Error handled by error interceptor.
  }
});

}}

/*

EXECUTION FLOW

1. Angular opens Login Page

â†“

2. LoginComponent created

â†“

3. loginUser object created

â†“

4. Constructor runs

â†“

5. HTML loads

â†“

6. User enters Email

â†“

loginUser.email updated

â†“

7. User enters Password

â†“

loginUser.password updated

â†“

8. Click Login

â†“

9. login() executes

â†“

10. AuthService.login()

â†“

11. ASP.NET Login API

â†“

12. Database checks Email

â†“

13. Password Verified

â†“

14. JWT Token Generated

â†“

15. Angular receives token

â†“

16. saveToken()

â†“

17. localStorage

â†“

18. Navigate Home Page

*/
