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
        if (error.error.message) {
          message = error.error.message;
        } else if (error.error.errors && Array.isArray(error.error.errors)) {
          message = error.error.errors.join(', ');
        }
      } else if (typeof error.error === 'string') {
        message = error.error;
      }

      switch (error.status) {

        case 400:
          toastr.error(message, 'Bad Request');
          break;

        case 401:
          toastr.warning('Session expired. Please login again.', 'Unauthorized');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('name');
          localStorage.removeItem('email');
          localStorage.removeItem('role');
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
