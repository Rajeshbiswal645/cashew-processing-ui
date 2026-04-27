import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.resolveAccess(route, state);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.resolveAccess(childRoute, state);
  }

  private resolveAccess(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const isLoggedIn = this.authService.isAuthenticated();
    const isPublicOnly = route.data['publicOnly'] === true;

    if (isPublicOnly) {
      return isLoggedIn ? this.router.createUrlTree(['/dashboard']) : true;
    }

    if (isLoggedIn) {
      return true;
    }

    return this.router.createUrlTree(['/login'], {
      queryParams: state.url && state.url !== '/login' ? { returnUrl: state.url } : undefined
    });
  }
}
