import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// This guard protects Owner pages.
// Only users with the "Owner" role can open them.
export const ownerGuard: CanActivateFn = () => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role === 'Owner') {
    return true;
  }

  // Not an Owner. Go back to Home.
  router.navigate(['/']);
  return false;
};
