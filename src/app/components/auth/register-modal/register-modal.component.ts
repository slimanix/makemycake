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
  showActivationMessage: boolean = false;
  userEmail: string = '';
  loading: boolean = false;
  selectedRole: 'CLIENT' | 'PATISSIER' = 'CLIENT';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
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
      const formData = this.registerForm.value;
      const formDataObj = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });
      
      if (this.selectedFile) {
        formDataObj.append('file', this.selectedFile);
      }

      this.authService.register(formDataObj).subscribe({
        next: (response) => {
          this.userEmail = formData.email;
          this.showActivationMessage = true;
          this.notificationService.showSuccess('Registration successful! Please check your email to activate your account.');
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          console.error(this.errorMessage);
        }
      });
    }
  }
} 