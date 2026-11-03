import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { estimateMaterial, roomPerimeter } from '../../../../shared/data/material-estimate';
import { Product, quotationUrl } from '../../../../shared/data/products';
import { SeoService } from '../../../../shared/services/seo.service';
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
  private readonly seo = inject(SeoService);
  readonly product = computed(() =>
    (this.data()['category'] === 'pisos' ? this.catalog.floors() : this.catalog.accessories()).find(
      (p) => p.id === this.params().get('id'),
    ),
  );
  readonly floors = this.catalog.floors;
  readonly hasError = computed(
    () =>
      this.catalog.source()[this.data()['category'] === 'pisos' ? 'pisos' : 'accesorios'] ===
      'fallback',
  );
  readonly images = computed(() => {
    const p = this.product();
    return [
      ...new Set([p?.imageUrl, ...(p?.gallery ?? [])].filter((image): image is string => !!image)),
    ];
  });
  readonly activeImage = signal<string | undefined>(undefined);
  constructor() {
    effect(() => {
      this.params().get('id');
      this.data()['category'];
      this.chosenProduct.set('');
    });
    effect(() => {
      const product = this.product();
      this.seo.navigation();
      this.seo.set(
        product
          ? {
              title: (product.seoTitle || product.name) + ' | Lanyi Pisos',
              description: product.seoDescription || product.description,
              image: product.imageUrl,
              path: '/' + product.category + '/' + product.id,
              type: 'product',
            }
          : {
              title: 'Producto no encontrado | Lanyi Pisos',
              description: 'Consulta nuestro catálogo.',
              noindex: !this.catalog.loading(),
            },
      );
      this.activeImage.set(undefined);
    });
  }
  readonly isAccessory = computed(() => this.data()['category'] === 'accesorios');
  readonly area = signal(25);
  readonly roomLength = signal(5);
  readonly roomWidth = signal(5);
  readonly perimeter = signal(20);
  readonly measurementMode = signal('dimensions');
  readonly installation = signal(true);
  readonly chosenProduct = signal('');
  readonly calculatorProducts = computed(() =>
    this.isAccessory() ? this.catalog.accessories() : this.catalog.floors(),
  );
  readonly calculatorProduct = computed<Product | undefined>(
    () => this.calculatorProducts().find((p) => p.id === this.chosenProduct()) ?? this.product(),
  );
  readonly unitLabel = computed(() => (this.isAccessory() ? 'm lineales' : 'm²'));
  readonly priceUnitLabel = computed(() => (this.isAccessory() ? 'metro lineal' : 'm²'));
  readonly baseQuantity = computed(() =>
    this.isAccessory()
      ? this.measurementMode() === 'dimensions'
        ? roomPerimeter(this.roomLength(), this.roomWidth())
        : this.perimeter()
      : this.area(),
  );
  readonly materialEstimate = computed(() =>
    estimateMaterial(this.baseQuantity(), this.calculatorProduct()?.price),
  );
  readonly quote = quotationUrl;
  readonly calculatedQuote = computed(() => {
    const estimate = this.materialEstimate();
    const total =
      estimate.total === null
        ? 'Precio por confirmar.'
        : 'Precio estimado de material: S/ ' + estimate.total.toFixed(2) + '.';
    const measures = this.isAccessory()
      ? 'Perímetro a cubrir: ' + this.baseQuantity().toFixed(2) + ' m lineales.'
      : 'Superficie a cubrir: ' + this.area() + ' m².';
    return (
      'https://wa.me/51971924719?text=' +
      encodeURIComponent(
        'Hola, quisiera cotizar ' +
          (this.calculatorProduct()?.name ?? 'este producto') +
          '. ' +
          measures +
          ' Material estimado (incluye 10% adicional): ' +
          estimate.quantity.toFixed(2) +
          ' ' +
          this.unitLabel() +
          '. ' +
          total +
          ' No incluye instalación ni transporte. Necesito instalación: ' +
          (this.installation() ? 'Sí' : 'No') +
          '. Importe referencial sujeto a cotización final.',
      )
    );
  });
  updateMeasure(target: WritableSignal<number>, value: string) {
    const number = Number(value);
    target.set(Number.isFinite(number) && number >= 0.01 && number <= 1_000_000 ? number : 0);
  }
}
