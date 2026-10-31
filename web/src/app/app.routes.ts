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
  {
    path: 'pisos/:id',
    title: 'Detalle del piso | Lanyi Pisos',
    data: { category: 'pisos' },
    loadComponent: () => import('./features/products/pages/product-detail/product-detail').then(m => m.ProductDetail),
  },
  {
    path: 'accesorios/:id',
    title: 'Detalle del accesorio | Lanyi Pisos',
    data: { category: 'accesorios' },
    loadComponent: () => import('./features/products/pages/product-detail/product-detail').then(m => m.ProductDetail),
  },
  { path: 'blog/:slug', title: 'Artículo | Lanyi Pisos', loadComponent: () => import('./features/blog/article/article').then(m => m.Article) },
  { path: 'blog', title: 'Blog | Consejos y novedades | Lanyi Pisos', loadComponent: () => import('./features/blog/blog').then(m => m.Blog) },
  { path: 'proyectos', title: 'Proyectos realizados | Lanyi Pisos', loadComponent: () => import('./features/projects/projects').then(m => m.Projects) },
  { path: 'zocalos', redirectTo: 'accesorios', pathMatch: 'full' },
  { path: 'productos', redirectTo: 'accesorios', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
