import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import { SiteConfigService } from './site-config.service';
import { canIndex, pageKey, pageSchema } from '../data/site-config';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
export interface PageMetadata {
  title: string;
  description: string;
  image?: string;
  path?: string;
  type?: string;
  noindex?: boolean;
}
@Injectable({ providedIn: 'root' })
export class SeoService {
  readonly navigation = signal(0);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly site = inject(SiteConfigService);
  private lastPage?: PageMetadata;
  constructor() {
    effect(() => {
      this.site.config();
      if (this.lastPage) this.set(this.lastPage);
    });
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      let leaf = this.router.routerState.snapshot.root;
      while (leaf.firstChild) leaf = leaf.firstChild;
      this.set({
        title: leaf.title ?? 'Lanyi Pisos',
        description:
          'Pisos de madera, bambú, laminados y accesorios. Asesoría personalizada en Lima, Perú.',
        noindex: leaf.data['notFound'] === true,
      });
      this.navigation.update((n) => n + 1);
    });
  }
  set(page: PageMetadata) {
    this.lastPage = page;
    const config = this.site.config();
    const preset = config.pages[pageKey(this.router.url)];
    page = { ...page, ...preset };
    this.title.setTitle(page.title);
    const origin = this.document.location.origin;
    const canonical = new URL(
      preset?.canonicalPath ?? page.path ?? this.router.url.split('?')[0],
      canIndex(config, this.document.location.hostname) ? config.productionOrigin : origin,
    ).href;
    const image = new URL(page.image ?? config.defaultImage, origin).href;
    for (const [name, content] of Object.entries({
      description: page.description,
      robots:
        page.noindex || !canIndex(config, this.document.location.hostname)
          ? 'noindex,follow'
          : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      'twitter:card': 'summary_large_image',
      'twitter:title': page.title,
      'twitter:description': page.description,
      'twitter:image': image,
    }))
      this.meta.updateTag({ name, content });
    for (const [property, content] of Object.entries({
      'og:title': page.title,
      'og:description': page.description,
      'og:url': canonical,
      'og:image': image,
      'og:type': page.type ?? 'website',
      'og:locale': 'es_PE',
      'og:site_name': config.siteName,
    }))
      this.meta.updateTag({ property, content });
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.append(link);
    }
    link.href = canonical;
    let structured = this.document.getElementById('lanyi-structured-data');
    if (!structured) {
      structured = this.document.createElement('script');
      structured.id = 'lanyi-structured-data';
      structured.setAttribute('type', 'application/ld+json');
      this.document.head.append(structured);
    }
    structured.textContent = JSON.stringify(
      pageSchema(config, canonical, page.title, page.description, image, page.type),
    );
  }
}
