import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface RoadmapStep {
  label: string;
  isProfession?: boolean;
}

interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  linkText: string;
  route: string;
}

interface AudienceCard {
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">AI-Powered Career Roadmaps</p>
        <h1>From Matric to your dream profession &mdash; one clear path.</h1>
        <p class="lede">
          CareerPath AI maps the real education route &mdash; Matric, Intermediate, Bachelor&apos;s,
          Master&apos;s, PhD &mdash; behind any profession, then helps you find the right one
          based on your interests and skills.
        </p>
        <div class="hero-actions">
          <a routerLink="/explore" class="btn btn-primary">Explore Careers &rarr;</a>
          <a routerLink="/advisor" class="btn btn-secondary">Try the AI Advisor</a>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="mini-roadmap">
          @for (step of roadmapPreview; track step.label; let last = $last) {
            <span [class]="'chip' + (step.isProfession ? ' chip-profession' : '')">{{ step.label }}</span>
            @if (!last) {
              <span class="chip-arrow">&rarr;</span>
            }
          }
        </div>
      </div>
    </section>

    <section class="stats">
      @for (stat of stats; track stat.label) {
        <div class="stat">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      }
    </section>

    <section class="how-it-works">
      <p class="eyebrow">How it works</p>
      <h2>Three steps from &ldquo;what should I study&rdquo; to a plan.</h2>

      <div class="steps-grid">
        @for (item of howItWorks; track item.title) {
          <article class="step-card">
            <span class="step-number">{{ item.step }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <a [routerLink]="item.route" class="step-link">{{ item.linkText }} &rarr;</a>
          </article>
        }
      </div>
    </section>

    <section class="audience">
      <p class="eyebrow">Built for</p>
      <div class="audience-grid">
        @for (card of audience; track card.title) {
          <article class="audience-card">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
          </article>
        }
      </div>
    </section>

    <section class="cta-banner">
      <h2>Ready to find your path?</h2>
      <p>Browse real professions and see exactly what it takes to get there.</p>
      <a routerLink="/explore" class="btn btn-primary btn-lg">Start Exploring &rarr;</a>
    </section>
  `,
  styles: [`
    section {
      margin-bottom: 4.5rem;
    }

    .eyebrow {
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-teal);
      margin-bottom: 0.6rem;
    }

    /* Hero */
    .hero {
      display: flex;
      align-items: center;
      gap: 3rem;
      padding: 2rem 0 1rem;
    }

    .hero-copy {
      flex: 1.1;
      min-width: 0;
    }

    .hero h1 {
      font-size: 2.6rem;
      font-weight: 600;
      line-height: 1.15;
      margin-bottom: 1.1rem;
    }

    .hero .lede {
      color: var(--color-slate);
      font-size: 1.08rem;
      max-width: 46ch;
      margin-bottom: 1.75rem;
    }

    .hero-actions {
      display: flex;
      gap: 0.9rem;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-block;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0.8rem 1.4rem;
      border-radius: var(--radius-sm);
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
    }

    .btn-primary {
      background: var(--color-ink);
      color: var(--color-paper);
      border: 1px solid var(--color-ink);
    }

    .btn-primary:hover {
      background: var(--color-teal);
      border-color: var(--color-teal);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: transparent;
      color: var(--color-ink);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      border-color: var(--color-teal);
      color: var(--color-teal);
    }

    .btn-lg {
      font-size: 1rem;
      padding: 0.9rem 1.8rem;
    }

    .hero-visual {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mini-roadmap {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-card);
      padding: 1.5rem;
    }

    .chip {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.45rem 0.8rem;
      border-radius: 999px;
      background: var(--color-paper);
      border: 1px solid var(--color-border);
      color: var(--color-ink);
      white-space: nowrap;
    }

    .chip-profession {
      background: rgba(31, 138, 112, 0.15);
      border-color: var(--color-teal);
      color: var(--color-teal);
    }

    .chip-arrow {
      color: var(--color-slate);
    }

