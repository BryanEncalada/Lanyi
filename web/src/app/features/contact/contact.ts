import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CatalogService } from '../../shared/services/catalog.service';

import { Icon } from '../../shared/components/icon/icon';
import { timeout } from 'rxjs';
@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly http = inject(HttpClient);
  readonly catalog = inject(CatalogService);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: ['', [Validators.maxLength(30)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]],
    consent: [false, Validators.requiredTrue],
    website: [''],
  });
  readonly sending = signal(false);
  readonly sent = signal(false);
  readonly error = signal('');
  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.sending()) return;
    const base = this.catalog.apiBaseUrl();
    this.error.set('');
    if (!base) {
      this.error.set('El formulario no está conectado. Escríbenos por WhatsApp o correo.');
      return;
    }
    this.sending.set(true);
    this.http
      .post(base + '/contacto', this.form.getRawValue())
      .pipe(timeout(12000))
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.sent.set(true);
          this.form.reset();
        },
        error: (e: HttpErrorResponse) => {
          this.sending.set(false);
          this.error.set(
            e.status === 429
              ? 'Has enviado varias consultas. Espera un minuto antes de intentar nuevamente.'
              : e.status === 422
                ? 'Revisa los datos del formulario y vuelve a intentarlo.'
                : 'No pudimos enviar tu consulta. Intenta nuevamente o escríbenos por WhatsApp.',
          );
        },
      });
  }
}
