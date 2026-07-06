# Spec: Login/Signup Database & Backend API

## 1. Goal

Implement a self-hosted SQL Server database and a .NET Core Web API backend that supports user registration (signup) and login, authenticating subsequent requests with JWT tokens.

## 2. Tech Stack

- **Backend**: .NET Core Web API
- **ORM**: Entity Framework Core (`Microsoft.EntityFrameworkCore.SqlServer`)
- **Database**: SQL Server, self-hosted via Docker (no cloud dependency)
- **Password hashing**: `PasswordHasher<TUser>` (`Microsoft.Extensions.Identity.Core`) — no full ASP.NET Core Identity
- **Auth**: JWT (`Microsoft.AspNetCore.Authentication.JwtBearer`)

## 3. Database Requirements

### 3.1 Hosting

- Use a locally installed SQL Server instance (e.g. SQL Server Express/Developer Edition), managed and inspected via SQL Server Management Studio (SSMS).
- Connect via a local instance name, typically `localhost\SQLEXPRESS` or `(localdb)\MSSQLLocalDB` depending on what's installed — confirm the exact instance name in SSMS's "Connect to Server" dialog before writing the connection string.
- Authentication mode: either Windows Authentication (`Trusted_Connection=True`, no password in the connection string) or SQL Server Authentication (username/password) — confirm which the local instance is configured for.
- Store the connection string in `appsettings.Development.json` or via `dotnet user-secrets` — not committed to source control if it contains credentials.
- Create the target database itself (e.g. via SSMS or `CREATE DATABASE` script, or let EF Core's first migration create it) before running migrations.

### 3.2 Schema — `Users` table

| Column | Type | Constraints |
|---|---|---|
| `Id` | `int` (identity) | Primary key |
| `Email` | `nvarchar(256)` | Not null, unique index |
| `FirstName` | `nvarchar(100)` | Not null |
| `LastName` | `nvarchar(100)` | Not null |
| `PasswordHash` | `nvarchar(max)` | Not null |
| `CreatedAt` | `datetime2` | Not null, default UTC now |
| `LastLoginAt` | `datetime2` | Nullable |
| `IsActive` | `bit` | Not null, default `1` |

- Email uniqueness enforced at the database level (unique index), not just application-level validation.
- Migrations managed via `dotnet ef migrations` — no manual SQL schema edits outside of migrations.

## 4. API Requirements

### 4.1 Endpoints

| Method | Route | Purpose | Auth required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account | No |
| `POST` | `/api/auth/login` | Authenticate and issue a JWT | No |
| `GET` | `/api/auth/me` | Return the current authenticated user's profile | Yes (JWT) |

### 4.2 Request/response contracts

**`POST /api/auth/register`**
- Request: `{ email, password, firstName, lastName }`
- Validation: valid email format, password meets minimum strength (see 5.2), first/last name non-empty.
- Response `201`: `{ id, email, firstName, lastName, createdAt }` (never return `passwordHash`).
- Response `409`: email already registered.
- Response `400`: validation failure, with field-level error messages.

**`POST /api/auth/login`**
- Request: `{ email, password }`
- On success `200`: `{ token, expiresAt, user: { id, email, firstName, lastName } }`.
- On failure `401`: generic "invalid email or password" — do not reveal whether the email exists.

**`GET /api/auth/me`**
- Requires `Authorization: Bearer <token>` header.
- Response `200`: `{ id, email, firstName, lastName, createdAt, lastLoginAt }`.
- Response `401` if token missing/invalid/expired.

### 4.3 JWT requirements

- Claims: `sub` (user id), `email`, `iat`, `exp`.
- Expiry: 60 minutes (adjust as needed — no refresh token flow in this spec; treat as a future enhancement).
- Signing: symmetric key (`HmacSha256`), key stored in configuration/environment variable, never committed to source control.
- Validate `issuer`, `audience`, `lifetime`, and `signing key` on every protected request.

## 5. Security Requirements

- Passwords hashed with `PasswordHasher<TUser>` — never stored or logged in plaintext.
- All endpoints served over HTTPS in any non-local environment.
- Generic error messages on login failure (no "email not found" vs "wrong password" distinction).
- Basic rate limiting or throttling on `/api/auth/login` and `/api/auth/register` to reduce brute-force/spam risk (can use built-in ASP.NET Core rate limiting middleware).

### 5.1 Input validation

- Email: valid format, max 256 chars.
- Password minimum requirements (adjust to your preference): minimum 8 characters, at least one letter and one number.
- Reject requests with missing/malformed fields with a `400` and clear field-level messages.

## 6. Configuration

- `appsettings.json` / `appsettings.Development.json`:
  - `ConnectionStrings:DefaultConnection` — points to the local SQL Server instance (e.g. `Server=localhost\SQLEXPRESS;Database=YourDbName;Trusted_Connection=True;TrustServerCertificate=True;`).
  - `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`, `Jwt:ExpiryMinutes`.
- Secrets (SQL credentials if using SQL auth, JWT key) sourced from `dotnet user-secrets` in development — not committed to source control.

## 7. Out of Scope (call out explicitly, don't build unless asked)

- Email verification on signup.
- Password reset / forgot-password flow.
- Refresh tokens / token revocation.
- Role-based authorization (single user type only, for now).
- Full ASP.NET Core Identity (this uses a custom, lighter-weight table + hasher instead).

## 8. Acceptance Criteria

- [ ] Local SQL Server instance is reachable from the app (verified via SSMS and/or a test connection).
- [ ] EF Core migration creates the `Users` table with the schema above.
- [ ] `POST /api/auth/register` creates a user, rejects duplicate emails, rejects weak passwords/invalid input.
- [ ] `POST /api/auth/login` returns a valid JWT on correct credentials, generic `401` on incorrect ones.
- [ ] `GET /api/auth/me` returns profile data only with a valid JWT, `401` otherwise.
- [ ] No plaintext passwords appear in the database, logs, or API responses.
- [ ] Connection strings and JWT signing key are not hardcoded in source-controlled files.

## 9. Deliverables

- Confirmed local SQL Server connection string (instance name + auth mode) documented in `appsettings.Development.json`.
- EF Core: `User` model, `AppDbContext`, migration files.
- `AuthController` (or minimal API equivalent) implementing the three endpoints above.
- JWT configuration in `Program.cs`.
- Updated `appsettings.json` with placeholders (no real secrets committed).