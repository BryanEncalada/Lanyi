import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-projects-section',
  imports: [RouterLink],
  templateUrl: './projects-section.html',
  styleUrl: './projects-section.scss',
})
export class ProjectsSection {
  // Proyectos de muestra basados en la referencia visual.
  readonly projects = [
    { slug: 'departamento-san-isidro', name: 'Departamento en San Isidro', material: 'Piso laminado' },
    { slug: 'oficina-corporativa', name: 'Oficina corporativa', material: 'Piso de madera' },
    { slug: 'casa-la-molina', name: 'Casa en La Molina', material: 'Piso de bambú' },
    { slug: 'terraza-exterior', name: 'Terraza exterior', material: 'Deck WPC' },
  ];

  scrollProjects(track: HTMLElement, direction: number) {
    const firstCard = track.firstElementChild;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + 16 : track.clientWidth;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: distance * direction, behavior: reducedMotion ? 'instant' : 'smooth' });
  }
}
