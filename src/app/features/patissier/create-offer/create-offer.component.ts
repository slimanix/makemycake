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
  showCustomEventType = false;

  constructor(
    private fb: FormBuilder,
    private offerService: OfferService,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.offerForm = this.fb.group({
      typeEvenement: ['', Validators.required],
      customEventType: [''],
      kilos: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      prix: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      photo: [null, Validators.required]
    });

    // Listen for changes in typeEvenement
    this.offerForm.get('typeEvenement')?.valueChanges.subscribe(value => {
      this.showCustomEventType = value === 'OTHER';
      if (this.showCustomEventType) {
        this.offerForm.get('customEventType')?.setValidators([Validators.required]);
      } else {
        this.offerForm.get('customEventType')?.clearValidators();
        this.offerForm.get('customEventType')?.setValue('');
      }
      this.offerForm.get('customEventType')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.loading = true;
    this.authService.getUserInfo().subscribe({
      next: (response: { data: UserInfo }) => {
        if (response && response.data) {
          this.handleUserData(response.data);
        } else {
          this.error = 'Unable to load user information';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading user info:', error);
        this.error = 'Unable to load user information';
        this.loading = false;
      }
    });
  }

  private handleUserData(user: UserInfo): void {
    this.currentUser = user;
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

    this.patisserieId = user.patisserieInfo.id;
    if (!this.patisserieId) {
      this.error = 'Invalid patisserie ID. Please try logging in again.';
      this.loading = false;
      return;
    }

    if (!user.patisserieInfo.valid) {
      this.error = 'Your patisserie account is not yet activated. Please wait for administrator approval.';
      this.loading = false;
      return;
    }

    this.loading = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.error = 'File size should not exceed 5MB';
        return;
      }
      this.selectedFile = file;
      this.createImagePreview(file);
    }
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.offerForm.valid && this.selectedFile) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();
        let eventType = this.offerForm.get('typeEvenement')?.value;
        
        // If "OTHER" is selected, use the custom event type
        if (eventType === 'OTHER') {
          eventType = this.offerForm.get('customEventType')?.value;
        }

        formData.append('typeEvenement', eventType);
        formData.append('kilos', this.offerForm.get('kilos')?.value);
        formData.append('prix', this.offerForm.get('prix')?.value);
        formData.append('photo', this.selectedFile);
        formData.append('patisserieId', this.patisserieId!.toString());

        this.offerService.createOffer(formData).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/patissier/offers']);
          },
          error: (err) => {
            console.error('Error creating offer:', err);
            this.loading = false;
            this.error = err.error?.message || 'Error creating offer';
          }
        });
      } catch (e) {
        this.loading = false;
        this.error = e instanceof Error ? e.message : 'An error occurred';
      }
    }
  }
} 