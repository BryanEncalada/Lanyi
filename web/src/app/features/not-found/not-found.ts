import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `<section class="section container missing">
    <p class="section-label">Error 404</p>
    <h1>Esta página no está disponible</h1>
    <p>Puede que el enlace haya cambiado. Encuentra tu próximo acabado en nuestro catálogo.</p>
    <div>
      <a class="btn btn-primary" routerLink="/pisos">Explorar pisos</a
      ><a routerLink="/">Volver al inicio</a>
    </div>
  </section>`,
  styles: `
    .missing {
      min-height: 55vh;
      display: grid;
      align-content: center;
      gap: 22px;
    }
    .missing h1 {
      font-size: clamp(28px, 4vw, 48px);
    }
    .missing div {
      display: flex;
      gap: 24px;
      align-items: center;
      flex-wrap: wrap;
    }
  `,
})
export class NotFound {
  constructor() {
    inject(SeoService).set({
      title: 'Página no encontrada | Lanyi Pisos',
      description: 'El enlace solicitado no está disponible.',
      noindex: true,
    });
  }
}
