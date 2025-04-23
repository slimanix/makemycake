import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Offer {
  id: number;
  typeEvenement: string;
  kilos: number;
  prix: number;
  photoUrl: string;
  valide: boolean;
  patisserieId: number;
  patisserieNom: string;
  description: string;
  ingredients: string[];
  allergens: string[];
}

@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.css']
})
export class OfferDetailsComponent implements OnInit {
  offer: Offer | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const offerId = this.route.snapshot.paramMap.get('id');
    if (offerId) {
      this.fetchOfferDetails(offerId);
    }
  }

  fetchOfferDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Offer>(`${environment.apiUrl}/api/offres/patisserie/${id}`)
      .subscribe({
        next: (data) => {
          this.offer = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching offer details:', error);
          this.errorMessage = 'Unable to fetch offer details. Please try again later.';
          this.isLoading = false;
        }
      });
  }
} 