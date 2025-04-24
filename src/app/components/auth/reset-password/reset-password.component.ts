import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  isTokenValid: boolean = false;
  isTokenValidating: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (this.token) {
      this.verifyToken(this.token);
    } else {
      this.errorMessage = 'No reset token provided';
      this.isTokenValidating = false;
      setTimeout(() => {
        this.router.navigate(['/auth/forgot-password']);
      }, 3000);
    }
  }

  private verifyToken(token: string): void {
    this.isTokenValidating = true;
    this.authService.verifyResetToken(token).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.isTokenValid = true;
          this.successMessage = 'Token verified successfully. You can now reset your password.';
        } else {
          this.errorMessage = response.message || 'Invalid token';
          setTimeout(() => {
            this.router.navigate(['/auth/forgot-password']);
          }, 3000);
        }
        this.isTokenValidating = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Invalid or expired reset token';
        this.isTokenValidating = false;
        setTimeout(() => {
          this.router.navigate(['/auth/forgot-password']);
        }, 3000);
      }
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token) {
      this.isLoading = true;
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;
      
      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Password has been successfully reset!';
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'An error occurred while resetting your password.';
          this.isLoading = false;
        }
      });
    }
  }
}