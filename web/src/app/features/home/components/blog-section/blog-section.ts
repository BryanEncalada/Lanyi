import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blog-section',
  imports: [RouterLink],
  templateUrl: './blog-section.html',
  styleUrl: './blog-section.scss',
})
export class BlogSection {
  // Publicaciones de muestra basadas en la referencia visual.
  readonly posts = [
    {
      slug: 'como-elegir-el-piso-ideal',
      title: '¿Cómo elegir el piso ideal para tu hogar?',
      description: 'Conoce los factores más importantes a considerar antes de instalar un piso.',
      date: '2026-10-15',
      displayDate: '15 oct. 2026',
      image: 'piso-ideal.jpg',
    },
    {
      slug: 'diferencias-pisos-laminados-madera-bambu',
      title: 'Diferencias entre pisos laminados, de madera y bambú',
      description: 'Te explicamos las características, ventajas y usos de cada tipo de piso.',
      date: '2026-10-10',
      displayDate: '10 oct. 2026',
      image: 'tipos-de-pisos.jpg',
    },
    {
      slug: 'zocalos-el-detalle-que-hace-la-diferencia',
      title: 'Zócalos: el detalle que hace la diferencia',
      description: 'Descubre cómo los zócalos complementan y protegen tus espacios.',
      date: '2026-10-05',
      displayDate: '5 oct. 2026',
      image: 'zocalos.jpg',
    },
  ];
}
