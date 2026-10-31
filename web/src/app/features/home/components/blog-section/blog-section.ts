import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BLOG_POSTS } from '../../../../shared/data/blog';
import { ReferencePhoto } from '../../../../shared/components/reference-photo/reference-photo';
import { Icon } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-blog-section',
  imports: [ReferencePhoto, Icon, RouterLink],
  templateUrl: './blog-section.html',
  styleUrl: './blog-section.scss',
})
export class BlogSection {
  readonly photos = [
    [42, 1259, 203, 63],
    [259, 1259, 203, 63],
    [476, 1259, 202, 63],
  ];
// Publicaciones de muestra basadas en la referencia visual.
  readonly posts = BLOG_POSTS;
}
