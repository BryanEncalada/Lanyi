import { Component, inject } from '@angular/core';
import { ContentService } from '../../../../shared/services/content.service';
import { ContentPhoto } from '../../../../shared/components/content-photo/content-photo';
@Component({
  selector: 'app-testimonials-section',
  imports: [ContentPhoto],
  templateUrl: './testimonials-section.html',
  styleUrl: './testimonials-section.scss',
})
export class TestimonialsSection {
  readonly content = inject(ContentService);
  readonly testimonials = this.content.testimonials;
}
