import { Component, signal } from '@angular/core';
import { ReferencePhoto } from '../../../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-blog-section',
  imports: [ReferencePhoto, Icon],
  templateUrl: './blog-section.html',
  styleUrl: './blog-section.scss',
})
export class BlogSection {
  readonly photos = [
    [42, 1259, 203, 63],
    [259, 1259, 203, 63],
    [476, 1259, 202, 63],
  ];
  readonly selected = signal<(typeof this.posts)[number] | null>(null);
  open(post: (typeof this.posts)[number], dialog: HTMLDialogElement) {
    this.selected.set(post);
    dialog.showModal();
  }
  readonly articles: Record<string, string[]> = {
    'como-elegir-el-piso-ideal': [
      'Antes de elegir un piso, considera el uso del ambiente, la cantidad de luz natural y los tonos de tus muebles. Una muestra física te ayudará a comparar colores en tu propio espacio.',
      'Consulta la ficha técnica del fabricante para conocer las condiciones de instalación, resistencia y mantenimiento. Nuestro equipo puede orientarte según tu proyecto y presupuesto.',
    ],
    'diferencias-pisos-laminados-madera-bambu': [
      'Los pisos laminados ofrecen una amplia variedad de acabados decorativos. La madera destaca por sus vetas naturales, mientras que el bambú aporta una apariencia cálida y distintiva.',
      'La elección depende del ambiente y de las especificaciones de cada producto. Compara muestras, mantenimiento y compatibilidad con el lugar de instalación antes de decidir.',
    ],
    'zocalos-el-detalle-que-hace-la-diferencia': [
      'Los zócalos acompañan el encuentro entre la pared y el piso y ayudan a proteger la parte inferior del muro. Su altura, tono y acabado influyen en el resultado visual del ambiente.',
      'Puedes elegir un color similar al piso para dar continuidad, o un tono que combine con las paredes. Revisa las condiciones de humedad y las instrucciones de instalación de cada material.',
    ],
  };

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
