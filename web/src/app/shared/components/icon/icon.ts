import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  template: `@if (name() === 'whatsapp') {
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="whatsapp-icon">
        <path
          d="M21 11.5a9 9 0 0 1-13.4 7.9L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M16.6 13.6c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1-.2.2-.6.7-.8.9-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.3-1.3-1.5-.1-.2 0-.3.1-.4l.4-.5.2-.4c.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.2 0-.4.1-.5.2-.2.2-.7.7-.7 1.7s.7 2 .8 2.2c.1.1 1.5 2.4 3.7 3.3 1.3.6 1.8.6 2.4.5.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1-.1-.1-.2-.2-.4-.3Z"
          fill="currentColor"
        />
      </svg>
    } @else {
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path [attr.d]="paths[name()] || paths['arrow']" />
      </svg>
    }`,
  styles: `
    :host {
      display: inline-flex;
      width: 1.5em;
      height: 1.5em;
      flex-shrink: 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class Icon {
  readonly name = input('arrow');
  readonly paths: Record<string, string> = {
    check: 'M20 6 9 17l-5-5',
    clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    shield: 'M12 2 21 6v6c0 6-9 10-9 10S3 18 3 12V6ZM8 12l3 3 5-6',
    diamond: 'M6 3h12l5 6-11 13L1 9ZM1 9h22M6 3l6 19 6-19M6 3l-2 6m14-6 2 6',
    tools: 'm3 3 18 18-3 2L1 6Zm12 5 4-5 3 3-5 5M8 14l-6 6 3 3 6-6',
    chat: 'M21 11a9 9 0 0 1-13 8l-6 3 2-6A9 9 0 1 1 21 11Z',
    document: 'M6 2h9l4 4v16H6ZM14 2v5h5M9 11h7M9 15h7M9 18h5',
    gear: 'm9 3 1-2h4l1 2 3 1 2 2-1 3 2 2v3l-2 1-1 3-3 1-1 2h-4l-1-2-3-1-2-2 1-3-2-2v-3l2-1 1-3ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z',
    user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-3a8 8 0 0 1 16 0v3Z',
  };
}
