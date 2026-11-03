import { Component, input } from '@angular/core';
import { ReferencePhoto } from '../reference-photo/reference-photo';
@Component({
  selector: 'app-content-photo',
  imports: [ReferencePhoto],
  template: `@if (src()) {
      <img [src]="src()" [alt]="alt()" loading="lazy" />
    } @else if (rect().length === 4) {
      <app-reference-photo [rect]="rect()" [alt]="alt()" />
    } @else {
      <span class="placeholder" role="img" [attr.aria-label]="alt()">Lanyi Pisos</span>
    }`,
  styles: `
    :host {
      display: block;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .placeholder {
      display: grid;
      place-items: center;
      background: #eee6db;
      color: #966a38;
      width: 100%;
      height: 100%;
      min-height: 100px;
    }
  `,
})
export class ContentPhoto {
  readonly src = input<string>();
  readonly rect = input<readonly number[]>([]);
  readonly alt = input('');
}
