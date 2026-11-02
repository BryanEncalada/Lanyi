import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { Product } from '../../../../shared/data/products';
import { quotationUrl } from '../../../../shared/data/products';
import { ProductPhoto } from '../../../../shared/components/product-photo/product-photo';
import { Icon } from '../../../../shared/components/icon/icon';
@Component({
  selector: 'app-featured-products',
  imports: [RouterLink, ProductPhoto, Icon],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.scss',
})
export class FeaturedProducts {
  private readonly catalog = inject(CatalogService);
  readonly products = computed(() => {
    const floors = this.catalog.floors();
    const featured = floors.filter((p) => p.featured);
    return (featured.length ? featured : floors).slice(0, 4);
  });
  readonly selected = signal<Product | null>(null);
  readonly quotationUrl = quotationUrl;
  open(product: Product, dialog: HTMLDialogElement) {
    this.selected.set(product);
    dialog.showModal();
  }
}
