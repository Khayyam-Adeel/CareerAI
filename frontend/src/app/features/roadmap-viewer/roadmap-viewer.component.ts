import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CareerApiService } from '../../core/services/career-api.service';
import { Degree, EDUCATION_LEVEL_LABELS, Roadmap, RoadmapNode } from '../../core/models/career.models';

interface PositionedNode extends RoadmapNode {
  x: number;
  y: number;
}

@Component({
  selector: 'app-roadmap-viewer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/explore" class="back-link">&larr; Back to Career Explorer</a>

    @if (loading()) {
      <p class="status-text">Building the roadmap&hellip;</p>
    } @else if (error()) {
      <p class="status-text error">{{ error() }}</p>
    } @else if (roadmap()) {
      <section class="roadmap-head">
        <p class="eyebrow">Education Roadmap</p>
        <h1>The path to becoming {{ roadmap()!.professionTitle }}</h1>
        <p class="lede">
          Follow the line from Matric to the finish. Each station is a real qualification step
          &mdash; click one to see subjects, duration, and what it takes to get in.
        </p>
      </section>

      <div class="roadmap-canvas-wrap">
        <svg
          class="roadmap-svg"
          [attr.viewBox]="'0 0 ' + svgWidth() + ' 220'"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            [attr.points]="linePoints()"
            fill="none"
            stroke="var(--color-border)"
            stroke-width="4"
          />
          <polyline
            [attr.points]="linePoints()"
            fill="none"
            stroke="var(--color-teal)"
            stroke-width="4"
            stroke-dasharray="2 10"
            stroke-linecap="round"
          />

          @for (node of positionedNodes(); track node.order) {
            <g
              class="station"
              [class.station-final]="node.nodeType === 'Profession'"
              [class.station-active]="selectedNode()?.order === node.order"
              (click)="selectNode(node)"
              [attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
            >
              <circle
                [attr.r]="node.nodeType === 'Profession' ? 16 : 12"
                class="station-dot"
              />
              <text
                class="station-label"
                [attr.y]="node.nodeType === 'Profession' ? 38 : 34"
                text-anchor="middle"
              >{{ shortLabel(node.title) }}</text>
              @if (node.level !== null) {
                <text class="station-sublabel" y="-22" text-anchor="middle">
                  {{ levelLabel(node.level) }}
                </text>
              }
            </g>
          }
        </svg>
      </div>

      @if (selectedNode()) {
        <div class="detail-panel">
          @if (selectedNode()!.nodeType === 'Degree' && selectedDegree()) {
            <h3>{{ selectedDegree()!.name }}</h3>
            <p class="detail-meta">{{ levelLabel(selectedDegree()!.level) }} &middot; {{ selectedDegree()!.durationInYears }} year(s) &middot; {{ selectedDegree()!.field }}</p>
            <p class="detail-desc">{{ selectedDegree()!.description }}</p>

            <div class="detail-columns">
              <div>
                <h4>Subjects</h4>
                <ul>
                  @for (s of selectedDegree()!.subjects; track s) {
                    <li>{{ s }}</li>
                  }
                </ul>
              </div>
              <div>
                <h4>Eligibility</h4>
                <ul>
                  @for (e of selectedDegree()!.eligibilityRequirements; track e) {
                    <li>{{ e }}</li>
                  }
                </ul>
              </div>
            </div>
          } @else if (selectedNode()!.nodeType === 'Profession') {
            <h3>{{ roadmap()!.professionTitle }}</h3>
            <p class="detail-desc">This is the career outcome at the end of this roadmap. Visit the Career Explorer for full salary, demand, and certification details.</p>
            <a [routerLink]="['/explore']" class="explorer-link">Open in Career Explorer &rarr;</a>
          } @else {
            <p class="status-text">Loading details&hellip;</p>
          }
        </div>
      } @else {
        <p class="hint-text">Click any station on the path above to see its details.</p>
      }

      @if (alternatives().length > 1) {
        <section class="alt-paths">
          <h4>Alternative routes to {{ roadmap()!.professionTitle }}</h4>
          <div class="alt-list">
            @for (alt of alternatives(); track alt.nodes[0].refId) {
              <button
                class="alt-chip"
                [class.alt-chip-active]="alt === roadmap()"
                (click)="useAlternative(alt)"
              >
                {{ altSummary(alt) }}
              </button>
            }
          </div>
        </section>
      }
    }
  `,
  styles: [`
    .back-link {
      display: inline-block;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      color: var(--color-slate);
      text-decoration: none;
    }

    .back-link:hover {
      color: var(--color-ink);
    }

    .roadmap-head {
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
      font-size: 1.9rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .lede {
      color: var(--color-slate);
    }

    .status-text {
      color: var(--color-slate);
      padding: 2rem 0;
    }

    .status-text.error {
      color: var(--color-danger);
    }

    .roadmap-canvas-wrap {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1rem 0;
      overflow-x: auto;
      margin-bottom: 1rem;
      box-shadow: var(--shadow-card);
    }

    .roadmap-svg {
      width: 100%;
      min-width: 640px;
      height: 220px;
      display: block;
    }

    .station {
      cursor: pointer;
    }

    .station-dot {
      fill: var(--color-card);
      stroke: var(--color-teal);
      stroke-width: 3;
      transition: fill 0.15s ease, r 0.15s ease;
    }

    .station-final .station-dot {
      stroke: var(--color-amber);
      fill: var(--color-amber);
    }

    .station-active .station-dot {
      fill: var(--color-teal);
    }

    .station-label {
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 600;
      fill: var(--color-ink);
    }

    .station-sublabel {
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      fill: var(--color-slate);
    }

    .hint-text {
      color: var(--color-slate);
      font-size: 0.9rem;
      padding: 1rem 0;
    }

    .detail-panel {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      box-shadow: var(--shadow-card);
    }

    .detail-panel h3 {
      font-size: 1.3rem;
      margin-bottom: 0.4rem;
    }

    .detail-meta {
      color: var(--color-slate);
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }

    .detail-desc {
      margin-bottom: 1rem;
      color: var(--color-ink);
    }

    .detail-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .detail-columns h4 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-slate);
      margin-bottom: 0.5rem;
    }

    .detail-columns ul {
      margin: 0;
      padding-left: 1.1rem;
      font-size: 0.9rem;
    }

    .detail-columns li {
      margin-bottom: 0.3rem;
    }

    .explorer-link {
      display: inline-block;
      margin-top: 0.5rem;
      color: var(--color-teal);
      font-weight: 600;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .alt-paths {
      margin-top: 2rem;
    }

    .alt-paths h4 {
      font-size: 0.95rem;
      margin-bottom: 0.75rem;
    }

    .alt-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }

    .alt-chip {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: 999px;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      color: var(--color-ink);
    }

    .alt-chip:hover {
      border-color: var(--color-teal);
    }

    .alt-chip-active {
      background: var(--color-ink);
      color: var(--color-paper);
      border-color: var(--color-ink);
    }

    @media (max-width: 640px) {
      .detail-columns {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RoadmapViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CareerApiService);

  roadmap = signal<Roadmap | null>(null);
  alternatives = signal<Roadmap[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedNode = signal<RoadmapNode | null>(null);
  selectedDegree = signal<Degree | null>(null);

  svgWidth = computed(() => {
    const count = this.roadmap()?.nodes.length ?? 1;
    return Math.max(640, count * 150);
  });

  positionedNodes = computed<PositionedNode[]>(() => {
    const nodes = this.roadmap()?.nodes ?? [];
    const width = this.svgWidth();
    const usableWidth = width - 100;
    const step = nodes.length > 1 ? usableWidth / (nodes.length - 1) : 0;

    return nodes.map((node, i) => ({
      ...node,
      x: 60 + i * step,
      y: 110 + (i % 2 === 0 ? -10 : 10) // gentle zig-zag so labels don't collide on long chains
    }));
  });

  linePoints = computed(() =>
    this.positionedNodes().map(n => `${n.x},${n.y}`).join(' ')
  );

  ngOnInit(): void {
    const professionId = Number(this.route.snapshot.paramMap.get('professionId'));
    if (!professionId) {
      this.error.set('No profession specified.');
      this.loading.set(false);
      return;
    }
    this.fetchRoadmap(professionId);
    this.fetchAlternatives(professionId);
  }

  selectNode(node: RoadmapNode): void {
    this.selectedNode.set(node);
    this.selectedDegree.set(null);

    if (node.nodeType === 'Degree') {
      this.api.getDegreeById(node.refId).subscribe({
        next: degree => this.selectedDegree.set(degree),
        error: (err: unknown) => {
          console.error('Failed to load degree', node.refId, err);
          this.error.set('Could not load degree details. (Full error logged to console.)');
        }
      });
    }
  }

  useAlternative(alt: Roadmap): void {
    this.roadmap.set(alt);
    this.selectedNode.set(null);
    this.selectedDegree.set(null);
  }

  altSummary(alt: Roadmap): string {
    const degreeNodes = alt.nodes.filter(n => n.nodeType === 'Degree');
    return degreeNodes.length > 0 ? `Via ${degreeNodes[degreeNodes.length - 1].title}` : 'Path';
  }

  levelLabel(level: number): string {
    return EDUCATION_LEVEL_LABELS[level as keyof typeof EDUCATION_LEVEL_LABELS] ?? '';
  }

  shortLabel(title: string): string {
    return title.length > 22 ? title.slice(0, 20) + '…' : title;
  }

  private fetchRoadmap(professionId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getRoadmap(professionId).subscribe({
      next: roadmap => {
        this.roadmap.set(roadmap);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to load roadmap for profession', professionId, err);
        this.error.set('Could not load this roadmap. Make sure the backend is running on http://localhost:5080. (Full error logged to console.)');
        this.loading.set(false);
      }
    });
  }

  private fetchAlternatives(professionId: number): void {
    this.api.getAllRoadmapAlternatives(professionId).subscribe({
      next: alts => this.alternatives.set(alts),
      error: (err: unknown) => {
        console.error('Failed to load roadmap alternatives for profession', professionId, err);
        this.alternatives.set([]);
      }
    });
  }
}
