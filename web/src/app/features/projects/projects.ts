import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROJECTS } from '../../shared/data/projects';
import { quotationUrl } from '../../shared/data/products';
import { ReferencePhoto } from '../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../shared/components/icon/icon';
@Component({selector: 'app-projects', imports: [RouterLink, ReferencePhoto, Icon], templateUrl: './projects.html', styleUrl: './projects.scss'})
export class Projects {
  readonly projects = PROJECTS;
  readonly categories = ['Todos', ...new Set(PROJECTS.map(p => p.material))];
  readonly category = signal('Todos');
  readonly results = computed(() => PROJECTS.filter(p => this.category() === 'Todos' || p.material === this.category()));
  readonly selected = signal<(typeof PROJECTS)[number] | null>(null);
  readonly quote = quotationUrl;
  open(project: (typeof PROJECTS)[number], dialog: HTMLDialogElement) { this.selected.set(project); dialog.showModal(); }
}
