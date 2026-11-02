import { Component, input } from '@angular/core';
import { Product } from '../../data/products';
import { ReferencePhoto } from '../reference-photo/reference-photo';
@Component({
  selector: 'app-product-photo',
  imports: [ReferencePhoto],
  template: `@if (imageUrl() || product().imageUrl) {
      <img [src]="imageUrl() || product().imageUrl" [alt]="product().name" loading="lazy" />
    } @else if (product().photo.length === 4) {
      <app-reference-photo
        [source]="product().photoSource ?? 'catalog'"
        [rect]="product().photo"
        [alt]="product().name"
      />
    } @else {
      <span class="placeholder" role="img" [attr.aria-label]="'Sin imagen: ' + product().name"
        >Imagen no disponible</span
      >
    }`,
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .placeholder {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      min-height: 100px;
      background: #f4f0e9;
      color: #8b7760;
      font-size: 12px;
    }
  `,
})
export class ProductPhoto {
  readonly product = input.required<Product>();
  readonly imageUrl = input<string>();
}
