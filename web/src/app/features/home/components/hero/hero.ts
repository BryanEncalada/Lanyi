import { Icon } from '../../../../shared/components/icon/icon';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, Icon],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {}
