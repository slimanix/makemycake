import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class ClientGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && this.authService.hasClientRole()) {
      return true;
    } else {
      this.authService.triggerLoginPopup();
      return false;
    }
  }
}