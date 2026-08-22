import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Read token from localStorage.
  const token = localStorage.getItem('token');

  // If token exists,
  // attach it with every API request.
  if(token){

    req = req.clone({

      setHeaders:{

        Authorization:`Bearer ${token}`

      }

    });

  }

  // Continue request.
  return next(req);

};
// What does auth.interceptor.ts contain?

// This file contains one function whose only job is:

// Before any API request goes to the backend, check if a JWT token exists. If yes, attach it to the request.

// That's all.

// Simple Flow
// User Login

// â†“

// JWT Token Saved

// â†“

// User opens Orders

// â†“

// Angular calls API

// â†“

// Interceptor runs

// â†“

// Checks Token

// â†“

// Adds Token

// â†“

// Backend receives request

// â†“

// Returns Data

