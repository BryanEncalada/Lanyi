import { Component, signal } from '@angular/core';
import { ReferencePhoto } from '../../../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../../../shared/components/icon/icon';
import { quotationUrl } from '../../../../shared/data/products';
@Component({
  selector: 'app-projects-section',
  imports: [ReferencePhoto, Icon],
  templateUrl: './projects-section.html',
  styleUrl: './projects-section.scss',
})
export class ProjectsSection {
  readonly projects = [
    {
      slug: 'departamento-san-isidro',
      name: 'Departamento en San Isidro',
      material: 'Piso laminado',
      photo: [223, 420, 112, 88],
    },
    {
      slug: 'oficina-corporativa',
      name: 'Oficina corporativa',
      material: 'Piso de madera',
      photo: [343, 420, 111, 88],
    },
    {
      slug: 'casa-la-molina',
      name: 'Casa en La Molina',
      material: 'Piso de bambú',
      photo: [462, 420, 111, 88],
    },
    {
      slug: 'terraza-exterior',
      name: 'Terraza exterior',
      material: 'Deck WPC',
      photo: [581, 420, 111, 88],
    },
  ];
  readonly selected = signal<(typeof this.projects)[number] | null>(null);
  readonly quotationUrl = quotationUrl;
  open(project: (typeof this.projects)[number], dialog: HTMLDialogElement) {
    this.selected.set(project);
    dialog.showModal();
  }
  scrollProjects(track: HTMLElement, direction: number) {
    const distance =
      (track.firstElementChild?.getBoundingClientRect().width || track.clientWidth) + 12;
    let next = track.scrollLeft + distance * direction;
    if (next > track.scrollWidth - track.clientWidth + 3) next = 0;
    if (next < 0) next = track.scrollWidth;
    track.scrollTo({
      left: next,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }
}
