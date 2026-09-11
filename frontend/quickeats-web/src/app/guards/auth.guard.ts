import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  // Remember where the user wanted to go so we can return after login.
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
// What does this file contain? (Simple)

// This file contains one function.

// Its job is:

// Before opening any protected page

// â†“

// Check Login

// â†“

// If Logged In

// â†“

// Open Page

// Else

// â†“

// Open Login Page
