import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ClientDashboardComponent } from './components/client/dashboard/dashboard.component';
import { LandingComponent } from './components/landing/landing.component';
import { authGuard } from './guards/auth.guard';
import { OfferDetailsComponent } from './components/offers/offer-details/offer-details.component';
import { PatisseriesComponent } from './components/patisseries/patisseries.component';
import { PatisserieOffersComponent } from './components/patisseries/patisserie-offers/patisserie-offers.component';
import { ProfileComponent } from './components/profile/profile.component';

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
  { path: '', component: LandingComponent }
];
