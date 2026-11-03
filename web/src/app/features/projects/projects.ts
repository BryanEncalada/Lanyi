import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../shared/services/content.service';
import { quotationUrl } from '../../shared/data/products';
import { ContentPhoto } from '../../shared/components/content-photo/content-photo';
import { Icon } from '../../shared/components/icon/icon';
@Component({
  selector: 'app-projects',
  imports: [RouterLink, ContentPhoto, Icon],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  readonly content = inject(ContentService);
  readonly projects = this.content.projects;
  readonly categories = computed(() => [
    'Todos',
    ...new Set(
      this.projects()
        .map((p) => p.material)
        .filter(Boolean),
    ),
  ]);
  readonly category = signal('Todos');
  readonly results = computed(() =>
    this.projects().filter((p) => this.category() === 'Todos' || p.material === this.category()),
  );
  readonly quote = quotationUrl;
}
