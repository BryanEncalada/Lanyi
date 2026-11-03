import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../../shared/services/content.service';
import { ContentPhoto } from '../../../../shared/components/content-photo/content-photo';
import { Icon } from '../../../../shared/components/icon/icon';
@Component({
  selector: 'app-blog-section',
  imports: [ContentPhoto, Icon, RouterLink],
  templateUrl: './blog-section.html',
  styleUrl: './blog-section.scss',
})
export class BlogSection {
  readonly content = inject(ContentService);
  readonly posts = computed(() => this.content.articles().slice(0, 3));
}
