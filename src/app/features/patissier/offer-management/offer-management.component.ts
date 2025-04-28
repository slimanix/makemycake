import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OfferService, Offer } from '../../../services/offer.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserInfo } from '../../../models/user-info';

@Component({
  selector: 'app-offer-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './offer-management.component.html',
  styleUrls: ['./offer-management.component.css']
})
export class OfferManagementComponent implements OnInit {
  // Expose Math object to template
  Math = Math;
  
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedSort: string = 'newest';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  pages: number[] = [];
  loading = false;
  error: string | null = null;
  currentUser: UserInfo | null = null;
  patisserieId: number | null = null;

  constructor(
    private offerService: OfferService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.loading = true;
    this.authService.getUserInfo().subscribe({
      next: (response: { data: UserInfo }) => {
        if (response && response.data) {
          this.currentUser = response.data;
          if (this.currentUser.role === 'PATISSIER' && this.currentUser.patisserieInfo) {
            this.patisserieId = this.currentUser.patisserieInfo.id;
            this.loadOffers();
          } else {
            this.error = 'You must be logged in as a patissier to manage offers';
            this.loading = false;
          }
        } else {
          this.error = 'Unable to load user information';
          this.loading = false;
        }
      },
      error: (error: Error) => {
        console.error('Error loading user info:', error);
        this.error = 'Unable to load user information';
        this.loading = false;
      }
    });
  }

  loadOffers(): void {
    if (!this.patisserieId) {
      this.error = 'Invalid patisserie ID';
      return;
    }

    this.loading = true;
    this.error = null;
    
    this.offerService.getOffersByPatisserie(this.patisserieId).subscribe({
      next: (offers: Offer[]) => {
        this.offers = offers;
        this.filteredOffers = [...this.offers];
        this.updatePagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.error = 'Error loading offers';
        this.loading = false;
      }
    });
  }

  filterOffers(): void {
    let filtered = [...this.offers];

    // Filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(offer => 
        offer.client?.username?.toLowerCase().includes(searchLower) ||
        offer.cake?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(offer => offer.status === this.selectedStatus);
    }

    // Sort offers
    switch (this.selectedSort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    this.filteredOffers = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  getPaginatedOffers(): Offer[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOffers.slice(startIndex, endIndex);
  }

  getStatusText(status: 'PENDING' | 'ACCEPTED' | 'REJECTED'): string {
    return status === 'PENDING' ? 'Pending' :
           status === 'ACCEPTED' ? 'Accepted' :
           status === 'REJECTED' ? 'Rejected' : status;
  }

  viewOfferDetails(id: number): void {
    this.router.navigate(['/patissier/offers', id]);
  }

  deleteOffer(id: number): void {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.offerService.deleteOffer(id).subscribe({
        next: () => {
          this.loadOffers();
        },
        error: (error) => {
          console.error('Error deleting offer:', error);
          this.error = 'Error deleting offer';
        }
      });
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOffers.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
} 