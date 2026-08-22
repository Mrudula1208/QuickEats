import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Register } from '../../../core/models/register.model';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-register',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
 user: Register = {

  name: '',

  email: '',

  password: '',
 phoneNumber: '',
  role: 'Customer'

};
  constructor (
    private authService :AuthService,
    private router :Router,
    private toastr: ToastrService
  ){}

register(): void {

  this.authService.register(this.user)
  .subscribe({
    next: () => {
      this.toastr.success('Registration Successful', 'Welcome');
      this.router.navigate(['/login']);
    },
    error: () => {

      // Error handled by error interceptor.
    }
  });

}}

// Execution Flow

// ----------------------------------------

// 1. Angular opens Register Page

// â†“

// 2. RegisterComponent created

// â†“

// 3. user object created

// â†“

// 4. User types Name

// â†“

// user.name updated

// â†“

// 5. User types Email

// â†“

// user.email updated

// â†“

// 6. User types Password

// â†“

// user.password updated

// â†“

// 7. User clicks Register

// â†“

// 8. register() executes

// â†“

// 9. AuthService.register(user)

// â†“

// 10. ASP.NET API

// â†“

// 11. SQL Server

// â†“

// 12. Success

// â†“

// 13. Login Page

// */









// 1. User types

// http://localhost:4200/register

//         â”‚
//         â–¼

// 2. Angular checks app.routes.ts

//         â”‚
//         â–¼

// 3. RegisterComponent is created

//         â”‚
//         â–¼

// 4. user object is created

// {

// name:"",

// email:"",

// password:""

// }

//         â”‚
//         â–¼

// 5. Constructor runs

// AuthService âœ”

// Router âœ”

//         â”‚
//         â–¼

// 6. register.html loads

//         â”‚
//         â–¼

// 7. Textboxes connect to user object

//         â”‚
//         â–¼

// 8. User types data

//         â”‚
//         â–¼

// 9. user object gets updated

//         â”‚
//         â–¼

// 10. Click Register

//         â”‚
//         â–¼

// 11. register()

//         â”‚
//         â–¼

// 12. AuthService

//         â”‚
//         â–¼

// 13. ASP.NET API

//         â”‚
//         â–¼

// 14. Database
