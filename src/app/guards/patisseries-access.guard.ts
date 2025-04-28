import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class PatisseriesAccessGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      console.log('PatisseriesAccessGuard: unauthenticated, allow');
      return true;
    }
    const user = this.authService.getCurrentUser();
    console.log('PatisseriesAccessGuard: user', user);
    const allowed = user?.role === 'CLIENT' || user?.role === 'ADMIN';
    console.log('PatisseriesAccessGuard: allowed?', allowed);
    return allowed;
  }
} 