import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <a class="brand" routerLink="/explore">
          <span class="brand-mark">CP</span>
          <span class="brand-text">CareerPath<em>AI</em></span>
        </a>
        <nav class="app-nav">
          <a routerLink="/explore" routerLinkActive="active">Explore Careers</a>
          <a routerLink="/advisor" routerLinkActive="active">AI Advisor</a>
        </nav>
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
    }
  `]
})
export class AppComponent {}
