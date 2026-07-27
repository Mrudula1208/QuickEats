import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {

  console.log('✅ AUTH GUARD EXECUTED');

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    console.log('Running on server');
    return true;
  }

  const token = localStorage.getItem('token');

  console.log('Token =', token);

  if (token) {
    return true;
  }

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