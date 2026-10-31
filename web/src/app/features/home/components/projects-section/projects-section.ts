import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROJECTS } from '../../../../shared/data/projects';
import { ReferencePhoto } from '../../../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../../../shared/components/icon/icon';
import { quotationUrl } from '../../../../shared/data/products';
@Component({
  selector: 'app-projects-section',
  imports: [ReferencePhoto, Icon, RouterLink],
  templateUrl: './projects-section.html',
  styleUrl: './projects-section.scss',
})
export class ProjectsSection {
  readonly projects = PROJECTS;
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