    /* Stats */
    .stats {
      display: flex;
      gap: 2.5rem;
      flex-wrap: wrap;
      padding: 2rem 2.25rem;
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-card);
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .stat-value {
      font-family: var(--font-display);
      font-size: 1.9rem;
      font-weight: 600;
      color: var(--color-ink);
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--color-slate);
    }

    /* How it works */
    .how-it-works h2, .audience h2 {
      font-size: 1.7rem;
      font-weight: 600;
      max-width: 34ch;
      margin-bottom: 2rem;
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }

    .step-card {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .step-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(27, 36, 48, 0.1);
    }

    .step-number {
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-amber);
    }

    .step-card h3 {
      font-size: 1.15rem;
      font-weight: 600;
    }

    .step-card p {
      color: var(--color-slate);
      font-size: 0.92rem;
      flex: 1;
    }

    .step-link {
      text-decoration: none;
      color: var(--color-teal);
      font-weight: 600;
      font-size: 0.88rem;
    }

    .step-link:hover {
      text-decoration: underline;
    }

    /* Audience */
    .audience-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .audience-card {
      padding: 1.4rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }

    .audience-card h3 {
      font-size: 1.05rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .audience-card p {
      color: var(--color-slate);
      font-size: 0.9rem;
    }

    /* CTA banner */
    .cta-banner {
      text-align: center;
      padding: 3rem 2rem;
      background: var(--color-ink);
      border-radius: var(--radius-md);
      color: var(--color-paper);
    }

    .cta-banner h2 {
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 0.6rem;
    }

    .cta-banner p {
      color: rgba(250, 247, 240, 0.75);
      margin-bottom: 1.5rem;
    }

    .cta-banner .btn-primary {
      background: var(--color-teal);
      border-color: var(--color-teal);
      color: var(--color-paper);
    }

    .cta-banner .btn-primary:hover {
      background: var(--color-amber);
      border-color: var(--color-amber);
    }

    @media (max-width: 900px) {
      .hero {
        flex-direction: column;
        align-items: stretch;
      }

      .hero h1 {
        font-size: 2.1rem;
      }
    }

    @media (max-width: 640px) {
      section {
        margin-bottom: 3rem;
      }

      .stats {
        gap: 1.5rem;
        padding: 1.5rem;
      }

      .cta-banner {
        padding: 2.25rem 1.5rem;
      }
    }
  `]
})
export class HomeComponent {
  readonly roadmapPreview: RoadmapStep[] = [
    { label: 'Matric' },
    { label: 'Intermediate' },
    { label: "Bachelor's" },
    { label: "Master's" },
    { label: 'PhD' },
    { label: 'Profession', isProfession: true }
  ];

  readonly stats = [
    { value: '9', label: 'Professions catalogued' },
    { value: '10', label: 'Degree pathways' },
    { value: '5', label: 'Education levels, Matric to PhD' }
  ];

  readonly howItWorks: HowItWorksStep[] = [
    {
      step: '01',
      title: 'Explore professions',
      description: 'Browse real careers with salary ranges, demand trends, required skills, and certifications.',
      linkText: 'Explore careers',
      route: '/explore'
    },
    {
      step: '02',
      title: 'See the roadmap',
      description: 'Open any profession to see the exact Matric-to-PhD education path, plus alternative routes.',
      linkText: 'View a roadmap',
      route: '/explore'
    },
    {
      step: '03',
      title: 'Get matched',
      description: 'Enter your interests, favorite subjects, and skills to get ranked profession recommendations.',
      linkText: 'Try the AI Advisor',
      route: '/advisor'
    }
  ];

  readonly audience: AudienceCard[] = [
    {
      title: 'Students',
      description: 'Know exactly which subjects and degrees to pick before committing years to a path.'
    },
    {
      title: 'Parents',
      description: 'Understand the real education timeline and requirements behind a career your child is considering.'
    },
    {
      title: 'Counselors',
      description: 'Give students clear, comparable roadmaps instead of vague advice about "what\'s in demand."'
    }
  ];
}
