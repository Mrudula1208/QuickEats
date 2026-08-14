import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// This guard protects Admin pages.
// Only users with the "Admin" role can open them.
export const adminGuard: CanActivateFn = () => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role === 'Admin') {
    return true;
  }

  // Not an Admin. Go back to Home.
  router.navigate(['/']);
  return false;
};
