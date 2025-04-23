import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { Patisserie } from '../../../models/patisserie';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
  userEmail: string = '';
  patisseries: Patisserie[] = [];
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get user email from the current user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userEmail = currentUser.email;
    }

    // Fetch validated patisseries
    this.fetchPatisseries();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  fetchPatisseries(): void {
    this.http.get<Patisserie[]>(`${environment.apiUrl}/api/patisseries/validated`)
      .subscribe({
        next: (data) => {
          this.patisseries = data;
        },
        error: (error) => {
          this.errorMessage = 'Error fetching patisseries';
          console.error('Error:', error);
        }
      });
  }
} 