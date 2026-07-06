import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { extractErrorMessages } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <section class="auth-card">
        <p class="eyebrow">Get started</p>
        <h1>Create your account</h1>

        <form (ngSubmit)="submit()">
          <div class="name-row">
            <label>
              First name
              <input type="text" name="firstName" autocomplete="given-name" required [(ngModel)]="firstName" />
            </label>

            <label>
              Last name
              <input type="text" name="lastName" autocomplete="family-name" required [(ngModel)]="lastName" />
            </label>
          </div>

          <label>
            Email
            <input type="email" name="email" autocomplete="email" required [(ngModel)]="email" />
          </label>

          <label>
            Password
            <input type="password" name="password" autocomplete="new-password" required [(ngModel)]="password" />
            <span class="hint">At least 8 characters, including a letter and a number.</span>
          </label>

          <button type="submit" class="submit-btn" [disabled]="loading()">
            {{ loading() ? 'Creating account…' : 'Sign up' }}
          </button>
        </form>

        @if (errors().length > 0) {
          <ul class="status-text error">
            @for (message of errors(); track message) {
              <li>{{ message }}</li>
            }
          </ul>
        }

        <p class="switch-link">
          Already have an account? <a routerLink="/login">Log in</a>
        </p>
      </section>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 16rem);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 0;
    }

    .auth-card {
      width: 100%;
      max-width: 480px;
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-card);
      padding: 2.5rem;
    }

    .eyebrow {
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-teal);
      margin-bottom: 0.6rem;
    }

    h1 {
      font-size: 1.6rem;
      font-weight: 600;
      margin-bottom: 1.75rem;
    }

    form {
      display: grid;
      gap: 1.4rem;
    }

    .name-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-ink);
      min-width: 0;
    }

    input {
      width: 100%;
      min-width: 0;
      font-family: var(--font-body);
      font-size: 0.95rem;
      padding: 0.75rem 0.9rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-paper);
      color: var(--color-ink);
    }

    input:focus {
      border-color: var(--color-teal);
    }

    .hint {
      font-size: 0.8rem;
      color: var(--color-slate);
      font-weight: 400;
    }

    .submit-btn {
      background: var(--color-ink);
      color: var(--color-paper);
      border: none;
      padding: 0.8rem 1.2rem;
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      font-weight: 600;
      margin-top: 0.35rem;
      transition: background 0.15s ease;
    }

    .submit-btn:hover:not(:disabled) {
      background: var(--color-teal);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .status-text {
      margin: 1.25rem 0 0;
      padding: 0;
      list-style: none;
      font-size: 0.88rem;
    }

    .status-text.error {
      color: var(--color-danger);
    }

    .switch-link {
      margin-top: 1.75rem;
      font-size: 0.88rem;
      color: var(--color-slate);
    }

    .switch-link a {
      color: var(--color-teal);
      font-weight: 600;
      text-decoration: none;
    }

    .switch-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 1.75rem;
      }
      .name-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';

  loading = signal(false);
  errors = signal<string[]>([]);

  submit(): void {
    this.loading.set(true);
    this.errors.set([]);

    this.auth
      .register({
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim(),
        password: this.password
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/login'], { queryParams: { registered: '1' } });
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.errors.set(
            extractErrorMessages(
              err,
              'Could not reach the CareerPath AI API. Make sure the backend is running on http://localhost:5080.'
            )
          );
        }
      });
  }
}
