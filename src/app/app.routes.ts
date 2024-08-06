import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
   
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/login/login/login.component').then((m) => m.LoginComponent),
    title: 'Seva Adhikar Diyo - Login'
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
      title: 'Seva Adhikar Diyo - Admin'
  },
  {
    path: '',
    loadComponent: () =>
      import('./modules/home/home/home.component').then((m) => m.HomeComponent),
    pathMatch: 'full',
     title: 'Seva Adhikar Diyo - Home'
  },
];
