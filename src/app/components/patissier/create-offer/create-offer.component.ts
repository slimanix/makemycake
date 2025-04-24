import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OfferService } from '../../../services/offer.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.css']
})
export class CreateOfferComponent implements OnInit {
  offerForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: SafeUrl | null = null;
  loading = false;
  error: string | null = null;

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
    this.authService.loadUserInfo(); 
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error = 'Please select an image file';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'File size should not exceed 5MB';
        return;
      }

      this.selectedFile = file;
      this.offerForm.patchValue({ photo: file });
      this.error = null;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    console.log('tcdxc,xzbcvest');

    if (this.offerForm.valid && this.selectedFile) {
      this.loading = true;
      const formData = new FormData();
      
      const user = this.authService.getCurrentUser();
      const patisserieId = user?.id;
    console.log('User ID:', user?.id);

       console.log('Patisserie ID:', user?.patisserieInfo); 
      if (!patisserieId) {
        this.error = 'Patisserie ID not found';
        this.loading = false;
        return;
      }

      formData.append('typeEvenement', this.offerForm.get('typeEvenement')?.value);
      formData.append('kilos', this.offerForm.get('kilos')?.value);
      formData.append('prix', this.offerForm.get('prix')?.value);
      formData.append('photo', this.selectedFile);
      formData.append('patisserieId', patisserieId.toString());

      this.offerService.createOffer(formData).subscribe({
        next: () => {
          this.router.navigate(['/patissier/offers']);
        },
        error: (err) => {
          this.error = 'Error creating offer: ' + (err.error?.message || 'Unknown error');
          this.loading = false;
          console.error(err);
        }
      });
    }
  }
} 