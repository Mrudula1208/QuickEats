import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// This guard protects Delivery Partner pages.
// Only users with the "DeliveryPartner" role can open them.
export const deliveryPartnerGuard: CanActivateFn = () => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role === 'DeliveryPartner') {
    return true;
  }

  // Not a Delivery Partner. Go back to Home.
  router.navigate(['/']);
  return false;
};
