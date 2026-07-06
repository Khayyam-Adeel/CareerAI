import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Normalizes the shapes the backend actually returns (ValidationProblemDetails' `errors` map
 * for 400s, `{ message }` for 401/409, empty body for the rate limiter's 429) plus the
 * "backend unreachable" case into a flat list of user-facing strings.
 */
export function extractErrorMessages(err: HttpErrorResponse, fallback: string): string[] {
  if (err.status === 429) {
    return ['Too many attempts. Please wait a minute and try again.'];
  }

  const body = err.error as ApiErrorBody | null;

  if (body?.errors) {
    return Object.values(body.errors).flat();
  }

  if (body?.message) {
    return [body.message];
  }

  return [fallback];
}
