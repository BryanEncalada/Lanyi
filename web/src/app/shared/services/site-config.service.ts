import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, timeout } from 'rxjs';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../data/site-config';
@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  readonly config = signal<SiteConfig>(DEFAULT_SITE_CONFIG);
  readonly ready = signal(false);
  constructor() {
    inject(HttpClient)
      .get<Partial<SiteConfig>>('/site-config.json')
      .pipe(
        timeout(4000),
        catchError(() => of<Partial<SiteConfig>>({})),
      )
      .subscribe((value) => {
        if (value && typeof value === 'object')
          this.config.set({
            ...DEFAULT_SITE_CONFIG,
            ...value,
            analytics: { ...DEFAULT_SITE_CONFIG.analytics, ...value.analytics },
            organization: { ...DEFAULT_SITE_CONFIG.organization, ...value.organization },
            pages: value.pages ?? {},
          });
        this.ready.set(true);
      });
  }
}
