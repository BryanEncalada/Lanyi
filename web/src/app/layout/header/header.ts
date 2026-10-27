import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update((value) => !value);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
