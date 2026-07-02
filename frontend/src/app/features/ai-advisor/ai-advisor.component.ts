import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CareerApiService } from '../../core/services/career-api.service';
import { AdvisorRecommendation } from '../../core/models/career.models';

@Component({
  selector: 'app-ai-advisor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="advisor-head">
      <p class="eyebrow">AI Career Advisor</p>
      <h1>Tell us what you're drawn to. We'll show you where it leads.</h1>
      <p class="lede">
        List a few interests, favorite subjects, and skills &mdash; even rough ones.
        The advisor matches them against real professions and shows exactly why each one fits.
      </p>
    </section>

    <form class="advisor-form" (ngSubmit)="submit()">
      <label>
        Interests
        <input type="text" placeholder="e.g. technology, problem solving, building things" [(ngModel)]="interestsInput" name="interests" />
      </label>

      <label>
        Favorite subjects
        <input type="text" placeholder="e.g. mathematics, computer science, biology" [(ngModel)]="subjectsInput" name="subjects" />
      </label>

      <label>
        Skills you already have
        <input type="text" placeholder="e.g. coding, communication, drawing" [(ngModel)]="skillsInput" name="skills" />
      </label>

      <label>
        Your goal <span class="optional">(optional)</span>
        <input type="text" placeholder="e.g. work in AI, become a doctor, build my own company" [(ngModel)]="goalInput" name="goal" />
      </label>

      <p class="hint">Separate multiple items with commas.</p>

      <button type="submit" class="submit-btn" [disabled]="loading()">
        {{ loading() ? 'Matching…' : 'Get my recommendations' }}
      </button>
    </form>

    @if (error()) {
      <p class="status-text error">{{ error() }}</p>
    }

    @if (results().length > 0) {
      <section class="results">
        <h2>Best matches for you</h2>
        <div class="results-list">
          @for (rec of results(); track rec.profession.id) {
            <article class="result-card">
              <div class="result-top">
                <h3>{{ rec.profession.title }}</h3>
                <span class="match-score">{{ (rec.matchScore * 100) | number: '1.0-0' }}% match</span>
              </div>
              <p class="desc">{{ rec.profession.description }}</p>
              @if (rec.aiExplanation) {
                <p class="ai-explanation">
                  <span class="ai-badge">AI</span>
                  {{ rec.aiExplanation }}
                </p>
              }
              <div class="matched-on">
                <span class="matched-label">Matched on:</span>
                @for (term of rec.matchedOn; track term) {
                  <span class="matched-chip">{{ term }}</span>
                }
              </div>
              <button class="roadmap-btn" (click)="openRoadmap(rec.profession.id)">
                View education roadmap &rarr;
              </button>
            </article>
          }
        </div>
      </section>
    } @else if (searched()) {
      <p class="status-text">
        No strong matches yet. Try adding a few more interests or skills &mdash; even broad ones like "math" or "helping people" work well.
      </p>
    }
  `,
  styles: [`
    .advisor-head {
      max-width: 720px;
      margin-bottom: 2rem;
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
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .lede {
      color: var(--color-slate);
    }

    .advisor-form {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.75rem;
      display: grid;
      gap: 1.1rem;
      max-width: 560px;
      box-shadow: var(--shadow-card);
      margin-bottom: 2rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-ink);
    }

    .optional {
      font-weight: 400;
      color: var(--color-slate);
      font-size: 0.8rem;
    }

    input[type="text"] {
      font-family: var(--font-body);
      font-size: 0.95rem;
      font-weight: 400;
      padding: 0.7rem 0.9rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-paper);
      color: var(--color-ink);
    }

    input[type="text"]:focus {
      border-color: var(--color-teal);
    }

    .hint {
      font-size: 0.8rem;
      color: var(--color-slate);
      font-weight: 400;
      margin: -0.3rem 0 0;
    }

    .submit-btn {
      background: var(--color-ink);
      color: var(--color-paper);
      border: none;
      padding: 0.75rem 1.2rem;
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      font-weight: 600;
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
      color: var(--color-slate);
      padding: 1rem 0;
    }

    .status-text.error {
      color: var(--color-danger);
    }

    .results h2 {
      font-size: 1.3rem;
      margin-bottom: 1rem;
    }

    .results-list {
      display: grid;
      gap: 1rem;
      max-width: 720px;
    }

    .result-card {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      box-shadow: var(--shadow-card);
    }

    .result-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .result-top h3 {
      font-size: 1.1rem;
    }

    .match-score {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-teal);
      white-space: nowrap;
    }

    .desc {
      color: var(--color-slate);
      font-size: 0.9rem;
      margin-bottom: 0.75rem;
    }

    .ai-explanation {
      font-size: 0.88rem;
      color: var(--color-ink);
      background: var(--color-paper);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 0.6rem 0.75rem;
      margin-bottom: 0.75rem;
      line-height: 1.5;
    }

    .ai-badge {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--color-paper);
      background: var(--color-teal);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      margin-right: 0.4rem;
      vertical-align: middle;
    }

    .matched-on {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.9rem;
    }

    .matched-label {
      font-size: 0.78rem;
      color: var(--color-slate);
      font-weight: 600;
    }

    .matched-chip {
      font-size: 0.75rem;
      background: rgba(31, 138, 112, 0.12);
      color: var(--color-teal);
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      font-weight: 600;
    }

    .roadmap-btn {
      background: var(--color-ink);
      color: var(--color-paper);
      border: none;
      padding: 0.6rem 0.95rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      transition: background 0.15s ease;
    }

    .roadmap-btn:hover {
      background: var(--color-teal);
    }
  `]
})
export class AiAdvisorComponent {
  private readonly api = inject(CareerApiService);
  private readonly router = inject(Router);

  interestsInput = '';
  subjectsInput = '';
  skillsInput = '';
  goalInput = '';

  results = signal<AdvisorRecommendation[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searched = signal(false);

  submit(): void {
    const interests = this.splitCsv(this.interestsInput);
    const favoriteSubjects = this.splitCsv(this.subjectsInput);
    const skills = this.splitCsv(this.skillsInput);

    if (interests.length === 0 && favoriteSubjects.length === 0 && skills.length === 0) {
      this.error.set('Add at least one interest, subject, or skill so the advisor has something to match on.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.api.getAdvisorRecommendations({
      interests,
      favoriteSubjects,
      skills,
      goal: this.goalInput.trim() || null
    }).subscribe({
      next: result => {
        this.results.set(result.recommendedProfessions);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to get advisor recommendations:', err);
        this.error.set('Could not reach the CareerPath AI API. Make sure the backend is running on http://localhost:5080. (Full error logged to console.)');
        this.loading.set(false);
      }
    });
  }

  openRoadmap(professionId: number): void {
    this.router.navigate(['/roadmap', professionId]);
  }

  private splitCsv(value: string): string[] {
    return value
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }
}
