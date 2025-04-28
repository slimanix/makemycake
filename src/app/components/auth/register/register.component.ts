import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/register-request';
import { CommonModule } from '@angular/common';

interface ClientRequestData {
  address: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: 'CLIENT';
}

interface PatissierRequestData {
  shopName: string;
  phoneNumber: string;
  profile_picture: string;
  siretNumber: string;
  location: string;
  role: 'PATISSIER';
  email: string;
  password: string;
}

type RequestData = ClientRequestData | PatissierRequestData;

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
  isLoading: boolean = false;

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
      phoneNumber: ['', [Validators.pattern('^[0-9]{10}$')]],
      address: [''],
      // Patissier fields
      shopName: [''],
      location: [''],
      siretNumber: ['', [Validators.pattern('^[0-9]{9,14}$')]]
    });
  }

  onRoleChange(role: 'CLIENT' | 'PATISSIER'): void {
    this.selectedRole = role;
    this.registerForm.patchValue({ role });
    
    // Update validators based on role
    if (role === 'CLIENT') {
      this.registerForm.get('fullName')?.setValidators([Validators.required]);
      this.registerForm.get('phoneNumber')?.setValidators([Validators.required, Validators.pattern('^[0-9]{10}$')]);
      this.registerForm.get('address')?.setValidators([Validators.required]);
      
      // Clear Patissier field validators
      this.registerForm.get('shopName')?.clearValidators();
      this.registerForm.get('location')?.clearValidators();
      this.registerForm.get('siretNumber')?.clearValidators();
    } else {
      this.registerForm.get('shopName')?.setValidators([Validators.required]);
      this.registerForm.get('phoneNumber')?.setValidators([Validators.required, Validators.pattern('^[0-9]{10}$')]);
      this.registerForm.get('location')?.setValidators([Validators.required]);
      this.registerForm.get('siretNumber')?.setValidators([Validators.required, Validators.pattern('^[0-9]{9,14}$')]);
      
      // Clear Client field validators
      this.registerForm.get('fullName')?.clearValidators();
      this.registerForm.get('address')?.clearValidators();
    }
    
    // Update validity
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.updateValueAndValidity();
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Invalid file type. Please upload a JPEG, PNG or GIF image.';
        input.value = '';
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.errorMessage = 'File is too large. Maximum size is 5MB.';
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  private getFormValidationErrors(): string[] {
    const errors: string[] = [];
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control?.errors) {
        if (control.errors['required']) {
          errors.push(`${key} is required`);
        }
        if (control.errors['email']) {
          errors.push('Invalid email format');
        }
        if (control.errors['minlength']) {
          errors.push('Password must be at least 8 characters');
        }
        if (control.errors['pattern']) {
          if (key === 'phoneNumber') {
            errors.push('Phone number must be 10 digits');
          }
          if (key === 'siretNumber') {
            errors.push('SIRET number must be between 9 and 14 digits');
          }
        }
      }
    });
    return errors;
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formData = new FormData();
      const formValue = this.registerForm.value;

      // 1. Create a clean request object based on role
      const requestData = {
        email: formValue.email,
        password: formValue.password,
        role: this.selectedRole,
        ...(this.selectedRole === 'CLIENT' ? {
          fullName: formValue.fullName,
          phoneNumber: formValue.phoneNumber,
          address: formValue.address
        } : {
          shopName: formValue.shopName,
          phoneNumber: formValue.phoneNumber,
          location: formValue.location,
          siretNumber: formValue.siretNumber
        })
      };

      // 2. Append as proper JSON string with content type
      const requestBlob = new Blob(
        [JSON.stringify(requestData)], 
        { type: 'application/json' }
      );
      formData.append('request', requestBlob);

      // 3. Append file with proper field name
      if (this.selectedRole === 'PATISSIER' && this.selectedFile) {
        formData.append(
          'profileImage', // Must match @RequestPart name in Spring
          this.selectedFile,
          this.selectedFile.name
        );
      }

      // Debug: Log FormData contents
      formData.forEach((value, key) => {
        console.log(key, value);
      });

      this.isLoading = true;
      this.errorMessage = '';

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 200 || response.status === 201) {
            this.router.navigate(['/auth/login']);
          } else {
            this.errorMessage = response.message || 'Registration failed. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Registration error:', error);
          
          if (error.status === 0) {
            this.errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          } else if (error.status === 415) {
            this.errorMessage = 'Invalid file format. Please upload a valid image file (JPEG, PNG, or GIF).';
          } else if (error.status === 400) {
            const validationErrors = this.getFormValidationErrors();
            this.errorMessage = validationErrors.length > 0 
              ? validationErrors.join(', ') 
              : error.error?.message || 'Invalid form data. Please check your inputs.';
          } else if (error.status === 409) {
            this.errorMessage = 'Email already exists. Please use a different email address.';
          } else {
            this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          }
        }
      });
    } else {
      const validationErrors = this.getFormValidationErrors();
      this.errorMessage = validationErrors.join(', ');
      this.markFormFieldsAsTouched();
    }
  }

  private markFormFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}