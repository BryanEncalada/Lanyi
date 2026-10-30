import { Icon } from '../../shared/components/icon/icon';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly year = new Date().getFullYear();
}
