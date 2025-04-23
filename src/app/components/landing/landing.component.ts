import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  offers: Offer[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(private http: HttpClient) {}

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
} 