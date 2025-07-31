import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../shared/Token/token-service.service';

export const adminGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.getToken() && tokenService.getRole() == "1") return true;

  router.navigate(['/login']);
  return false;
};

export const userGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.getToken() && tokenService.getRole() != "1") return true;

  router.navigate(['/login']);
  return false;
};
