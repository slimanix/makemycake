import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../models/login-request';
import { ApiResponse } from '../models/api-response';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserInfo, UserInfoResponse } from '../models/user-info';

interface LoginResponse extends ApiResponse<string> {}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private jwtHelper = new JwtHelperService();
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient) {
    // Load user info when service is initialized
    this.loadStoredUserData();
  }

  private loadStoredUserData(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem('user');

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      // If we have stored user data, use it immediately
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          this.currentUserSubject.next(userData);
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }
      
      // Then refresh it from the server
      this.refreshUserInfo().subscribe();
      
      // Set up auto-refresh of token
      this.autoRefreshToken(token);
    } else {
      this.clearAuthData();
    }
  }

  private refreshUserInfo(): Observable<UserInfoResponse> {
    return this.getUserInfo().pipe(
      tap((response) => {
          if (response && response.data) {
          this.storeUserData(response.data);
        }
      }),
      catchError((error) => {
        console.error('Error refreshing user info:', error);
        if (error.status === 401) {
          this.clearAuthData();
        }
        return of(null as any);
      })
    );
  }

  private storeUserData(user: UserInfo): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
          }
  }

  private autoRefreshToken(token: string): void {
    try {
      const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
      if (expirationDate) {
        const timeUntilExpiration = expirationDate.getTime() - Date.now();
        const refreshTime = Math.max(timeUntilExpiration - 60000, 0); // Refresh 1 minute before expiration

        this.tokenExpirationTimer = setTimeout(() => {
          this.refreshUserInfo().subscribe();
        }, refreshTime);
      }
    } catch (e) {
      console.error('Error setting up token refresh:', e);
    }
  }

  getUserInfo(): Observable<UserInfoResponse> {
    return this.http.get<UserInfoResponse>(`${this.apiUrl}/me`);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: LoginResponse) => {
        if (response && response.data) {
          localStorage.setItem('token', response.data);
          this.loadStoredUserData(); // This will handle loading user info and setting up refresh
        }
      })
    );
  }

  register(data: FormData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    this.clearAuthData();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  forgotPassword(email: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    });
  }

  verifyResetToken(token: string): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(`${this.apiUrl}/reset-password`, { 
      params: { token }
    });
  }

  hasClientRole(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'CLIENT';
  }

  triggerLoginPopup(): void {
    // Implement your login popup logic here
    // This could be a modal, redirect to login page, etc.
    // For now, we'll just log a message
    console.log('Login popup triggered');
  }
}