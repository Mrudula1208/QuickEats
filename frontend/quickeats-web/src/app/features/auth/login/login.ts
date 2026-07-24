// Component decorator.
import { Component } from '@angular/core';

// Common Angular directives.
import { CommonModule } from '@angular/common';

// Required for ngModel.
import { FormsModule } from '@angular/forms';

// Used for page navigation.
import { Router } from '@angular/router';

// Login model.
import { Login } from '../../../core/models/login.model';

// Auth response model.
import { AuthResponse } from '../../../core/models/auth-response.model';

// Auth Service.
import { AuthService } from '../../../core/services/auth.service';

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

  // Stores email and password entered by user.
  login: Login = {

    email: '',

    password: ''

  };

  constructor(

    // Calls Login API.
    private authService: AuthService,

    // Opens another page.
    private router: Router

  ) { }

  // Runs when Login button is clicked.
  loginUser(): void {

    // Send Login object to backend.
    this.authService.login(this.login)

      // Wait for backend response.
      .subscribe({

        // Login successful.
        next: (response: AuthResponse) => {

          // Save JWT token.
          this.authService.saveToken(response.token);

          alert('✅ Login Successful');

          // Open Home page.
          this.router.navigate(['/']);

        },

        // Login failed.
        error: () => {

          alert('❌ Invalid Email or Password');

        }

      });

  }

}

/*

Execution Order

1. Login page opens.

2. LoginComponent created.

3. login object created.

4. HTML loads.

5. User enters Email.

6. User enters Password.

7. Click Login.

8. loginUser() runs.

9. AuthService.login()

10. ASP.NET API

11. JWT Token returned.

12. saveToken()

13. Navigate Home.

*/