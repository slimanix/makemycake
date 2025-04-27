import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css']
})
export class RegisterModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() loginClick = new EventEmitter<void>();

  registerForm: FormGroup;
  errorMessage: string = '';
  selectedFile: File | null = null;
  selectedRole: 'CLIENT' | 'PATISSIER' = 'CLIENT';
  showActivationMessage: boolean = false;
  userEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['CLIENT'],
      fullName: [''],
      phoneNumber: [''],
      address: [''],
      shopName: [''],
      location: [''],
      siretNumber: ['']
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  onClose() {
    this.close.emit();
    this.showActivationMessage = false;
  }

  onRoleChange(role: 'CLIENT' | 'PATISSIER') {
    this.selectedRole = role;
    this.registerForm.patchValue({ role });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = new FormData();
      const { profilePicture, ...formValue } = this.registerForm.value;

      formData.append('request', new Blob([JSON.stringify(formValue)], {
        type: 'application/json'
      }));

      if (this.selectedFile) {
        formData.append('profileImage', this.selectedFile);
      }

      // Also append fields separately (optional but matches your other component)
      Object.keys(formValue).forEach(key => {
        if (formValue[key] !== null && formValue[key] !== undefined) {
          formData.append(key, formValue[key]);
        }
      });

      this.authService.register(formData).subscribe({
        next: () => {
          this.userEmail = formValue.email;
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
