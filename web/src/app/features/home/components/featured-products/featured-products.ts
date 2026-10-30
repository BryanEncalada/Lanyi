import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FLOORS } from '../../../../shared/data/floors';
import { quotationUrl } from '../../../../shared/data/products';
import { ReferencePhoto } from '../../../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../../../shared/components/icon/icon';
@Component({
  selector: 'app-featured-products',
  imports: [RouterLink, ReferencePhoto, Icon],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.scss',
})
export class FeaturedProducts {
  readonly products = FLOORS;
  readonly selected = signal<(typeof FLOORS)[number] | null>(null);
  readonly quotationUrl = quotationUrl;
  open(product: (typeof FLOORS)[number], dialog: HTMLDialogElement) {
    this.selected.set(product);
    dialog.showModal();
  }
}
