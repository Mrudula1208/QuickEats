import { CanActivateFn } from '@angular/router';

import { inject } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);

  const router = inject(Router);

  // Check token.
  if(authService.isLoggedIn()){

      return true;

  }

  // No token.
  router.navigate(['/login']);

  return false;

};

// What does this file contain? (Simple)

// This file contains one function.

// Its job is:

// Before opening any protected page

// ↓

// Check Login

// ↓

// If Logged In

// ↓

// Open Page

// Else

// ↓

// Open Login Page