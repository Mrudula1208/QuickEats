// auth.service.ts

// Angular Service

import { Injectable } from '@angular/core';

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

  private apiUrl = "https://localhost:7044/api/auth";

  constructor(

    // Used for calling API

    private http: HttpClient

  ) { }

  // ==========================================
  // REGISTER
  // ==========================================
// AuthService

// ↓

// I received one object.

// ↓

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

    localStorage.removeItem(

      'token'

    );

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

↓

AuthService

↓

Backend


Login

↓

AuthService

↓

Backend


Backend returns JWT

↓

AuthService

↓

localStorage


Logout

↓

Remove JWT


Instead of writing login code
inside every component,

all components use AuthService.

Flow

RegisterComponent

↓

AuthService

↓

ASP.NET API

↓

Database

*/