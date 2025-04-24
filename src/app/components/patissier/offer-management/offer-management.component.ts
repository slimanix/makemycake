import { Component, OnInit } from '@angular/core';
import { OfferService, Offer } from '../../../services/offer.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-offer-management',
  templateUrl: './offer-management.component.html',
  styleUrls: ['./offer-management.component.css']
})
export class OfferManagementComponent implements OnInit {
  offers: Offer[] = [];
  currentPage = 0;
  pageSize = 10;
  totalOffers = 0;
  loading = false;
  error: string | null = null;

  constructor(
    private offerService: OfferService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    const patisserieId = user?.patisserieInfo?.id;
    
    if (!patisserieId) {
      this.error = 'Patisserie ID not found';
      this.loading = false;
      return;
    }

    this.offerService.getOffersByPatisseriePaginated(patisserieId, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.offers = response.content;
          this.totalOffers = response.totalElements;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error loading offers';
          this.loading = false;
          console.error(err);
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOffers();
  }

  deleteOffer(id: number): void {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.offerService.deleteOffer(id).subscribe({
        next: () => {
          this.loadOffers();
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