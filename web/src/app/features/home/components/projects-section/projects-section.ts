import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../../shared/services/content.service';
import { ContentPhoto } from '../../../../shared/components/content-photo/content-photo';
import { Icon } from '../../../../shared/components/icon/icon';
import { quotationUrl } from '../../../../shared/data/products';
@Component({
  selector: 'app-projects-section',
  imports: [ContentPhoto, Icon, RouterLink],
  templateUrl: './projects-section.html',
  styleUrl: './projects-section.scss',
})
export class ProjectsSection {
  readonly content = inject(ContentService);
  readonly projects = computed(() => this.content.projects().slice(0, 8));
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
