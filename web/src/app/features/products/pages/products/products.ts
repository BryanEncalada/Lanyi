import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PRODUCTS } from '../../../../shared/data/products';
import { FLOOR_CATALOG } from '../../../../shared/data/floors';
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
  readonly categoryName = computed(() => (this.isFloors() ? 'Pisos' : 'Accesorios'));
  readonly catalogPath = computed(() => (this.isFloors() ? '/pisos' : '/accesorios'));
  readonly description = computed(() =>
    this.isFloors()
      ? 'Encuentra el piso ideal para transformar tus espacios. Descubre nuestros pisos laminados, de madera y bambú, con tonos y texturas que dan calidez a cada ambiente.'
      : 'Los detalles que completan tus espacios. Encuentra zócalos y rodones en nuestra categoría de Accesorios, con diseños y acabados para acompañar tus pisos.',
  );
  readonly catalogProducts = computed(() => (this.isFloors() ? FLOOR_CATALOG : PRODUCTS));
  readonly filters = signal<Record<string, string[]>>({});
  readonly sort = signal('popular');
  readonly mobileFilters = signal(false);
  readonly groups = computed(() => {
    const items = this.catalogProducts();
    const unique = (key: 'material' | 'finish') => [...new Set(items.map((p) => p[key]))];
    const heights = [...new Set(items.flatMap((p) => (p.height === undefined ? [] : [p.height])))]
      .sort((a, b) => a - b)
      .map(String);
    return [
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
  readonly colorOptions = [
    { name: 'Blanco', value: '#fafafa' },
    { name: 'Arena', value: '#d5b287' },
    { name: 'Roble', value: '#c6935a' },
    { name: 'Canela', value: '#af6f32' },
    { name: 'Nogal', value: '#70401e' },
    { name: 'Gris', value: '#a8a7a3' },
  ];
  readonly availableColors = computed(() =>
    this.colorOptions.filter((color) =>
      this.catalogProducts().some((p) => p.colorFamilies.includes(color.name)),
    ),
  );
  readonly preset = computed(() => {
    const type = this.params().get('tipo');
    return type && this.catalogProducts().some((p) => p.material === type) ? type : null;
  });
  readonly activeCount = computed(
    () => Object.values(this.filters()).reduce((n, v) => n + v.length, 0) + (this.preset() ? 1 : 0),
  );
  readonly results = computed(() => {
    const filters = this.filters();
    let items = this.catalogProducts().filter((p) => {
      if (this.preset() && p.material !== this.preset()) return false;
      return Object.entries(filters).every(([key, values]) => {
        if (!values.length) return true;
        if (key === 'usage') return values.some((v) => p.usage.includes(v));
        if (key === 'height') return values.includes(String(p.height));
        if (key === 'color') return values.some((v) => p.colorFamilies.includes(v));
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
  clear() {
    this.filters.set({});
  }
}
