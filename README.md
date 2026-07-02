# CareerPath AI

An interactive education-to-career roadmap platform. Pick a profession, see the exact
education path (Matric → Intermediate → Bachelor → Master → PhD) that leads there, explore
alternative routes, or get AI-style recommendations based on your interests and skills.

This is a **clean, extendable starting slice** of the larger CareerPath AI vision — not the
full enterprise SaaS spec (no database, no auth, no multi-tenant yet). It's built so all of
that can be added later without rewriting what's here. See "Extending this later" below.

---

## What's included

**Backend** — `ASP.NET Core 8 Web API`, layered:
- `CareerPathAI.Domain` — entities (`Profession`, `Degree`) and enums
- `CareerPathAI.Application` — DTOs, repository interfaces, `RoadmapService`, `CareerAdvisorService`
- `CareerPathAI.Infrastructure` — in-memory repositories + seed data (9 professions, 10 degrees, real prerequisite chains), plus two **optional** free external integrations (see below)
- `CareerPathAI.API` — controllers, Swagger, CORS

**Frontend** — `Angular 18` standalone components, signals-based:
- **Career Explorer** — browse/search/filter professions, optional "Verify on O*NET" check per card
- **Roadmap Viewer** — interactive SVG "path" visualization from Matric to profession, click any station for details, switch between alternative routes
- **AI Advisor** — enter interests/subjects/skills, get ranked profession matches with an explanation of what matched (optionally enriched by Gemini)

No database — data lives in memory on the backend, reset on restart. Repository interfaces
already isolate this so swapping to EF Core + SQL Server later doesn't touch Application or API code.

---

## Optional free integrations

Both of these are **off by default** and the app works completely normally without them —
they only upgrade specific features when configured, and fail silently back to built-in
behavior if a key is missing, invalid, or the service is unreachable.

### Gemini (free AI for the AI Advisor)

The AI Advisor's matching logic is always rule-based (keyword overlap) and works with zero
setup. If you add a free Gemini API key, the backend additionally asks Gemini to write a
short, friendly explanation for each already-matched profession — Gemini never decides
*which* professions get recommended, only explains ones already chosen by the rule-based
matcher. This keeps results trustworthy even if the AI call fails or is removed entirely.

**To enable it:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and sign in with a Google account (18+, supported region required). No credit card needed.
2. Click "Create API key". Copy it.
3. **Important (as of June 2026):** Google now rejects unrestricted keys. In AI Studio's API Keys page, open your new key and restrict it to "Generative Language API only" before using it.
4. Set it as an environment variable rather than editing `appsettings.json` directly:
   ```bash
   # macOS/Linux
   export GEMINI__APIKEY="your-key-here"

   # Windows PowerShell
   $env:GEMINI__APIKEY="your-key-here"
   ```
   (The double underscore `__` is how .NET maps env vars to nested config sections.)
5. Run the backend as normal. You'll see AI-written explanations appear in Advisor results.

Free tier is rate-limited (roughly 10 requests/minute, 250/day on `gemini-2.5-flash` as of
mid-2026 — Google adjusts this periodically, check the AI Studio dashboard for current limits).
Fine for a student project; if you outgrow it, enabling billing on the Google Cloud project
removes the rate limit without changing any code.

### O*NET (free real-world occupation data, US Dept of Labor)

A "Verify on O*NET" button on each Career Explorer card can check a profession against
O*NET's real, government-maintained occupation database (~900 US occupations) and show its
official title and O*NET-SOC code. This is enrichment only — O*NET has no concept of the
Matric→PhD degree ladder this app is built around, so it can never replace the seed catalog,
only confirm that a profession corresponds to something real.

