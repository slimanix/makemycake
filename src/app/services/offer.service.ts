import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Offer {
  id?: number;
  typeEvenement: string;
  kilos: number;
  prix: number;
  photoUrl: string;
  patisserieId: number;
  valide: boolean;
  patisserieNom?: string;
  validatedByAdminId?: number;
  validatedByAdminName?: string;
}

export interface OfferRequest {
  typeEvenement: string;
  kilos: number;
  prix: number;
  photo: File;
  patisserieId: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = `${environment.apiUrl}/api/offres`;

  constructor(private http: HttpClient) { }

  createOffer(formData: FormData): Observable<Offer> {
    console.log('Creating offer with formData:', {
      typeEvenement: formData.get('typeEvenement'),
      kilos: formData.get('kilos'),
      prix: formData.get('prix'),
      patisserieId: formData.get('patisserieId'),
      photo: formData.get('photo')
    });

    return this.http.post<Offer>(this.apiUrl, formData).pipe(
      tap(response => {
        console.log('Offer creation successful:', response);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client error:', error.error.message);
      errorMessage = error.error.message;
    } else {
      // Server-side error
      console.error('Server error:', {
        status: error.status,
        error: error.error,
        message: error.message
      });
      errorMessage = error.error?.message || error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  getOffersByPatisserie(patisserieId: number): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/patisserie/${patisserieId}`).pipe(
      catchError(this.handleError)
    );
  }

  getOffersByPatisseriePaginated(patisserieId: number, page: number = 0, size: number = 10): Observable<{
    content: Offer[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/patisserie/${patisserieId}/paginated?page=${page}&size=${size}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteOffer(id: number): Observable<void> {
    console.log(`Sending DELETE request to /api/offres/${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log(`Offer with ID ${id} successfully deleted`);
      }),
      catchError(error => {
        console.error(`Error deleting offer with ID ${id}:`, error);
        return this.handleError(error);
      })
    );
  }

  getOfferById(id: number): Observable<Offer> {
    console.log(`Fetching offer with ID ${id}`);
    return this.http.get<Offer>(`${this.apiUrl}/${id}`).pipe(
      tap(offer => {
        console.log('Fetched offer:', offer);
      }),
      catchError(error => {
        console.error(`Error fetching offer with ID ${id}:`, error);
        return this.handleError(error);
      })
    );
  }
} 