import { Injectable, effect, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, timeout } from 'rxjs';
import { CatalogService } from './catalog.service';
import { BLOG_LIST, BLOG_RECOMMENDATIONS, BLOG_ARTICLES } from '../data/blog';
import { PROJECTS } from '../data/projects';
export interface EditorialEntry {
  slug: string;
  title: string;
  name: string;
  description: string;
  body: string;
  category: string;
  material: string;
  location: string;
  tags: string[];
  photo: readonly number[];
  imageUrl?: string;
  gallery: string[];
  date: string;
  displayDate: string;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}
export interface CustomerTestimonial {
  id: number;
  name: string;
  location: string;
  quote: string;
  imageUrl?: string;
}
export type ContentStatus = 'loading' | 'ready' | 'error' | 'preview';
function entry(value: unknown): EditorialEntry {
  const p = value as Record<string, unknown>;
  if (!p || typeof p['slug'] !== 'string' || typeof p['title'] !== 'string')
    throw Error('Contenido inválido');
  const strings = (key: string) =>
    Array.isArray(p[key])
      ? (p[key] as unknown[]).filter((v): v is string => typeof v === 'string')
      : [];
  const image = (value: unknown) => {
    if (typeof value !== 'string') return undefined;
    try {
      const url = new URL(value, window.location.origin);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
    } catch {
      return undefined;
    }
  };
  const date = String(p['date'] ?? '').slice(0, 10);
  const validDate = date && !Number.isNaN(Date.parse(date));
  return {
    slug: p['slug'],
    title: p['title'],
    name: p['title'],
    description: String(p['description'] ?? ''),
    body: String(p['body'] ?? ''),
    category: String(p['category'] ?? ''),
    material: String(p['material'] ?? ''),
    location: String(p['location'] ?? ''),
    tags: strings('tags'),
    photo: Array.isArray(p['photo']) ? (p['photo'] as number[]) : [],
    imageUrl: image(p['imageUrl']),
    gallery: strings('gallery')
      .map(image)
      .filter((v): v is string => !!v),
    date,
    displayDate: validDate
      ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: 'UTC' }).format(
          new Date(date + 'T12:00:00Z'),
        )
      : '',
    featured: p['featured'] === true,
    seoTitle: typeof p['seoTitle'] === 'string' ? p['seoTitle'] : undefined,
    seoDescription: typeof p['seoDescription'] === 'string' ? p['seoDescription'] : undefined,
  };
}
const previewBlog = [...BLOG_LIST, ...BLOG_RECOMMENDATIONS].map((p) =>
  entry({ ...p, body: (BLOG_ARTICLES[p.slug] ?? [p.description]).join('\n\n') }),
);
const previewProjects = PROJECTS.map((p) =>
  entry({
    ...p,
    title: p.name,
    description: 'Ambiente referencial de la propuesta visual.',
    body: 'Imagen de inspiración. Consulta con nuestro equipo las opciones para tu espacio.',
    category: p.material,
  }),
);
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  readonly catalog = inject(CatalogService);
  readonly articles = signal<EditorialEntry[]>([]);
  readonly projects = signal<EditorialEntry[]>([]);
  readonly testimonials = signal<CustomerTestimonial[]>([]);
  readonly status = signal<Record<string, ContentStatus>>({
    blog: 'loading',
    proyectos: 'loading',
    testimonios: 'loading',
  });
  constructor() {
    effect(() => {
      const base = this.catalog.apiBaseUrl();
      if (base === null) return;
      if (!base) {
        this.articles.set(previewBlog);
        this.projects.set(previewProjects);
        this.status.set({ blog: 'preview', proyectos: 'preview', testimonios: 'ready' });
        return;
      }
      this.load(base, 'blog', this.articles);
      this.load(base, 'proyectos', this.projects);
      this.http
        .get<{ data: CustomerTestimonial[] }>(base + '/testimonios')
        .pipe(
          timeout(8000),
          catchError(() => of(null)),
        )
        .subscribe((response) => {
          this.testimonials.set(response && Array.isArray(response.data) ? response.data : []);
          this.status.update((s) => ({ ...s, testimonios: response ? 'ready' : 'error' }));
        });
    });
  }
  private load(base: string, kind: 'blog' | 'proyectos', target: WritableSignal<EditorialEntry[]>) {
    this.status.update((s) => ({ ...s, [kind]: 'loading' }));
    this.http
      .get<{ data: unknown[] }>(base + '/contenido/' + kind)
      .pipe(
        timeout(8000),
        catchError(() => of(null)),
      )
      .subscribe((response) => {
        try {
          if (!response || !Array.isArray(response.data)) throw Error();
          target.set(response.data.map(entry));
          this.status.update((s) => ({ ...s, [kind]: 'ready' }));
        } catch {
          target.set([]);
          this.status.update((s) => ({ ...s, [kind]: 'error' }));
        }
      });
  }
}
