import { Routes } from '@angular/router';
const catalog = () => import('./features/products/pages/products/products').then((m) => m.Products);
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Lanyi Pisos | Pisos de madera, bambú y laminados',
    loadComponent: () => import('./features/home/pages/home/home').then((m) => m.Home),
  },
  {
    path: 'pisos',
    title: 'Catálogo de Pisos | Lanyi Pisos',
    data: { category: 'pisos' },
    loadComponent: catalog,
  },
  {
    path: 'accesorios',
    title: 'Catálogo de Accesorios | Lanyi Pisos',
    data: { category: 'accesorios' },
    loadComponent: catalog,
  },
  {
    path: 'nosotros',
    title: 'Nosotros | Más de 25 años | Lanyi Pisos',
    loadComponent: () => import('./features/about/pages/about/about').then((m) => m.About),
  },
  { path: 'zocalos', redirectTo: 'accesorios', pathMatch: 'full' },
  { path: 'productos', redirectTo: 'accesorios', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
