import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

/** Sends signed-out visitors to Admin Login, remembering where they were going. */
export const adminGuard: CanActivateFn = (_route, state) =>
  inject(AdminAuthService).hasValidSession() || inject(Router).createUrlTree(['/admin-login'], { queryParams: { returnUrl: state.url } });

/** Signed-in admins skip the login page. */
export const adminLoginGuard: CanActivateFn = () =>
  !inject(AdminAuthService).hasValidSession() || inject(Router).createUrlTree(['/admin-backoffice']);
