import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
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
  errorMessage: string = '';
  showActivationMessage: boolean = false;
  userEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
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
      const formData = this.registerForm.value;
      const userData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'CLIENT' ? {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address
        } : {
          shopName: formData.shopName,
          location: formData.location,
          siretNumber: formData.siretNumber
        })
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.userEmail = formData.email;
          this.showActivationMessage = true;
          this.notificationService.showSuccess('Registration successful! Please check your email to activate your account.');
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          this.notificationService.showError(this.errorMessage);
        }
      });
    }
  }
} 