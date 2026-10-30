import { Component } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
@Component({
  selector: 'app-advisor-banner',
  imports: [Icon],
  templateUrl: './advisor-banner.html',
  styleUrl: './advisor-banner.scss',
})
export class AdvisorBanner {
  readonly benefits = [
    { icon: 'diamond', text: 'Más de 25 años', detail: 'de experiencia' },
    { icon: 'tools', text: 'Instalación', detail: 'profesional' },
    { icon: 'shield', text: 'Garantía', detail: 'en todos nuestros pisos' },
    { icon: 'chat', text: 'Asesoría', detail: 'personalizada' },
  ];
}
