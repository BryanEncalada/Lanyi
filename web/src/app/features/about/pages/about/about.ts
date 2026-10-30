import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReferencePhoto } from '../../../../shared/components/reference-photo/reference-photo';
@Component({
  selector: 'app-about',
  imports: [RouterLink, ReferencePhoto],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {}
