import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

interface Patisserie {
  id: number;
  shopName: string;
  phoneNumber: string;
  location: string;
  siretNumber: string;
  userEmail: string;
  nombreOffres: number;
  valid: boolean;
}

interface ApiResponse {
  data: Patisserie[];
  message: string;
  status: number;
}

@Component({
  selector: 'app-patisseries',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patisseries.component.html',
  styleUrls: ['./patisseries.component.css']
})
export class PatisseriesComponent implements OnInit, OnDestroy {
  patisseries: Patisserie[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  private socket$: WebSocketSubject<any> | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPatisseries();
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }

  private connectWebSocket(): void {
    this.socket$ = webSocket(`${environment.apiUrl.replace('http', 'ws')}/ws-commandes`);
    
    this.socket$.subscribe({
      next: (msg) => {
        console.log('WebSocket message received:', msg);
      },
      error: (err) => {
        console.error('WebSocket error:', err);
      },
      complete: () => {
        console.log('WebSocket connection closed');
      }
    });
  }

  fetchPatisseries(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    this.http.get<ApiResponse>(`${environment.apiUrl}/api/patisseries/valides`, { headers })
      .subscribe({
        next: (response) => {
          this.patisseries = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching patisseries:', error);
          this.errorMessage = error.error?.message || 'Unable to fetch patisseries. Please try again later.';
          this.isLoading = false;
        }
      });
  }
} 