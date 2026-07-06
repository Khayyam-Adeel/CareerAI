import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Attaches the JWT to outgoing requests to our own API only - never to third-party URLs
 * (e.g. the O*NET/Gemini calls the backend itself proxies) so the token can't leak.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  if (token && req.url.startsWith(environment.apiBaseUrl)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};
