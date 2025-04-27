import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

interface Offer {
  id: number;
  typeEvenement: string;
  kilos: number;
  prix: number;
  photoUrl: string;
  valide: boolean;
  patisserieId: number;
  patisserieNom: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  offers: Offer[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;

  // Filtering and pagination
  selectedTypeEvenement: string = '';
  currentPage: number = 1;
  pageSize: number = 12;

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchOffers();
  }

  fetchOffers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.http.get<Offer[]>(`${environment.apiUrl}/api/offres`)
      .subscribe({
        next: (data) => {
          this.offers = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.errorMessage = 'Unable to fetch offers at this time. Please try again later.';
          this.isLoading = false;
          // Set some sample data for development
          this.offers = [
            {
              id: 1,
              typeEvenement: 'Birthday',
              kilos: 2,
              prix: 45,
              photoUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
              valide: true,
              patisserieId: 1,
              patisserieNom: 'Sweet Delights'
            },
            {
              id: 2,
              typeEvenement: 'Wedding',
              kilos: 5,
              prix: 120,
              photoUrl: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
              valide: true,
              patisserieId: 2,
              patisserieNom: 'Cake Masters'
            }
          ];
        }
      });
  }

  get typeEvenementOptions(): string[] {
    const allTypes = this.offers.map(o => o.typeEvenement).filter(Boolean);
    return Array.from(new Set(allTypes));
  }

  get filteredOffers(): Offer[] {
    if (!this.selectedTypeEvenement) return this.offers;
    return this.offers.filter(o => o.typeEvenement === this.selectedTypeEvenement);
  }

  get paginatedOffers(): Offer[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOffers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOffers.length / this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onTypeEvenementChange() {
    this.currentPage = 1;
  }

  onConfigureCake(offerId?: number): void {
    console.log('onConfigureCake called with offerId:', offerId);
    const isAuthenticated = this.authService.isAuthenticated();
    const hasClientRole = this.authService.hasClientRole();
    if (isAuthenticated && hasClientRole) {
      if (offerId) {
        this.router.navigate(['/cake-configurator', offerId]);
      } else {
        this.router.navigate(['/']);
      }
    } else {
      this.authService.triggerLoginPopup();
    }
  }

  get isPatisserie(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'PATISSIER';
  }
} 