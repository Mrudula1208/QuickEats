import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const toastr = inject(ToastrService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      let message = 'Something went wrong. Please try again.';

      if (error.error && typeof error.error === 'object') {

        // Standard error responses: { message } or { message, errors[] }.
        if (error.error.message && typeof error.error.message === 'string') {
          message = error.error.message;
        }

        // ASP.NET validation errors (ValidationProblemDetails):
        // errors is an object like { Field: ["Error 1", "Error 2"] }.
        if (error.error.errors) {

          const validationErrors = Array.isArray(error.error.errors)
            ? error.error.errors
            : Object.values(error.error.errors).flat();

          if (validationErrors.length > 0) {
            message = message !== 'Something went wrong. Please try again.'
              ? `${message}: ${validationErrors.join(', ')}`
              : validationErrors.join(', ');
          }
        }

      } else if (typeof error.error === 'string') {
        message = error.error;
      }

      switch (error.status) {

        case 400:
          toastr.error(message, 'Bad Request');
          break;

        case 401:

          // Failed login attempt keeps the backend message
          // instead of treating it as an expired session.
          if (req.url.includes('/Auth/login')) {
            toastr.warning(message, 'Login Failed');
            break;
          }

          toastr.warning('Session expired. Please login again.', 'Unauthorized');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('name');
          localStorage.removeItem('email');
          localStorage.removeItem('role');
          localStorage.removeItem('profileImageUrl');
          router.navigate(['/login']);
          break;

        case 403:
          toastr.error('You do not have permission to perform this action.', 'Access Denied');
          break;

        case 404:
          toastr.warning(message, 'Not Found');
          break;

        case 500:
          toastr.error('Server error. Please try again later.', 'Internal Server Error');
          break;

        case 0:
          toastr.error('Cannot connect to server. Please check your connection.', 'Network Error');
          break;

        default:
          toastr.error(message, 'Error');
          break;
      }

      return throwError(() => error);
    })
  );
};
