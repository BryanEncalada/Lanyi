import { Component, input } from '@angular/core';

/** Displays just the photographic region of the supplied design reference.
 * Replace with original photography when the full-resolution assets are available. */
@Component({
  selector: 'app-reference-photo',
  template: `<span class="photo" [style.aspect-ratio]="rect()[2] + '/' + rect()[3]">
    <img
      [src]="'/images/references/' + source() + '.jpg'"
      [alt]="alt()"
      loading="lazy"
      [style.width.%]="(sourceWidth() / rect()[2]) * 100"
      [style.height.%]="(1600 / rect()[3]) * 100"
      [style.left.%]="(-rect()[0] / rect()[2]) * 100"
      [style.top.%]="(-rect()[1] / rect()[3]) * 100"
    />
  </span>`,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      height: 100%;
    }
    .photo {
      display: block;
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
    img {
      position: absolute;
      max-width: none;
      object-fit: fill;
    }
  `,
})
export class ReferencePhoto {
  readonly source = input<'home' | 'catalog'>('home');
  readonly rect = input.required<readonly number[]>();
  readonly alt = input('');
  sourceWidth() {
    return this.source() === 'home' ? 718 : 900;
  }
}
