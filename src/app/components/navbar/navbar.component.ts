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
  showProfileDropdown = false;
  private authSubscription?: Subscription;
  private outsideClickListener?: (event: MouseEvent) => void;
  private escapeListener?: (event: KeyboardEvent) => void;

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
    this.removeDropdownListeners();
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

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
    if (this.showProfileDropdown) {
      this.addDropdownListeners();
    } else {
      this.removeDropdownListeners();
    }
  }

  addDropdownListeners() {
    this.outsideClickListener = (event: MouseEvent) => {
      const dropdown = document.getElementById('profile-dropdown-menu');
      const trigger = document.getElementById('profile-dropdown-trigger');
      if (dropdown && trigger && !dropdown.contains(event.target as Node) && !trigger.contains(event.target as Node)) {
        this.showProfileDropdown = false;
        this.removeDropdownListeners();
      }
    };
    this.escapeListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.showProfileDropdown = false;
        this.removeDropdownListeners();
      }
    };
    document.addEventListener('mousedown', this.outsideClickListener);
    document.addEventListener('keydown', this.escapeListener);
  }

  removeDropdownListeners() {
    if (this.outsideClickListener) {
      document.removeEventListener('mousedown', this.outsideClickListener);
      this.outsideClickListener = undefined;
    }
    if (this.escapeListener) {
      document.removeEventListener('keydown', this.escapeListener);
      this.escapeListener = undefined;
    }
  }

  onProfileDropdownBlur() {
    setTimeout(() => {
      if (this.showProfileDropdown) {
        this.showProfileDropdown = false;
        this.removeDropdownListeners();
      }
    }, 100);
  }
}