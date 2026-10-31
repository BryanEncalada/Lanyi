import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { BLOG_ARTICLES, BLOG_LIST, BLOG_RECOMMENDATIONS } from '../../../shared/data/blog';
import { ReferencePhoto } from '../../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../../shared/components/icon/icon';
@Component({selector: 'app-article', imports: [RouterLink, ReferencePhoto, Icon], templateUrl: './article.html', styleUrl: './article.scss'})
export class Article {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly all = [...BLOG_LIST, ...BLOG_RECOMMENDATIONS];
  readonly post = computed(() => this.all.find(p => p.slug === this.params().get('slug')));
  readonly related = computed(() => this.all.filter(p => p.slug !== this.post()?.slug).slice(0,3));
  readonly paragraphs = computed(() => BLOG_ARTICLES[this.post()?.slug ?? ''] ?? [this.post()?.description ?? '']);
  readonly isGuide = computed(() => this.post()?.slug === 'como-elegir-el-piso-ideal');
  readonly copyStatus = signal('');
  readonly floorTypes = [
    {name: 'Piso laminado', text: 'Versátil, moderno y de fácil mantenimiento.', type: 'Laminado', photo: [476,1259,202,63]},
    {name: 'Piso de madera', text: 'Elegancia natural y durabilidad.', type: 'Madera', photo: [259,1259,203,63]},
    {name: 'Piso de bambú', text: 'Una opción cálida y resistente.', type: 'Bambú', photo: [367,685,150,77]},
  ];
  constructor() { effect(() => { this.title.setTitle((this.post()?.title ?? 'Publicación no encontrada') + ' | Lanyi Pisos'); this.copyStatus.set(''); }); }
  shareUrl(service: string) {
    const url = encodeURIComponent(window.location.href);
    if (service === 'facebook') return 'https://www.facebook.com/sharer/sharer.php?u=' + url;
    if (service === 'linkedin') return 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
    return 'https://wa.me/?text=' + encodeURIComponent(this.post()?.title ?? '') + '%20' + url;
  }
  async copyLink() { try { await navigator.clipboard.writeText(window.location.href); this.copyStatus.set('Enlace copiado'); } catch { this.copyStatus.set('Puedes copiar el enlace desde la barra del navegador.'); } }
}
