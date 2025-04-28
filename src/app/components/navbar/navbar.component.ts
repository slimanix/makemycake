import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginModalComponent } from '../auth/login-modal/login-modal.component';
import { RegisterModalComponent } from '../auth/register-modal/register-modal.component';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoginModalComponent,
    RegisterModalComponent,
    NotificationBellComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoginModalOpen = false;
  isRegisterModalOpen = false;
  isMobileMenuOpen = false;
  isAuthenticated = false;
  private authSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  openLoginModal() {
    this.isLoginModalOpen = true;
    this.closeMobileMenu();
  }

  closeLoginModal() {
    this.isLoginModalOpen = false;
  }

  openRegisterModal() {
    this.isRegisterModalOpen = true;
    this.closeMobileMenu();
  }

  closeRegisterModal() {
    this.isRegisterModalOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }
}