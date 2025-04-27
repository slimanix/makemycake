import { Component, OnInit } from '@angular/core';
import { OfferService, Offer } from '../../../services/offer.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserInfo } from '../../../models/user-info';

@Component({
  selector: 'app-offer-management',
  templateUrl: './offer-management.component.html',
  styleUrls: ['./offer-management.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class OfferManagementComponent implements OnInit {
  offers: Offer[] = [];
  currentPage = 0;
  pageSize = 10;
  totalOffers = 0;
  loading = false;
  error: string | null = null;
  currentUser: UserInfo | null = null;
  patisserieId: number | null = null;

  constructor(
    private offerService: OfferService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.loading = true;
    console.log('Starting to load user data');
    
    // First check if we have a current user in the service
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user from service:', currentUser);

    if (currentUser?.patisserieInfo?.id) {
      console.log('Found patisserie ID in current user:', currentUser.patisserieInfo.id);
      this.handleUserData(currentUser);
      return;
    }

    // If no current user or missing patisserie info, try to fetch it
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        console.log('User info loaded in component:', response);
        if (response && response.data) {
          this.handleUserData(response.data);
        } else {
          console.error('No user data in response');
          this.error = 'Unable to load user information';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading user info in component:', error);
        this.error = 'Unable to load user information. Please try logging in again.';
        this.loading = false;
        if (error.status === 401) {
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  private handleUserData(user: UserInfo): void {
    this.currentUser = user;
    console.log('Processing user data:', {
      role: user.role,
      hasPatisserieInfo: !!user.patisserieInfo,
      patisserieId: user.patisserieInfo?.id
    });
    
    if (user.role !== 'PATISSIER') {
      this.error = 'You must be logged in as a patissier to manage offers';
      this.loading = false;
      return;
    }

    if (!user.patisserieInfo) {
      this.error = 'Please complete your patisserie profile before managing offers';
      this.loading = false;
      return;
    }

    // Store patisserie ID - FIXED: Use user.id like in create-offer
    this.patisserieId = user.id;
    console.log('Patisserie ID set:', this.patisserieId);

    if (!this.patisserieId) {
      this.error = 'Invalid patisserie ID. Please try logging in again.';
      this.loading = false;
      return;
    }

    // Check if patisserie is valid using patisserieInfo.valid
    if (!user.patisserieInfo.valid) {
      this.error = 'Your patisserie account is not yet activated. Please wait for administrator approval.';
      this.loading = false;
      return;
    }

    console.log('Patisserie status:', {
      id: this.patisserieId,
      shopName: user.patisserieInfo.shopName,
      valid: user.patisserieInfo.valid,
      validated: user.patisserieInfo.validated
    });

    // Double check all conditions like in create-offer
    if (!this.currentUser?.patisserieInfo) {
      this.error = 'Please complete your patisserie profile before managing offers';
      this.loading = false;
      return;
    }

    if (!this.currentUser.patisserieInfo.valid) {
      this.error = 'Your patisserie account is not yet activated. Please wait for administrator approval.';
      this.loading = false;
      return;
    }

    if (!this.patisserieId) {
      this.error = 'Patisserie ID is missing. Please try logging in again.';
      this.loading = false;
      return;
    }

    // If all validations pass, load the offers
    this.loadOffers(this.patisserieId);
  }

  loadOffers(patisserieId: number): void {
    this.loading = true;
    this.error = null;

    console.log('Loading offers for patisserie:', patisserieId);
    this.offerService.getOffersByPatisseriePaginated(patisserieId, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          console.log('Offers loaded:', response);
          this.offers = response.content;
          this.totalOffers = response.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading offers:', err);
          this.error = 'Error loading offers';
          this.loading = false;
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.patisserieId) {
      this.loadOffers(this.patisserieId);
    }
  }

  deleteOffer(id: number): void {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.offerService.deleteOffer(id).subscribe({
        next: () => {
          if (this.patisserieId) {
            this.loadOffers(this.patisserieId);
          }
        },
        error: (err) => {
          this.error = 'Error deleting offer';
          console.error(err);
        }
      });
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalOffers / this.pageSize);
  }

  isLastPage(): boolean {
    return this.currentPage >= this.getTotalPages() - 1;
  }
} 