**To enable it:**
1. Sign up for a free developer account at [services.onetcenter.org](https://services.onetcenter.org/) — unlike Gemini, this requires manual approval and arrives by email (can take a day or two), and you'll receive a Username/Password pair, not a single API key.
2. Set both as environment variables:
   ```bash
   export ONET__USERNAME="your-username"
   export ONET__PASSWORD="your-password"
   ```
3. Run the backend. The "Verify on O*NET" button will now return real matches.

This data is US-focused. If your students are mainly in Pakistan/South Asia, O*NET's
profession descriptions and salary data won't be locally accurate — treat it as a nice-to-have
cross-check rather than a primary source for non-US users.

---

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) and npm
- [Angular CLI](https://angular.dev/tools/cli): `npm install -g @angular/cli`

---

## Running the backend

```bash
cd backend/src/CareerPathAI.API
dotnet restore
dotnet run
```

The API starts on **http://localhost:5080**. Open **http://localhost:5080/swagger** to see
and try every endpoint interactively.

### Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/professions` | List professions, optional `?field=` and `?keyword=` filters |
| GET | `/api/professions/{id}` | Get one profession |
| GET | `/api/professions/compare?aId=&bId=` | Compare two professions |
| GET | `/api/professions/{id}/onet-match` | Optional: live O*NET enrichment lookup (204 if not configured/no match) |
| GET | `/api/degrees` | List all degrees |
| GET | `/api/degrees/{id}` | Get one degree |
| GET | `/api/roadmap/{professionId}` | Build the Matric→Profession roadmap |
| GET | `/api/roadmap/{professionId}/alternatives` | All valid degree-path roadmaps to that profession |
| POST | `/api/advisor/recommend` | Get ranked profession matches from interests/subjects/skills |

---

## Running the frontend

In a second terminal:

```bash
cd frontend
npm install
ng serve
```

Open **http://localhost:4200**. The dev server is pre-configured to call the backend at
`http://localhost:5080/api` (see `src/environments/environment.ts`) and the backend's CORS
policy already allows `http://localhost:4200`, so the two should talk to each other with no
extra configuration.

**Run the backend first** — the frontend shows a friendly error if it can't reach the API.

---

## Project structure

```
CareerPathAI/
├── backend/
│   ├── CareerPathAI.sln
│   └── src/
│       ├── CareerPathAI.Domain/
│       ├── CareerPathAI.Application/
│       ├── CareerPathAI.Infrastructure/
│       └── CareerPathAI.API/
└── frontend/
    └── src/app/
        ├── core/            # models + API service (shared)
        └── features/
            ├── career-explorer/
            ├── roadmap-viewer/
            └── ai-advisor/
```

---

## Extending this later

This was deliberately kept lean (per the request to build fast and keep tokens reasonable),
but every seam needed for the full original spec is already in place:

- **Add a real database**: implement `IProfessionRepository` / `IDegreeRepository` against
  EF Core + SQL Server in a new `CareerPathAI.Persistence` project, then change two lines in
  `Program.cs` (the `AddSingleton<I...Repository, InMemory...>` calls). Nothing in
  `Application`, `API`, or the Angular frontend needs to change.
- **Add authentication**: add JWT middleware + `[Authorize]` attributes in `API`; the
  Angular side would add an `AuthInterceptor` and route guards.
- **Real AI (done, optional)**: `CareerAdvisorService` always matches via rule-based keyword
  overlap, and additionally calls Gemini (free tier) to write natural-language explanations
  if `GEMINI__APIKEY` is set. See "Optional free integrations" above. The Gemini call is
  constrained to explaining an already-fixed shortlist, never to inventing or reordering
  professions, so a bad or missing key never breaks the feature.
- **Real-world occupation data (done, optional)**: a "Verify on O*NET" button checks any
  profession against the free O*NET database once `ONET__USERNAME` / `ONET__PASSWORD` are
  set. See "Optional free integrations" above. US-focused; treat as enrichment, not a
  primary source, for non-US users.
- **Add more professions/degrees**: edit `CatalogSeed.cs` — it's plain C# objects, no
  migrations needed since there's no database yet.
- **Multi-tenant, RBAC, D3 graph view, AWS deployment**: out of scope for this slice: each is
  a substantial addition in its own right and is best tackled once the core product is
  validated with real users.

---

## A note on accuracy

I wasn't able to run `dotnet build` or `ng serve` myself in this environment (no .NET/Node
runtime, no network access), so I reviewed every file by hand for type consistency, DTO
field alignment, and Angular template correctness. Please run `dotnet build` and `ng serve`
on your machine and let me know if anything doesn't compile — I'd rather fix a real error
than have you guess at one.
