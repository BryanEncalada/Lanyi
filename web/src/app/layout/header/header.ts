import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CatalogService, CatalogType } from '../../shared/services/catalog.service';
import { menuCategories } from '../../shared/data/catalog-utils';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: { '(document:click)': 'outsideClick($event)', '(document:keydown.escape)': 'escape()' },
})
export class Header {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly catalog = inject(CatalogService);
  readonly menuOpen = signal(false);
  readonly expanded = signal<CatalogType | null>(null);
  readonly sections = [
    { kind: 'pisos' as const, label: 'Pisos' },
    { kind: 'accesorios' as const, label: 'Accesorios' },
  ];
  readonly links = computed(() => ({
    pisos: menuCategories(
      'pisos',
      this.catalog.categories(),
      this.catalog.floors(),
      this.catalog.source().pisos === 'api',
    ),
    accesorios: menuCategories(
      'accesorios',
      this.catalog.categories(),
      this.catalog.accessories(),
      this.catalog.source().accesorios === 'api',
    ),
  }));
  toggleMenu() {
    this.menuOpen.update((v) => !v);
    this.expanded.set(null);
  }
  toggleSubmenu(kind: CatalogType) {
    this.expanded.update((v) => (v === kind ? null : kind));
  }
  closeMenu() {
    this.menuOpen.set(false);
    this.expanded.set(null);
  }
  outsideClick(event: Event) {
    if (event.target instanceof Node && !this.element.nativeElement.contains(event.target))
      this.closeMenu();
  }
  escape() {
    const kind = this.expanded();
    if (kind) {
      this.expanded.set(null);
      this.element.nativeElement
        .querySelector<HTMLButtonElement>('[data-toggle="' + kind + '"]')
        ?.focus();
    } else if (this.menuOpen()) {
      this.closeMenu();
      this.element.nativeElement.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();
    }
  }
  closeOnFocusLeave(event: FocusEvent) {
    if (!this.element.nativeElement.contains(event.relatedTarget as Node | null)) this.closeMenu();
  }
}
