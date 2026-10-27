import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials-section',
  imports: [],
  templateUrl: './testimonials-section.html',
  styleUrl: './testimonials-section.scss',
})
export class TestimonialsSection {
  // Datos de muestra de la referencia visual.
  readonly testimonials = [
    {
      quote: 'Excelente servicio, la instalación fue rápida y el resultado superó nuestras expectativas. Muy recomendados.',
      name: 'María Fernández',
      location: 'San Isidro',
    },
    {
      quote: 'Muy buena calidad de pisos y una atención personalizada desde el inicio hasta la instalación.',
      name: 'Carlos Ramírez',
      location: 'La Molina',
    },
    {
      quote: 'Cumplieron con los plazos y el acabado quedó perfecto. Definitivamente los volvería a elegir.',
      name: 'Lucía Torres',
      location: 'Miraflores',
    },
  ];
}
