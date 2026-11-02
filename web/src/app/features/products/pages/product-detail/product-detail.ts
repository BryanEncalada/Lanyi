import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { Product, quotationUrl } from '../../../../shared/data/products';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { ProductPhoto } from '../../../../shared/components/product-photo/product-photo';
import { Icon } from '../../../../shared/components/icon/icon';
@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, DecimalPipe, KeyValuePipe, ProductPhoto, Icon],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  readonly catalog = inject(CatalogService);
  readonly product = computed(() =>
    (this.data()['category'] === 'pisos' ? this.catalog.floors() : this.catalog.accessories()).find(
      (p) => p.id === this.params().get('id'),
    ),
  );
  readonly floors = this.catalog.floors;
  readonly images = computed(() => {
    const p = this.product();
    return [
      ...new Set([p?.imageUrl, ...(p?.gallery ?? [])].filter((image): image is string => !!image)),
    ];
  });
  readonly activeImage = signal<string | undefined>(undefined);
  constructor() {
    effect(() => {
      this.product();
      this.activeImage.set(undefined);
    });
  }
  readonly area = signal(25);
  readonly installation = signal(true);
  readonly chosenFloor = signal('');
  readonly estimate = computed(() => Math.ceil(this.area() * 110) / 100);
  readonly calculatorProduct = computed<Product | undefined>(
    () =>
      this.floors().find((p) => p.id === this.chosenFloor()) ??
      (this.product()?.category === 'pisos' ? this.product()! : this.floors()[0]),
  );
  readonly quote = quotationUrl;
  readonly calculatedQuote = computed(
    () =>
      'https://wa.me/51971924719?text=' +
      encodeURIComponent(
        'Hola, quisiera cotizar ' +
          (this.calculatorProduct()?.name ?? 'piso') +
          '. Superficie: ' +
          this.area() +
          ' m². Material estimado (incluye 10% adicional): ' +
          this.estimate().toFixed(2) +
          ' m². Instalación: ' +
          (this.installation() ? 'Sí' : 'No') +
          '.',
      ),
  );
  updateArea(value: string) {
    const number = Number(value);
    this.area.set(Number.isFinite(number) && number > 0 ? number : 0);
  }
}
