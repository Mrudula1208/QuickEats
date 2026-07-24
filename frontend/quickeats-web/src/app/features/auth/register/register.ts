import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Register } from '../../../core/models/register.model';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-register',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  user:Register={
    name :'',
    email :'',
    password:''
  }
  constructor (
    private authService :AuthService,
    private router :Router
  ){}

  register ():void {
//     RegisterComponent

// ↓

// I have one object.

// ↓

// this.user
    this.authService.register(this.user)
    .subscribe({
      next:()=>{
   alert('Registration Successful');

          // Open Login Page.
          this.router.navigate(['/login']);

        },   
      error :()=>{
        alert("Registration Failed");
      }   
    });
  }  
  
}

// Execution Flow

// ----------------------------------------

// 1. Angular opens Register Page

// ↓

// 2. RegisterComponent created

// ↓

// 3. user object created

// ↓

// 4. User types Name

// ↓

// user.name updated

// ↓

// 5. User types Email

// ↓

// user.email updated

// ↓

// 6. User types Password

// ↓

// user.password updated

// ↓

// 7. User clicks Register

// ↓

// 8. register() executes

// ↓

// 9. AuthService.register(user)

// ↓

// 10. ASP.NET API

// ↓

// 11. SQL Server

// ↓

// 12. Success

// ↓

// 13. Login Page

// */









// 1. User types

// http://localhost:4200/register

//         │
//         ▼

// 2. Angular checks app.routes.ts

//         │
//         ▼

// 3. RegisterComponent is created

//         │
//         ▼

// 4. user object is created

// {

// name:"",

// email:"",

// password:""

// }

//         │
//         ▼

// 5. Constructor runs

// AuthService ✔

// Router ✔

//         │
//         ▼

// 6. register.html loads

//         │
//         ▼

// 7. Textboxes connect to user object

//         │
//         ▼

// 8. User types data

//         │
//         ▼

// 9. user object gets updated

//         │
//         ▼

// 10. Click Register

//         │
//         ▼

// 11. register()

//         │
//         ▼

// 12. AuthService

//         │
//         ▼

// 13. ASP.NET API

//         │
//         ▼

// 14. Database