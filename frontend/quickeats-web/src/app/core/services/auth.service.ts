// auth.service.ts

// Angular Service

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

// Used to call ASP.NET API
import { HttpClient } from '@angular/common/http';

// Models
import { Register } from '../models/register.model';
import { Login } from '../models/login.model';
import { AuthResponse } from '../models/auth-response.model';

// Helps to work with API response.
import { Observable } from 'rxjs';

@Injectable({

  providedIn: 'root'

})

export class AuthService {

  // Backend API URL

private apiUrl = `${environment.apiUrl}/Auth`;
  constructor(

    // Used for calling API

    private http: HttpClient

  ) { }

  // ==========================================
  // REGISTER
  // ==========================================
// AuthService

// â†“

// I received one object.

// â†“

//I'll call it user.

  register(user: Register): Observable<any> {

    return this.http.post(

      `${this.apiUrl}/register`,

      user

    );

  }

  // ==========================================
  // LOGIN
  // ==========================================

  login(user: Login): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(

      `${this.apiUrl}/login`,

      user

    );

  }

  // ==========================================
  // SAVE TOKEN
  // ==========================================

  saveToken(token: string): void {

    localStorage.setItem(

      'token',

      token

    );

  }

  // ==========================================
  // GET TOKEN
  // ==========================================

  getToken(): string | null {

    return localStorage.getItem(

      'token'

    );

  }

  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('profileImageUrl');

  }

  // ==========================================
  // CHECK LOGIN
  // ==========================================

  isLoggedIn(): boolean {

    return this.getToken() != null;

  }

}

/*

WHY DO WE CREATE THIS FILE?

Every authentication operation

comes here.

Register

â†“

AuthService

â†“

Backend


Login

â†“

AuthService

â†“

Backend


Backend returns JWT

â†“

AuthService

â†“

localStorage


Logout

â†“

Remove JWT


Instead of writing login code
inside every component,

all components use AuthService.

Flow

RegisterComponent

â†“

AuthService

â†“

ASP.NET API

â†“

Database

*/
