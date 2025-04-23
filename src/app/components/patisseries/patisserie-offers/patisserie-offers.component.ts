import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../services/notification.service';

interface Offer {
  id: number;
  patisserieId: number;
  typeEvenement: string;
  description: string;
  prix: number;
  photoUrl: string;
  kilos: number;
  isValide: boolean;
  adminId?: number;
}

@Component({
  selector: 'app-patisserie-offers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patisserie-offers.component.html',
  styleUrls: ['./patisserie-offers.component.css']
})
export class PatisserieOffersComponent implements OnInit {
  patisserieId: number = 0;
  patisserieName: string = 'Patisserie';
  offers: Offer[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.patisserieId = +params['id'];
      this.loadOffers();
    });
  }

  loadOffers() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Offer[]>(`${environment.apiUrl}/api/offres/patisserie/${this.patisserieId}`).subscribe({
      next: (offers) => {
        this.offers = offers || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load offers';
        this.isLoading = false;
        this.notificationService.showError(this.errorMessage);
      }
    });
  }
} 