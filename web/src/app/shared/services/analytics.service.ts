import { DOCUMENT } from '@angular/common';
import { Injectable, inject, effect, DestroyRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SiteConfigService } from './site-config.service';
import { canTrack, publicPageUrl } from '../data/site-config';
type TrackingWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly site = inject(SiteConfigService);
  private readonly destroy = inject(DestroyRef);
  private started = false;
  private previous = '';
  private pending = '';
  constructor() {
    effect(() => {
      const config = this.site.config();
      if (!this.site.ready() || this.started || !canTrack(config, this.document.location.hostname))
        return;
      this.started = true;
      const win = this.document.defaultView as TrackingWindow;
      win.dataLayer = win.dataLayer ?? [];
      win.gtag =
        win.gtag ??
        function (...args: unknown[]) {
          win.dataLayer!.push(arguments);
        };
      this.previous = '';
      win.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      if (!this.document.getElementById('lanyi-google-tag-manager')) {
        const script = this.document.createElement('script');
        script.id = 'lanyi-google-tag-manager';
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtm.js?id=' + config.analytics.gtmId;
        this.document.head.append(script);
      }
      this.navigation(this.pending || this.router.url);
    });
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        this.pending = e.urlAfterRedirects;
        queueMicrotask(() => this.navigation(e.urlAfterRedirects));
      });
    const listener = (e: Event) => {
      const element = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!element || !this.started) return;
      const href = element.getAttribute('href') ?? '';
      if (/^https:\/\/(?:wa\.me|api\.whatsapp\.com)\//i.test(href))
        this.event('ClicButtonWs', { contact_channel: 'whatsapp' });
      else if (href.startsWith('tel:')) this.event('contact_click', { contact_channel: 'phone' });
      else if (href.startsWith('mailto:'))
        this.event('contact_click', { contact_channel: 'email' });
    };
    this.document.addEventListener('click', listener);
    this.destroy.onDestroy(() => this.document.removeEventListener('click', listener));
  }
  private navigation(path: string) {
    if (!this.started) return;
    const location = publicPageUrl(this.document.location.origin, path);
    const win = this.document.defaultView as TrackingWindow;
    if (
      this.previous === location &&
      win.dataLayer?.some(
        (entry: any) => entry?.event === 'lanyi_page_view' && entry.page_location === location,
      )
    )
      return;
    win.dataLayer?.push({
      event: 'lanyi_page_view',
      page_location: location,
      page_path: new URL(location).pathname,
      page_title: this.document.title,
      page_referrer: this.previous,
    });
    this.previous = location;
  }
  event(
    name: 'ClicButtonWs' | 'contact_click' | 'generate_lead',
    parameters: Record<string, string> = {},
  ) {
    if (!this.started) return;
    const config = this.site.config();
    if (!canTrack(config, this.document.location.hostname)) return;
    const win = this.document.defaultView as TrackingWindow;
    win.gtag?.('event', name, {
      send_to: config.analytics.measurementId,
      page_location: publicPageUrl(this.document.location.origin, this.router.url),
      ...parameters,
    });
  }
}
