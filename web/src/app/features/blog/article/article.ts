import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentService } from '../../../shared/services/content.service';
import { SeoService } from '../../../shared/services/seo.service';
import { ContentPhoto } from '../../../shared/components/content-photo/content-photo';
import { Icon } from '../../../shared/components/icon/icon';
import { editorialBlocks } from '../../../shared/data/editorial-utils';
import { quotationUrl } from '../../../shared/data/products';
@Component({
  selector: 'app-article',
  imports: [RouterLink, ContentPhoto, Icon],
  templateUrl: './article.html',
  styleUrl: './article.scss',
})
export class Article {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);
  readonly kind = computed((): 'blog' | 'proyectos' =>
    this.data()['kind'] === 'proyectos' ? 'proyectos' : 'blog',
  );
  readonly all = computed(() =>
    this.kind() === 'blog' ? this.content.articles() : this.content.projects(),
  );
  readonly post = computed(() => this.all().find((p) => p.slug === this.params().get('slug')));
  readonly related = computed(() =>
    this.all()
      .filter((p) => p.slug !== this.post()?.slug)
      .slice(0, 3),
  );
  readonly blocks = computed(() => editorialBlocks(this.post()?.body ?? ''));
  readonly gallery = computed(() => [
    ...new Set(
      [this.post()?.imageUrl, ...(this.post()?.gallery ?? [])].filter((p): p is string => !!p),
    ),
  ]);
  readonly activeImage = signal<string | undefined>(undefined);
  readonly copyStatus = signal('');
  readonly quote = quotationUrl;
  constructor() {
    effect(() => {
      const p = this.post();
      this.seo.navigation();
      this.activeImage.set(undefined);
      this.seo.set(
        p
          ? {
              title: (p.seoTitle || p.title) + ' | Lanyi Pisos',
              description: p.seoDescription || p.description,
              image: p.imageUrl,
              path: '/' + this.kind() + '/' + p.slug,
              type: this.kind() === 'blog' ? 'article' : 'website',
            }
          : {
              title: 'Contenido no encontrado | Lanyi Pisos',
              description: 'Consulta nuestras publicaciones y proyectos.',
              noindex: this.content.status()[this.kind()] !== 'loading',
            },
      );
    });
  }
  shareUrl(service: string) {
    const url = encodeURIComponent(window.location.href);
    if (service === 'facebook') return 'https://www.facebook.com/sharer/sharer.php?u=' + url;
    if (service === 'linkedin') return 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
    return 'https://wa.me/?text=' + encodeURIComponent(this.post()?.title ?? '') + '%20' + url;
  }
  async copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.copyStatus.set('Enlace copiado');
    } catch {
      this.copyStatus.set('Copia la dirección desde tu navegador.');
    }
  }
}
