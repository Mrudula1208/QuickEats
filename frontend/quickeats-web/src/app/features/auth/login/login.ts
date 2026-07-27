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
    private router: Router

  ) { }

  // Runs when Login button is clicked.
  login(): void {

    console.log("Login Button Clicked");

    console.log(this.loginUser);

    // Call Backend Login API.
  this.authService.login(this.loginUser).subscribe({
  next: (response) => {

    console.log(response);

    // Save user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('name', response.name);
    localStorage.setItem('email', response.email);
    localStorage.setItem('role', response.role);

    alert("Login Successful");

    this.router.navigate(['/']);
  },

  error: (err) => {
    console.log(err);
    alert("Invalid Email or Password");
  }
});

}}

/*

EXECUTION FLOW

1. Angular opens Login Page

↓

2. LoginComponent created

↓

3. loginUser object created

↓

4. Constructor runs

↓

5. HTML loads

↓

6. User enters Email

↓

loginUser.email updated

↓

7. User enters Password

↓

loginUser.password updated

↓

8. Click Login

↓

9. login() executes

↓

10. AuthService.login()

↓

11. ASP.NET Login API

↓

12. Database checks Email

↓

13. Password Verified

↓

14. JWT Token Generated

↓

15. Angular receives token

↓

16. saveToken()

↓

17. localStorage

↓

18. Navigate Home Page

*/