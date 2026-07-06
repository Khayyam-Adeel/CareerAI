import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <a class="brand" routerLink="/">
          <span class="brand-mark">CP</span>
          <span class="brand-text">CareerPath<em>AI</em></span>
        </a>
        <nav class="app-nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/explore" routerLinkActive="active">Explore Careers</a>
          <a routerLink="/advisor" routerLinkActive="active">AI Advisor</a>
        </nav>
        <div class="app-auth">
          @if (auth.isAuthenticated()) {
            <span class="auth-greeting">Hi, {{ auth.currentUser()?.firstName }}</span>
            <button type="button" class="auth-logout" (click)="logout()">Log out</button>
          } @else {
            <a routerLink="/login" routerLinkActive="active" class="auth-link">Log in</a>
            <a routerLink="/register" class="auth-signup">Sign up</a>
          }
        </div>
      </header>

      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <footer class="app-footer">
        <span>CareerPath AI &mdash; built for students, parents &amp; counselors.</span>
      </footer>
    </div>
  `,
  styles: [`
    .app-auth {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .auth-greeting {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-ink);
    }

    .auth-logout {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-slate);
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-sm);
      transition: border-color 0.15s ease, color 0.15s ease;
    }

    .auth-logout:hover {
      border-color: var(--color-danger);
      color: var(--color-danger);
    }

    .auth-link {
      text-decoration: none;
      color: var(--color-slate);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .auth-link:hover, .auth-link.active {
      color: var(--color-ink);
    }

    .auth-signup {
      text-decoration: none;
      background: var(--color-ink);
      color: var(--color-paper);
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.5rem 0.95rem;
      border-radius: var(--radius-sm);
      transition: background 0.15s ease;
    }

    .auth-signup:hover {
      background: var(--color-teal);
    }

    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--color-paper);
    }

    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 2rem;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-paper);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      color: var(--color-ink);
    }

    .brand-mark {
      width: 2.1rem;
      height: 2.1rem;
      border-radius: 0.5rem;
      background: var(--color-ink);
      color: var(--color-paper);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.02em;
    }

    .brand-text {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .brand-text em {
      font-style: normal;
      color: var(--color-teal);
    }

    .app-nav {
      display: flex;
      gap: 1.75rem;
    }

    .app-nav a {
      text-decoration: none;
      color: var(--color-slate);
      font-size: 0.95rem;
      font-weight: 500;
      padding-bottom: 0.3rem;
      border-bottom: 2px solid transparent;
      transition: color 0.15s ease, border-color 0.15s ease;
    }

    .app-nav a:hover {
      color: var(--color-ink);
    }

    .app-nav a.active {
      color: var(--color-ink);
      border-bottom-color: var(--color-teal);
    }

    .app-main {
      flex: 1;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2.5rem 2rem 4rem;
    }

    .app-footer {
      text-align: center;
      padding: 1.5rem;
      font-size: 0.85rem;
      color: var(--color-slate);
      border-top: 1px solid var(--color-border);
    }

    @media (max-width: 640px) {
      .app-header {
        padding: 1rem 1.25rem;
      }
      .app-main {
        padding: 1.75rem 1.25rem 3rem;
      }
      .brand-text {
        font-size: 1.05rem;
      }
      .app-nav {
        gap: 1rem;
      }
      .auth-greeting {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
