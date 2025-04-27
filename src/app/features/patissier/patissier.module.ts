import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CreateOfferComponent } from './create-offer/create-offer.component';

@NgModule({
  declarations: [
    CreateOfferComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    CreateOfferComponent
  ]
})
export class PatissierModule { } 