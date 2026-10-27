import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-category-grid',
  imports: [RouterLink],
  templateUrl: './category-grid.html',
  styleUrl: './category-grid.scss',
})
export class CategoryGrid {
  readonly categories = [
    { name: 'Laminados', slug: 'laminados', position: '15% 90%' },
    { name: 'Laminados resistentes al agua', slug: 'laminados-resistentes-al-agua', position: '35% 90%' },
    { name: 'SPC', slug: 'spc', position: '55% 90%' },
    { name: 'Bambú', slug: 'bambu', position: '75% 90%' },
    { name: 'Madera', slug: 'madera', position: '95% 90%' },
    { name: 'Accesorios', slug: 'accesorios', position: '50% 65%' },
  ];
}
