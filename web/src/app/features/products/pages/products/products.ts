import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  normalizeText,
  colorOptions,
  matchesProductSearch,
  categoryDescendants,
} from '../../../../shared/data/catalog-utils';
import { CatalogService } from '../../../../shared/services/catalog.service';

import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { ReferencePhoto } from '../../../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../../../shared/components/icon/icon';
@Component({
  selector: 'app-products',
  imports: [RouterLink, ProductCard, ReferencePhoto, Icon],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly isFloors = computed(() => this.data()['category'] === 'pisos');
  readonly categoryName = computed(
    () => this.data()['landingTitle'] ?? (this.isFloors() ? 'Pisos' : 'Accesorios'),
  );
  readonly catalogPath = computed(() => (this.isFloors() ? '/pisos' : '/accesorios'));
  readonly description = computed(() =>
    this.isFloors()
      ? 'Encuentra el piso ideal para transformar tus espacios. Descubre nuestros pisos laminados, de madera y bambú, con tonos y texturas que dan calidez a cada ambiente.'
      : 'Los detalles que completan tus espacios. Encuentra zócalos y rodones en nuestra categoría de Accesorios, con diseños y acabados para acompañar tus pisos.',
  );
  readonly catalog = inject(CatalogService);
  readonly catalogProducts = computed(() =>
    this.isFloors() ? this.catalog.floors() : this.catalog.accessories(),
  );
  readonly filters = signal<Record<string, string[]>>({});
  readonly sort = signal('popular');
  readonly search = signal('');
  readonly hasError = computed(
    () => this.catalog.source()[this.isFloors() ? 'pisos' : 'accesorios'] === 'fallback',
  );
  readonly mobileFilters = signal(false);
  readonly groups = computed(() => {
    const items = this.catalogProducts();
    const unique = (key: 'material' | 'finish') => [...new Set(items.map((p) => p[key]))];
    const heights = [...new Set(items.flatMap((p) => (p.height === undefined ? [] : [p.height])))]
      .sort((a, b) => a - b)
      .map(String);
    return [
      ...(this.catalog.categories().length
        ? [
            {
              key: 'subcategory',
              title: 'Categoría',
              options: this.catalog
                .categories()
                .filter((c) => c.kind === (this.isFloors() ? 'pisos' : 'accesorios'))
                .map((c) => c.name),
            },
          ]
        : []),
      {
        key: 'material',
        title: this.isFloors() ? 'Tipo de piso' : 'Tipo de accesorio',
        options: unique('material'),
      },
      { key: 'finish', title: 'Acabado', options: unique('finish') },
      { key: 'height', title: this.isFloors() ? 'Espesor' : 'Altura', options: heights },
      {
        key: 'usage',
        title: 'Uso recomendado',
        options: [...new Set(items.flatMap((p) => p.usage))],
      },
    ];
  });
  readonly availableColors = computed(() => colorOptions(this.catalogProducts()));
  readonly preset = computed(() => {
    const type = this.data()['material'] ?? this.params().get('tipo');
    return type || null;
  });
  readonly categorySlug = computed(() => this.params().get('categoria'));
  readonly categoryIds = computed(() =>
    categoryDescendants(
      this.categorySlug() ?? '',
      this.isFloors() ? 'pisos' : 'accesorios',
      this.catalog.categories(),
    ),
  );
  readonly categoryLabel = computed(
    () =>
      this.catalog
        .categories()
        .find(
          (c) =>
            c.slug === this.categorySlug() && c.kind === (this.isFloors() ? 'pisos' : 'accesorios'),
        )?.name ?? this.categorySlug(),
  );
  readonly activeCount = computed(
    () =>
      Object.values(this.filters()).reduce((n, v) => n + v.length, 0) +
      (this.preset() ? 1 : 0) +
      (this.categorySlug() ? 1 : 0),
  );
  readonly results = computed(() => {
    const filters = this.filters();
    let items = this.catalogProducts().filter((p) => {
      if (
        this.categorySlug() &&
        (p.categoryId === undefined || !this.categoryIds().has(p.categoryId))
      )
        return false;
      if (this.search() && !matchesProductSearch(p, this.search())) return false;
      if (this.preset() && normalizeText(p.material) !== normalizeText(this.preset()!))
        return false;
      return Object.entries(filters).every(([key, values]) => {
        if (!values.length) return true;
        if (key === 'subcategory') return values.includes(p.subcategory ?? '');
        if (key === 'usage') return values.some((v) => p.usage.includes(v));
        if (key === 'height') return values.includes(String(p.height));
        if (key === 'color')
          return values.some((v) =>
            p.colorFamilies.some((family) => normalizeText(family) === normalizeText(v)),
          );
        return values.includes(key === 'material' ? p.material : p.finish);
      });
    });
    if (this.sort() === 'name')
      items = [...items].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (this.sort() === 'height-asc')
      items = [...items].sort((a, b) => (a.height ?? Infinity) - (b.height ?? Infinity));
    if (this.sort() === 'height-desc')
      items = [...items].sort((a, b) => (b.height ?? -Infinity) - (a.height ?? -Infinity));
    return items;
  });
  constructor() {
    effect(() => {
      this.data();
      this.params();
      this.filters.set({});
      this.search.set(this.params().get('buscar') ?? '');
      this.sort.set('popular');
      this.mobileFilters.set(false);
    });
  }
  selected(key: string, value: string) {
    return (this.filters()[key] || []).includes(value);
  }
  toggle(key: string, value: string) {
    this.filters.update((f) => {
      const values = f[key] || [];
      return {
        ...f,
        [key]: values.includes(value) ? values.filter((v) => v !== value) : [...values, value],
      };
    });
  }
  retry() {
    window.location.reload();
  }
  clear() {
    this.search.set('');
    this.filters.set({});
  }
}
