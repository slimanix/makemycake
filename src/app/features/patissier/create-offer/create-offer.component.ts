import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OfferService, OfferRequest } from '../../../services/offer.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { UserInfo } from '../../../models/user-info';

@Component({
  selector: 'app-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class CreateOfferComponent implements OnInit {
  offerForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: SafeUrl | null = null;
  loading = false;
  error: string | null = null;
  currentUser: UserInfo | null = null;
  patisserieId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private offerService: OfferService,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.offerForm = this.fb.group({
      typeEvenement: ['', Validators.required],
      kilos: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      prix: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      photo: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.loading = true;
    console.log('Starting to load user data');
    
    // First check if we have a current user in the service
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user from service:', currentUser);

    if (currentUser?.patisserieInfo?.id) {
      console.log('Found patisserie ID in current user:', currentUser.patisserieInfo.id);
      this.handleUserData(currentUser);
      return;
    }

    // If no current user or missing patisserie info, try to fetch it
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        console.log('User info loaded in component:', response);
        if (response && response.data) {
          this.handleUserData(response.data);
        } else {
          console.error('No user data in response');
          this.error = 'Unable to load user information';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading user info in component:', error);
        this.error = 'Unable to load user information. Please try logging in again.';
        this.loading = false;
        if (error.status === 401) {
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  private handleUserData(user: UserInfo): void {
    this.currentUser = user;
    console.log('Processing user data:', {
      role: user.role,
      hasPatisserieInfo: !!user.patisserieInfo,
      patisserieId: user.patisserieInfo?.id
    });

    if (user.role !== 'PATISSIER') {
      this.error = 'You must be logged in as a patissier to create offers';
      this.loading = false;
      return;
    }

    if (!user.patisserieInfo) {
      this.error = 'Please complete your patisserie profile before creating offers';
      this.loading = false;
      return;
    }

    // Store patisserie ID and validate it
    this.patisserieId = user.id;
    console.log('Patisserie ID set:', this.patisserieId);

    if (!this.patisserieId) {
      this.error = 'Invalid patisserie ID. Please try logging in again.';
      this.loading = false;
      return;
    }

    // Check if patisserie is valid (active)
    if (!user.patisserieInfo.valid) {
      this.error = 'Your patisserie account is not yet activated. Please wait for administrator approval.';
      this.loading = false;
      return;
    }

    console.log('Patisserie status:', {
      id: this.patisserieId,
      shopName: user.patisserieInfo.shopName,
      valid: user.patisserieInfo.valid,
      validated: user.patisserieInfo.validated
    });

    this.loading = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.error = 'Please select an image file';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.error = 'File size should not exceed 5MB';
        return;
      }

      this.selectedFile = file;
      this.offerForm.patchValue({ photo: file });
      this.error = null;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    console.log('Submit button clicked');
    console.log('Form state:', {
      valid: this.offerForm.valid,
      value: this.offerForm.value,
      errors: this.offerForm.errors,
      hasFile: !!this.selectedFile
    });

    if (!this.currentUser?.patisserieInfo) {
      this.error = 'Please complete your patisserie profile before creating offers';
      return;
    }

    if (!this.currentUser.patisserieInfo.valid) {
      this.error = 'Your patisserie account is not yet activated. Please wait for administrator approval.';
      return;
    }

    if (!this.patisserieId) {
      this.error = 'Patisserie ID is missing. Please try logging in again.';
      return;
    }

    if (this.offerForm.valid && this.selectedFile) {
      this.loading = true;
      this.error = null;
      const formData = new FormData();
      
      console.log('Creating offer for patisserie:', {
        id: this.patisserieId,
        shopName: this.currentUser.patisserieInfo.shopName,
        valid: this.currentUser.patisserieInfo.valid
      });
      
      const kilos = parseFloat(this.offerForm.get('kilos')?.value);
      const prix = parseFloat(this.offerForm.get('prix')?.value);

      if (isNaN(kilos) || isNaN(prix)) {
        this.error = 'Invalid numeric values for kilos or price';
        this.loading = false;
        return;
      }

      console.log('Parsed numeric values:', { kilos, prix });

      try {
        const typeEvenement = this.offerForm.get('typeEvenement')?.value;
        if (!typeEvenement) {
          throw new Error('Event type is required');
        }

        // Log all values before creating FormData
        console.log('Values before FormData creation:', {
          typeEvenement,
          kilos,
          prix,
          patisserieId: this.patisserieId,
          selectedFile: this.selectedFile
        });

        formData.append('typeEvenement', typeEvenement);
        formData.append('kilos', kilos.toString());
        formData.append('prix', prix.toString());
        formData.append('photo', this.selectedFile);
        formData.append('patisserieId', this.patisserieId.toString());

        // Verify FormData contents
        console.log('Verifying FormData contents:');
        formData.forEach((value, key) => {
          console.log(`${key}:`, value);
        });

        this.offerService.createOffer(formData).subscribe({
          next: (response) => {
            console.log('Offer created successfully:', response);
            this.loading = false;
            this.router.navigate(['/patissier/offers']);
          },
          error: (err) => {
            console.error('Error creating offer:', err);
            this.loading = false;
            if (err.status === 0) {
              this.error = 'Unable to connect to the server. Please check if the backend is running.';
            } else if (err.error?.message) {
              this.error = 'Error creating offer: ' + err.error.message;
            } else {
              this.error = 'Error creating offer: ' + (err.message || 'Unknown error');
            }
          }
        });
      } catch (e) {
        console.error('Error preparing form data:', e);
        this.loading = false;
        this.error = 'Error preparing form data: ' + (e instanceof Error ? e.message : 'Unknown error');
      }
    } else {
      console.log('Form validation failed:', {
        formValid: this.offerForm.valid,
        formErrors: this.offerForm.errors,
        hasFile: !!this.selectedFile,
        fileErrors: this.selectedFile ? null : 'No file selected'
      });
      
      // Show specific validation errors
      if (!this.selectedFile) {
        this.error = 'Please select an image for your offer';
      } else if (!this.offerForm.valid) {
        const errors = [];
        if (this.offerForm.get('typeEvenement')?.errors) {
          errors.push('Event type is required');
        }
        if (this.offerForm.get('kilos')?.errors) {
          errors.push('Please enter a valid weight in kilos');
        }
        if (this.offerForm.get('prix')?.errors) {
          errors.push('Please enter a valid price');
        }
        this.error = errors.join(', ');
      }
    }
  }
} 