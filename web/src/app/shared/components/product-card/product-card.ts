import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, quotationUrl } from '../../data/products';
import { ReferencePhoto } from '../reference-photo/reference-photo';
import { Icon } from '../icon/icon';
@Component({
  selector: 'app-product-card',
  imports: [ReferencePhoto, Icon, RouterLink],
  template: `<article class="product-card">
    <div class="product-image">
      <app-reference-photo
        [source]="source() ?? product().photoSource ?? 'catalog'"
        [rect]="product().photo"
        [alt]="product().name"
      />
    </div>
    <div class="product-content">
      <h3>{{ product().name }}</h3>
      <p>
        {{ product().spec || product().height + ' mm | Acabado ' + product().finish.toLowerCase() }}
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
  </article>`,
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly source = input<'home' | 'catalog'>();
  quote() {
    return quotationUrl(this.product().name);
  }
}
