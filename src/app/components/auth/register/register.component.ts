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
  selectedFile: File | null = null;
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
      // Patissier fields
      shopName: [''],
      location: [''],
      siretNumber: ['']
      // Note: profilePicture removed from form group as it will be handled via file upload
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
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
      const formData = new FormData();
      const { profilePicture, ...formValue } = this.registerForm.value;

    // 1. Add all form fields as JSON under 'request'
    formData.append('request', new Blob([JSON.stringify(formValue)], {
      type: 'application/json'
    }));

        // 2. Add the image file if exists
        if (this.selectedFile) {
          formData.append('profileImage', this.selectedFile);
        }

      // Add all form values to FormData
      Object.keys(formValue).forEach(key => {
        if (formValue[key] !== null && formValue[key] !== undefined) {
          formData.append(key, formValue[key]);
        }
      });

      // Add the image file if exists (for Patissier)
      if (this.selectedRole === 'PATISSIER' && this.selectedFile) {
        formData.append('profileImage', this.selectedFile);
      }

      this.authService.register(formData).subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Registration failed';
        }
      });
    }
  }
}