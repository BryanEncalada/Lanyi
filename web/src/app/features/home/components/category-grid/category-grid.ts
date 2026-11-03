import { categoryQuery } from '../../../../shared/data/catalog-utils';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReferencePhoto } from '../../../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../../../shared/components/icon/icon';
@Component({
  selector: 'app-category-grid',
  imports: [RouterLink, ReferencePhoto, Icon],
  templateUrl: './category-grid.html',
  styleUrl: './category-grid.scss',
})
export class CategoryGrid {
  readonly query = categoryQuery;
  readonly categories = [
    { name: 'Pisos Laminados', slug: 'laminados', photo: [18, 320, 104, 58] },
    { name: 'Pisos de Madera', slug: 'madera', photo: [133, 320, 106, 58] },
    { name: 'Pisos de Bambú', slug: 'bambu', photo: [249, 320, 105, 58] },
    { name: 'Pisos Estructurados', slug: 'estructurados', photo: [365, 320, 106, 58] },
    { name: 'Accesorios · Zócalos', slug: 'zocalos', photo: [481, 320, 104, 58] },
    { name: 'Accesorios', slug: 'accesorios', photo: [596, 320, 105, 58] },
  ];
}
