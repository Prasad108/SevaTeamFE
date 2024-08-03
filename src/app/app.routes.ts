import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/login/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule)
  },
  {
    path: '',
    loadComponent: () =>
      import('./modules/home/home/home.component').then((m) => m.HomeComponent),
    pathMatch: 'full'
  },
];
