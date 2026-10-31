import { RouterLink } from '@angular/router';
import { Component, computed, signal } from '@angular/core';
import { BLOG_LIST, BLOG_RECOMMENDATIONS } from '../../shared/data/blog';
import { ReferencePhoto } from '../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../shared/components/icon/icon';
@Component({selector: 'app-blog', imports: [ReferencePhoto, Icon, RouterLink], templateUrl: './blog.html', styleUrl: './blog.scss'})
export class Blog {
  readonly categories = ['Todos', 'Pisos Laminados', 'Madera', 'Bambú', 'Zócalos', 'Consejos', 'Instalación'];
  readonly category = signal('Todos');
  readonly search = signal('');
  readonly posts = BLOG_LIST;
  readonly recommendations = BLOG_RECOMMENDATIONS;
  readonly results = computed(() => this.posts.filter(p => (this.category() === 'Todos' || p.tags.includes(this.category())) && this.normalize(p.title + ' ' + p.description).includes(this.normalize(this.search()))));
  normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
  reset() { this.category.set('Todos'); this.search.set(''); }
}
