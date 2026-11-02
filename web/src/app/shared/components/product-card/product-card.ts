import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, quotationUrl } from '../../data/products';
import { ProductPhoto } from '../product-photo/product-photo';
import { Icon } from '../icon/icon';
@Component({
  selector: 'app-product-card',
  imports: [ProductPhoto, Icon, RouterLink],
  template: `<article class="product-card">
    <div class="product-image">
      <app-product-photo [product]="product()" />
    </div>
    <div class="product-content">
      <h3>{{ product().name }}</h3>
      <p>
        {{
          product().spec ||
            (product().height ? product().height + ' mm | ' : '') +
              'Acabado ' +
              product().finish.toLowerCase()
        }}
      </p>
      <p>{{ product().description }}</p>
      @if (product().price) {
        <strong class="product-price">S/ {{ product().price }} m²</strong>
      }
      <div class="swatches" aria-label="Colores disponibles">
        @for (color of product().colors; track color) {
          <span [style.background]="color" aria-hidden="true"></span>
        }
      </div>
      <a class="btn btn-detail" [routerLink]="['/', product().category, product().id]">
        Ver detalle del producto <app-icon name="arrow" />
      </a>
      <a class="btn btn-primary" [href]="quote()" target="_blank" rel="noopener noreferrer"
        ><app-icon name="document" /> Solicitar cotización</a
      >
    </div>
  </article> `,
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly source = input<'home' | 'catalog'>();
  quote() {
    return quotationUrl(this.product().name);
  }
}
