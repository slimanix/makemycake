import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserInfo } from '../../models/user-info';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html' // Only change: `template` → `templateUrl`
})
export class ProfileComponent implements OnInit {
  userInfo: UserInfo | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  navigateToOfferManagement() {
    this.router.navigate(['/patissier/offers']);
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.userInfo = user;
    });
  }
}