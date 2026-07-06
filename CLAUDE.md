# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CareerPath AI: an interactive education-to-career roadmap platform. Pick a profession, see
the education path (Matric → Intermediate → Bachelor → Master → PhD) that leads there,
explore alternative routes, or get AI-assisted profession recommendations based on
interests/subjects/skills.

This is a deliberately lean starting slice, not the full product spec: **no database, no
auth, no multi-tenant**. Data lives in memory on the backend and resets on every restart.
Repository interfaces already isolate persistence so EF Core + SQL Server can be dropped in
later without touching `Application`, `API`, or the Angular frontend.

## Commands

### Backend (ASP.NET Core 8)

```bash
cd backend/src/CareerPathAI.API
dotnet restore
dotnet run
```

Runs on `http://localhost:5080`; Swagger UI at `http://localhost:5080/swagger`.

Build/restore from the solution root instead when touching multiple projects:

```bash
cd backend
dotnet build CareerPathAI.sln
```

There are no test projects in this repo yet.

### Frontend (Angular 18)

```bash
cd frontend
npm install
ng serve       # or: npm start
ng build       # production build
```

Runs on `http://localhost:4200`. **Start the backend first** — the frontend surfaces a
friendly error if it can't reach the API, but has no offline/mock mode.

There is no lint script and no test script configured in `frontend/package.json` — don't
assume `npm test` or `npm run lint` exist; check `package.json` before inventing commands.

## Architecture

### Backend: layered, interface-isolated

- `CareerPathAI.Domain` — plain entities (`Profession`, `Degree`) and enums
  (`DemandTrend`, `EducationLevel`). No dependencies on other projects.
- `CareerPathAI.Application` — DTOs (`DTOs/Dtos.cs`), repository interfaces
  (`Interfaces/Repositories.cs`), and the two business services:
  - `RoadmapService` — builds the Matric→Profession path and alternative degree routes from
    `Profession.QualifyingDegreeIds` and each `Degree`'s prerequisite chain.
  - `CareerAdvisorService` — matches professions to user input via rule-based keyword overlap
    against `Profession.Tags`/`RequiredSkills`. This ranking is deterministic and never
    delegated to the AI call (see below).
- `CareerPathAI.Infrastructure` — `InMemoryRepositories.cs` (the only `IProfessionRepository`
  / `IDegreeRepository` implementations) and `SeedData/CatalogSeed.cs` (9 professions, 10
  degrees, real prerequisite chains — edit this file directly to add catalog data; no
  migrations needed). Also holds the two optional external integrations under
  `ExternalServices/Gemini` and `ExternalServices/Onet`.
- `CareerPathAI.API` — controllers (`Professions`, `Degrees`, `Roadmap`, `Advisor`), Swagger,
  CORS. `Program.cs` wires everything: repositories are `AddSingleton` (in-memory state must
  survive across requests), services are `AddScoped`.

**Swapping in a real database**: implement `IProfessionRepository`/`IDegreeRepository`
against EF Core in a new `CareerPathAI.Persistence` project, then change the two
`AddSingleton<I...Repository, InMemory...>` lines in `Program.cs`. Nothing in `Application`,
`API`, or the frontend needs to change as a result.

### Optional external integrations (both off by default, fail silently)

Both self-disable with zero effect on core functionality if unconfigured, unreachable, or
given an invalid credential — never introduce a hard dependency on either.

- **Gemini** (`ExternalServices/Gemini`, `IAiRecommenderClient`): only writes a friendly
  natural-language *explanation* for professions the rule-based matcher already selected. It
  never decides which professions are recommended or reorders them. Configure via
  `GEMINI__APIKEY` env var (maps to `Gemini:ApiKey` config section).
- **O*NET** (`ExternalServices/Onet`, `IOnetClient`): enrichment-only lookup against the US
  Dept of Labor's occupation database via the `/api/professions/{id}/onet-match` endpoint
  (returns 204 if unconfigured or no match). Configure via `ONET__USERNAME` /
  `ONET__PASSWORD` env vars. US-focused data — treat as a cross-check, not a source of truth.

### Frontend: Angular 18 standalone components, signals-based

- `core/models/career.models.ts` — TypeScript types mirroring the backend DTOs.
- `core/services/career-api.service.ts` — the single HTTP client for the backend API; all
  features go through this rather than calling `HttpClient` directly.
- `core/global-error-handler.ts` — app-wide error handler.
- `features/home`, `features/career-explorer`, `features/roadmap-viewer`,
  `features/ai-advisor` — one standalone component per route, lazy-loaded in
  `app.routes.ts` via `loadComponent`.
  - **Career Explorer**: browse/search/filter professions; per-card "Verify on O*NET" check.
  - **Roadmap Viewer** (`roadmap/:professionId`): interactive SVG path visualization from
    Matric to the target profession; supports switching between alternative degree routes.
  - **AI Advisor**: takes interests/subjects/skills, returns ranked matches with match
    explanations.
- `shared/components` — cross-feature presentational components.
- Dev API base URL is set in `src/environments/environment.ts` (`http://localhost:5080/api`);
  backend CORS in `Program.cs` allows `http://localhost:4200` — keep these in sync if either
  port changes.

## Notes for contributors (from repo README)

- No tests currently exist in either project — the original author reviewed all code by hand
  instead of running `dotnet build`/`ng serve` locally due to environment constraints. Treat
  this as unverified until you actually build/run it.
- Out of scope for this slice (don't attempt unless explicitly asked): authentication,
  multi-tenant/RBAC, D3-based graph view, AWS deployment, real database.
