import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Lanyi Pisos | Pisos de madera, bambú y laminados',
    loadComponent: () => import('./features/home/pages/home/home').then((m) => m.Home),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
