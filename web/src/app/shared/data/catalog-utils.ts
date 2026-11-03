import { Product } from './products';
export const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
export const COLOR_PALETTE: Record<string, string> = {
  blanco: '#fafafa',
  beige: '#dcc5a6',
  arena: '#d5b287',
  natural: '#c6a579',
  roble: '#c6935a',
  canela: '#af6f32',
  nogal: '#70401e',
  marron: '#80512f',
  gris: '#a8a7a3',
  negro: '#333333',
};
export function colorOptions(products: Product[]) {
  const labels = new Map<string, { name: string; value: string }>();
  for (const p of products)
    for (const [i, name] of p.colorFamilies.entries()) {
      const key = normalizeText(name);
      if (key && !labels.has(key))
        labels.set(key, {
          name,
          value: COLOR_PALETTE[key] ?? p.colors[i] ?? p.colors[0] ?? '#c6a579',
        });
    }
  return [...labels.values()];
}

export function matchesProductSearch(product: Product, query: string): boolean {
  return normalizeText(product.name + ' ' + (product.sku ?? '')).includes(normalizeText(query));
}
export function categoryQuery(slug: string): Record<string, string> {
  if (slug === 'zocalos') return { buscar: 'zócalo' };
  if (slug === 'accesorios') return {};
  return {
    tipo:
      (
        {
          laminados: 'Laminado',
          madera: 'Madera',
          bambu: 'Bambú',
          estructurados: 'Estructurado',
        } as Record<string, string>
      )[slug] ?? '',
  };
}

export interface MenuCategory {
  label: string;
  query: Record<string, string>;
}
interface NavigationCategory {
  id: number;
  name: string;
  slug: string;
  kind: 'pisos' | 'accesorios';
  parentId: number | null;
}
export function menuCategories(
  kind: 'pisos' | 'accesorios',
  categories: NavigationCategory[],
  products: Product[],
  authoritative = false,
): MenuCategory[] {
  const matching = categories.filter((c) => c.kind === kind);
  if (matching.length)
    return matching.map((c) => ({
      label: c.parentId
        ? (matching.find((parent) => parent.id === c.parentId)?.name ?? '') + ' · ' + c.name
        : c.name,
      query: { categoria: c.slug },
    }));
  if (authoritative) return [];
  return [...new Set(products.map((p) => p.material).filter(Boolean))].map((material) => ({
    label: material,
    query: { tipo: material },
  }));
}
export function categoryDescendants(
  slug: string,
  kind: 'pisos' | 'accesorios',
  categories: NavigationCategory[],
): Set<number> {
  const selected = categories.find((c) => c.kind === kind && c.slug === slug);
  const ids = new Set<number>();
  if (!selected) return ids;
  ids.add(selected.id);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of categories) {
      if (c.kind === kind && c.parentId !== null && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id);
        changed = true;
      }
    }
  }
  return ids;
}
