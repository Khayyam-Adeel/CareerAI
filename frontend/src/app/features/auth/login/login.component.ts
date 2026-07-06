import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { extractErrorMessages } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <section class="auth-card">
        <p class="eyebrow">Welcome back</p>
        <h1>Log in to CareerPath AI</h1>

        @if (justRegistered()) {
          <p class="status-text success">Account created &mdash; log in to continue.</p>
        }

        <form (ngSubmit)="submit()">
          <label>
            Email
            <input type="email" name="email" autocomplete="email" required [(ngModel)]="email" />
          </label>

          <label>
            Password
            <input type="password" name="password" autocomplete="current-password" required [(ngModel)]="password" />
          </label>

          <button type="submit" class="submit-btn" [disabled]="loading()">
            {{ loading() ? 'Logging in…' : 'Log in' }}
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
          Don&apos;t have an account? <a routerLink="/register">Sign up</a>
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
      max-width: 420px;
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

    .status-text.success {
      color: var(--color-teal);
      font-weight: 600;
      margin-bottom: 1.25rem;
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
    }
  `]
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';

  loading = signal(false);
  errors = signal<string[]>([]);
  justRegistered = signal(this.route.snapshot.queryParamMap.get('registered') === '1');

  submit(): void {
    this.loading.set(true);
    this.errors.set([]);

    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/');
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
