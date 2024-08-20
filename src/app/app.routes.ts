import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./modules/home/home/home.component').then((m) => m.HomeComponent),
    title: 'Seva Adhikar Diyo - Home'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/login/login/login.component').then((m) => m.LoginComponent),
    title: 'Seva Adhikar Diyo - Login'
  },
  {
    path: 'poc',
    loadChildren: () => import('./modules/poc/poc.module').then((m) => m.PocModule),
    title: 'Seva Adhikar Diyo - POC',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'poc' }
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then((m) => m.AdminModule),
      title: 'Seva Adhikar Diyo - Admin',
      canActivate: [AuthGuard, RoleGuard],
      data: { expectedRole: 'admin' }

  },
  {
    path: 'volunteer-registration',
    loadComponent: () => import('./modules/login/volunteer-registration/volunteer-registration.page').then( m => m.VolunteerRegistrationPage)
  },
  {
    path: '',
    loadComponent: () =>
      import('./modules/home/home/home.component').then((m) => m.HomeComponent),
    pathMatch: 'full',
     title: 'Seva Adhikar Diyo - Home'
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
