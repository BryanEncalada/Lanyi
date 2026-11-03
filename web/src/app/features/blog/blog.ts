import { RouterLink } from '@angular/router';
import { Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../../shared/services/content.service';
import { ContentPhoto } from '../../shared/components/content-photo/content-photo';
import { Icon } from '../../shared/components/icon/icon';
import { normalizeText } from '../../shared/data/catalog-utils';
@Component({
  selector: 'app-blog',
  imports: [ContentPhoto, Icon, RouterLink],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  readonly content = inject(ContentService);
  readonly posts = this.content.articles;
  readonly categories = computed(() => [
    'Todos',
    ...new Set(
      this.posts()
        .flatMap((p) => [p.category, ...p.tags])
        .filter(Boolean),
    ),
  ]);
  readonly category = signal('Todos');
  readonly search = signal('');
  readonly results = computed(() =>
    this.posts().filter(
      (p) =>
        (this.category() === 'Todos' ||
          p.category === this.category() ||
          p.tags.includes(this.category())) &&
        normalizeText(p.title + ' ' + p.description).includes(normalizeText(this.search())),
    ),
  );
  readonly recommendations = computed(() =>
    this.posts()
      .filter((p) => p.featured)
      .slice(0, 3),
  );
  reset() {
    this.category.set('Todos');
    this.search.set('');
  }
}
