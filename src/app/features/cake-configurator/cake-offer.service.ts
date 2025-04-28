import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CakeOfferService {
  private apiUrl = 'http://localhost:8080/api/offres';

  constructor(private http: HttpClient) {}

  getOfferDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/details`);
  }
} 