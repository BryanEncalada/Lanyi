import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { provideEnvironmentInitializer, inject } from '@angular/core';
import { SeoService } from './shared/services/seo.service';
import { AnalyticsService } from './shared/services/analytics.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideEnvironmentInitializer(() => {
      inject(SeoService);
      inject(AnalyticsService);
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
  ],
};
