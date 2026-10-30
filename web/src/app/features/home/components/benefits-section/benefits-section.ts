import { ReferencePhoto } from '../../../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../../../shared/components/icon/icon';
import { Component } from '@angular/core';

@Component({
  selector: 'app-benefits-section',
  imports: [ReferencePhoto, Icon],
  templateUrl: './benefits-section.html',
  styleUrl: './benefits-section.scss',
})
export class BenefitsSection {}
