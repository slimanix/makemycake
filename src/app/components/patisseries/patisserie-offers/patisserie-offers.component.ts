import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { OfferService, Offer } from '../../../services/offer.service';
import { AuthService } from '../../../services/auth.service';

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
    private offerService: OfferService,
    private authService: AuthService,
    private router: Router
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

    this.offerService.getOffersByPatisserie(this.patisserieId).subscribe({
      next: (offers: Offer[]) => {
        this.offers = offers || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Failed to load offers';
        console.error(this.errorMessage);
        this.isLoading = false;
      }
    });
  }

  onConfigureCake(offerId: number): void {
    const isAuthenticated = this.authService.isAuthenticated();
    const hasClientRole = this.authService.hasClientRole();
    
    if (isAuthenticated && hasClientRole) {
      this.router.navigate(['/cake-configurator', offerId]);
    } else {
      this.authService.triggerLoginPopup();
    }
  }
} 