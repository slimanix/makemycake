import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { ApiResponse } from '../models/api-response';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserInfo, UserInfoResponse } from '../models/user-info';

interface LoginResponse extends ApiResponse<string> {} // JWT token is in the data field

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {
    this.loadUserInfo();
  }

   loadUserInfo(): void {
    if (this.isAuthenticated()) {
      console.log('Loading user info - token exists');
      this.getUserInfo().subscribe({
        next: (response) => {
          console.log('User info loaded:', response);
          if (response && response.data) {
            console.log('Setting current user with data:', {
              id: response.data.id,
              email: response.data.email,
              role: response.data.role,
              patisserieInfo: response.data.patisserieInfo
            });
            this.currentUserSubject.next(response.data);
          } else {
            console.error('No user data in response');
          }
        },
        error: (error) => {
          console.error('Error loading user info:', error);
          this.logout();
        }
      });
    } else {
      console.log('No token found - user not authenticated');
    }
  }

  getUserInfo(): Observable<UserInfoResponse> {
    return this.http.get<UserInfoResponse>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        console.log('GET /me Response:', response);
        if (response && response.data) {
          console.log('Patisserie Info in Response:', response.data.patisserieInfo);
        }
      })
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: LoginResponse) => {
        console.log('Login response:', response);
        if (response && response.data) {
          localStorage.setItem('token', response.data);
          // Add a small delay before loading user info to ensure token is stored
          setTimeout(() => {
            console.log('Loading user info after login');
            this.loadUserInfo();
          }, 100);
        } else {
          console.error('No token received in login response');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  register(data: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/register`, data).pipe(
      tap((response: ApiResponse<any>) => {
        // Don't automatically login after registration
        // The user needs to activate their account first
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): UserInfo | null {
    this.loadUserInfo();
    console.log('Current user subject value:', this.currentUserSubject.value);
    const user = this.currentUserSubject.value;
    console.log('Getting current user:', user);
    if (user && user.patisserieInfo) {
      console.log('Patisserie info found:', user.patisserieInfo);
    } else {
      console.log('No patisserie info in current user');
    }
    return user;
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
} 