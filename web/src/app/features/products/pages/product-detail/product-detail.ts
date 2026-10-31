import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { PRODUCTS, quotationUrl } from '../../../../shared/data/products';
import { FLOOR_CATALOG } from '../../../../shared/data/floors';
import { ReferencePhoto } from '../../../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../../../shared/components/icon/icon';
@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, DecimalPipe, ReferencePhoto, Icon],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  readonly product = computed(() => (this.data()['category'] === 'pisos' ? FLOOR_CATALOG : PRODUCTS).find(p => p.id === this.params().get('id')));
  readonly floors = FLOOR_CATALOG;
  readonly area = signal(25);
  readonly installation = signal(true);
  readonly chosenFloor = signal('');
  readonly estimate = computed(() => Math.ceil(this.area() * 110) / 100);
  readonly calculatorProduct = computed(() => FLOOR_CATALOG.find(p => p.id === this.chosenFloor()) ?? (this.product()?.category === 'pisos' ? this.product()! : FLOOR_CATALOG[0]));
  readonly quote = quotationUrl;
  readonly calculatedQuote = computed(() => 'https://wa.me/51971924719?text=' + encodeURIComponent(
    'Hola, quisiera cotizar ' + this.calculatorProduct().name + '. Superficie: ' + this.area() + ' m². Material estimado (incluye 10% adicional): ' + this.estimate().toFixed(2) + ' m². Instalación: ' + (this.installation() ? 'Sí' : 'No') + '.'));
  updateArea(value: string) {
    const number = Number(value);
    this.area.set(Number.isFinite(number) && number > 0 ? number : 0);
  }
}
