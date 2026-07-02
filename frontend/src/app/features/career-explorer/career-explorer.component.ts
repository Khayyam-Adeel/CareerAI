import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CareerApiService } from '../../core/services/career-api.service';
import { DEMAND_LABELS, OnetOccupationMatch, Profession } from '../../core/models/career.models';

@Component({
  selector: 'app-career-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="explorer-head">
      <p class="eyebrow">Career Explorer</p>
      <h1>Find out where a subject can actually take you.</h1>
      <p class="lede">
        Browse real professions &mdash; salary range, demand, the skills and certifications
        each one expects &mdash; then open the full education roadmap behind any of them.
      </p>
    </section>

    <div class="filters">
      <input
        type="text"
        placeholder="Search by title, field, or skill (e.g. 'cloud', 'medicine')"
        [(ngModel)]="keyword"
        (ngModelChange)="onFilterChange()"
        class="search-input"
      />
      <select [(ngModel)]="field" (ngModelChange)="onFilterChange()" class="field-select">
        <option value="">All fields</option>
        @for (f of fields(); track f) {
          <option [value]="f">{{ f }}</option>
        }
      </select>
    </div>

    @if (loading()) {
      <p class="status-text">Loading professions&hellip;</p>
    } @else if (error()) {
      <p class="status-text error">{{ error() }}</p>
    } @else if (professions().length === 0) {
      <p class="status-text">No professions match that search. Try a different keyword.</p>
    } @else {
      <div class="card-grid">
        @for (p of professions(); track p.id) {
          <article class="career-card">
            <div class="card-top">
              <span class="field-tag">{{ p.field }}</span>
              <span [class]="'demand-pill demand-' + p.demand">{{ demandLabel(p) }}</span>
            </div>
            <h3>{{ p.title }}</h3>
            <p class="desc">{{ p.description }}</p>
            <p class="salary">{{ p.currency }} {{ p.salaryMin | number }}&ndash;{{ p.salaryMax | number }} / yr</p>
            <div class="skills">
              @for (skill of p.requiredSkills.slice(0, 3); track skill) {
                <span class="skill-chip">{{ skill }}</span>
              }
            </div>
            <div class="card-actions">
              <button class="roadmap-btn" (click)="openRoadmap(p.id)">
                View education roadmap &rarr;
              </button>
              <button class="onet-btn" (click)="checkOnet(p.id)" [disabled]="onetLoading() === p.id">
                {{ onetLoading() === p.id ? 'Checking…' : 'Verify on O*NET' }}
              </button>
            </div>
            @if (onetResults().has(p.id)) {
              @if (onetResults().get(p.id)) {
                <p class="onet-result">
                  <span class="onet-badge">O*NET</span>
                  Matches "{{ onetResults().get(p.id)!.title }}" ({{ onetResults().get(p.id)!.onetSocCode }})
                </p>
              } @else {
                <p class="onet-result onet-result-empty">No O*NET match available (not configured or no match found).</p>
              }
            }
          </article>
        }
      </div>
    }
  `,
  styles: [`
    .explorer-head {
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
      font-size: 2.1rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .lede {
      color: var(--color-slate);
      font-size: 1.02rem;
    }

    .filters {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .search-input, .field-select {
      font-family: var(--font-body);
      font-size: 0.95rem;
      padding: 0.7rem 1rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-card);
      color: var(--color-ink);
    }

    .search-input {
      flex: 1;
      min-width: 240px;
    }

    .search-input:focus, .field-select:focus {
      border-color: var(--color-teal);
    }

    .status-text {
      color: var(--color-slate);
      padding: 2rem 0;
    }

    .status-text.error {
      color: var(--color-danger);
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .career-card {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      box-shadow: var(--shadow-card);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .career-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(27, 36, 48, 0.1);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .field-tag {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-slate);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .demand-pill {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: var(--color-border);
      color: var(--color-slate);
    }

    .demand-pill.demand-3 {
      background: rgba(31, 138, 112, 0.15);
      color: var(--color-teal);
    }

    .demand-pill.demand-2 {
      background: rgba(232, 163, 61, 0.18);
      color: #9c6a1f;
    }

    .career-card h3 {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .desc {
      color: var(--color-slate);
      font-size: 0.9rem;
      flex: 1;
    }

    .salary {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .skill-chip {
      font-size: 0.75rem;
      background: var(--color-paper);
      border: 1px solid var(--color-border);
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      color: var(--color-ink);
    }

    .roadmap-btn {
      margin-top: 0.5rem;
      background: var(--color-ink);
      color: var(--color-paper);
      border: none;
      padding: 0.65rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      font-weight: 600;
      text-align: left;
      transition: background 0.15s ease;
    }

    .roadmap-btn:hover {
      background: var(--color-teal);
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .onet-btn {
      background: transparent;
      color: var(--color-slate);
      border: 1px solid var(--color-border);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      font-weight: 600;
      text-align: left;
      transition: border-color 0.15s ease, color 0.15s ease;
    }

    .onet-btn:hover:not(:disabled) {
      border-color: var(--color-teal);
      color: var(--color-teal);
    }

    .onet-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .onet-result {
      font-size: 0.8rem;
      color: var(--color-slate);
      margin-top: -0.1rem;
    }

    .onet-result-empty {
      font-style: italic;
    }

    .onet-badge {
      display: inline-block;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--color-paper);
      background: var(--color-slate);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      margin-right: 0.35rem;
      vertical-align: middle;
    }
  `]
})
export class CareerExplorerComponent implements OnInit {
  private readonly api = inject(CareerApiService);
  private readonly router = inject(Router);

  professions = signal<Profession[]>([]);
  fields = signal<string[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  /** Maps professionId -> result. A present-but-null value means "checked, no match". */
  onetResults = signal<Map<number, OnetOccupationMatch | null>>(new Map());
  onetLoading = signal<number | null>(null);

  keyword = '';
  field = '';

  ngOnInit(): void {
    this.fetchProfessions();
  }

  onFilterChange(): void {
    this.fetchProfessions();
  }

  openRoadmap(professionId: number): void {
    this.router.navigate(['/roadmap', professionId]);
  }

  demandLabel(p: Profession): string {
    return DEMAND_LABELS[p.demand];
  }

  checkOnet(professionId: number): void {
    this.onetLoading.set(professionId);

    this.api.getOnetMatch(professionId).subscribe({
      next: result => {
        const updated = new Map(this.onetResults());
        updated.set(professionId, result);
        this.onetResults.set(updated);
        this.onetLoading.set(null);
      },
      error: (err: unknown) => {
        // Treat any failure the same as "no match" - O*NET is an enhancement, not a dependency.
        console.error('O*NET lookup failed for profession', professionId, err);
        const updated = new Map(this.onetResults());
        updated.set(professionId, null);
        this.onetResults.set(updated);
        this.onetLoading.set(null);
      }
    });
  }

  private fetchProfessions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getProfessions(this.field || undefined, this.keyword || undefined).subscribe({
      next: results => {
        this.professions.set(results);
        if (this.fields().length === 0) {
          this.fields.set([...new Set(results.map(r => r.field))].sort());
        }
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to load professions from the API:', err);
        this.error.set('Could not reach the CareerPath AI API. Make sure the backend is running on http://localhost:5080. (Full error logged to console.)');
        this.loading.set(false);
      }
    });
  }
}
