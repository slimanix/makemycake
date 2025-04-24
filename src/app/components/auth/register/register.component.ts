import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/register-request';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = '';
  selectedRole: 'CLIENT' | 'PATISSIER' = 'CLIENT';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['CLIENT'],
      // Client fields
      fullName: [''],
      phoneNumber: [''],
      address: [''],
      // Patissier fields (matching backend)
      shopName: [''],
      location: [''],
      siretNumber: [''],
      profilePicture: ['']
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  onRoleChange(role: 'CLIENT' | 'PATISSIER'): void {
    this.selectedRole = role;
    this.registerForm.patchValue({ role });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const registerRequest: RegisterRequest = {
        email: formValue.email,
        password: formValue.password,
        role: formValue.role,
        ...(this.selectedRole === 'CLIENT' ? {
          fullName: formValue.fullName,
          phoneNumber: formValue.phoneNumber,
          address: formValue.address
        } : {
          shopName: formValue.shopName,
          location: formValue.location,
          siretNumber: formValue.siretNumber,
          profilePicture: formValue.profilePicture,
          phoneNumber: formValue.phoneNumber
        })
      };

      this.authService.register(registerRequest).subscribe({
        next: () => this.router.navigate(['/auth/login']),
        error: (error) => {
          this.errorMessage = error.error.message || 'Registration failed';
        }
      });
    }
  }
}
