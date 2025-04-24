import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';

import { ClientDashboardComponent } from './components/client/dashboard/dashboard.component';
import { LandingComponent } from './components/landing/landing.component';
import { authGuard } from './guards/auth.guard';
import { OfferDetailsComponent } from './components/offers/offer-details/offer-details.component';
import { PatisseriesComponent } from './components/patisseries/patisseries.component';
import { PatisserieOffersComponent } from './components/patisseries/patisserie-offers/patisserie-offers.component';
import { ProfileComponent } from './components/profile/profile.component';
import { OfferManagementComponent } from './features/patissier/offer-management/offer-management.component';
import { CreateOfferComponent } from './features/patissier/create-offer/create-offer.component';

export const routes: Routes = [
  { 
    path: 'client/dashboard', 
    component: ClientDashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'auth/login', 
    component: LoginComponent,
    data: { hideNavbar: true } // This will hide the navbar on the standalone login page
  },
  { 
    path: 'auth/register', 
    component: RegisterComponent,
    data: { hideNavbar: true } // This will hide the navbar on the standalone register page
  },
  { 
    path: 'auth/forgot-password', 
    component: ForgotPasswordComponent,
    data: { hideNavbar: true }
  },
  {
    path: 'auth/reset-password',
    component: ResetPasswordComponent,
    data: { hideNavbar: true }
  },
  {
    path: 'offers/:id',
    component: OfferDetailsComponent
  },
  {
    path: 'patisseries',
    component: PatisseriesComponent
  },
  {
    path: 'patisseries/:id/offers',
    component: PatisserieOffersComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  { path: '', component: LandingComponent },
  {
    path: 'patissier',
    canActivate: [authGuard],
    data: { roles: ['PATISSIER'] },
    children: [
      {
        path: 'offers',
        component: OfferManagementComponent
      },
      {
        path: 'offers/create',
        component: CreateOfferComponent
      },
      {
        path: 'offers/:id',
        component: OfferDetailsComponent
      }
    ]
  }
];
