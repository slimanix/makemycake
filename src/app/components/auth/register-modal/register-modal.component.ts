import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css']
})
export class RegisterModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() loginClick = new EventEmitter<void>();
  
  selectedRole: 'CLIENT' | 'PATISSIER' = 'CLIENT';
  registerForm: FormGroup;
  errorMessage: string | null = null;
  showActivationMessage: boolean = false;
  userEmail: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['CLIENT', Validators.required],
      fullName: [''],
      phoneNumber: [''],
      address: [''],
      shopName: [''],
      location: [''],
      siretNumber: ['']
    });
  }

  onClose() {
    this.close.emit();
    this.showActivationMessage = false;
  }

  selectRole(role: 'CLIENT' | 'PATISSIER') {
    this.selectedRole = role;
    this.registerForm.patchValue({ role });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = null;
      
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.loading = false;
          console.log('Registration successful! Please check your email to activate your account.');
          this.closeModal();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          console.error(this.errorMessage);
        }
      });
    }
  }

  closeModal() {
    this.close.emit();
    this.showActivationMessage = false;
  }
} 