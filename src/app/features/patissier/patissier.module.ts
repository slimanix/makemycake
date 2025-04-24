import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OfferManagementComponent } from './offer-management/offer-management.component';
import { CreateOfferComponent } from './create-offer/create-offer.component';

@NgModule({
  declarations: [
    OfferManagementComponent,
    CreateOfferComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    OfferManagementComponent,
    CreateOfferComponent
  ]
})
export class PatissierModule { } 