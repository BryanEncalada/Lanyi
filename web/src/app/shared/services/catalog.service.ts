import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, timeout } from 'rxjs';
import { FLOOR_CATALOG } from '../data/floors';
import { PRODUCTS, Product } from '../data/products';

export interface CatalogCategory {
  id: number;
  name: string;
  slug: string;
  kind: 'pisos' | 'accesorios';
  parentId: number | null;
}
export type CatalogType = 'pisos' | 'accesorios';
interface CatalogConfig {
  apiBaseUrl: string;
  fallbackOnError: boolean;
}
interface ApiEnvelope {
  data: unknown[];
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly floorState = signal<Product[]>(FLOOR_CATALOG);
  private readonly accessoryState = signal<Product[]>(PRODUCTS);
  private pending = 0;
  readonly floors = this.floorState.asReadonly();
  readonly accessories = this.accessoryState.asReadonly();
  readonly loading = signal(true);
  readonly categories = signal<CatalogCategory[]>([]);
  readonly source = signal<Record<CatalogType, 'static' | 'api' | 'fallback'>>({
    pisos: 'static',
    accesorios: 'static',
  });

  constructor() {
    this.http
      .get<CatalogConfig>('/catalog-config.json')
      .pipe(
        timeout(3000),
        catchError(() => of({ apiBaseUrl: '', fallbackOnError: true })),
      )
      .subscribe((config) => {
        const base = (config.apiBaseUrl || '').trim().replace(/\/$/, '');
        if (!base) {
          this.loading.set(false);
          return;
        }
        try {
          const url = new URL(base, window.location.origin);
          if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid API protocol');
        } catch {
          this.loading.set(false);
          return;
        }
        this.pending = 3;
        this.http
          .get<{ data: CatalogCategory[] }>(base + '/categorias')
          .pipe(
            timeout(8000),
            catchError(() => of({ data: [] })),
          )
          .subscribe((response) => {
            this.categories.set(
              Array.isArray(response.data)
                ? response.data.filter(
                    (c) =>
                      typeof c.id === 'number' &&
                      typeof c.name === 'string' &&
                      ['pisos', 'accesorios'].includes(c.kind),
                  )
                : [],
            );
            if (--this.pending === 0) this.loading.set(false);
          });
        this.load(base, 'pisos', config.fallbackOnError !== false);
        this.load(base, 'accesorios', config.fallbackOnError !== false);
      });
  }

  private load(base: string, category: CatalogType, fallback: boolean) {
    this.http
      .get<ApiEnvelope>(base + '/' + category)
      .pipe(
        timeout(8000),
        map((response) => {
          if (!response || !Array.isArray(response.data))
            throw new Error('Invalid catalogue response');
          return response.data.map((value) => this.product(value, category));
        }),
        catchError(() => of(null)),
      )
      .subscribe((products) => {
        const target = category === 'pisos' ? this.floorState : this.accessoryState;
        // An empty successful response is authoritative: never resurrect unpublished products.
        if (products !== null) {
          target.set(products);
          this.source.update((s) => ({ ...s, [category]: 'api' }));
        } else {
          if (!fallback) target.set([]);
          this.source.update((s) => ({ ...s, [category]: 'fallback' }));
        }
        if (--this.pending === 0) this.loading.set(false);
      });
  }

  private product(value: unknown, category: CatalogType): Product {
    const p = value as Record<string, unknown>;
    if (
      !p ||
      typeof p['id'] !== 'string' ||
      !p['id'] ||
      typeof p['name'] !== 'string' ||
      p['category'] !== category
    ) {
      throw new Error('Invalid product or category mismatch');
    }
    const strings = (key: string) =>
      Array.isArray(p[key])
        ? (p[key] as unknown[]).filter((v): v is string => typeof v === 'string')
        : [];
    const image = (url: unknown): string | undefined => {
      if (typeof url !== 'string' || !url) return undefined;
      try {
        const parsed = new URL(url, window.location.origin);
        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : undefined;
      } catch {
        return undefined;
      }
    };
    return {
      categoryId: typeof p['categoryId'] === 'number' ? p['categoryId'] : undefined,
      subcategory: typeof p['subcategory'] === 'string' ? p['subcategory'] : undefined,
      id: p['id'] as string,
      name: p['name'] as string,
      category,
      sku: typeof p['sku'] === 'string' ? p['sku'] : undefined,
      description: String(p['description'] ?? ''),
      material: String(p['material'] ?? ''),
      finish: String(p['finish'] ?? ''),
      spec: typeof p['spec'] === 'string' ? p['spec'] : undefined,
      height: typeof p['height'] === 'number' ? p['height'] : undefined,
      price: p['price'] == null ? undefined : String(p['price']),
      usage: strings('usage'),
      colors: strings('colors'),
      colorFamilies: strings('colorFamilies'),
      photo: Array.isArray(p['photo']) && p['photo'].length === 4 ? (p['photo'] as number[]) : [],
      photoSource: p['photoSource'] === 'home' ? 'home' : 'catalog',
      imageUrl: image(p['imageUrl']),
      gallery: strings('gallery')
        .map(image)
        .filter((url): url is string => !!url),
      featured: p['featured'] === true,
      technical:
        typeof p['technical'] === 'object' && p['technical'] !== null
          ? (p['technical'] as Record<string, string>)
          : {},
    };
  }
}
